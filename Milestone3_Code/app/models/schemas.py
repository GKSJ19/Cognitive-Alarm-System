
from pydantic import BaseModel


class UserData(BaseModel):
    user_id: str
    wake_up_time: str
    snooze_count: int
    challenge_completion_time_sec: int
    accuracy_percent: float
    sleep_duration_hours: float
    success_rate: float
    current_difficulty: str

class HabitScoreResponse(BaseModel):
    user_id: str
    habit_score: float
    classification: str

class RecommendationResponse(BaseModel):
    user_id: str
    recommendations: list[str]

class AdaptiveLevelResponse(BaseModel):
    user_id: str
    current_level: str
    new_level: str
    reason: str
