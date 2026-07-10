from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from app.models.habit_model import Habit, HabitProgress
from app.schemas.habit_schemas import HabitCreate, HabitUpdate, HabitCompleteRequest

class HabitService:
    @staticmethod
    async def get_habits_by_user(db: AsyncSession, user_id: str) -> list[Habit]:
        """Fetch all habits for a user"""
        result = await db.execute(select(Habit).where(Habit.user_id == user_id))
        return list(result.scalars().all())

    @staticmethod
    async def create_habit(db: AsyncSession, user_id: str, data: HabitCreate) -> Habit:
        """Create a new habit"""
        habit = Habit(
            user_id=user_id,
            title=data.title,
            description=data.description,
            frequency=data.frequency,
            reminder_time=data.reminder_time,
            target_days=data.target_days,
            is_active=data.is_active
        )
        db.add(habit)
        await db.commit()
        await db.refresh(habit)
        return habit

    @staticmethod
    async def update_habit(db: AsyncSession, user_id: str, habit_id: str, data: HabitUpdate) -> Habit | None:
        """Update an existing habit"""
        result = await db.execute(select(Habit).where(Habit.habit_id == habit_id, Habit.user_id == user_id))
        habit = result.scalars().first()
        if not habit:
            return None
            
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(habit, key, value)
            
        await db.commit()
        await db.refresh(habit)
        return habit

    @staticmethod
    async def delete_habit(db: AsyncSession, user_id: str, habit_id: str) -> bool:
        """Delete a habit"""
        result = await db.execute(select(Habit).where(Habit.habit_id == habit_id, Habit.user_id == user_id))
        habit = result.scalars().first()
        if not habit:
            return False
            
        await db.delete(habit)
        await db.commit()
        return True

    @staticmethod
    async def complete_habit(db: AsyncSession, user_id: str, req: HabitCompleteRequest) -> HabitProgress | None:
        """Record progress (completion) for a habit and calculate streak"""
        # Ensure habit belongs to user
        res = await db.execute(select(Habit).where(Habit.habit_id == req.habit_id, Habit.user_id == user_id))
        habit = res.scalars().first()
        if not habit:
            return None

        # Check if completion for this date already exists
        exists_res = await db.execute(
            select(HabitProgress).where(
                HabitProgress.habit_id == req.habit_id,
                HabitProgress.completion_date == req.completion_date
            )
        )
        existing = exists_res.scalars().first()
        if existing:
            # Update status if needed
            existing.status = req.status
            await db.commit()
            await db.refresh(existing)
            return existing

        # Fetch recent completions to calculate streak
        all_progress_res = await db.execute(
            select(HabitProgress)
            .where(HabitProgress.habit_id == req.habit_id)
            .order_by(HabitProgress.completion_date.desc())
        )
        progress_list = all_progress_res.scalars().all()

        streak = 1
        if progress_list:
            last_progress = progress_list[0]
            try:
                last_date = datetime.strptime(last_progress.completion_date, "%Y-%m-%d")
                curr_date = datetime.strptime(req.completion_date, "%Y-%m-%d")
                delta = curr_date - last_date
                
                if delta.days == 1:
                    streak = last_progress.streak_count + 1
                elif delta.days <= 0:
                    streak = last_progress.streak_count
                else:
                    streak = 1
            except Exception:
                streak = 1

        new_progress = HabitProgress(
            habit_id=req.habit_id,
            completion_date=req.completion_date,
            status=req.status,
            streak_count=streak
        )
        db.add(new_progress)
        await db.commit()
        await db.refresh(new_progress)
        return new_progress

    @staticmethod
    async def get_habit_progress(db: AsyncSession, user_id: str) -> list[HabitProgress]:
        """Fetch all progress logged by the user's habits"""
        result = await db.execute(
            select(HabitProgress)
            .join(Habit, Habit.habit_id == HabitProgress.habit_id)
            .where(Habit.user_id == user_id)
        )
        return list(result.scalars().all())
