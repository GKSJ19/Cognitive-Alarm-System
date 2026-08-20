"""
Enhanced Database Models for Intelligent Cognitive Alarm Platform
SQLAlchemy ORM models
"""

from sqlalchemy import (
    create_engine, Column, String, Integer, Float, DateTime, Boolean, 
    Text, ForeignKey, JSON, Table
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./intelligent_alarm.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ==================== User & Authentication ====================

class UserORM(Base):
    __tablename__ = "users"
    
    user_id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    first_name = Column(String)
    last_name = Column(String)
    role = Column(String, default="user")  # user, wellness_coach, administrator
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    profile = relationship("UserProfileORM", back_populates="user", uselist=False)
    habits = relationship("HabitORM", back_populates="user")
    alarms = relationship("AlarmORM", back_populates="user")
    challenges = relationship("ChallengeORM", back_populates="user")


class UserProfileORM(Base):
    __tablename__ = "user_profiles"
    
    profile_id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.user_id"), unique=True)
    timezone = Column(String, default="UTC")
    preferred_wake_up_time = Column(String)  # HH:MM
    sleep_duration = Column(Integer, default=8)
    difficulty_preference = Column(String, default="medium")
    bio = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    user = relationship("UserORM", back_populates="profile")


# ==================== Habits ====================

class HabitORM(Base):
    __tablename__ = "habits"
    
    habit_id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.user_id"), index=True)
    name = Column(String)
    description = Column(Text, nullable=True)
    category = Column(String)  # sleep, exercise, productivity, meditation
    goal = Column(String)
    frequency = Column(String)  # daily, weekly, specific_days
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    user = relationship("UserORM", back_populates="habits")
    progress = relationship("HabitProgressORM", back_populates="habit")


class HabitProgressORM(Base):
    __tablename__ = "habit_progress"
    
    progress_id = Column(String, primary_key=True, index=True)
    habit_id = Column(String, ForeignKey("habits.habit_id"), index=True)
    date = Column(String, index=True)  # YYYY-MM-DD
    completed = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    recorded_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    habit = relationship("HabitORM", back_populates="progress")


# ==================== Alarms ====================

class AlarmORM(Base):
    __tablename__ = "alarms"
    
    alarm_id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.user_id"), index=True)
    title = Column(String)
    alarm_time = Column(String)  # HH:MM
    alarm_type = Column(String)  # daily, weekday, weekend, one_time, smart_adaptive
    days = Column(JSON, nullable=True)  # [0-6] for weekday alarms
    enabled = Column(Boolean, default=True)
    intensity = Column(Integer, default=5)  # 1-10
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    user = relationship("UserORM", back_populates="alarms")
    challenges = relationship("ChallengeORM", back_populates="alarm")


# ==================== Cognitive Challenges ====================

class ChallengeORM(Base):
    __tablename__ = "challenges"
    
    challenge_id = Column(String, primary_key=True, index=True)
    alarm_id = Column(String, ForeignKey("alarms.alarm_id"), index=True)
    user_id = Column(String, ForeignKey("users.user_id"), index=True)
    challenge_type = Column(String)  # math, logic, memory, word, pattern, riddle, quiz
    difficulty = Column(String)  # beginner, easy, medium, hard, expert
    content = Column(Text)
    correct_answer = Column(String)
    hints = Column(JSON, nullable=True)
    time_limit = Column(Integer, default=60)  # seconds
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("UserORM", back_populates="challenges")
    alarm = relationship("AlarmORM", back_populates="challenges")
    results = relationship("ChallengeResultORM", back_populates="challenge")


class ChallengeResultORM(Base):
    __tablename__ = "challenge_results"
    
    result_id = Column(String, primary_key=True, index=True)
    challenge_id = Column(String, ForeignKey("challenges.challenge_id"), index=True)
    user_answer = Column(String)
    is_correct = Column(Boolean)
    time_taken = Column(Integer)  # seconds
    hint_used = Column(Boolean, default=False)
    points_earned = Column(Integer)
    completed_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    challenge = relationship("ChallengeORM", back_populates="results")


# ==================== Wake-Up Verification ====================

class WakeUpVerificationORM(Base):
    __tablename__ = "wake_up_verifications"
    
    verification_id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True)
    alarm_id = Column(String, index=True)
    verification_method = Column(String)
    status = Column(String)  # pending, in_progress, completed, failed
    challenges_required = Column(Integer)
    challenges_completed = Column(Integer, default=0)
    verified_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class WakeUpStatsORM(Base):
    __tablename__ = "wake_up_stats"
    
    stat_id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True)
    date = Column(String, index=True)  # YYYY-MM-DD
    alarm_id = Column(String, index=True)
    scheduled_time = Column(String)
    actual_wake_time = Column(String, nullable=True)
    snoozed = Column(Boolean, default=False)
    snooze_count = Column(Integer, default=0)
    challenge_completed = Column(Boolean, default=False)
    challenge_score = Column(Float, nullable=True)
    productivity_score = Column(Float, nullable=True)
    recorded_at = Column(DateTime, default=datetime.utcnow)


# ==================== Analytics & Scoring ====================

class HabitScoreORM(Base):
    __tablename__ = "habit_scores"
    
    score_id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True)
    date = Column(String, index=True)  # YYYY-MM-DD
    wake_up_consistency = Column(Float)  # 0-100
    challenge_completion = Column(Float)  # 0-100
    snooze_reduction = Column(Float)  # 0-100
    sleep_adherence = Column(Float)  # 0-100
    total_habit_score = Column(Float)  # 0-100
    recorded_at = Column(DateTime, default=datetime.utcnow)


class BehaviorAnalyticsORM(Base):
    __tablename__ = "behavior_analytics"
    
    analytics_id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True)
    snooze_patterns = Column(JSON)
    wake_up_patterns = Column(JSON)
    productivity_correlation = Column(Float)
    habit_consistency = Column(Float)
    challenge_accuracy = Column(Float)
    avg_challenge_time = Column(Float)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ==================== Recommendations & Adjustments ====================

class RecommendationORM(Base):
    __tablename__ = "recommendations"
    
    recommendation_id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True)
    category = Column(String)  # sleep, wake_up, habit, productivity
    title = Column(String)
    description = Column(Text)
    action = Column(String, nullable=True)
    confidence_score = Column(Float)
    is_dismissed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class DifficultyAdjustmentORM(Base):
    __tablename__ = "difficulty_adjustments"
    
    adjustment_id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True)
    current_difficulty = Column(String)
    suggested_difficulty = Column(String)
    reason = Column(Text)
    adjustment_factor = Column(Float)
    implemented_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# Create tables
Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
