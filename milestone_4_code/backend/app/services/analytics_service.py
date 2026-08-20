"""
Analytics Service
=================

Orchestration layer between the AI engines, the database models, and the
API routers.  Responsible for:

  • Fetching raw data from PostgreSQL
  • Calling AI engine functions to compute metrics
  • Persisting computed results back to PostgreSQL
  • Providing retrieval methods for the dashboard endpoints
"""

from __future__ import annotations

import logging
import uuid
from datetime import UTC, date, datetime, timedelta
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.alarm import Alarm
from app.models.analytics import (
    BehaviorAnalytics,
    HabitScoreRecord,
    Recommendation,
    UserStatistics,
)
from app.models.challenge import ChallengeSession
from app.models.habit import HabitStreak
from app.modules.ai.behavioral_analytics import (
    AlarmEvent,
    BehavioralAnalyticsEngine,
    ChallengeEvent,
    calc_avg_sleep_duration,
    calc_avg_snooze_count,
    calc_challenge_success_rate,
    calc_sleep_schedule_adherence,
    calc_wake_up_consistency,
)
from app.modules.ai.habit_scoring import HabitMetrics, HabitScoringEngine
from app.modules.ai.recommendation_engine import (
    RecommendationEngine,
    UserMetricsSnapshot,
)

logger = logging.getLogger(__name__)

# Re-usable engine singletons (stateless)
_analytics_engine = BehavioralAnalyticsEngine()
_habit_engine = HabitScoringEngine()
_rec_engine = RecommendationEngine()


# ---------------------------------------------------------------------------
# Helper: build synthetic events from DB rows
# ---------------------------------------------------------------------------

def _challenge_rows_to_events(sessions: list) -> list[ChallengeEvent]:
    """Convert ChallengeSession ORM rows to ChallengeEvent data-classes."""
    return [
        ChallengeEvent(
            event_date=s.completed_at.date() if s.completed_at else date.today(),
            is_successful=s.is_successful,
            completion_time_seconds=s.time_taken_seconds,
            difficulty=s.difficulty,
        )
        for s in sessions
    ]


def _build_alarm_events(sessions: list, alarms: list) -> list[AlarmEvent]:
    """
    Build AlarmEvent data-classes.  Since we don't track per-alarm-fire
    wake time in the current schema, we approximate from challenge sessions
    (each successful challenge = one alarm dismissal).
    """
    events: list[AlarmEvent] = []
    for s in sessions:
        event_date = s.completed_at.date() if s.completed_at else date.today()
        wake_min = (s.completed_at.hour * 60 + s.completed_at.minute) if s.completed_at else 420
        alarm_min = max(0, wake_min - int(s.time_taken_seconds / 60))
        events.append(
            AlarmEvent(
                event_date=event_date,
                alarm_time_minutes=alarm_min,
                wake_time_minutes=wake_min,
                snooze_count=0,
                sleep_duration_hours=7.0,
                bedtime_minutes=0,
                target_bedtime_minutes=0,
            )
        )
    return events


# ---------------------------------------------------------------------------
# Behavioral Analytics
# ---------------------------------------------------------------------------

async def compute_behavioral_analytics(
    db: AsyncSession, user_id: uuid.UUID, target_date: date | None = None
) -> dict[str, Any]:
    """Compute and persist daily behavioral analytics for a user."""
    target = target_date or date.today()
    window_start = target - timedelta(days=30)

    # Fetch challenge sessions in window
    stmt = (
        select(ChallengeSession)
        .where(
            ChallengeSession.user_id == user_id,
            ChallengeSession.completed_at >= datetime.combine(window_start, datetime.min.time()).replace(tzinfo=UTC),
        )
        .order_by(ChallengeSession.completed_at)
    )
    sessions = list((await db.execute(stmt)).scalars().all())

    challenge_events = _challenge_rows_to_events(sessions)
    alarm_events = _build_alarm_events(sessions, [])

    # Compute via engine
    daily_data = _analytics_engine.compute_daily(alarm_events, challenge_events)
    daily_data["analytics_date"] = target

    # Upsert record
    existing_stmt = select(BehaviorAnalytics).where(
        BehaviorAnalytics.user_id == user_id,
        BehaviorAnalytics.analytics_date == target,
    )
    existing = (await db.execute(existing_stmt)).scalar_one_or_none()

    if existing:
        for key, value in daily_data.items():
            if key != "analytics_date" and hasattr(existing, key):
                setattr(existing, key, value)
        existing.updated_at = datetime.now(UTC)
    else:
        record = BehaviorAnalytics(user_id=user_id, **daily_data)
        db.add(record)

    await db.commit()
    return daily_data


