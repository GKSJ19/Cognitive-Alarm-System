from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
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

class CognitiveChallengeModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    type: str # Math, Logic, Memory, Pattern, Word, Riddle
    difficulty: str # Beginner, Easy, Medium, Hard, Expert
    content: Dict[str, Any] # e.g. {"question": "2 + 2 * 4", "options": ["10", "16", "8", "12"]}
    correct_answer: str
    generated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class ChallengeAttemptModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: Optional[str] = None
    challenge_id: str
    alarm_log_id: str
    user_answer: str
    is_correct: bool
    time_taken_seconds: float
    attempted_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
