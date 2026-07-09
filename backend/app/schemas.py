from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional
from enum import Enum

class UserRole(str, Enum):
    USER = "user"
    WELLNESS_COACH = "wellness_coach"
    ADMIN = "admin"

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

class TokenData(BaseModel):
    user_id: Optional[UUID] = None
    role: Optional[str] = None
