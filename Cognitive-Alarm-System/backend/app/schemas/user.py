from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    goal_type: Optional[str] = None
    preferred_wake_time: Optional[str] = None
    sleep_duration_mins: Optional[int] = None
    timezone: Optional[str] = None
    difficulty_pref: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(min_length=8)


class UserUpdate(BaseModel):
    name: Optional[str] = None
    goal_type: Optional[str] = None
    preferred_wake_time: Optional[str] = None
    sleep_duration_mins: Optional[int] = None
    timezone: Optional[str] = None
    difficulty_pref: Optional[str] = None


class UserOut(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    role: str
    auth_provider: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
