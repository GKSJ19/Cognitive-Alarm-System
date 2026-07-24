from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, desc
from app.models.user_model import User
from app.models.profile_model import UserProfile
from app.models.coach_model import CoachAssignment, CoachMessage, CoachNotification
from app.models.habit_model import Habit, HabitProgress, ChallengeResult
from app.models.alarm_model import Alarm, AlarmHistory
from app.schemas.coach_schemas import CoachMessageCreate, CoachAssignRequest
from app.services.admin_service import AdminService

class CoachService:
    @staticmethod
    async def verify_coach_access(db: AsyncSession, coach_id: str, user_id: str) -> bool:
        """Verify if a coach is authorized to view a user's data (RBAC enforcement)."""
        res = await db.execute(
            select(CoachAssignment)
            .where(CoachAssignment.coach_id == coach_id, CoachAssignment.user_id == user_id, CoachAssignment.status == "active")
        )
        return res.scalars().first() is not None

    @staticmethod
    async def get_assigned_users(db: AsyncSession, coach_id: str) -> list[User]:
        """Fetch all users assigned to the coach."""
        result = await db.execute(
            select(User)
            .join(CoachAssignment, CoachAssignment.user_id == User.id)
            .where(CoachAssignment.coach_id == coach_id, CoachAssignment.status == "active")
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_assigned_users_detailed(
        db: AsyncSession,
        coach_id: str,
        search: str | None = None,
        filter_status: str | None = None
    ) -> list[dict]:
        """
        Fetch cards for assigned clients with metrics:
        Name, Email, Current Habit Score, Current Streak, Total Challenges, Avg Completion Time, Last Active, Account Status.
        """
        assigned_users = await CoachService.get_assigned_users(db, coach_id)

        user_cards = []
        for u in assigned_users:
            ch_res = await db.execute(
                select(ChallengeResult)
                .where(ChallengeResult.user_id == u.id)
                .order_by(desc(ChallengeResult.completed_at))
            )
            ch_list = list(ch_res.scalars().all())

            total_ch = len(ch_list)
            times = [c.time_taken_seconds for c in ch_list if c.is_correct]
            avg_time = round(sum(times) / len(times), 1) if times else 0.0

            recent_scores = [c.habit_score for c in ch_list[:5]]
            cur_score = round(sum(recent_scores) / len(recent_scores), 1) if recent_scores else 0.0

            # Calculate streak
            current_streak = 0
            if ch_list:
                dates = sorted(list(set(c.completed_at.date() for c in ch_list if c.is_correct)), reverse=True)
                today = datetime.utcnow().date()
                if dates and (dates[0] == today or dates[0] == today - timedelta(days=1)):
                    current_streak = 1
                    for i in range(len(dates) - 1):
                        if dates[i] - dates[i+1] == timedelta(days=1):
                            current_streak += 1
                        else:
                            break

            status_str = "Active" if u.is_active else "Inactive"
            last_active = u.updated_at.strftime("%Y-%m-%d %H:%M")

            card = {
                "id": u.id,
                "full_name": u.full_name,
                "email": u.email,
                "current_habit_score": cur_score,
                "current_streak": current_streak,
                "total_challenges": total_ch,
                "average_completion_time": avg_time,
                "last_active": last_active,
                "account_status": status_str
            }

            # Filter Search
            if search:
                s_lower = search.lower()
                if s_lower not in u.full_name.lower() and s_lower not in u.email.lower():
                    continue

            # Filter Status
            if filter_status and filter_status != "all":
                if filter_status.lower() != status_str.lower():
                    continue

            user_cards.append(card)

        return user_cards

    @staticmethod
    async def get_assigned_user_analytics(db: AsyncSession, coach_id: str, user_id: str) -> dict:
        """
        Fetch full analytics for a client assigned to the coach.
        Strict RBAC check: raises PermissionError if user is not assigned to this coach!
        """
        is_assigned = await CoachService.verify_coach_access(db, coach_id, user_id)
        if not is_assigned:
            raise PermissionError("Access Denied: User is not assigned to this coach")

        return await AdminService.get_user_full_analytics(db, user_id)

    @staticmethod
    async def get_coach_dashboard_overview(db: AsyncSession, coach_id: str) -> dict:
        """Fetch summary statistics and overview for the coach dashboard."""
        assigned_users = await CoachService.get_assigned_users(db, coach_id)
        user_ids = [u.id for u in assigned_users]

        total_assigned = len(assigned_users)
        active_today = 0
        avg_score = 0.0
        weekly_improvement = 0.0
        total_challenges = 0
        avg_time = 0.0

        if user_ids:
            now = datetime.utcnow()
            today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

            # Active users today
            ch_today_res = await db.execute(
                select(ChallengeResult.user_id)
                .where(ChallengeResult.user_id.in_(user_ids), ChallengeResult.completed_at >= today_start)
                .distinct()
            )
            active_today = len(ch_today_res.scalars().all())

            # Challenges across assigned clients
            ch_res = await db.execute(
                select(ChallengeResult).where(ChallengeResult.user_id.in_(user_ids))
            )
            ch_list = list(ch_res.scalars().all())

            total_challenges = len(ch_list)
            if total_challenges > 0:
                avg_score = round(sum(c.habit_score for c in ch_list) / total_challenges, 1)
                correct_times = [c.time_taken_seconds for c in ch_list if c.is_correct]
                avg_time = round(sum(correct_times) / len(correct_times), 1) if correct_times else 0.0

                # Weekly improvement calculation (this week vs last week avg score)
                this_week_items = [c for c in ch_list if c.completed_at >= now - timedelta(days=7)]
                last_week_items = [c for c in ch_list if now - timedelta(days=14) <= c.completed_at < now - timedelta(days=7)]

                tw_avg = sum(c.habit_score for c in this_week_items) / len(this_week_items) if this_week_items else avg_score
                lw_avg = sum(c.habit_score for c in last_week_items) / len(last_week_items) if last_week_items else tw_avg
                weekly_improvement = round(tw_avg - lw_avg, 1)

        notifications = await CoachService.get_coach_notifications(db, coach_id)

        return {
            "summary_cards": {
                "assigned_users": total_assigned,
                "active_users_today": active_today,
                "average_habit_score": avg_score,
                "weekly_improvement": weekly_improvement,
                "total_challenges_completed": total_challenges,
                "average_completion_time": avg_time
            },
            "notifications": notifications[:10]
        }

    @staticmethod
    async def get_coach_notifications(db: AsyncSession, coach_id: str) -> list[dict]:
        """Generate smart notifications for a coach regarding their assigned clients."""
        assigned_users = await CoachService.get_assigned_users(db, coach_id)
        notifications = []

        now = datetime.utcnow()

        for u in assigned_users:
            ch_res = await db.execute(
                select(ChallengeResult)
                .where(ChallengeResult.user_id == u.id)
                .order_by(desc(ChallengeResult.completed_at))
            )
            ch_list = list(ch_res.scalars().all())

            if ch_list:
                latest = ch_list[0]
                # High score notification
                if latest.habit_score >= 75.0 and (now - latest.completed_at).days <= 2:
                    notifications.append({
                        "id": f"high_{u.id}_{latest.id}",
                        "type": "HIGH_SCORE",
                        "user_id": u.id,
                        "title": f"🏆 High Score Achieved!",
                        "message": f"{u.full_name} achieved an impressive Habit Score of {latest.habit_score:.1f} pts in {latest.challenge_type.upper()}.",
                        "time": latest.completed_at.strftime("%b %d, %H:%M"),
                        "is_read": False
                    })

                # Streak notification
                correct_dates = sorted(list(set(c.completed_at.date() for c in ch_list if c.is_correct)), reverse=True)
                if len(correct_dates) >= 5:
                    notifications.append({
                        "id": f"streak_{u.id}",
                        "type": "STREAK",
                        "user_id": u.id,
                        "title": f"🔥 Great Wake-up Streak!",
                        "message": f"{u.full_name} has maintained a consistent challenge completion streak of {len(correct_dates)} days.",
                        "time": "Today",
                        "is_read": False
                    })

                # Inactivity notification
                if (now - latest.completed_at).days >= 3:
                    notifications.append({
                        "id": f"inact_{u.id}",
                        "type": "INACTIVE",
                        "user_id": u.id,
                        "title": f"⚠️ Client Inactivity Alert",
                        "message": f"{u.full_name} has been inactive for {(now - latest.completed_at).days} days. Consider sending a reminder message.",
                        "time": f"{(now - latest.completed_at).days}d ago",
                        "is_read": False
                    })

        # Sort notifications by newest
        return notifications

    @staticmethod
    async def get_coach_dashboard_stats(db: AsyncSession, coach_id: str) -> dict:
        overview = await CoachService.get_coach_dashboard_overview(db, coach_id)
        cards = overview["summary_cards"]
        return {
            "total_assigned_users": cards["assigned_users"],
            "active_users": cards["active_users_today"],
            "todays_wakeups": cards["active_users_today"],
            "habit_completion_rate": min(cards["average_habit_score"], 100.0),
            "alarm_success_rate": min(cards["average_habit_score"], 100.0),
            "challenge_success_rate": min(cards["average_habit_score"], 100.0)
        }

    @staticmethod
    async def send_coach_message(db: AsyncSession, coach_id: str, data: CoachMessageCreate) -> CoachMessage:
        msg = CoachMessage(
            coach_id=coach_id,
            user_id=data.user_id,
            title=data.title,
            message=data.message
        )
        db.add(msg)
        await db.commit()
        await db.refresh(msg)
        return msg

    @staticmethod
    async def delete_coach_message(db: AsyncSession, msg_id: str) -> bool:
        result = await db.execute(select(CoachMessage).where(CoachMessage.message_id == msg_id))
        msg = result.scalars().first()
        if not msg:
            return False
        await db.delete(msg)
        await db.commit()
        return True

    @staticmethod
    async def get_sent_messages(db: AsyncSession, coach_id: str) -> list[CoachMessage]:
        result = await db.execute(select(CoachMessage).where(CoachMessage.coach_id == coach_id))
        return list(result.scalars().all())

    @staticmethod
    async def assign_user(db: AsyncSession, req: CoachAssignRequest) -> CoachAssignment:
        return await AdminService.assign_coach(db, req.coach_id, req.user_id, req.assigned_by_admin)

    @staticmethod
    async def remove_user(db: AsyncSession, coach_id: str, user_id: str) -> bool:
        return await AdminService.remove_coach_assignment(db, user_id)

    @staticmethod
    async def get_user_progress(db: AsyncSession, user_id: str) -> dict:
        return await AdminService.get_user_full_analytics(db, user_id)
