from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional, List, Dict, Any

class DifficultyHistoryResponse(BaseModel):
    id: UUID
    alarm_id: UUID
    previous_difficulty: str
    new_difficulty: str
    reason: Optional[str] = None
    changed_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserBehaviorAnalyticResponse(BaseModel):
    id: UUID
    date: str
    wake_up_time: Optional[str] = None
    target_wake_up_time: Optional[str] = None
    wake_up_delay: int
    snooze_count: int
    challenge_solved: bool
    challenge_solve_time: int
    challenge_attempts: int
    sleep_duration: Optional[float] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserBehaviorSummaryResponse(BaseModel):
    average_snooze_count: float
    average_wake_up_delay_seconds: float
    challenge_completion_rate: float
    average_sleep_duration_hours: float
    total_tracked_days: int


class HabitScoreResponse(BaseModel):
    id: UUID
    date: str
    wake_up_consistency: float
    challenge_completion: float
    snooze_reduction: float
    sleep_adherence: float
    overall_score: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RecommendationResponse(BaseModel):
    id: UUID
    category: str
    title: str
    content: str
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DashboardSummaryResponse(BaseModel):
    current_scores: Optional[HabitScoreResponse] = None
    score_trends: List[HabitScoreResponse]
    challenge_stats: Dict[str, Any]
    sleep_trends: List[Dict[str, Any]]
    wake_up_history: List[Dict[str, Any]]
    progress_report: Dict[str, Any]
    recommendations: List[RecommendationResponse]


class ClientSummaryResponse(BaseModel):
    id: UUID
    full_name: str
    email: str
    is_active: bool
    latest_score: Optional[float] = None
    avg_score: Optional[float] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CoachDashboardResponse(BaseModel):
    total_clients: int
    clients: List[ClientSummaryResponse]


class CoachUserDetailResponse(BaseModel):
    user_id: UUID
    full_name: str
    email: str
    profile: Optional[Dict[str, Any]] = None
    summary: DashboardSummaryResponse


class AdminDashboardResponse(BaseModel):
    total_users: int
    total_alarms: int
    system_avg_habit_score: float
    system_avg_snooze_count: float
    system_avg_wake_up_delay_seconds: float
    system_avg_sleep_duration_hours: float
    challenge_category_breakdown: Dict[str, int]
    active_users_count: int


class SystemStatsResponse(BaseModel):
    snooze_by_day_of_week: Dict[str, float]
    challenge_accuracy_by_difficulty: Dict[str, float]
    average_solve_time_by_category: Dict[str, float]
    adherence_distribution: Dict[str, int]

