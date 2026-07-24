import uuid
from pydantic import BaseModel, ConfigDict

class UserProfileBase(BaseModel):
    avatar_url: str | None = None
    bio: str | None = None
    phone_number: str | None = None
    timezone: str | None = "UTC"
    theme_preference: str | None = "dark"

class UserProfileUpdate(UserProfileBase):
    pass

class UserProfileResponse(UserProfileBase):
    id: uuid.UUID
    user_id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)
