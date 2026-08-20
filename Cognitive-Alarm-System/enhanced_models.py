"""
Enhanced database models for Intelligent Cognitive Alarm Platform
"""

from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict
from datetime import datetime
from enum import Enum


# ==================== User & Authentication ====================

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    role: str = "user"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserProfileCreate(BaseModel):
    timezone: str = "UTC"
    preferred_wake_up_time: str  # HH:MM format
    sleep_duration: int = 8  # hours
    difficulty_preference: str = "medium"


class UserProfile(BaseModel):
    user_id: str
    timezone: str
    preferred_wake_up_time: str
    sleep_duration: int
    difficulty_preference: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserInfo(BaseModel):
    user_id: str
    email: str
    first_name: str
    last_name: str
    role: str
    profile: Optional[UserProfile]
    created_at: datetime


# ==================== Habit Management ====================

class HabitCreate(BaseModel):
    name: str
    description: Optional[str]
    category: str  # sleep, exercise, productivity, meditation, etc.
    goal: str
    frequency: str  # daily, weekly, specific_days


class Habit(BaseModel):
    habit_id: str
    user_id: str
    name: str
    description: Optional[str]
    category: str
    goal: str
    frequency: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class HabitProgress(BaseModel):
    date: str  # YYYY-MM-DD
    completed: bool
    notes: Optional[str]


# ==================== Alarm System ====================

class AlarmType(str, Enum):
    DAILY = "daily"
    WEEKDAY = "weekday"
    WEEKEND = "weekend"
    ONE_TIME = "one_time"
    SMART_ADAPTIVE = "smart_adaptive"


class AlarmCreate(BaseModel):
    title: str
    alarm_time: str  # HH:MM format
    alarm_type: AlarmType = AlarmType.DAILY
    days: Optional[List[int]] = None  # 0-6 for weekday alarms
    enabled: bool = True
    intensity: int = 5  # 1-10
    description: Optional[str] = None


class Alarm(BaseModel):
    alarm_id: str
    user_id: str
    title: str
    alarm_time: str
    alarm_type: str
    days: Optional[List[int]]
    enabled: bool
    intensity: int
    description: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


# ==================== Cognitive Challenges ====================

class DifficultyLevel(str, Enum):
    BEGINNER = "beginner"
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"
    EXPERT = "expert"


class ChallengeType(str, Enum):
    MATH = "math"
    LOGIC = "logic"
    MEMORY = "memory"
    WORD = "word"
    PATTERN = "pattern"
    RIDDLE = "riddle"
    QUIZ = "quiz"


class ChallengeCreate(BaseModel):
    challenge_type: ChallengeType
    difficulty: DifficultyLevel
    alarm_id: str


class Challenge(BaseModel):
    challenge_id: str
    alarm_id: str
    challenge_type: str
    difficulty: str
    content: str
    correct_answer: str
    hints: Optional[List[str]]
    time_limit: int  # seconds
    created_at: datetime
    
    class Config:
        from_attributes = True


class ChallengeResponse(BaseModel):
    challenge_id: str
    user_answer: str
    time_taken: int  # seconds
    is_correct: bool
    hint_used: bool = False


class ChallengeResult(BaseModel):
    challenge_id: str
    is_correct: bool
    time_taken: int
    difficulty: str
    challenge_type: str
    points_earned: int
    completed_at: datetime


# ==================== Wake-Up Verification ====================

class WakeUpVerification(BaseModel):
    alarm_id: str
    verification_method: str  # puzzle, multi_step, consecutive, time_based
    status: str  # pending, in_progress, completed, failed
    challenges_required: int
    challenges_completed: int
    verified_at: Optional[datetime]


# ==================== Analytics & Performance ====================

class WakeUpStats(BaseModel):
    date: str
    alarm_id: str
    scheduled_time: str
    actual_wake_time: Optional[str]
    snoozed: bool
    snooze_count: int
    challenge_completed: bool
    challenge_score: Optional[float]
    productivity_score: Optional[float]


class HabitScore(BaseModel):
    user_id: str
    date: str
    wake_up_consistency: float  # 0-100
    challenge_completion: float  # 0-100
    snooze_reduction: float  # 0-100
    sleep_adherence: float  # 0-100
    total_habit_score: float  # 0-100


class BehaviorAnalytics(BaseModel):
    user_id: str
    snooze_patterns: Dict
    wake_up_patterns: Dict
    productivity_correlation: float
    habit_consistency: float
    challenge_accuracy: float
    avg_challenge_time: float


# ==================== Recommendations ====================

class Recommendation(BaseModel):
    recommendation_id: str
    user_id: str
    category: str  # sleep, wake_up, habit, productivity
    title: str
    description: str
    action: Optional[str]
    confidence_score: float
    created_at: datetime


class DifficultyAdjustment(BaseModel):
    user_id: str
    current_difficulty: str
    suggested_difficulty: str
    reason: str
    adjustment_factor: float
    implemented_at: Optional[datetime]


# ==================== Dashboard Views ====================

class UserDashboard(BaseModel):
    total_alarms: int
    active_alarms: int
    habit_score: float
    wake_up_success_rate: float
    snooze_reduction: float
    recent_challenges: List[ChallengeResult]
    recent_recommendations: List[Recommendation]
    productivity_trend: Dict


class CoachDashboard(BaseModel):
    total_users: int
    avg_habit_score: float
    top_performers: List[Dict]
    users_needing_support: List[Dict]
    trend_analysis: Dict
    recommendation_effectiveness: float


class AdminDashboard(BaseModel):
    total_users: int
    total_alarms: int
    active_users: int
    system_health: Dict
    platform_analytics: Dict
    performance_metrics: Dict


# ==================== Reports ====================

class HabitReport(BaseModel):
    user_id: str
    date_range: str
    total_habit_score: float
    category_breakdown: Dict
    trends: Dict
    recommendations: List[str]


class WakeUpReport(BaseModel):
    user_id: str
    date_range: str
    total_alarms: int
    successful_wake_ups: int
    success_rate: float
    avg_snooze_time: float
    consistency_score: float


class ChallengePerformanceReport(BaseModel):
    user_id: str
    date_range: str
    total_challenges: int
    accuracy_rate: float
    by_type: Dict
    by_difficulty: Dict
    avg_time: float
    improvement_trend: Dict
