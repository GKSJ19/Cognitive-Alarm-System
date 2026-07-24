import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, Integer, DateTime, ForeignKey, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.connection import Base

class Habit(Base):
    __tablename__ = "habits"

    habit_id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    frequency: Mapped[str] = mapped_column(String(50), default="daily", nullable=False) # e.g. daily, weekly
    reminder_time: Mapped[str | None] = mapped_column(String(50), nullable=True) # e.g. "08:00"
    target_days: Mapped[int] = mapped_column(Integer, default=7, nullable=False) # e.g. target 7 days a week
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    progress = relationship("HabitProgress", back_populates="habit", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "habit_id": self.habit_id,
            "user_id": self.user_id,
            "title": self.title,
            "description": self.description,
            "frequency": self.frequency,
            "reminder_time": self.reminder_time,
            "target_days": self.target_days,
            "is_active": self.is_active,
            "created_at": self.created_at
        }

class HabitProgress(Base):
    __tablename__ = "habit_progress"

    progress_id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    habit_id: Mapped[str] = mapped_column(String(36), ForeignKey("habits.habit_id"), nullable=False)
    completion_date: Mapped[str] = mapped_column(String(10), nullable=False) # Format: YYYY-MM-DD
    status: Mapped[str] = mapped_column(String(50), default="completed", nullable=False) # completed, skipped, missed
    streak_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Relationships
    habit = relationship("Habit", back_populates="progress")

    def to_dict(self):
        return {
            "progress_id": self.progress_id,
            "habit_id": self.habit_id,
            "completion_date": self.completion_date,
            "status": self.status,
            "streak_count": self.streak_count
        }

from sqlalchemy import Float

class ChallengeResult(Base):
    __tablename__ = "challenge_results"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    challenge_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    challenge_type: Mapped[str] = mapped_column(String(50), default="math", nullable=False)
    difficulty: Mapped[str] = mapped_column(String(50), default="medium", nullable=False)
    time_taken_seconds: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    is_correct: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    attempts: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    habit_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    completed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "challenge_id": self.challenge_id,
            "challenge_type": self.challenge_type,
            "difficulty": self.difficulty,
            "time_taken_seconds": self.time_taken_seconds,
            "is_correct": self.is_correct,
            "attempts": self.attempts,
            "habit_score": self.habit_score,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None
        }

