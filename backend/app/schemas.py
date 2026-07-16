from pydantic import BaseModel, Field, ConfigDict, model_validator
from uuid import UUID
from datetime import datetime, time
from typing import Optional
from enum import Enum

# --- User Roles ---

class UserRole(str, Enum):
    USER = "user"
    WELLNESS_COACH = "wellness_coach"
    ADMIN = "admin"

# --- User Schemas ---

class UserBase(BaseModel):
    email: str = Field(..., description="User email address")
    full_name: str = Field(..., min_length=1, max_length=120)

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, description="Password must be at least 6 characters long")
    role: UserRole = UserRole.USER

class UserResponse(UserBase):
    id: UUID
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenRefreshRequest(BaseModel):
    refresh_token: str

class TokenData(BaseModel):
    user_id: Optional[UUID] = None
    role: Optional[str] = None

class UserProfileResponse(BaseModel):
    id: UUID
    user_id: UUID
    profile_photo: Optional[str] = None
    phone_number: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[str] = None
    occupation: Optional[str] = None
    timezone: str = "UTC"
    preferred_wakeup_time: Optional[str] = None
    preferred_sleep_time: Optional[str] = None
    bio: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class UserProfileUpdate(BaseModel):
    phone_number: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[str] = None
    occupation: Optional[str] = None
    timezone: Optional[str] = None
    preferred_wakeup_time: Optional[str] = None
    preferred_sleep_time: Optional[str] = None
    bio: Optional[str] = None

# --- Alarm Repeat Enum ---

class AlarmRepeatType(str, Enum):
    ONCE = "once"
    DAILY = "daily"
    WEEKDAYS = "weekdays"
    WEEKENDS = "weekends"
    CUSTOM = "custom"

# --- Alarm Schemas ---

class AlarmBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    alarm_time: time = Field(..., description="Alarm time in HH:MM format")
    repeat_type: AlarmRepeatType = AlarmRepeatType.DAILY
    custom_days: Optional[str] = Field(None, description="Comma separated days (e.g. MON,WED,FRI) when repeat_type is custom")
    challenge_type: str = Field("math", description="Cognitive challenge type (e.g. math, memory, logic)")
    volume: int = Field(80, ge=0, le=100, description="Volume level (0-100)")
    vibration: bool = True
    snooze_enabled: bool = True
    snooze_duration: int = Field(5, ge=1, le=30, description="Snooze duration in minutes (1-30)")
    is_smart_adaptive: bool = False
    
    # New fields mapping to React Native frontend
    repeat_days: Optional[str] = Field(None, description="Comma separated active day indices (e.g. 1,2,3,4,5)")
    ringtone: str = Field("cyber_alarm.mp3", description="Ringtone asset path")
    challenge_required: bool = True
    difficulty: str = Field("medium", description="Difficulty level (easy, medium, hard)")

    @model_validator(mode="after")
    def validate_custom_days(self) -> 'AlarmBase':
        if self.repeat_type == AlarmRepeatType.CUSTOM and not self.custom_days:
            raise ValueError("custom_days must be provided when repeat_type is 'custom'")
        return self

class AlarmCreate(AlarmBase):
    pass

class AlarmUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    alarm_time: Optional[time] = None
    repeat_type: Optional[AlarmRepeatType] = None
    custom_days: Optional[str] = None
    challenge_type: Optional[str] = None
    volume: Optional[int] = Field(None, ge=0, le=100)
    vibration: Optional[bool] = None
    snooze_enabled: Optional[bool] = None
    snooze_duration: Optional[int] = Field(None, ge=1, le=30)
    is_smart_adaptive: Optional[bool] = None
    
    # New fields
    repeat_days: Optional[str] = None
    ringtone: Optional[str] = None
    challenge_required: Optional[bool] = None
    difficulty: Optional[str] = None

    @model_validator(mode="after")
    def validate_custom_days(self) -> 'AlarmUpdate':
        if self.repeat_type == AlarmRepeatType.CUSTOM and not self.custom_days:
            raise ValueError("custom_days must be provided when repeat_type is 'custom'")
        return self

class AlarmResponse(AlarmBase):
    id: UUID
    alarm_id: UUID
    user_id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Challenge Schemas ---

class ChallengeCategoryResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ChallengeResponse(BaseModel):
    id: UUID
    category_id: UUID
    category_name: Optional[str] = None
    question_text: str
    difficulty: str
    additional_data: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ChallengeSubmitRequest(BaseModel):
    challenge_id: UUID
    answer: str
    alarm_id: Optional[UUID] = None
    solve_time: int
    attempt_count: int


class ChallengeSubmitResponse(BaseModel):
    is_correct: bool
    correct_answer: Optional[str] = None
    score: Optional[int] = None
    accuracy: Optional[float] = None


class AlarmDismissRequest(BaseModel):
    alarm_id: UUID
    wake_time: str
    solved: bool
    solve_time: int


class AlarmHistoryResponse(BaseModel):
    history_id: UUID
    alarm_id: UUID
    wake_time: str
    solved: bool
    solve_time: int
    dismissed_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OAuthLoginRequest(BaseModel):
    id_token: str
    email: Optional[str] = None
    full_name: Optional[str] = None


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6, description="New password must be at least 6 characters long")



