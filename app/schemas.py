from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime, time
from typing import Optional
from app.models import UserRole


# ---------- Auth request schemas ----------

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


# ---------- Profile request schemas ----------

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None


class UserHabitsUpdate(BaseModel):
    # All optional -- only fields provided in the request are updated.
    preferred_wake_up_time: Optional[time] = None
    sleep_duration_minutes: Optional[int] = None
    timezone: Optional[str] = None
    difficulty_preference: Optional[str] = None
    productivity_goals: Optional[str] = None
    habit_preferences: Optional[dict] = None


# ---------- Admin request schemas ----------

class RoleUpdate(BaseModel):
    role: UserRole


class StatusUpdate(BaseModel):
    is_active: bool


# ---------- Response schemas ----------

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: UserRole
    is_active: bool
    preferred_wake_up_time: Optional[time] = None
    sleep_duration_minutes: Optional[int] = None
    timezone: Optional[str] = None
    difficulty_preference: Optional[str] = None
    productivity_goals: Optional[str] = None
    habit_preferences: Optional[dict] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
