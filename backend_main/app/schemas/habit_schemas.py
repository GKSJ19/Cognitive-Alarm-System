from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict

# --- Legacy Habit Schemas (Maintained for backwards safety) ---
class HabitBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=500)
    frequency: str = Field("daily", max_length=50)
    reminder_time: Optional[str] = Field(None, max_length=50)
    target_days: int = Field(7)
    is_active: bool = Field(True)

class HabitCreate(HabitBase):
    pass

class HabitUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=500)
    frequency: Optional[str] = Field(None, max_length=50)
    reminder_time: Optional[str] = Field(None, max_length=50)
    target_days: Optional[int] = None
    is_active: Optional[bool] = None

class HabitResponse(HabitBase):
    habit_id: str
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class HabitProgressBase(BaseModel):
    completion_date: str = Field(..., description="YYYY-MM-DD format")
    status: str = Field("completed", description="completed, skipped, missed")
    streak_count: int = Field(0)

class HabitProgressResponse(HabitProgressBase):
    progress_id: str
    habit_id: str

    class Config:
        from_attributes = True

class HabitCompleteRequest(BaseModel):
    habit_id: str
    completion_date: str = Field(..., description="YYYY-MM-DD format")
    status: str = Field("completed")


# --- New Automated Habit Score & Challenge Result Schemas ---
class ChallengeResultCreate(BaseModel):
    challenge_id: Optional[str] = Field(None, description="Associated alarm or challenge ID")
    challenge_type: str = Field("math", description="math, memory, pattern, etc.")
    difficulty: str = Field("medium", description="easy, medium, hard")
    time_taken_seconds: float = Field(..., ge=0.0, description="Time taken to solve challenge in seconds")
    is_correct: bool = Field(True, description="Whether challenge was solved correctly")
    attempts: int = Field(1, ge=1, description="Number of attempts taken")

class ChallengeResultResponse(BaseModel):
    id: str
    user_id: str
    challenge_id: Optional[str] = None
    challenge_type: str
    difficulty: str
    time_taken_seconds: float
    is_correct: bool
    attempts: int
    habit_score: float
    completed_at: datetime

    class Config:
        from_attributes = True

class DailyScoreTrend(BaseModel):
    date: str
    average_score: float
    count: int

class DifficultyPerformance(BaseModel):
    difficulty: str
    total: int
    correct: int
    success_rate: float
    avg_score: float
    avg_time_seconds: float

class HabitScoreDashboardData(BaseModel):
    current_habit_score: float
    average_completion_time: float
    total_challenges_completed: int
    success_rate: float
    fastest_completion_time: float
    weekly_avg_score: float
    monthly_avg_score: float
    score_trend_7_days: List[DailyScoreTrend]
    weekly_progress: List[DailyScoreTrend]
    monthly_progress: List[DailyScoreTrend]
    difficulty_performance: List[DifficultyPerformance]
    recent_history: List[ChallengeResultResponse]
