import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr
from app.schemas.role import RoleResponse
from app.schemas.profile import UserProfileResponse

class UserBase(BaseModel):
    email: EmailStr
    full_name: str | None = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: EmailStr | None = None
    full_name: str | None = None
    password: str | None = None
    is_active: bool | None = None
    role_id: uuid.UUID | None = None

class UserResponse(UserBase):
    id: uuid.UUID
    is_active: bool
    is_superuser: bool
    created_at: datetime
    updated_at: datetime
    role: RoleResponse | None = None
    profile: UserProfileResponse | None = None

    model_config = ConfigDict(from_attributes=True)

