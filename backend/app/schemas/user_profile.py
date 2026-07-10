from pydantic import BaseModel, EmailStr
from datetime import time
from typing import Optional


class UserProfileBase(BaseModel):
    user_id: int
    full_name: str
    email: EmailStr

    preferred_wakeup_time: time
    sleep_duration: int
    timezone: str

    productivity_goal: Optional[str] = None
    difficulty_preference: Optional[str] = None
    habit_preference: Optional[str] = None


class UserProfileCreate(UserProfileBase):
    pass


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None

    preferred_wakeup_time: Optional[time] = None
    sleep_duration: Optional[int] = None
    timezone: Optional[str] = None

    productivity_goal: Optional[str] = None
    difficulty_preference: Optional[str] = None
    habit_preference: Optional[str] = None


class UserProfileResponse(UserProfileBase):
    id: int

    class Config:
        from_attributes = True