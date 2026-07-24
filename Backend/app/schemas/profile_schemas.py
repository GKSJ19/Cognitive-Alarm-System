from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class ProfileBase(BaseModel):
    phone_number: Optional[str] = Field(None, max_length=50)
    gender: Optional[str] = Field(None, max_length=50)
    date_of_birth: Optional[str] = Field(None, max_length=50)
    occupation: Optional[str] = Field(None, max_length=100)
    timezone: str = Field("UTC", max_length=100)
    preferred_wakeup_time: Optional[str] = Field(None, max_length=50)
    preferred_sleep_time: Optional[str] = Field(None, max_length=50)
    bio: Optional[str] = Field(None, max_length=500)

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(ProfileBase):
    pass

class ProfileResponse(ProfileBase):
    profile_id: str
    user_id: str
    profile_photo: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
