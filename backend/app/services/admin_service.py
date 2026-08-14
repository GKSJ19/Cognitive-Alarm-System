from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, desc, or_, and_
from app.models.user_model import User
from app.models.profile_model import UserProfile
from app.models.habit_model import Habit, ChallengeResult
from app.models.alarm_model import Alarm, AlarmHistory
from app.models.coach_model import CoachAssignment, CoachMessage

class AdminService:
    @staticmethod
    async def assign_coach(db: AsyncSession, coach_id: str, user_id: str, admin_id: str | None = None) -> CoachAssignment:
        """Assign or reassign a coach to a user."""
        # Ensure user and coach exist
        coach_res = await db.execute(select(User).where(User.id == coach_id, User.role == "coach"))
        coach = coach_res.scalars().first()
        if not coach:
            raise ValueError("Target coach not found or invalid role")

        user_res = await db.execute(select(User).where(User.id == user_id))
        user = user_res.scalars().first()
        if not user:
            raise ValueError("Target user not found")

        # Check existing active assignment for this user
        existing_res = await db.execute(
            select(CoachAssignment).where(CoachAssignment.user_id == user_id)
        )
        assignment = existing_res.scalars().first()

        if assignment:
            assignment.coach_id = coach_id
            assignment.assigned_by_admin = admin_id
            assignment.assigned_date = datetime.utcnow()
            assignment.status = "active"
        else:
            assignment = CoachAssignment(
                coach_id=coach_id,
                user_id=user_id,
                assigned_by_admin=admin_id,
                assigned_date=datetime.utcnow(),
                status="active"
            )
            db.add(assignment)

        await db.commit()
        await db.refresh(assignment)
        return assignment

    @staticmethod
    async def remove_coach_assignment(db: AsyncSession, user_id: str) -> bool:
        """Remove a coach assignment for a user."""
        res = await db.execute(select(CoachAssignment).where(CoachAssignment.user_id == user_id))
        assignment = res.scalars().first()
        if not assignment:
            return False

        await db.delete(assignment)
        await db.commit()
        return True

    @staticmethod
    async def get_detailed_users(
        db: AsyncSession,
        search: str | None = None,
        filter_status: str | None = None,
        filter_coach_status: str | None = None
    ) -> list[dict]:
        """
        Retrieve all users with complete details:
        User ID, Name, Email, Phone, Reg Date, Last Login, Status, Assigned Coach,
        Habit Score, Challenges Completed, Avg Time, Success Rate, Streaks, Alarms Count.
        """
        query = select(User).where(User.role == "user")
        res = await db.execute(query)
        users = list(res.scalars().all())

        detailed_list = []
        for u in users:
            # Profile details
            prof_res = await db.execute(select(UserProfile).where(UserProfile.user_id == u.id))
            prof = prof_res.scalars().first()

            # Assigned coach
            assign_res = await db.execute(
                select(CoachAssignment)
                .where(CoachAssignment.user_id == u.id, CoachAssignment.status == "active")
            )
            assign = assign_res.scalars().first()
            coach_dict = None
            if assign:
                c_res = await db.execute(select(User).where(User.id == assign.coach_id))
                coach_obj = c_res.scalars().first()
                if coach_obj:
                    coach_dict = {
                        "id": coach_obj.id,
                        "full_name": coach_obj.full_name,
                        "email": coach_obj.email
                    }

            # Challenges & Habit Score analytics
            ch_res = await db.execute(
                select(ChallengeResult)
                .where(ChallengeResult.user_id == u.id)
                .order_by(desc(ChallengeResult.completed_at))
            )
            ch_list = list(ch_res.scalars().all())

            total_ch = len(ch_list)
            correct_ch = [c for c in ch_list if c.is_correct]
            success_rate = round((len(correct_ch) / total_ch * 100), 1) if total_ch > 0 else 0.0
            avg_time = round(sum(c.time_taken_seconds for c in ch_list) / total_ch, 1) if total_ch > 0 else 0.0

            recent_scores = [c.habit_score for c in ch_list[:5]]
            cur_score = round(sum(recent_scores) / len(recent_scores), 1) if recent_scores else 0.0
            last_ch_date = ch_list[0].completed_at.strftime("%Y-%m-%d %H:%M") if ch_list else None

            # Calculate current streak and longest streak from challenge results
            current_streak = 0
            longest_streak = 0
            if ch_list:
                # Group by distinct dates
                dates = sorted(list(set(c.completed_at.date() for c in ch_list if c.is_correct)), reverse=True)
                if dates:
                    today = datetime.utcnow().date()
                    if dates[0] == today or dates[0] == today - timedelta(days=1):
                        current_streak = 1
                        for i in range(len(dates) - 1):
                            if dates[i] - dates[i+1] == timedelta(days=1):
                                current_streak += 1
                            else:
                                break

                    # Longest streak calculation
                    sorted_asc = sorted(dates)
                    temp_streak = 1
                    max_s = 1
                    for i in range(len(sorted_asc) - 1):
                        if sorted_asc[i+1] - sorted_asc[i] == timedelta(days=1):
                            temp_streak += 1
                            max_s = max(max_s, temp_streak)
                        elif sorted_asc[i+1] != sorted_asc[i]:
                            temp_streak = 1
                    longest_streak = max(max_s, current_streak)

            # Alarms count
            alarm_count_res = await db.execute(select(func.count(Alarm.alarm_id)).where(Alarm.user_id == u.id))
            total_alarms = alarm_count_res.scalar() or 0

            status_str = "Active" if u.is_active else "Inactive"

            user_item = {
                "id": u.id,
                "full_name": u.full_name,
                "email": u.email,
                "phone_number": prof.phone_number if prof else None,
                "role": u.role,
                "registration_date": u.created_at.strftime("%Y-%m-%d"),
                "last_login": u.updated_at.strftime("%Y-%m-%d %H:%M"),
                "account_status": status_str,
                "assigned_coach": coach_dict,
                "current_habit_score": cur_score,
                "total_challenges_completed": total_ch,
                "average_completion_time": avg_time,
                "success_rate": success_rate,
                "current_streak": current_streak,
                "longest_streak": longest_streak,
                "preferred_wakeup_time": prof.preferred_wakeup_time if prof else "07:00 AM",
                "total_alarms_created": total_alarms,
                "last_challenge_date": last_ch_date
            }

            # Filter Search
            if search:
                s_lower = search.lower()
                if s_lower not in u.full_name.lower() and s_lower not in u.email.lower():
                    continue

            # Filter Account Status
            if filter_status and filter_status != "all":
                if filter_status.lower() != status_str.lower():
                    continue

            # Filter Coach Assignment Status
            if filter_coach_status and filter_coach_status != "all":
                if filter_coach_status.lower() == "assigned" and not coach_dict:
                    continue
                if filter_coach_status.lower() == "unassigned" and coach_dict:
                    continue

            detailed_list.append(user_item)

        return detailed_list

    @staticmethod
    async def get_detailed_coaches(db: AsyncSession) -> list[dict]:
        """Retrieve all registered coaches with client counts, active count, avg score, avg completion rate."""
        coaches_res = await db.execute(select(User).where(User.role == "coach"))
        coaches = list(coaches_res.scalars().all())

        coach_list = []
        for c in coaches:
            prof_res = await db.execute(select(UserProfile).where(UserProfile.user_id == c.id))
            prof = prof_res.scalars().first()

            # Assigned users
            assign_res = await db.execute(
                select(CoachAssignment)
                .where(CoachAssignment.coach_id == c.id, CoachAssignment.status == "active")
            )
            assignments = list(assign_res.scalars().all())
            assigned_user_ids = [a.user_id for a in assignments]

            assigned_count = len(assigned_user_ids)
            active_count = 0
            avg_score = 0.0
            avg_completion_rate = 0.0

            if assigned_user_ids:
                active_res = await db.execute(
                    select(func.count(User.id)).where(User.id.in_(assigned_user_ids), User.is_active == True)
                )
                active_count = active_res.scalar() or 0

                # Scores across assigned users
                ch_res = await db.execute(
                    select(ChallengeResult).where(ChallengeResult.user_id.in_(assigned_user_ids))
                )
                ch_list = list(ch_res.scalars().all())
                if ch_list:
                    avg_score = round(sum(ch.habit_score for ch in ch_list) / len(ch_list), 1)
                    correct_count = sum(1 for ch in ch_list if ch.is_correct)
                    avg_completion_rate = round((correct_count / len(ch_list)) * 100, 1)

            coach_list.append({
                "id": c.id,
                "full_name": c.full_name,
                "email": c.email,
                "phone_number": prof.phone_number if prof else None,
                "role": c.role,
                "assigned_users_count": assigned_count,
                "total_active_users": active_count,
                "average_user_habit_score": avg_score,
                "average_challenge_completion_rate": avg_completion_rate,
                "created_at": c.created_at.strftime("%Y-%m-%d")
            })

        return coach_list

    @staticmethod
    async def get_user_full_analytics(db: AsyncSession, user_id: str) -> dict:
        """Fetch complete analytics for a specific user."""
        user_res = await db.execute(select(User).where(User.id == user_id))
        user = user_res.scalars().first()
        if not user:
            raise ValueError("User not found")

        prof_res = await db.execute(select(UserProfile).where(UserProfile.user_id == user.id))
        prof = prof_res.scalars().first()

        assign_res = await db.execute(
            select(CoachAssignment).where(CoachAssignment.user_id == user.id, CoachAssignment.status == "active")
        )
        assign = assign_res.scalars().first()
        coach_dict = None
        if assign:
            c_res = await db.execute(select(User).where(User.id == assign.coach_id))
            c_obj = c_res.scalars().first()
            if c_obj:
                coach_dict = {"id": c_obj.id, "full_name": c_obj.full_name, "email": c_obj.email}

        # Challenge Analytics
        ch_res = await db.execute(
            select(ChallengeResult)
            .where(ChallengeResult.user_id == user.id)
            .order_by(desc(ChallengeResult.completed_at))
        )
        ch_list = list(ch_res.scalars().all())

        total_ch = len(ch_list)
        failed_ch = sum(1 for c in ch_list if not c.is_correct)
        correct_ch = [c for c in ch_list if c.is_correct]
        times = [c.time_taken_seconds for c in correct_ch]
        avg_time = round(sum(times) / len(times), 1) if times else 0.0
        fastest = round(min(times), 1) if times else 0.0
        slowest = round(max(times), 1) if times else 0.0
        success_pct = round((len(correct_ch) / total_ch * 100), 1) if total_ch > 0 else 0.0

        # Difficulty breakdown
        diff_stats = {}
        for d in ["easy", "medium", "hard"]:
            d_items = [c for c in ch_list if (c.difficulty or "").lower() == d]
            if d_items:
                d_corr = sum(1 for c in d_items if c.is_correct)
                diff_stats[d] = {
                    "total": len(d_items),
                    "correct": d_corr,
                    "success_rate": round((d_corr / len(d_items)) * 100, 1),
                    "avg_score": round(sum(c.habit_score for c in d_items) / len(d_items), 1)
                }
            else:
                diff_stats[d] = {"total": 0, "correct": 0, "success_rate": 0.0, "avg_score": 0.0}

        # Habit Score Analytics
        scores = [c.habit_score for c in ch_list]
        cur_score = round(sum(scores[:5]) / len(scores[:5]), 1) if scores else 0.0
        highest_score = round(max(scores), 1) if scores else 0.0
        lowest_score = round(min(scores), 1) if scores else 0.0
        avg_score = round(sum(scores) / len(scores), 1) if scores else 0.0

        now = datetime.utcnow()
        w_items = [c for c in ch_list if c.completed_at >= now - timedelta(days=7)]
        weekly_score = round(sum(c.habit_score for c in w_items) / len(w_items), 1) if w_items else cur_score

        m_items = [c for c in ch_list if c.completed_at >= now - timedelta(days=30)]
        monthly_score = round(sum(c.habit_score for c in m_items) / len(m_items), 1) if m_items else cur_score

        # Alarm Analytics
        alarms_res = await db.execute(select(Alarm).where(Alarm.user_id == user.id))
        alarms = list(alarms_res.scalars().all())

        hist_res = await db.execute(
            select(AlarmHistory)
            .join(Alarm, Alarm.alarm_id == AlarmHistory.alarm_id)
            .where(Alarm.user_id == user.id)
        )
        hist_list = list(hist_res.scalars().all())
        completed_alarms = sum(1 for h in hist_list if h.solved)
        missed_alarms = sum(1 for h in hist_list if not h.solved)
        consistency = round((completed_alarms / len(hist_list) * 100), 1) if hist_list else 100.0

        # Performance Charts Datasets (Last 7 Days)
        trend_7_days = []
        for i in range(6, -1, -1):
            day_date = (now - timedelta(days=i)).date()
            day_items = [c for c in ch_list if c.completed_at.date() == day_date]
            day_score = round(sum(c.habit_score for c in day_items) / len(day_items), 1) if day_items else 0.0
            day_time = round(sum(c.time_taken_seconds for c in day_items) / len(day_items), 1) if day_items else 0.0
            day_rate = round((sum(1 for c in day_items if c.is_correct) / len(day_items) * 100), 1) if day_items else 0.0
            trend_7_days.append({
                "date": day_date.strftime("%Y-%m-%d"),
                "day": day_date.strftime("%a"),
                "habit_score": day_score,
                "completion_time": day_time,
                "success_rate": day_rate,
                "count": len(day_items)
            })

        return {
            "user_info": {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "phone_number": prof.phone_number if prof else None,
                "gender": prof.gender if prof else None,
                "preferred_wakeup_time": prof.preferred_wakeup_time if prof else "07:00 AM",
                "assigned_coach": coach_dict,
                "registration_date": user.created_at.strftime("%Y-%m-%d"),
                "account_status": "Active" if user.is_active else "Inactive"
            },
            "challenge_analytics": {
                "total_completed": total_ch,
                "total_failed": failed_ch,
                "average_completion_time": avg_time,
                "fastest_completion": fastest,
                "slowest_completion": slowest,
                "success_percentage": success_pct,
                "difficulty_performance": diff_stats
            },
            "habit_score_analytics": {
                "current_score": cur_score,
                "weekly_score": weekly_score,
                "monthly_score": monthly_score,
                "highest_score": highest_score,
                "lowest_score": lowest_score,
                "average_score": avg_score,
                "score_history": [c.to_dict() for c in ch_list[:20]]
            },
            "alarm_analytics": {
                "total_alarms": len(alarms),
                "completed_alarms": completed_alarms,
                "missed_alarms": missed_alarms,
                "snoozed_alarms": 0,
                "wakeup_consistency": consistency
            },
            "charts": {
                "habit_score_trend": trend_7_days,
                "weekly_progress": trend_7_days,
                "monthly_progress": trend_7_days,
                "completion_time_trend": trend_7_days,
                "success_rate_trend": trend_7_days,
                "difficulty_distribution": [
                    {"difficulty": "Easy", "count": diff_stats["easy"]["total"]},
                    {"difficulty": "Medium", "count": diff_stats["medium"]["total"]},
                    {"difficulty": "Hard", "count": diff_stats["hard"]["total"]}
                ]
            }
        }

    @staticmethod
    async def get_admin_dashboard_overview(db: AsyncSession) -> dict:
        """Fetch comprehensive dashboard overview for system administrator."""
        users_res = await db.execute(select(User).where(User.role == "user"))
        users = list(users_res.scalars().all())
        total_users = len(users)

        active_users = sum(1 for u in users if u.is_active)
        coaches_res = await db.execute(select(User).where(User.role == "coach"))
        total_coaches = len(coaches_res.scalars().all())

        now = datetime.utcnow()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

        ch_res = await db.execute(select(ChallengeResult))
        ch_list = list(ch_res.scalars().all())

        today_ch = [c for c in ch_list if c.completed_at >= today_start]
        total_challenges = len(ch_list)
        avg_habit_score = round(sum(c.habit_score for c in ch_list) / len(ch_list), 1) if ch_list else 0.0

        alarms_res = await db.execute(select(func.count(Alarm.alarm_id)).where(Alarm.is_active == True))
        active_alarms = alarms_res.scalar() or 0

        new_regs_today = sum(1 for u in users if u.created_at >= today_start)

        # Charts Datasets
        last_7_days = []
        for i in range(6, -1, -1):
            d_date = (now - timedelta(days=i)).date()
            d_users = sum(1 for u in users if u.created_at.date() <= d_date)
            d_ch = [c for c in ch_list if c.completed_at.date() == d_date]
            d_score = round(sum(c.habit_score for c in d_ch) / len(d_ch), 1) if d_ch else 0.0
            last_7_days.append({
                "date": d_date.strftime("%Y-%m-%d"),
                "day": d_date.strftime("%a"),
                "user_count": d_users,
                "challenges_completed": len(d_ch),
                "avg_habit_score": d_score
            })

        # Recent activities feed
        activities = []
        # Registrations
        for u in sorted(users, key=lambda x: x.created_at, reverse=True)[:5]:
            activities.append({
                "id": f"reg_{u.id}",
                "type": "New User Registration",
                "icon": "account-plus",
                "title": f"New User Registered: {u.full_name}",
                "time": u.created_at.strftime("%b %d, %H:%M")
            })
        # High scores
        high_ch = [c for c in ch_list if c.habit_score >= 75]
        for c in sorted(high_ch, key=lambda x: x.completed_at, reverse=True)[:5]:
            activities.append({
                "id": f"score_{c.id}",
                "type": "High Habit Score Achieved",
                "icon": "trophy",
                "title": f"Habit Score {c.habit_score:.1f} earned in {c.difficulty.capitalize()} Challenge",
                "time": c.completed_at.strftime("%b %d, %H:%M")
            })

        return {
            "overview_cards": {
                "total_users": total_users,
                "total_coaches": total_coaches,
                "active_users_today": active_users,
                "challenges_completed_today": len(today_ch),
                "average_habit_score": avg_habit_score,
                "total_challenges_completed": total_challenges,
                "active_alarms": active_alarms,
                "new_registrations_today": new_regs_today
            },
            "charts": {
                "user_growth": last_7_days,
                "daily_challenges": last_7_days,
                "habit_score_trend": last_7_days,
                "challenge_difficulty_distribution": [
                    {"difficulty": "Easy", "count": sum(1 for c in ch_list if c.difficulty.lower() == "easy")},
                    {"difficulty": "Medium", "count": sum(1 for c in ch_list if c.difficulty.lower() == "medium")},
                    {"difficulty": "Hard", "count": sum(1 for c in ch_list if c.difficulty.lower() == "hard")}
                ],
                "weekly_active_users": last_7_days
            },
            "recent_activities": activities[:10]
        }

    # Backward compatibility methods
    @staticmethod
    async def get_admin_dashboard_stats(db: AsyncSession) -> dict:
        overview = await AdminService.get_admin_dashboard_overview(db)
        return overview["overview_cards"]

    @staticmethod
    async def get_all_users(db: AsyncSession) -> list[User]:
        res = await db.execute(select(User))
        return list(res.scalars().all())

    @staticmethod
    async def create_user(db: AsyncSession, email: str, full_name: str, password_hash: str, role: str) -> User:
        user = User(email=email, full_name=full_name, hashed_password=password_hash, role=role, is_verified=True)
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def update_user(db: AsyncSession, user_id: str, updates: dict) -> User | None:
        res = await db.execute(select(User).where(User.id == user_id))
        user = res.scalars().first()
        if not user:
            return None
        for k, v in updates.items():
            setattr(user, k, v)
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def delete_user(db: AsyncSession, user_id: str) -> bool:
        res = await db.execute(select(User).where(User.id == user_id))
        user = res.scalars().first()
        if not user:
            return False
        await db.delete(user)
        await db.commit()
        return True

    @staticmethod
    async def update_user_status(db: AsyncSession, user_id: str, is_active: bool) -> User | None:
        return await AdminService.update_user(db, user_id, {"is_active": is_active})

    @staticmethod
    async def get_coaches(db: AsyncSession) -> list[User]:
        res = await db.execute(select(User).where(User.role == "coach"))
        return list(res.scalars().all())
