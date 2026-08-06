from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class SleepLogCreate(BaseModel):
    date: date
    sleep_start: datetime
    sleep_end: datetime
    duration_mins: int
    source: Optional[str] = None


class HabitScoreOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    date: date
    wake_consistency_score: Optional[int]
    challenge_success_score: Optional[int]
    snooze_reduction_score: Optional[int]
    sleep_adherence_score: Optional[int]
    total_score: Optional[int]
    created_at: datetime


class GoalMetricCreate(BaseModel):
    date: Optional[date] = None
    goal_type: Optional[str] = None
    metric_label: Optional[str] = None
    metric_value: Optional[int] = None


class RecommendationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    message: str
    category: Optional[str]
    is_read: bool
    created_at: datetime
