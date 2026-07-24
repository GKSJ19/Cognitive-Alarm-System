from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class CoachAssignmentBase(BaseModel):
    coach_id: str
    user_id: str
    status: str = "active"

class CoachAssignRequest(BaseModel):
    coach_id: str
    user_id: str

class CoachAssignmentResponse(CoachAssignmentBase):
    assignment_id: str
    assigned_date: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CoachMessageBase(BaseModel):
    user_id: str
    title: str = Field(..., max_length=255)
    message: str = Field(..., max_length=2000)

class CoachMessageCreate(CoachMessageBase):
    pass

class CoachMessageResponse(CoachMessageBase):
    message_id: str
    coach_id: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class CoachDashboardResponse(BaseModel):
    total_assigned_users: int
    active_users: int
    todays_wakeups: int
    habit_completion_rate: float
    alarm_success_rate: float
    challenge_success_rate: float
