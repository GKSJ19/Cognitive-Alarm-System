from pydantic import BaseModel, EmailStr
from datetime import time
from typing import Optional

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    preferred_wake_time: Optional[time] = None
    sleep_duration_mins: Optional[int] = None
    timezone: Optional[str] = None
    goal_type: Optional[str] = None
    difficulty_pref: Optional[str] = None

class GoogleLoginRequest(BaseModel):
    id_token: str