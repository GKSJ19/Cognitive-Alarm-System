from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, desc
from app.models.habit_model import Habit, HabitProgress, ChallengeResult
from app.schemas.habit_schemas import (
    HabitCreate, HabitUpdate, HabitCompleteRequest,
    ChallengeResultCreate
)

class HabitService:
    @staticmethod
    def calculate_habit_score(
        difficulty: str,
        time_taken_seconds: float,
        is_correct: bool,
        attempts: int = 1
    ) -> float:
        """
        Calculate Habit Score automatically.
        Rules:
        - Easy -> Base 40
        - Medium -> Base 60
        - Hard -> Base 80
        - Time Penalty: - 0.5 points per second taken
        - First attempt bonus: +5 points if is_correct and attempts == 1
        - Incorrect answer: score = 0.0
        - Score never negative: max(0.0, score)
        """
        if not is_correct:
            return 0.0

        diff_lower = (difficulty or "medium").strip().lower()
        if diff_lower == "easy":
            base_score = 40.0
        elif diff_lower == "hard":
            base_score = 80.0
        else: # medium or default
            base_score = 60.0

        penalty = time_taken_seconds * 0.5
        score = base_score - penalty

        # First-attempt bonus
        if attempts == 1:
            score += 5.0

        return max(0.0, round(score, 2))

    @staticmethod
    async def record_challenge_result(
        db: AsyncSession,
        user_id: str,
        data: ChallengeResultCreate
    ) -> ChallengeResult:
        """Record completed cognitive challenge result and calculate habit score."""
        score = HabitService.calculate_habit_score(
            difficulty=data.difficulty,
            time_taken_seconds=data.time_taken_seconds,
            is_correct=data.is_correct,
            attempts=data.attempts
        )

        result = ChallengeResult(
            user_id=user_id,
            challenge_id=data.challenge_id,
            challenge_type=data.challenge_type or "math",
            difficulty=data.difficulty or "medium",
            time_taken_seconds=data.time_taken_seconds,
            is_correct=data.is_correct,
            attempts=data.attempts,
            habit_score=score,
            completed_at=datetime.utcnow()
        )

        db.add(result)
        await db.commit()
        await db.refresh(result)
        return result

    @staticmethod
    async def get_latest_habit_score(db: AsyncSession, user_id: str) -> float:
        """Get the latest calculated habit score for user."""
        res = await db.execute(
            select(ChallengeResult)
            .where(ChallengeResult.user_id == user_id)
            .order_by(desc(ChallengeResult.completed_at))
            .limit(1)
        )
        latest = res.scalars().first()
        return latest.habit_score if latest else 0.0

    @staticmethod
    async def get_challenge_history(db: AsyncSession, user_id: str, limit: int = 50) -> list[ChallengeResult]:
        """Fetch challenge completion history for user."""
        res = await db.execute(
            select(ChallengeResult)
            .where(ChallengeResult.user_id == user_id)
            .order_by(desc(ChallengeResult.completed_at))
            .limit(limit)
        )
        return list(res.scalars().all())

    @staticmethod
    async def get_habit_score_analytics(db: AsyncSession, user_id: str) -> dict:
        """Generate comprehensive Habit Score analytics and dashboard metrics."""
        history = await HabitService.get_challenge_history(db, user_id, limit=200)

        if not history:
            return {
                "current_habit_score": 0.0,
                "average_completion_time": 0.0,
                "total_challenges_completed": 0,
                "success_rate": 0.0,
                "fastest_completion_time": 0.0,
                "weekly_avg_score": 0.0,
                "monthly_avg_score": 0.0,
                "score_trend_7_days": [],
                "weekly_progress": [],
                "monthly_progress": [],
                "difficulty_performance": [
                    {"difficulty": "easy", "total": 0, "correct": 0, "success_rate": 0.0, "avg_score": 0.0, "avg_time_seconds": 0.0},
                    {"difficulty": "medium", "total": 0, "correct": 0, "success_rate": 0.0, "avg_score": 0.0, "avg_time_seconds": 0.0},
                    {"difficulty": "hard", "total": 0, "correct": 0, "success_rate": 0.0, "avg_score": 0.0, "avg_time_seconds": 0.0},
                ],
                "recent_history": []
            }

        total_completed = len(history)
        correct_list = [h for h in history if h.is_correct]
        success_rate = round((len(correct_list) / total_completed) * 100.0, 1)

        times = [h.time_taken_seconds for h in history if h.is_correct]
        avg_time = round(sum(times) / len(times), 1) if times else 0.0
        fastest_time = round(min(times), 1) if times else 0.0

        # Current score: latest challenge score or rolling average of last 5
        recent_scores = [h.habit_score for h in history[:5]]
        current_score = round(sum(recent_scores) / len(recent_scores), 1) if recent_scores else 0.0

        now = datetime.utcnow()
        seven_days_ago = now - timedelta(days=7)
        thirty_days_ago = now - timedelta(days=30)

        weekly_items = [h for h in history if h.completed_at >= seven_days_ago]
        weekly_avg = round(sum(h.habit_score for h in weekly_items) / len(weekly_items), 1) if weekly_items else current_score

        monthly_items = [h for h in history if h.completed_at >= thirty_days_ago]
        monthly_avg = round(sum(h.habit_score for h in monthly_items) / len(monthly_items), 1) if monthly_items else current_score

        # 7-day score trend breakdown
        trend_7_days = []
        for i in range(6, -1, -1):
            day_date = (now - timedelta(days=i)).date()
            day_str = day_date.strftime("%Y-%m-%d")
            day_items = [h for h in history if h.completed_at.date() == day_date]
            if day_items:
                day_avg = round(sum(h.habit_score for h in day_items) / len(day_items), 1)
                count = len(day_items)
            else:
                day_avg = 0.0
                count = 0
            trend_7_days.append({
                "date": day_str,
                "average_score": day_avg,
                "count": count
            })

        # Difficulty performance breakdown
        diff_stats = {}
        for d in ["easy", "medium", "hard"]:
            d_items = [h for h in history if (h.difficulty or "").lower() == d]
            if d_items:
                d_correct = [h for h in d_items if h.is_correct]
                d_total = len(d_items)
                d_success = round((len(d_correct) / d_total) * 100.0, 1)
                d_avg_score = round(sum(h.habit_score for h in d_items) / d_total, 1)
                d_avg_time = round(sum(h.time_taken_seconds for h in d_items) / d_total, 1)
                diff_stats[d] = {
                    "difficulty": d.capitalize(),
                    "total": d_total,
                    "correct": len(d_correct),
                    "success_rate": d_success,
                    "avg_score": d_avg_score,
                    "avg_time_seconds": d_avg_time
                }
            else:
                diff_stats[d] = {
                    "difficulty": d.capitalize(),
                    "total": 0,
                    "correct": 0,
                    "success_rate": 0.0,
                    "avg_score": 0.0,
                    "avg_time_seconds": 0.0
                }

        return {
            "current_habit_score": current_score,
            "average_completion_time": avg_time,
            "total_challenges_completed": total_completed,
            "success_rate": success_rate,
            "fastest_completion_time": fastest_time,
            "weekly_avg_score": weekly_avg,
            "monthly_avg_score": monthly_avg,
            "score_trend_7_days": trend_7_days,
            "weekly_progress": trend_7_days,
            "monthly_progress": trend_7_days,
            "difficulty_performance": list(diff_stats.values()),
            "recent_history": [h.to_dict() for h in history[:20]]
        }

    # --- Legacy Habit methods preserved for backwards compatibility ---
    @staticmethod
    async def get_habits_by_user(db: AsyncSession, user_id: str) -> list[Habit]:
        result = await db.execute(select(Habit).where(Habit.user_id == user_id))
        return list(result.scalars().all())

    @staticmethod
    async def create_habit(db: AsyncSession, user_id: str, data: HabitCreate) -> Habit:
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
        result = await db.execute(select(Habit).where(Habit.habit_id == habit_id, Habit.user_id == user_id))
        habit = result.scalars().first()
        if not habit:
            return False
        await db.delete(habit)
        await db.commit()
        return True

    @staticmethod
    async def complete_habit(db: AsyncSession, user_id: str, req: HabitCompleteRequest) -> HabitProgress | None:
        res = await db.execute(select(Habit).where(Habit.habit_id == req.habit_id, Habit.user_id == user_id))
        habit = res.scalars().first()
        if not habit:
            return None
        exists_res = await db.execute(
            select(HabitProgress).where(
                HabitProgress.habit_id == req.habit_id,
                HabitProgress.completion_date == req.completion_date
            )
        )
        existing = exists_res.scalars().first()
        if existing:
            existing.status = req.status
            await db.commit()
            await db.refresh(existing)
            return existing
        new_progress = HabitProgress(
            habit_id=req.habit_id,
            completion_date=req.completion_date,
            status=req.status,
            streak_count=1
        )
        db.add(new_progress)
        await db.commit()
        await db.refresh(new_progress)
        return new_progress

    @staticmethod
    async def get_habit_progress(db: AsyncSession, user_id: str) -> list[HabitProgress]:
        result = await db.execute(
            select(HabitProgress)
            .join(Habit, Habit.habit_id == HabitProgress.habit_id)
            .where(Habit.user_id == user_id)
        )
        return list(result.scalars().all())
