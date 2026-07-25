from pydantic import BaseModel
from datetime import datetime


class VerificationCreate(BaseModel):
    user_id: int
    challenge_id: int
    user_answer: str
    correct_answer: str


class VerificationResponse(BaseModel):
    id: int
    user_id: int
    challenge_id: int
    user_answer: str
    correct_answer: str
    is_correct: bool
    verified_at: datetime

    class Config:
        from_attributes = True