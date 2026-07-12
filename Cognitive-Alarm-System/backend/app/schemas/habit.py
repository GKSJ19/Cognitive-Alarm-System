from datetime import date, datetime

from pydantic import BaseModel, Field


class SleepLogCreate(BaseModel):
    date: date
    sleep_start: datetime
    sleep_end: datetime
    duration_mins: int
    source: str | None = None


class HabitScoreOut(BaseModel):
    id: str
    user_id: str
    date: date
    wake_consistency_score: int | None
    challenge_success_score: int | None
    snooze_reduction_score: int | None
    sleep_adherence_score: int | None
    total_score: int | None
    created_at: datetime

    class Config:
        orm_mode = True


class GoalMetricCreate(BaseModel):
    date: date | None = None
    goal_type: str | None = None
    metric_label: str | None = None
    metric_value: int | None = None


class RecommendationOut(BaseModel):
    id: str
    message: str
    category: str | None
    is_read: bool
    created_at: datetime

    class Config:
        orm_mode = True
