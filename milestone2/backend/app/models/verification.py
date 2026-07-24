from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, _):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")

class WakeUpVerificationModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: str
    alarm_id: str
    alarm_log_id: str
    status: str = "pending" # pending, passed, failed
    method: str # Puzzle Completion, Consecutive Correct Answers, etc.
    required_correct_answers: int = 1
    current_correct_answers: int = 0
    challenges_attempted: List[str] = []
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class VerificationStartRequest(BaseModel):
    alarm_id: str
    alarm_log_id: str
    difficulty: str = "Medium"

class VerificationValidateRequest(BaseModel):
    verification_id: str
    challenge_attempt_id: str
    is_correct: bool