async def get_behavioral_analytics(
    db: AsyncSession, user_id: uuid.UUID, days: int = 30
) -> list:
    """Retrieve recent behavioral analytics records."""
    cutoff = date.today() - timedelta(days=days)
    stmt = (
        select(BehaviorAnalytics)
        .where(
            BehaviorAnalytics.user_id == user_id,
            BehaviorAnalytics.analytics_date >= cutoff,
        )
        .order_by(BehaviorAnalytics.analytics_date.desc())
    )
    return list((await db.execute(stmt)).scalars().all())


# ---------------------------------------------------------------------------
# Habit Score
# ---------------------------------------------------------------------------

async def compute_habit_score(
    db: AsyncSession, user_id: uuid.UUID, score_date: date | None = None
) -> dict[str, Any]:
    """Compute and persist the weighted habit score for a user."""
    target = score_date or date.today()
    window_start = target - timedelta(days=30)

    # Fetch sessions for the window
    stmt = select(ChallengeSession).where(
        ChallengeSession.user_id == user_id,
        ChallengeSession.completed_at >= datetime.combine(window_start, datetime.min.time()).replace(tzinfo=UTC),
    )
    sessions = list((await db.execute(stmt)).scalars().all())

    challenge_events = _challenge_rows_to_events(sessions)
    alarm_events = _build_alarm_events(sessions, [])

    # Compute raw metrics
    consistency = calc_wake_up_consistency(alarm_events)
    challenge_rate = calc_challenge_success_rate(challenge_events)
    avg_snooze = calc_avg_snooze_count(alarm_events)
    sleep_adherence = calc_sleep_schedule_adherence(alarm_events)

    # Feed into scoring engine
    metrics = HabitMetrics(
        wake_up_consistency_pct=consistency,
        challenge_success_pct=challenge_rate,
        avg_snooze_count=avg_snooze,
        sleep_adherence_pct=sleep_adherence,
    )
    result = _habit_engine.score(metrics)
    result["score_date"] = target

    # Upsert
    existing_stmt = select(HabitScoreRecord).where(
        HabitScoreRecord.user_id == user_id,
        HabitScoreRecord.score_date == target,
    )
    existing = (await db.execute(existing_stmt)).scalar_one_or_none()

    if existing:
        for key, value in result.items():
            if key != "score_date" and hasattr(existing, key):
                setattr(existing, key, value)
    else:
        record = HabitScoreRecord(user_id=user_id, **result)
        db.add(record)

    await db.commit()
    return result


async def get_habit_score_history(
    db: AsyncSession, user_id: uuid.UUID, days: int = 30
) -> list:
    """Retrieve habit score history."""
    cutoff = date.today() - timedelta(days=days)
    stmt = (
        select(HabitScoreRecord)
        .where(
            HabitScoreRecord.user_id == user_id,
            HabitScoreRecord.score_date >= cutoff,
        )
        .order_by(HabitScoreRecord.score_date.desc())
    )
    return list((await db.execute(stmt)).scalars().all())


# ---------------------------------------------------------------------------
# Recommendations
# ---------------------------------------------------------------------------

async def generate_recommendations(
    db: AsyncSession, user_id: uuid.UUID
) -> list[dict[str, Any]]:
    """Generate and persist personalised recommendations."""
    window_start = date.today() - timedelta(days=30)

    # Fetch data
    stmt = select(ChallengeSession).where(
        ChallengeSession.user_id == user_id,
        ChallengeSession.completed_at >= datetime.combine(window_start, datetime.min.time()).replace(tzinfo=UTC),
    )
    sessions = list((await db.execute(stmt)).scalars().all())

    challenge_events = _challenge_rows_to_events(sessions)
    alarm_events = _build_alarm_events(sessions, [])

    # Compute metrics for the recommendation engine
    consistency = calc_wake_up_consistency(alarm_events)
    challenge_rate = calc_challenge_success_rate(challenge_events)
    avg_snooze = calc_avg_snooze_count(alarm_events)
    avg_sleep = calc_avg_sleep_duration(alarm_events)

    from app.modules.ai.behavioral_analytics import calc_avg_challenge_time
    avg_time = calc_avg_challenge_time(challenge_events)

    # Get existing active recommendation rule IDs to avoid duplicates
    active_stmt = select(Recommendation.rule_id).where(
        Recommendation.user_id == user_id,
        Recommendation.is_active == True,
        Recommendation.is_dismissed == False,
    )
    existing_rules = set((await db.execute(active_stmt)).scalars().all())

    # Detect trends
    snooze_trend = _analytics_engine.detect_snooze_trend(alarm_events)
    accuracy_trend = _analytics_engine.detect_accuracy_trend(challenge_events)

    # Get current difficulty
    stats_stmt = select(UserStatistics).where(UserStatistics.user_id == user_id)
    user_stats = (await db.execute(stats_stmt)).scalar_one_or_none()
    current_diff = user_stats.current_difficulty if user_stats else "medium"

    snapshot = UserMetricsSnapshot(
        avg_snooze_count=avg_snooze,
        challenge_accuracy_pct=challenge_rate,
        wake_up_consistency_pct=consistency,
        avg_sleep_duration_hours=avg_sleep,
        avg_challenge_time_seconds=avg_time,
        snooze_trend=snooze_trend,
        accuracy_trend=accuracy_trend,
        current_difficulty=current_diff,
    )

    recs = _rec_engine.generate(snapshot, exclude_rule_ids=existing_rules)

    # Persist new recommendations
    results = []
    for rec in recs:
        db_rec = Recommendation(
            user_id=user_id,
            title=rec.title,
            description=rec.description,
            category=rec.category,
            priority=rec.priority,
            rule_id=rec.rule_id,
        )
        db.add(db_rec)
        results.append({
            "title": rec.title,
            "description": rec.description,
            "category": rec.category,
            "priority": rec.priority,
            "rule_id": rec.rule_id,
        })

    await db.commit()
    return results


