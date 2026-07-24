from pydantic import BaseModel

class DifficultyResponse(BaseModel):
    difficulty: str
    recent_accuracy_percent: float
    recent_attempts_considered: int