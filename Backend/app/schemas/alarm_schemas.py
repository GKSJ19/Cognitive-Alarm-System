from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class AlarmBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    alarm_time: str = Field(..., description="HH:MM format")
    repeat_days: Optional[str] = Field(None, description="Comma-separated day indices, e.g. 1,2,3,4,5")
    vibration: bool = Field(True)
    ringtone: str = Field("default")
    snooze_enabled: bool = Field(True)
    snooze_duration: int = Field(5, description="Snooze duration in minutes")
    challenge_required: bool = Field(False)
    challenge_type: str = Field("math")
    difficulty: str = Field("medium")
    is_active: bool = Field(True)

class AlarmCreate(AlarmBase):
    pass

class AlarmUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    alarm_time: Optional[str] = Field(None, description="HH:MM format")
    repeat_days: Optional[str] = None
    vibration: Optional[bool] = None
    ringtone: Optional[str] = None
    snooze_enabled: Optional[bool] = None
    snooze_duration: Optional[int] = None
    challenge_required: Optional[bool] = None
    challenge_type: Optional[str] = None
    difficulty: Optional[str] = None
    is_active: Optional[bool] = None

class AlarmResponse(AlarmBase):
    alarm_id: str
    user_id: str

    class Config:
        from_attributes = True

class AlarmHistoryBase(BaseModel):
    wake_time: str
    solved: bool
    solve_time: int
    dismissed_at: Optional[datetime] = None

class AlarmHistoryCreate(AlarmHistoryBase):
    alarm_id: str

class AlarmHistoryResponse(AlarmHistoryBase):
    history_id: str
    alarm_id: str
    dismissed_at: datetime

    class Config:
        from_attributes = True
