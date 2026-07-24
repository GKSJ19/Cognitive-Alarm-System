from pydantic import BaseModel
from datetime import time as time_type
from typing import Optional, List
from uuid import UUID

class AlarmCreateRequest(BaseModel):
    time: time_type
    alarm_type: str = "daily"
    days_of_week: Optional[List[int]] = None
    label: Optional[str] = None

class AlarmUpdateRequest(BaseModel):
    time: Optional[time_type] = None
    alarm_type: Optional[str] = None
    days_of_week: Optional[List[int]] = None
    label: Optional[str] = None
    is_active: Optional[bool] = None

class AlarmResponse(BaseModel):
    id: UUID
    time: time_type
    alarm_type: str
    days_of_week: Optional[List[int]] = None
    is_active: bool
    label: Optional[str] = None

    class Config:
        from_attributes = True