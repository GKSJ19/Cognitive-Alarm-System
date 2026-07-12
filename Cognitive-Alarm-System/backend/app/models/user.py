from sqlalchemy import Boolean, Column, Enum, String, Text, TIMESTAMP, Time, Integer, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import Base
from app.models.enums import AuthProvider, GoalType, DifficultyLevel, UserRole


class User(Base):
    __tablename__ = "users"
    __table_args__ = (UniqueConstraint("email", name="uq_users_email"),)

    id = Column(UUID(as_uuid=True), primary_key=True, server_default="gen_random_uuid()")
    name = Column(String(120), nullable=False)
    email = Column(String(160), nullable=False, unique=True)
    password_hash = Column(Text)
    auth_provider = Column(Enum(AuthProvider), nullable=False, server_default="email")
    google_id = Column(String(255), nullable=True)
    role = Column(Enum(UserRole), nullable=False, server_default="user")
    goal_type = Column(Enum(GoalType), nullable=False, server_default="study")
    preferred_wake_time = Column(Time, nullable=True)
    sleep_duration_mins = Column(Integer, nullable=True)
    timezone = Column(String(60), nullable=False, server_default="Asia/Kolkata")
    difficulty_pref = Column(Enum(DifficultyLevel), nullable=False, server_default="medium")
    is_active = Column(Boolean, nullable=False, server_default="true")
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default="CURRENT_TIMESTAMP")
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default="CURRENT_TIMESTAMP")

    alarms = relationship("Alarm", back_populates="user", cascade="all, delete-orphan")
    triggers = relationship("AlarmTrigger", back_populates="user", cascade="all, delete-orphan")
    password_reset_tokens = relationship("PasswordResetToken", back_populates="user", cascade="all, delete-orphan")
    assigned_users = relationship("CoachAssignment", foreign_keys="CoachAssignment.coach_id", back_populates="coach")
    coach_assignments = relationship("CoachAssignment", foreign_keys="CoachAssignment.user_id", back_populates="user")
    audit_logs = relationship("AuditLog", foreign_keys="AuditLog.admin_id", back_populates="admin")
    platform_settings = relationship("PlatformSetting", back_populates="updated_by_user")
    sleep_logs = relationship("SleepLog", back_populates="user", cascade="all, delete-orphan")
    habit_scores = relationship("HabitScore", back_populates="user", cascade="all, delete-orphan")
    goal_metrics = relationship("GoalMetric", back_populates="user", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="user", cascade="all, delete-orphan")
