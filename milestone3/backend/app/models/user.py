from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, _):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    email: EmailStr
    full_name: Optional[str] = None
    hashed_password: str
    role: Optional[str] = "user"
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class UserProfileModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: Optional[PyObjectId] = None
    full_name: str = ""
    phone: Optional[str] = None
    profile_image: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    time_zone: Optional[str] = "UTC"
    preferred_wakeup_time: Optional[str] = "07:00"
    sleep_duration_goal: Optional[float] = 8.0
    productivity_goals: List[str] = []
    difficulty_preference: str = "Medium"
    habit_preferences: List[str] = []

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    time_zone: Optional[str] = None
    preferred_wakeup_time: Optional[str] = None
    sleep_duration_goal: Optional[float] = None
    productivity_goals: Optional[List[str]] = None
    difficulty_preference: Optional[str] = None
    habit_preferences: Optional[List[str]] = None
