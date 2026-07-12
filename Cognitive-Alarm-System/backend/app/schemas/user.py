from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    goal_type: str | None = None
    preferred_wake_time: str | None = None
    sleep_duration_mins: int | None = None
    timezone: str | None = None
    difficulty_pref: str | None = None


class UserCreate(UserBase):
    password: str = Field(min_length=8)


class UserUpdate(BaseModel):
    name: str | None = None
    goal_type: str | None = None
    preferred_wake_time: str | None = None
    sleep_duration_mins: int | None = None
    timezone: str | None = None
    difficulty_pref: str | None = None


class UserOut(UserBase):
    id: str
    role: str
    auth_provider: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