async def get_active_recommendations(
    db: AsyncSession, user_id: uuid.UUID
) -> list:
    """Retrieve active (non-dismissed) recommendations."""
    stmt = (
        select(Recommendation)
        .where(
            Recommendation.user_id == user_id,
            Recommendation.is_active == True,
            Recommendation.is_dismissed == False,
        )
        .order_by(Recommendation.created_at.desc())
    )
    return list((await db.execute(stmt)).scalars().all())


async def dismiss_recommendation(
    db: AsyncSession, user_id: uuid.UUID, rec_id: uuid.UUID
) -> bool:
    """Mark a recommendation as dismissed."""
    stmt = select(Recommendation).where(
        Recommendation.id == rec_id,
        Recommendation.user_id == user_id,
    )
    rec = (await db.execute(stmt)).scalar_one_or_none()
    if not rec:
        return False
    rec.is_dismissed = True
    rec.is_active = False
    await db.commit()
    return True


# ---------------------------------------------------------------------------
# User Statistics (30-day aggregate)
# ---------------------------------------------------------------------------

async def compute_user_statistics(
    db: AsyncSession, user_id: uuid.UUID
) -> dict[str, Any]:
    """Compute and upsert the rolling 30-day user statistics."""
    window_start = date.today() - timedelta(days=30)

    # Challenge sessions
    stmt = select(ChallengeSession).where(
        ChallengeSession.user_id == user_id,
        ChallengeSession.completed_at >= datetime.combine(window_start, datetime.min.time()).replace(tzinfo=UTC),
    )
    sessions = list((await db.execute(stmt)).scalars().all())

    total_challenges = len(sessions)
    passed = sum(1 for s in sessions if s.is_successful)
    accuracy = (passed / total_challenges * 100) if total_challenges > 0 else 0
    avg_time = (
        sum(s.time_taken_seconds for s in sessions) / total_challenges
        if total_challenges > 0
        else 0
    )

    # Streak
    streak_stmt = select(HabitStreak).where(HabitStreak.user_id == user_id)
    streak = (await db.execute(streak_stmt)).scalar_one_or_none()

    # Alarms
    alarm_stmt = select(func.count(Alarm.id)).where(Alarm.user_id == user_id)
    alarm_count = (await db.execute(alarm_stmt)).scalar() or 0

    # Latest habit score
    score_stmt = (
        select(HabitScoreRecord)
        .where(HabitScoreRecord.user_id == user_id)
        .order_by(HabitScoreRecord.score_date.desc())
        .limit(1)
    )
    latest_score = (await db.execute(score_stmt)).scalar_one_or_none()

    # Difficulty from history
    from app.models.analytics import DifficultyHistory
    diff_stmt = (
        select(DifficultyHistory)
        .where(DifficultyHistory.user_id == user_id)
        .order_by(DifficultyHistory.changed_at.desc())
        .limit(1)
    )
    latest_diff = (await db.execute(diff_stmt)).scalar_one_or_none()

    data = {
        "current_difficulty": latest_diff.new_difficulty if latest_diff else "beginner",
        "total_alarms_set": alarm_count,
        "total_alarms_dismissed": passed,
        "total_snoozes": 0,
        "total_challenges_attempted": total_challenges,
        "total_challenges_passed": passed,
        "avg_wake_up_delay_minutes": 0.0,
        "avg_snooze_count": 0.0,
        "avg_challenge_time_seconds": round(avg_time, 2),
        "avg_sleep_duration_hours": 7.0,
        "wake_up_consistency_pct": accuracy,
        "challenge_accuracy_pct": round(accuracy, 2),
        "sleep_adherence_pct": 0.0,
        "current_wake_streak": streak.current_streak if streak else 0,
        "best_wake_streak": streak.max_streak if streak else 0,
        "latest_habit_score": latest_score.total_score if latest_score else 0.0,
    }

    # Upsert
    existing_stmt = select(UserStatistics).where(UserStatistics.user_id == user_id)
    existing = (await db.execute(existing_stmt)).scalar_one_or_none()

    if existing:
        for key, value in data.items():
            setattr(existing, key, value)
        existing.updated_at = datetime.now(UTC)
    else:
        record = UserStatistics(user_id=user_id, **data)
        db.add(record)

    await db.commit()
    return data


