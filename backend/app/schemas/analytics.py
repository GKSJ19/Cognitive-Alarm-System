from pydantic import BaseModel


class AnalyticsResponse(BaseModel):
    user_id: int

    total_challenges: int
    successful_challenges: int
    success_rate: float

    average_score: float
    average_time_taken: float

    passed_challenges: int
    failed_challenges: int

    current_difficulty: str | None
    next_difficulty: str | None

    habit_score: float | None
    habit_grade: str | None