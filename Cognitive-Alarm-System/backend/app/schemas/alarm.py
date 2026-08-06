from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class AlarmCreate(BaseModel):
    time: str = Field(..., pattern=r"^([01]\d|2[0-3]):([0-5]\d)$")
    alarm_type: str
    days_of_week: Optional[str] = None
    label: Optional[str] = None


class AlarmUpdate(BaseModel):
    time: Optional[str] = Field(None, pattern=r"^([01]\d|2[0-3]):([0-5]\d)$")
    alarm_type: Optional[str] = None
    days_of_week: Optional[str] = None
    is_active: Optional[bool] = None
    label: Optional[str] = None


class AlarmOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    time: str
    alarm_type: str
    days_of_week: Optional[str]
    is_active: bool
    label: Optional[str]
    created_at: datetime
