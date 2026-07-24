from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any

class AdminUserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    role: str = "user"
    phone_number: Optional[str] = None

class AdminUserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    phone_number: Optional[str] = None

class SystemSettings(BaseModel):
    max_snooze_limit: int = 3
    default_challenge_difficulty: str = "Medium"
    maintenance_mode: bool = False

class CoachAssignRequest(BaseModel):
    coach_id: str
    user_id: str
    assigned_by_admin: Optional[str] = None

class CoachReassignRequest(BaseModel):
    user_id: str
    new_coach_id: str

class DetailedUserCard(BaseModel):
    id: str
    full_name: str
    email: str
    phone_number: Optional[str] = None
    role: str = "user"
    registration_date: str
    last_login: str
    account_status: str
    assigned_coach: Optional[Dict[str, Any]] = None
    current_habit_score: float = 0.0
    total_challenges_completed: int = 0
    average_completion_time: float = 0.0
    success_rate: float = 0.0
    current_streak: int = 0
    longest_streak: int = 0
    preferred_wakeup_time: Optional[str] = None
    total_alarms_created: int = 0
    last_challenge_date: Optional[str] = None

class DetailedCoachCard(BaseModel):
    id: str
    full_name: str
    email: str
    phone_number: Optional[str] = None
    role: str = "coach"
    assigned_users_count: int = 0
    total_active_users: int = 0
    average_user_habit_score: float = 0.0
    average_challenge_completion_rate: float = 0.0
    created_at: str

class UserAnalyticsResponse(BaseModel):
    user_info: Dict[str, Any]
    challenge_analytics: Dict[str, Any]
    habit_score_analytics: Dict[str, Any]
    alarm_analytics: Dict[str, Any]
    charts: Dict[str, Any]

class AdminDashboardOverviewResponse(BaseModel):
    overview_cards: Dict[str, Any]
    charts: Dict[str, Any]
    recent_activities: List[Dict[str, Any]]
