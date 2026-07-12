from datetime import datetime

from pydantic import BaseModel, Field


class AlarmCreate(BaseModel):
    time: str = Field(..., regex=r"^([01]\d|2[0-3]):([0-5]\d)$")
    alarm_type: str
    days_of_week: str | None = None
    label: str | None = None


class AlarmUpdate(BaseModel):
    time: str | None = Field(None, regex=r"^([01]\d|2[0-3]):([0-5]\d)$")
    alarm_type: str | None = None
    days_of_week: str | None = None
    is_active: bool | None = None
    label: str | None = None


class AlarmOut(BaseModel):
    id: str
    user_id: str
    time: str
    alarm_type: str
    days_of_week: str | None
    is_active: bool
    label: str | None
    created_at: datetime

    class Config:
        orm_mode = True
