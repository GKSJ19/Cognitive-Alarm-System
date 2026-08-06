"""
Behavioral Analytics Service — Business Logic Layer.

Integrates BehavioralAnalyticsEngine ML model with user activity tables
to analyze habits, score consistency, and persist HabitScore records.
"""

from __future__ import annotations

import logging
from datetime import date, datetime, timezone
from typing import Any, Dict, List
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ml.behavioral_analytics import BehavioralAnalyticsEngine
from app.models.alarm import AlarmTrigger
from app.models.analytics import HabitScore, SleepLog
from app.models.challenge import ChallengeAttempt
from app.models.user import User

logger = logging.getLogger(__name__)


class BehavioralAnalyticsService:
    """
    Service for executing behavioral ML pattern analysis and persisting scores.
    """

    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.ml_engine = BehavioralAnalyticsEngine()

    async def _gather_user_behavior_logs(self, user_id: UUID, days: int = 14) -> List[Dict[str, Any]]:
        """
        Gathers raw behavior data across alarms, attempts, and sleep logs.
        """
        # Fetch triggers
        trigger_stmt = (
            select(AlarmTrigger)
            .where(AlarmTrigger.user_id == user_id)
            .order_by(AlarmTrigger.created_at.desc())
            .limit(30)
        )
        triggers_res = await self.session.execute(trigger_stmt)
        triggers = triggers_res.scalars().all()

        history = []
        for t in triggers:
            wake_mins = None
            if t.dismissed_at:
                wake_mins = t.dismissed_at.hour * 60 + t.dismissed_at.minute
            history.append({
                "snooze_count": t.snooze_count or 0,
                "wake_time_minutes": wake_mins,
            })

        # Fetch challenge attempts
        attempt_stmt = (
            select(ChallengeAttempt)
            .join(AlarmTrigger, ChallengeAttempt.alarm_trigger_id == AlarmTrigger.id)
            .where(AlarmTrigger.user_id == user_id)
            .order_by(ChallengeAttempt.answered_at.desc())
            .limit(30)
        )
        attempts_res = await self.session.execute(attempt_stmt)
        attempts = attempts_res.scalars().all()
        for a in attempts:
            history.append({
                "is_correct": a.is_correct,
                "time_taken_seconds": float(a.time_taken_seconds or 30),
            })

        # Fetch sleep logs
        sleep_stmt = (
            select(SleepLog)
            .where(SleepLog.user_id == user_id)
            .order_by(SleepLog.date.desc())
            .limit(14)
        )
        sleep_res = await self.session.execute(sleep_stmt)
        sleep_logs = sleep_res.scalars().all()
        for s in sleep_logs:
            history.append({
                "sleep_duration_mins": s.duration_mins,
            })

        return history

    async def analyze_and_record_habits(self, user_id: UUID) -> Dict[str, Any]:
        """
        Runs ML behavioral analysis, persists new HabitScore in DB, and returns results.
        """
        history = await self._gather_user_behavior_logs(user_id)
        analysis = self.ml_engine.analyze_patterns(history)
        scores = analysis["habit_scores"]

        today = date.today()
        habit_score_entry = HabitScore(
            user_id=user_id,
            date=today,
            wake_consistency_score=scores["wake_consistency_score"],
            challenge_success_score=scores["challenge_success_score"],
            snooze_reduction_score=scores["snooze_reduction_score"],
            sleep_adherence_score=scores["sleep_adherence_score"],
            total_score=scores["total_score"],
        )

        self.session.add(habit_score_entry)
        await self.session.commit()
        await self.session.refresh(habit_score_entry)

        analysis["id"] = str(habit_score_entry.id)
        analysis["user_id"] = str(user_id)
        analysis["date"] = str(today)
        return analysis

    async def get_user_behavioral_profile(self, user_id: UUID) -> Dict[str, Any]:
        """
        Returns full behavioral profile without creating a new DB record.
        """
        history = await self._gather_user_behavior_logs(user_id)
        analysis = self.ml_engine.analyze_patterns(history)
        analysis["user_id"] = str(user_id)
        return analysis
