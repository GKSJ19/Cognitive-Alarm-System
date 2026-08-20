"""
Difficulty Service
==================

Service layer for the Adaptive Difficulty Engine.  Handles:

  • Computing the recommended difficulty from user performance data
  • Persisting difficulty transitions to ``DifficultyHistory``
  • Retrieving difficulty history for timeline visualisation
"""

from __future__ import annotations

import logging
import uuid
from datetime import UTC, date, datetime, timedelta
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.analytics import DifficultyHistory, UserStatistics
from app.models.challenge import ChallengeSession
from app.modules.ai.adaptive_difficulty import (
    AdaptiveDifficultyEngine,
    PerformanceSnapshot,
)

logger = logging.getLogger(__name__)

_engine = AdaptiveDifficultyEngine()


# ---------------------------------------------------------------------------
# Compute adaptive difficulty
# ---------------------------------------------------------------------------

async def compute_difficulty(
    db: AsyncSession, user_id: uuid.UUID
) -> dict[str, Any]:
    """
    Compute the recommended difficulty tier for a user based on the last
    30 days of challenge performance, and persist the transition if changed.
    """
    window_start = date.today() - timedelta(days=30)

    # Fetch recent challenge sessions
    stmt = (
        select(ChallengeSession)
        .where(
            ChallengeSession.user_id == user_id,
            ChallengeSession.completed_at >= datetime.combine(
                window_start, datetime.min.time()
            ).replace(tzinfo=UTC),
        )
        .order_by(ChallengeSession.completed_at)
    )
    sessions = list((await db.execute(stmt)).scalars().all())

    total = len(sessions)
    successful = sum(1 for s in sessions if s.is_successful)
    avg_time = (
        sum(s.time_taken_seconds for s in sessions) / total if total > 0 else 0.0
    )

    # Get current difficulty
    stats_stmt = select(UserStatistics).where(UserStatistics.user_id == user_id)
    user_stats = (await db.execute(stats_stmt)).scalar_one_or_none()
    current_difficulty = user_stats.current_difficulty if user_stats else "beginner"

    # Build performance snapshot
    snapshot = PerformanceSnapshot(
        total_challenges=total,
        successful_challenges=successful,
        avg_completion_time_seconds=avg_time,
        avg_snooze_count=0.0,  # approximation
        consistency_pct=(successful / total * 100) if total > 0 else 0.0,
        current_difficulty=current_difficulty,
    )

    # Compute via engine
    result = _engine.compute(snapshot)

    # Persist transition if difficulty changed
    if result["new_difficulty"] != current_difficulty:
        history_entry = DifficultyHistory(
            user_id=user_id,
            previous_difficulty=current_difficulty,
            new_difficulty=result["new_difficulty"],
            accuracy_at_change=result["metrics"]["accuracy"],
            avg_completion_time=avg_time,
            snooze_count_at_change=0,
            reason=result["reason"],
        )
        db.add(history_entry)

        # Update user statistics
        if user_stats:
            user_stats.current_difficulty = result["new_difficulty"]
        else:
            user_stats = UserStatistics(
                user_id=user_id,
                current_difficulty=result["new_difficulty"],
            )
            db.add(user_stats)

        await db.commit()
        logger.info(
            "Difficulty changed for user %s: %s → %s (%s)",
            user_id,
            current_difficulty,
            result["new_difficulty"],
            result["reason"],
        )

    return result


# ---------------------------------------------------------------------------
# Difficulty history
# ---------------------------------------------------------------------------

async def get_difficulty_history(
    db: AsyncSession, user_id: uuid.UUID, limit: int = 20
) -> list:
    """Retrieve difficulty change history for a user."""
    stmt = (
        select(DifficultyHistory)
        .where(DifficultyHistory.user_id == user_id)
        .order_by(DifficultyHistory.changed_at.desc())
        .limit(limit)
    )
    return list((await db.execute(stmt)).scalars().all())


async def get_current_difficulty(
    db: AsyncSession, user_id: uuid.UUID
) -> dict[str, Any]:
    """Get the current difficulty level and supporting metrics."""
    stats_stmt = select(UserStatistics).where(UserStatistics.user_id == user_id)
    user_stats = (await db.execute(stats_stmt)).scalar_one_or_none()

    # Latest history entry
    history_stmt = (
        select(DifficultyHistory)
        .where(DifficultyHistory.user_id == user_id)
        .order_by(DifficultyHistory.changed_at.desc())
        .limit(1)
    )
    latest = (await db.execute(history_stmt)).scalar_one_or_none()

    return {
        "current_difficulty": user_stats.current_difficulty if user_stats else "beginner",
        "accuracy": user_stats.challenge_accuracy_pct if user_stats else 0.0,
        "avg_completion_time": user_stats.avg_challenge_time_seconds if user_stats else 0.0,
        "total_challenges_30d": user_stats.total_challenges_attempted if user_stats else 0,
        "last_changed_at": latest.changed_at.isoformat() if latest else None,
    }
