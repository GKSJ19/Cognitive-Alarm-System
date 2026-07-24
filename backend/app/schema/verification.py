from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class TriggerAlarmRequest(BaseModel):
    alarm_id: UUID

class TriggerAlarmResponse(BaseModel):
    trigger_id: UUID
    challenge_id: UUID
    category: str
    question: str
    debug_answer: Optional[str]= None

class VerifyAttemptRequest(BaseModel):
    trigger_id: UUID
    challenge_id: UUID
    submitted_answer: str

class VerifyAttemptResponse(BaseModel):
    is_correct: bool
    verification_status: str
    total_attempts: int