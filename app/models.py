import enum
from sqlalchemy import (
    Column, Integer, String, DateTime, Enum, Boolean, Time, Text, JSON, ForeignKey, Index
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class UserRole(str, enum.Enum):
    user = "user"
    wellness_coach = "wellness_coach"
    admin = "admin"  # Represents "Administrator" in the project plan


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=True)  # nullable: Google-only users have no password
    firebase_uid = Column(String(128), unique=True, index=True, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.user, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # --- Habit / wake-up profile fields (Milestone 2) ---
    # These are consumed by Member 2 (Alarm scheduling needs wake-up time/timezone),
    # Member 3 (AI/Analytics needs difficulty_preference + habit_preferences).
    preferred_wake_up_time = Column(Time, nullable=True)
    sleep_duration_minutes = Column(Integer, nullable=True)
    timezone = Column(String(50), default="UTC", nullable=True)
    difficulty_preference = Column(String(20), default="medium", nullable=True)
    productivity_goals = Column(Text, nullable=True)
    habit_preferences = Column(JSON, nullable=True)

    # --- Account lockout fields (Milestone 3) ---
    failed_login_attempts = Column(Integer, default=0, nullable=False)
    locked_until = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    refresh_tokens = relationship(
        "RefreshToken", back_populates="user", cascade="all, delete-orphan"
    )


class RefreshToken(Base):
    """
    Server-side record of issued refresh tokens. Storing these (instead of
    relying purely on a stateless JWT) is what makes /auth/logout and
    /auth/refresh actually work correctly -- a pure JWT can't be revoked.
    """
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    token = Column(String(255), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    revoked = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="refresh_tokens")


class PasswordResetToken(Base):
    """
    Short-lived, single-use tokens for the password reset flow. Never email
    or return the user's actual new password -- only ever this token.
    """
    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    token = Column(String(255), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AuditLog(Base):
    """
    Append-only record of security-relevant events: login attempts (success
    and failure), role changes, and admin actions. Read access is
    Administrator-only (see GET /admin/audit-logs).
    """
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)  # null = unknown/anonymous actor
    action = Column(String(50), nullable=False)  # e.g. "login_success", "login_failed", "role_changed"
    detail = Column(Text, nullable=True)
    ip_address = Column(String(64), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)


Index("ix_audit_logs_action_created", AuditLog.action, AuditLog.created_at)
