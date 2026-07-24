from pydantic import BaseModel
from uuid import UUID
from typing import Dict

class ChallengeGenerateResponse(BaseModel):
    challenge_id: UUID
    category: str
    question: str

class ChallengeVerifyRequest(BaseModel):
    challenge_id: UUID
    submitted_answer: str
    alarm_trigger_id: UUID | None = None
    time_taken_seconds: int | None = None

class ChallengeVerifyResponse(BaseModel):
    is_correct: bool

class ChallengeStatsResponse(BaseModel):
    total_attempts: int
    correct_attempts: int
    accuracy_percent: float
    by_category: Dict[str, Dict[str, float]]