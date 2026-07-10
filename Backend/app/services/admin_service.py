from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.models.user_model import User
from app.models.habit_model import Habit
from app.models.alarm_model import Alarm, AlarmHistory
from app.models.coach_model import CoachAssignment, CoachMessage

class AdminService:
    @staticmethod
    async def get_admin_dashboard_stats(db: AsyncSession) -> dict:
        """Fetch general stats for administration dashboard"""
        users_res = await db.execute(select(func.count(User.id)))
        total_users = users_res.scalar() or 0

        active_users_res = await db.execute(select(func.count(User.id)).where(User.is_active == True))
        active_users = active_users_res.scalar() or 0
        inactive_users = total_users - active_users

        coaches_res = await db.execute(select(func.count(User.id)).where(User.role == "coach"))
        coaches = coaches_res.scalar() or 0

        alarms_res = await db.execute(select(func.count(Alarm.alarm_id)))
        total_alarms = alarms_res.scalar() or 0

        habits_res = await db.execute(select(func.count(Habit.habit_id)))
        total_habits = habits_res.scalar() or 0

        history_res = await db.execute(select(func.count(AlarmHistory.history_id)))
        total_challenges = history_res.scalar() or 0

        # Today's wakeups count
        todays_wakeups = 0
        wakeups_res = await db.execute(
            select(func.count(AlarmHistory.history_id))
            .where(AlarmHistory.dismissed_at >= datetime_today_start())
        )
        todays_wakeups = wakeups_res.scalar() or 0

        return {
            "total_users": total_users,
            "active_users": active_users,
            "inactive_users": inactive_users,
            "total_coaches": coaches,
            "total_alarms": total_alarms,
            "total_habits": total_habits,
            "total_challenges": total_challenges,
            "todays_wakeups": todays_wakeups,
            "todays_missed_alarms": 0,
            "system_health": "Healthy"
        }

    @staticmethod
    async def get_all_users(db: AsyncSession) -> list[User]:
        """Fetch all user accounts"""
        result = await db.execute(select(User))
        return list(result.scalars().all())

    @staticmethod
    async def create_user(db: AsyncSession, email: str, full_name: str, password_hash: str, role: str) -> User:
        """Manually create user account"""
        user = User(email=email, full_name=full_name, hashed_password=password_hash, role=role, is_verified=True)
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def update_user(db: AsyncSession, user_id: str, updates: dict) -> User | None:
        """Modify user credentials or state"""
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalars().first()
        if not user:
            return None
        for key, value in updates.items():
            setattr(user, key, value)
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def delete_user(db: AsyncSession, user_id: str) -> bool:
        """Permanently delete user account"""
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalars().first()
        if not user:
            return False
        await db.delete(user)
        await db.commit()
        return True

    @staticmethod
    async def update_user_status(db: AsyncSession, user_id: str, is_active: bool) -> User | None:
        """Activate or Suspend user account"""
        return await AdminService.update_user(db, user_id, {"is_active": is_active})

    @staticmethod
    async def get_coaches(db: AsyncSession) -> list[User]:
        """Get list of coaches"""
        result = await db.execute(select(User).where(User.role == "coach"))
        return list(result.scalars().all())

def datetime_today_start():
    from datetime import datetime
    return datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
