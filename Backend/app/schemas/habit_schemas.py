from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class HabitBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=500)
    frequency: str = Field("daily", max_length=50)
    reminder_time: Optional[str] = Field(None, max_length=50)
    target_days: int = Field(7)
    is_active: bool = Field(True)

class HabitCreate(HabitBase):
    pass

class HabitUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=500)
    frequency: Optional[str] = Field(None, max_length=50)
    reminder_time: Optional[str] = Field(None, max_length=50)
    target_days: Optional[int] = None
    is_active: Optional[bool] = None

class HabitResponse(HabitBase):
    habit_id: str
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class HabitProgressBase(BaseModel):
    completion_date: str = Field(..., description="YYYY-MM-DD format")
    status: str = Field("completed", description="completed, skipped, missed")
    streak_count: int = Field(0)

class HabitProgressResponse(HabitProgressBase):
    progress_id: str
    habit_id: str

    class Config:
        from_attributes = True

class HabitCompleteRequest(BaseModel):
    habit_id: str
    completion_date: str = Field(..., description="YYYY-MM-DD format")
    status: str = Field("completed")
