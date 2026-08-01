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

class AlarmCreate(BaseModel):
    label: str = "Alarm"
    time: str  # "HH:MM" format
    alarm_type: str = "daily"  # daily, weekday, weekend, one-time
    days_active: List[int] = []  # 0=Monday, 6=Sunday
    is_active: bool = True
    sound_name: str = "default"
    snooze_duration: int = 5  # minutes
    vibration: bool = True
    snooze_enabled: bool = True
    difficulty: str = "Medium"

class AlarmUpdate(BaseModel):
    label: Optional[str] = None
    time: Optional[str] = None
    alarm_type: Optional[str] = None
    days_active: Optional[List[int]] = None
    is_active: Optional[bool] = None
    sound_name: Optional[str] = None
    snooze_duration: Optional[int] = None
    vibration: Optional[bool] = None
    snooze_enabled: Optional[bool] = None
    difficulty: Optional[str] = None

class AlarmModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: str = ""
    label: str = "Alarm"
    time: str = "07:00"
    alarm_type: str = "daily"  # daily, weekday, weekend, one-time
    days_active: List[int] = []
    is_active: bool = True
    sound_name: str = "default"
    snooze_duration: int = 5
    vibration: bool = True
    snooze_enabled: bool = True
    difficulty: str = "Medium"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class AlarmLogModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    alarm_id: str
    user_id: str
    ring_time: datetime
    dismiss_time: Optional[datetime] = None
    snooze_count: int = 0
    verification_passed: bool = False
    challenge_id: Optional[str] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
