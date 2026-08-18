import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, Integer, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.connection import Base

class Alarm(Base):
    __tablename__ = "alarms"

    alarm_id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    alarm_time: Mapped[str] = mapped_column(String(50), nullable=False) # e.g. "07:30"
    repeat_days: Mapped[str | None] = mapped_column(String(100), nullable=True) # e.g. "1,2,3,4,5"
    vibration: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    ringtone: Mapped[str] = mapped_column(String(255), default="default", nullable=False)
    snooze_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    snooze_duration: Mapped[int] = mapped_column(Integer, default=5, nullable=False) # in minutes
    challenge_required: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    challenge_type: Mapped[str] = mapped_column(String(100), default="math", nullable=False) # e.g. math, memory
    difficulty: Mapped[str] = mapped_column(String(50), default="medium", nullable=False) # e.g. easy, medium, hard
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    history = relationship("AlarmHistory", back_populates="alarm", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "alarm_id": self.alarm_id,
            "user_id": self.user_id,
            "title": self.title,
            "alarm_time": self.alarm_time,
            "repeat_days": self.repeat_days,
            "vibration": self.vibration,
            "ringtone": self.ringtone,
            "snooze_enabled": self.snooze_enabled,
            "snooze_duration": self.snooze_duration,
            "challenge_required": self.challenge_required,
            "challenge_type": self.challenge_type,
            "difficulty": self.difficulty,
            "is_active": self.is_active
        }

class AlarmHistory(Base):
    __tablename__ = "alarm_history"

    history_id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    alarm_id: Mapped[str] = mapped_column(String(36), ForeignKey("alarms.alarm_id"), nullable=False)
    wake_time: Mapped[str] = mapped_column(String(50), nullable=False) # Actual wake time e.g. "07:35"
    solved: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    solve_time: Mapped[int] = mapped_column(Integer, default=0, nullable=False) # time taken in seconds
    dismissed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    alarm = relationship("Alarm", back_populates="history")

    def to_dict(self):
        return {
            "history_id": self.history_id,
            "alarm_id": self.alarm_id,
            "wake_time": self.wake_time,
            "solved": self.solved,
            "solve_time": self.solve_time,
            "dismissed_at": self.dismissed_at
        }
