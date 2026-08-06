"""
Recommendation Service — Business Logic Layer.

Integrates RecommendationEngine ML model with User profile, Behavioral Analytics,
and Adaptive Difficulty to generate and manage personalized Recommendation records in DB.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ml.recommendation_engine import RecommendationEngine
from app.models.analytics import Recommendation
from app.models.user import User
from app.services.adaptive_difficulty_service import AdaptiveDifficultyService
from app.services.behavioral_analytics_service import BehavioralAnalyticsService

logger = logging.getLogger(__name__)


class RecommendationService:
    """
    Service for generating and persisting AI/ML recommendations.
    """

    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.ml_engine = RecommendationEngine()
        self.adaptive_svc = AdaptiveDifficultyService(session)
        self.behavioral_svc = BehavioralAnalyticsService(session)

    async def generate_user_recommendations(self, user_id: UUID) -> List[Recommendation]:
        """
        Synthesizes behavioral analysis & difficulty prediction, generates recommendations,
        and saves them to the DB.
        """
        # Fetch user
        user_res = await self.session.execute(select(User).where(User.id == user_id))
        user = user_res.scalars().first()
        if not user:
            raise ValueError("User not found")

        user_profile = {
            "goal_type": user.goal_type.value if user.goal_type else "study",
            "preferred_wake_time": str(user.preferred_wake_time) if user.preferred_wake_time else "07:00",
            "sleep_duration_mins": user.sleep_duration_mins or 480,
            "difficulty_pref": user.difficulty_pref.value if user.difficulty_pref else "medium",
        }

        behavioral_patterns = await self.behavioral_svc.get_user_behavioral_profile(user_id)
        adaptive_difficulty = await self.adaptive_svc.predict_next_difficulty(user_id)

        raw_recs = self.ml_engine.generate_recommendations(
            user_profile=user_profile,
            behavioral_patterns=behavioral_patterns,
            adaptive_difficulty=adaptive_difficulty,
        )

        saved_recs = []
        for r in raw_recs:
            rec_obj = Recommendation(
                user_id=user_id,
                message=r["message"],
                category=r.get("category", "general"),
                is_read=False,
            )
            self.session.add(rec_obj)
            saved_recs.append(rec_obj)

        await self.session.commit()
        for r in saved_recs:
            await self.session.refresh(r)

        return saved_recs

    async def list_recommendations(self, user_id: UUID, unread_only: bool = False) -> List[Recommendation]:
        """
        Lists stored recommendations for a user.
        """
        stmt = select(Recommendation).where(Recommendation.user_id == user_id)
        if unread_only:
            stmt = stmt.where(Recommendation.is_read.is_(False))
        stmt = stmt.order_by(Recommendation.created_at.desc())

        res = await self.session.execute(stmt)
        return list(res.scalars().all())

    async def mark_as_read(self, user_id: UUID, recommendation_id: UUID) -> Recommendation:
        """
        Marks a recommendation as read.
        """
        stmt = select(Recommendation).where(
            Recommendation.id == recommendation_id,
            Recommendation.user_id == user_id,
        )
        res = await self.session.execute(stmt)
        rec = res.scalars().first()
        if not rec:
            raise ValueError("Recommendation not found")

        rec.is_read = True
        await self.session.commit()
        await self.session.refresh(rec)
        return rec
