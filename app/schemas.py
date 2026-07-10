from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from app.models import UserRole


# ---------- Request Schemas ----------

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


# ---------- Response Schemas ----------

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: UserRole
    created_at: datetime

    # Allows Pydantic to read data directly from SQLAlchemy model objects
    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
