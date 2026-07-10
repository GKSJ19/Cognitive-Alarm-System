from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.models.user_model import User
from app.models.coach_model import CoachAssignment, CoachMessage
from app.models.habit_model import Habit, HabitProgress
from app.models.alarm_model import Alarm, AlarmHistory
from app.schemas.coach_schemas import CoachMessageCreate, CoachAssignRequest

class CoachService:
    @staticmethod
    async def get_assigned_users(db: AsyncSession, coach_id: str) -> list[User]:
        """Fetch all users assigned to the coach"""
        result = await db.execute(
            select(User)
            .join(CoachAssignment, CoachAssignment.user_id == User.id)
            .where(CoachAssignment.coach_id == coach_id, CoachAssignment.status == "active")
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_coach_dashboard_stats(db: AsyncSession, coach_id: str) -> dict:
        """Fetch summary statistics for the coach dashboard"""
        assigned_users = await CoachService.get_assigned_users(db, coach_id)
        total_assigned = len(assigned_users)
        
        active_users = sum(1 for u in assigned_users if u.is_active)
        
        # Today's date YYYY-MM-DD
        today_str = datetime.utcnow().strftime("%Y-%m-%d")
        
        # Today's wakeups
        user_ids = [u.id for u in assigned_users]
        todays_wakeups = 0
        habit_completion_rate = 0.0
        alarm_success_rate = 0.0
        challenge_success_rate = 0.0

        if user_ids:
            # Wake-ups today
            history_res = await db.execute(
                select(func.count(AlarmHistory.history_id))
                .join(Alarm, Alarm.alarm_id == AlarmHistory.alarm_id)
                .where(Alarm.user_id.in_(user_ids), AlarmHistory.dismissed_at >= datetime.utcnow().replace(hour=0, minute=0, second=0))
            )
            todays_wakeups = history_res.scalar() or 0

            # Habit completion rate (overall)
            habits_res = await db.execute(select(func.count(Habit.habit_id)).where(Habit.user_id.in_(user_ids)))
            total_habits = habits_res.scalar() or 0
            if total_habits > 0:
                completions_res = await db.execute(
                    select(func.count(HabitProgress.progress_id))
                    .join(Habit, Habit.habit_id == HabitProgress.habit_id)
                    .where(Habit.user_id.in_(user_ids), HabitProgress.status == "completed")
                )
                total_completions = completions_res.scalar() or 0
                habit_completion_rate = round((total_completions / (total_habits * 30)) * 100, 1) # out of past 30 days
            
            # Alarm success rate
            alarms_res = await db.execute(select(func.count(Alarm.alarm_id)).where(Alarm.user_id.in_(user_ids)))
            total_alarms = alarms_res.scalar() or 0
            if total_alarms > 0:
                dismissed_res = await db.execute(
                    select(func.count(AlarmHistory.history_id))
                    .join(Alarm, Alarm.alarm_id == AlarmHistory.alarm_id)
                    .where(Alarm.user_id.in_(user_ids), AlarmHistory.solved == True)
                )
                solved_count = dismissed_res.scalar() or 0
                alarm_success_rate = round((solved_count / (total_alarms * 30)) * 100, 1)
                challenge_success_rate = alarm_success_rate # mapped matching challenge dismissal rates

        return {
            "total_assigned_users": total_assigned,
            "active_users": active_users,
            "todays_wakeups": todays_wakeups,
            "habit_completion_rate": min(habit_completion_rate, 100.0),
            "alarm_success_rate": min(alarm_success_rate, 100.0),
            "challenge_success_rate": min(challenge_success_rate, 100.0)
        }

    @staticmethod
    async def get_user_progress(db: AsyncSession, user_id: str) -> dict:
        """Fetch unified history progress and stats for a client"""
        habits_res = await db.execute(select(Habit).where(Habit.user_id == user_id))
        habits = habits_res.scalars().all()
        
        alarms_res = await db.execute(select(Alarm).where(Alarm.user_id == user_id))
        alarms = alarms_res.scalars().all()

        history_res = await db.execute(
            select(AlarmHistory)
            .join(Alarm, Alarm.alarm_id == AlarmHistory.alarm_id)
            .where(Alarm.user_id == user_id)
        )
        history = history_res.scalars().all()

        progress_res = await db.execute(
            select(HabitProgress)
            .join(Habit, Habit.habit_id == HabitProgress.habit_id)
            .where(Habit.user_id == user_id)
        )
        progress = progress_res.scalars().all()

        return {
            "habits": [h.to_dict() for h in habits],
            "alarms": [a.to_dict() for a in alarms],
            "alarm_history": [hist.to_dict() for hist in history],
            "habit_progress": [p.to_dict() for p in progress]
        }

    @staticmethod
    async def send_coach_message(db: AsyncSession, coach_id: str, data: CoachMessageCreate) -> CoachMessage:
        """Send motivational message to user"""
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
        """Delete motivational message"""
        result = await db.execute(select(CoachMessage).where(CoachMessage.message_id == msg_id))
        msg = result.scalars().first()
        if not msg:
            return False
        await db.delete(msg)
        await db.commit()
        return True

    @staticmethod
    async def get_sent_messages(db: AsyncSession, coach_id: str) -> list[CoachMessage]:
        """Fetch all messages sent by this coach"""
        result = await db.execute(select(CoachMessage).where(CoachMessage.coach_id == coach_id))
        return list(result.scalars().all())

    @staticmethod
    async def assign_user(db: AsyncSession, req: CoachAssignRequest) -> CoachAssignment:
        """Assign client user to coach"""
        # Check if already assigned
        existing = await db.execute(
            select(CoachAssignment)
            .where(CoachAssignment.coach_id == req.coach_id, CoachAssignment.user_id == req.user_id)
        )
        assignment = existing.scalars().first()
        if assignment:
            assignment.status = "active"
        else:
            assignment = CoachAssignment(coach_id=req.coach_id, user_id=req.user_id, status="active")
            db.add(assignment)
        
        await db.commit()
        await db.refresh(assignment)
        return assignment

    @staticmethod
    async def remove_user(db: AsyncSession, coach_id: str, user_id: str) -> bool:
        """Remove user assignment link"""
        result = await db.execute(
            select(CoachAssignment)
            .where(CoachAssignment.coach_id == coach_id, CoachAssignment.user_id == user_id)
        )
        assignment = result.scalars().first()
        if not assignment:
            return False
        await db.delete(assignment)
        await db.commit()
        return True
