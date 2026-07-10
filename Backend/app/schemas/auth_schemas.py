from pydantic import BaseModel, EmailStr, Field, model_validator
from typing import Literal

class UserInfo(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: Literal["user", "coach", "admin"]
    is_active: bool
    is_verified: bool

    class Config:
        from_attributes = True

class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")
    confirm_password: str
    role: Literal["user", "coach", "admin"] = "user"

    @model_validator(mode="after")
    def passwords_match(self) -> 'RegisterRequest':
        if self.password != self.confirm_password:
            raise ValueError("passwords do not match")
        return self

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class VerifyEmailRequest(BaseModel):
    token: str

class SocialLoginRequest(BaseModel):
    provider: Literal["google", "apple"]
    identity_token: str
    # Some optional fields in case user details are sent during registration
    full_name: str | None = None
    email: EmailStr | None = None

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserInfo

class MessageResponse(BaseModel):
    message: str

class RefreshRequest(BaseModel):
    refresh_token: str