async def get_user_statistics(
    db: AsyncSession, user_id: uuid.UUID
) -> UserStatistics | None:
    """Retrieve the user's 30-day statistics record."""
    stmt = select(UserStatistics).where(UserStatistics.user_id == user_id)
    return (await db.execute(stmt)).scalar_one_or_none()


# ---------------------------------------------------------------------------
# Dashboard aggregation
# ---------------------------------------------------------------------------

async def get_dashboard_data(
    db: AsyncSession, user_id: uuid.UUID, period: str = "daily"
) -> dict[str, Any]:
    """Assemble dashboard data for the requested period (daily/weekly/monthly)."""
    stats_data = await compute_user_statistics(db, user_id)
    score_data = await compute_habit_score(db, user_id)
    analytics_data = await compute_behavioral_analytics(db, user_id)

    recs = await get_active_recommendations(db, user_id)
    rec_list = [
        {
            "id": str(r.id),
            "title": r.title,
            "description": r.description,
            "category": r.category,
            "priority": r.priority,
            "rule_id": r.rule_id,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in recs
    ]

    streak_stmt = select(HabitStreak).where(HabitStreak.user_id == user_id)
    streak = (await db.execute(streak_stmt)).scalar_one_or_none()

    score_history = await get_habit_score_history(db, user_id, days=30)
    score_chart = [
        {"label": str(s.score_date), "value": s.total_score}
        for s in reversed(score_history)
    ]

    analytics_history = await get_behavioral_analytics(db, user_id, days=30)
    consistency_chart = [
        {"label": str(a.analytics_date), "value": a.wake_up_consistency}
        for a in reversed(analytics_history)
    ]

    base = {
        "habit_score": score_data.get("total_score", 0),
        "habit_score_breakdown": {
            "wake_up_consistency": score_data.get("wake_up_consistency_weighted", 0),
            "challenge_success": score_data.get("challenge_success_weighted", 0),
            "snooze_reduction": score_data.get("snooze_reduction_weighted", 0),
            "sleep_adherence": score_data.get("sleep_adherence_weighted", 0),
        },
        "difficulty_level": stats_data.get("current_difficulty", "beginner"),
        "recommendations": rec_list,
        "wake_up_streak": streak.current_streak if streak else 0,
        "challenge_accuracy": stats_data.get("challenge_accuracy_pct", 0),
        "sleep_duration": stats_data.get("avg_sleep_duration_hours", 0),
        "wake_up_delay": stats_data.get("avg_wake_up_delay_minutes", 0),
        "snooze_statistics": {
            "avg_snooze": stats_data.get("avg_snooze_count", 0),
            "total_snooze": stats_data.get("total_snoozes", 0),
            "snooze_trend": "stable",
        },
        "charts": {
            "habit_score_trend": score_chart,
            "consistency_trend": consistency_chart,
        },
    }

    if period == "daily":
        base["date"] = date.today().isoformat()
        base["productivity_score"] = analytics_data.get("daily_productivity_score", 0)
        base["challenges_today"] = analytics_data.get("total_challenges_attempted", 0)

    elif period == "weekly":
        today = date.today()
        base["week_start"] = (today - timedelta(days=today.weekday())).isoformat()
        base["week_end"] = today.isoformat()

    elif period == "monthly":
        base["month"] = date.today().strftime("%Y-%m")
        heatmap = []
        for a in analytics_history:
            heatmap.append({
                "date": str(a.analytics_date),
                "score": a.daily_productivity_score,
                "status": (
                    "excellent" if a.daily_productivity_score >= 80
                    else "good" if a.daily_productivity_score >= 60
                    else "average" if a.daily_productivity_score >= 40
                    else "poor"
                ),
            })
        base["calendar_heatmap"] = heatmap

    return base
