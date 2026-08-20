"""
Milestone 3 — Analytics Pydantic Schemas

Request/response models for:
  • BehaviorAnalytics
  • HabitScore
  • Recommendation
  • DifficultyHistory
  • UserStatistics
  • Dashboard (Daily/Weekly/Monthly)
"""

import uuid
from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


# ---------------------------------------------------------------------------
# BehaviorAnalytics
# ---------------------------------------------------------------------------
class BehaviorAnalyticsResponse(BaseModel):
    """Full behavioral analytics for a user on a given date."""
    id: uuid.UUID
    user_id: uuid.UUID
    analytics_date: date
    wake_up_consistency: float = Field(..., description="% of on-time wake-ups (0-100)")
    avg_wake_up_delay_minutes: float
    avg_snooze_count: float
    sleep_schedule_adherence: float = Field(..., description="% adherence (0-100)")
    challenge_success_rate: float = Field(..., description="% success (0-100)")
    daily_productivity_score: float = Field(..., description="Composite score (0-100)")
    avg_sleep_duration_hours: float
    total_snooze_count: int
    total_challenges_attempted: int
    total_challenges_successful: int
    avg_challenge_completion_time: float
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class BehaviorAnalyticsSummary(BaseModel):
    """Summarised behavioral analytics (lighter payload for lists)."""
    analytics_date: date
    wake_up_consistency: float
    challenge_success_rate: float
    daily_productivity_score: float
    avg_snooze_count: float
    avg_sleep_duration_hours: float


# ---------------------------------------------------------------------------
# HabitScore
# ---------------------------------------------------------------------------
class HabitScoreResponse(BaseModel):
    """Habit score with full breakdown of weighted components."""
    id: uuid.UUID
    user_id: uuid.UUID
    score_date: date
    total_score: float = Field(..., description="Overall habit score (0-100)")
    wake_up_consistency_raw: float
    challenge_success_raw: float
    snooze_reduction_raw: float
    sleep_adherence_raw: float
    wake_up_consistency_weighted: float = Field(..., description="35% weight applied")
    challenge_success_weighted: float = Field(..., description="25% weight applied")
    snooze_reduction_weighted: float = Field(..., description="20% weight applied")
    sleep_adherence_weighted: float = Field(..., description="20% weight applied")
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class HabitScoreHistoryItem(BaseModel):
    """Light-weight habit score entry for trend charts."""
    score_date: date
    total_score: float


# ---------------------------------------------------------------------------
# Recommendation
# ---------------------------------------------------------------------------
class RecommendationResponse(BaseModel):
    """A single personalised recommendation."""
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    description: str
    category: str = Field(..., description="sleep | challenge | snooze | consistency")
    priority: str = Field(..., description="low | medium | high | critical")
    rule_id: str
    is_active: bool
    is_dismissed: bool
    created_at: datetime
    expires_at: datetime | None = None
    model_config = ConfigDict(from_attributes=True)


class RecommendationDismissRequest(BaseModel):
    """Request to dismiss a recommendation."""
    recommendation_id: uuid.UUID


# ---------------------------------------------------------------------------
# DifficultyHistory
# ---------------------------------------------------------------------------
class DifficultyHistoryResponse(BaseModel):
    """A single difficulty-change log entry."""
    id: uuid.UUID
    user_id: uuid.UUID
    previous_difficulty: str | None = None
    new_difficulty: str
    accuracy_at_change: float
    avg_completion_time: float
    snooze_count_at_change: int
    reason: str | None = None
    changed_at: datetime
    model_config = ConfigDict(from_attributes=True)


class CurrentDifficultyResponse(BaseModel):
    """Current difficulty level and key metrics."""
    current_difficulty: str
    accuracy: float
    avg_completion_time: float
    total_challenges_30d: int
    last_changed_at: datetime | None = None


# ---------------------------------------------------------------------------
# UserStatistics
# ---------------------------------------------------------------------------
class UserStatisticsResponse(BaseModel):
    """Rolling 30-day aggregate statistics."""
    id: uuid.UUID
    user_id: uuid.UUID
    current_difficulty: str
    total_alarms_set: int
    total_alarms_dismissed: int
    total_snoozes: int
    total_challenges_attempted: int
    total_challenges_passed: int
    avg_wake_up_delay_minutes: float
    avg_snooze_count: float
    avg_challenge_time_seconds: float
    avg_sleep_duration_hours: float
    wake_up_consistency_pct: float
    challenge_accuracy_pct: float
    sleep_adherence_pct: float
    current_wake_streak: int
    best_wake_streak: int
    latest_habit_score: float
    computed_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Weekly / Monthly Trends
# ---------------------------------------------------------------------------
class WeeklyTrendItem(BaseModel):
    """A single week's aggregated data."""
    week_start: date
    week_end: date
    avg_habit_score: float
    avg_consistency: float
    avg_challenge_accuracy: float
    avg_snooze_count: float
    total_challenges: int


class MonthlyTrendItem(BaseModel):
    """A single month's aggregated data."""
    month: str
    avg_habit_score: float
    avg_consistency: float
    avg_challenge_accuracy: float
    avg_snooze_count: float
    total_challenges: int


# ---------------------------------------------------------------------------
# Dashboard Responses
# ---------------------------------------------------------------------------
class ChartDataPoint(BaseModel):
    """Generic chart data point for frontend rendering."""
    label: str
    value: float


class DashboardBase(BaseModel):
    """Common fields shared by all dashboard granularities."""
    habit_score: float
    difficulty_level: str
    recommendations: list[RecommendationResponse]
    wake_up_streak: int
    challenge_accuracy: float
    sleep_duration: float
    wake_up_delay: float
    snooze_statistics: dict[str, Any] = Field(
        default_factory=dict,
        description="avg_snooze, total_snooze, snooze_trend",
    )


class DailyDashboardResponse(DashboardBase):
    """Daily dashboard payload."""
    date: date
    productivity_score: float
    challenges_today: int
    habit_score_breakdown: dict[str, float] = Field(
        default_factory=dict,
        description="Weighted component breakdown",
    )
    hourly_activity: list[ChartDataPoint] = []


class WeeklyDashboardResponse(DashboardBase):
    """Weekly dashboard payload."""
    week_start: date
    week_end: date
    daily_scores: list[ChartDataPoint] = []
    daily_consistency: list[ChartDataPoint] = []
    challenge_accuracy_by_day: list[ChartDataPoint] = []
    weekly_trends: list[WeeklyTrendItem] = []


class MonthlyDashboardResponse(DashboardBase):
    """Monthly dashboard payload."""
    month: str
    weekly_scores: list[ChartDataPoint] = []
    weekly_consistency: list[ChartDataPoint] = []
    monthly_trends: list[MonthlyTrendItem] = []
    calendar_heatmap: list[dict[str, Any]] = Field(
        default_factory=list,
        description="List of {date, score, status} for calendar rendering",
    )
