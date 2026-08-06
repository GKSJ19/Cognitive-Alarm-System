"""
Pydantic schemas for the Analytics Service & BI dashboard.
"""

from __future__ import annotations

from datetime import date, datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import AnalyticsEventType, BiReportType


class EventTrackIn(BaseModel):
    event_type: AnalyticsEventType
    session_id: Optional[UUID] = None
    alarm_id: Optional[UUID] = None
    properties: Optional[dict[str, Any]] = None
    platform: Optional[str] = Field(None, max_length=30)
    app_version: Optional[str] = Field(None, max_length=20)
    occurred_at: Optional[datetime] = Field(
        None,
        description="Client-side timestamp; defaults to server time if omitted.",
    )


class EventTrackOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    event_type: AnalyticsEventType
    occurred_at: datetime


class DailyUserStatOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    date: date

    alarms_triggered: int
    alarms_dismissed: int
    alarms_snoozed: int
    total_snooze_count: int

    challenges_attempted: int
    challenges_passed: int
    challenges_failed: int
    avg_challenge_duration_secs: Optional[float]

    sleep_duration_mins: Optional[int]
    sleep_quality_score: Optional[float]

    habit_score: Optional[float]
    streak_days: int

    notifications_sent: int
    notifications_read: int

    created_at: datetime


class UserStatsRangeOut(BaseModel):
    items: list[DailyUserStatOut]
    total_days: int


class PlatformStatOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    date: date

    total_registered_users: int
    daily_active_users: int
    weekly_active_users: int
    new_signups: int

    alarms_triggered_total: int
    alarm_success_rate: Optional[float]
    avg_snooze_count: Optional[float]

    challenges_attempted_total: int
    challenge_pass_rate: Optional[float]

    avg_sleep_duration_mins: Optional[float]
    avg_habit_score: Optional[float]
    avg_streak_days: Optional[float]

    notifications_sent_total: int
    notification_read_rate: Optional[float]

    created_at: datetime


class PlatformStatSummary(BaseModel):
    period_start: date
    period_end: date

    avg_dau: float
    peak_dau: int
    total_new_signups: int

    avg_alarm_success_rate: Optional[float]
    avg_challenge_pass_rate: Optional[float]
    avg_sleep_duration_mins: Optional[float]
    avg_habit_score: Optional[float]
    avg_notification_read_rate: Optional[float]


class BiReportCreate(BaseModel):
    report_type: BiReportType
    title: Optional[str] = None
    period_start: Optional[date] = None
    period_end: Optional[date] = None
    filters: Optional[dict[str, Any]] = None


class BiReportOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    requested_by: Optional[UUID]
    report_type: BiReportType
    title: Optional[str]
    period_start: Optional[date]
    period_end: Optional[date]
    filters: Optional[dict[str, Any]]
    file_url: Optional[str]
    row_count: Optional[int]
    status: str
    error_message: Optional[str]
    generated_at: Optional[datetime]
    created_at: datetime
