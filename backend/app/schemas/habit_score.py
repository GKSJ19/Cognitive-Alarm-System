from pydantic import BaseModel

class HabitScoreCreate(BaseModel):
    user_id: int
    wakeup_score: float
    challenge_score: float
    snooze_score: float
    sleep_score: float


class HabitScoreResponse(BaseModel):
    id: int
    user_id: int
    wakeup_score: float
    challenge_score: float
    snooze_score: float
    sleep_score: float
    overall_score: float
    grade: str

    class Config:
        from_attributes = True