"""
Adaptive Difficulty Service — Business Logic Layer.

Integrates the AdaptiveDifficultyEngine ML model with SQLAlchemy database repositories
(ChallengeAttempt, AlarmTrigger, SleepLog) to dynamically predict and update challenge difficulties.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ml.adaptive_difficulty import AdaptiveDifficultyEngine
from app.models.alarm import AlarmTrigger
from app.models.analytics import SleepLog
from app.models.challenge import Challenge, ChallengeAttempt
from app.models.user import User

logger = logging.getLogger(__name__)


class AdaptiveDifficultyService:
    """
    Service for integrating ML difficulty predictions with database operations.
    """

    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.ml_engine = AdaptiveDifficultyEngine()

    async def _fetch_user_history(self, user_id: UUID, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Fetches user performance records (attempts, triggers, sleep) from DB.
        """
        # Fetch challenge attempts for user's triggers
        stmt = (
            select(ChallengeAttempt, AlarmTrigger, Challenge)
            .join(AlarmTrigger, ChallengeAttempt.alarm_trigger_id == AlarmTrigger.id)
            .join(Challenge, ChallengeAttempt.challenge_id == Challenge.id)
            .where(AlarmTrigger.user_id == user_id)
            .order_by(ChallengeAttempt.answered_at.desc())
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        rows = result.all()

        history = []
        for attempt, trigger, challenge in rows:
            history.append({
                "is_correct": attempt.is_correct,
                "time_taken_seconds": float(attempt.time_taken_seconds or 30),
                "snooze_count": trigger.snooze_count or 0,
                "hour_of_day": attempt.answered_at.hour if attempt.answered_at else 7,
                "difficulty": challenge.difficulty.value if challenge.difficulty else "medium",
            })

        # Fetch sleep logs
        sleep_stmt = (
            select(SleepLog)
            .where(SleepLog.user_id == user_id)
            .order_by(SleepLog.date.desc())
            .limit(5)
        )
        sleep_res = await self.session.execute(sleep_stmt)
        sleep_logs = sleep_res.scalars().all()

        if sleep_logs and history:
            avg_sleep = sum(s.duration_mins or 420 for s in sleep_logs) / len(sleep_logs)
            for h in history:
                h["sleep_duration_mins"] = avg_sleep

        return history

    async def predict_next_difficulty(self, user_id: UUID) -> Dict[str, Any]:
        """
        Predicts the optimal challenge difficulty level for the user's next alarm.
        """
        # Fetch user details
        user_stmt = select(User).where(User.id == user_id)
        user_res = await self.session.execute(user_stmt)
        user = user_res.scalars().first()
        if not user:
            raise ValueError("User not found")

        current_pref = user.difficulty_pref.value if user.difficulty_pref else "medium"
        goal_pref = user.goal_type.value if user.goal_type else "medium"

        history = await self._fetch_user_history(user_id)
        prediction = self.ml_engine.predict_difficulty(
            current_difficulty=current_pref,
            user_history=history,
            goal_preference=goal_pref,
        )

        prediction["user_id"] = str(user_id)
        return prediction

    async def get_adaptive_challenge(self, user_id: UUID) -> Optional[Challenge]:
        """
        Predicts the optimal difficulty and selects a matching challenge from the DB.
        """
        prediction = await self.predict_next_difficulty(user_id)
        target_diff = prediction["predicted_difficulty"]

        stmt = select(Challenge).where(Challenge.difficulty == target_diff).limit(1)
        res = await self.session.execute(stmt)
        challenge = res.scalars().first()

        # Fallback to any challenge if exact target difficulty is missing in DB
        if not challenge:
            fallback_res = await self.session.execute(select(Challenge).limit(1))
            challenge = fallback_res.scalars().first()

        return challenge
