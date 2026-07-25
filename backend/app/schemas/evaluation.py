from pydantic import BaseModel
from datetime import datetime

class EvaluationCreate(BaseModel):
    user_id: int
    challenge_id: int
    score: int
    attempts: int
    time_taken: int
    status: str

class EvaluationResponse(EvaluationCreate):
    id: int
    evaluated_at: datetime

    class Config:
        from_attributes = True