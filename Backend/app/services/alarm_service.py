from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.alarm_model import Alarm, AlarmHistory
from app.schemas.alarm_schemas import AlarmCreate, AlarmUpdate, AlarmHistoryCreate

class AlarmService:
    @staticmethod
    async def get_alarms_by_user(db: AsyncSession, user_id: str) -> list[Alarm]:
        """Fetch all alarms for a user"""
        result = await db.execute(select(Alarm).where(Alarm.user_id == user_id))
        return list(result.scalars().all())

    @staticmethod
    async def _calculate_ai_challenge_recommendation(db: AsyncSession, user_id: str) -> tuple[str, str]:
        """AI Cognitive Engine: Evaluates historical solve times and success logs
        to recommend optimal challenge type and difficulty settings.
        """
        # Fetch user's alarm history logs
        result = await db.execute(
            select(AlarmHistory)
            .join(Alarm, Alarm.alarm_id == AlarmHistory.alarm_id)
            .where(Alarm.user_id == user_id)
        )
        logs = result.scalars().all()
        
        # Defaults
        difficulty = "medium"
        challenge_type = "math"
        
        if not logs:
            return challenge_type, difficulty
            
        solved_logs = [l for l in logs if l.solved]
        if solved_logs:
            avg_time = sum(l.solve_time for l in solved_logs) / len(solved_logs)
            if avg_time < 10:
                difficulty = "hard"
            elif avg_time > 25:
                difficulty = "easy"
            else:
                difficulty = "medium"
                
        # Recommend challenge type based on historical rotation
        types = ["math", "memory", "writing"]
        challenge_type = types[len(solved_logs) % len(types)]
        
        return challenge_type, difficulty

    @staticmethod
    async def create_alarm(db: AsyncSession, user_id: str, data: AlarmCreate) -> Alarm:
        """Create a new alarm"""
        challenge_type = data.challenge_type
        difficulty = data.difficulty
        if data.challenge_required:
            challenge_type, difficulty = await AlarmService._calculate_ai_challenge_recommendation(db, user_id)

        alarm = Alarm(
            user_id=user_id,
            title=data.title,
            alarm_time=data.alarm_time,
            repeat_days=data.repeat_days,
            vibration=data.vibration,
            ringtone=data.ringtone,
            snooze_enabled=data.snooze_enabled,
            snooze_duration=data.snooze_duration,
            challenge_required=data.challenge_required,
            challenge_type=challenge_type,
            difficulty=difficulty,
            is_active=data.is_active
        )
        db.add(alarm)
        await db.commit()
        await db.refresh(alarm)
        return alarm

    @staticmethod
    async def update_alarm(db: AsyncSession, user_id: str, alarm_id: str, data: AlarmUpdate) -> Alarm | None:
        """Update an existing alarm"""
        result = await db.execute(select(Alarm).where(Alarm.alarm_id == alarm_id, Alarm.user_id == user_id))
        alarm = result.scalars().first()
        if not alarm:
            return None

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(alarm, key, value)

        if alarm.challenge_required:
            rec_type, rec_diff = await AlarmService._calculate_ai_challenge_recommendation(db, user_id)
            alarm.challenge_type = rec_type
            alarm.difficulty = rec_diff

        await db.commit()
        await db.refresh(alarm)
        return alarm


    @staticmethod
    async def delete_alarm(db: AsyncSession, user_id: str, alarm_id: str) -> bool:
        """Delete an alarm"""
        result = await db.execute(select(Alarm).where(Alarm.alarm_id == alarm_id, Alarm.user_id == user_id))
        alarm = result.scalars().first()
        if not alarm:
            return False

        await db.delete(alarm)
        await db.commit()
        return True

    @staticmethod
    async def log_alarm_dismissal(db: AsyncSession, user_id: str, req: AlarmHistoryCreate) -> AlarmHistory | None:
        """Log alarm solution dismissal history"""
        # Ensure alarm belongs to user
        res = await db.execute(select(Alarm).where(Alarm.alarm_id == req.alarm_id, Alarm.user_id == user_id))
        alarm = res.scalars().first()
        if not alarm:
            return None

        history_log = AlarmHistory(
            alarm_id=req.alarm_id,
            wake_time=req.wake_time,
            solved=req.solved,
            solve_time=req.solve_time
        )
        db.add(history_log)
        await db.commit()
        await db.refresh(history_log)
        return history_log

    @staticmethod
    async def get_alarm_history(db: AsyncSession, user_id: str) -> list[AlarmHistory]:
        """Fetch alarm dismissal history for user's alarms"""
        result = await db.execute(
            select(AlarmHistory)
            .join(Alarm, Alarm.alarm_id == AlarmHistory.alarm_id)
            .where(Alarm.user_id == user_id)
        )
        return list(result.scalars().all())
