import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Float, ForeignKey, func, Uuid
from sqlalchemy.orm import relationship
from app.database import Base

class DifficultyHistory(Base):
    __tablename__ = "difficulty_histories"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    alarm_id = Column(Uuid, ForeignKey("alarms.id", ondelete="CASCADE"), nullable=False)
    previous_difficulty = Column(String(50), nullable=False)
    new_difficulty = Column(String(50), nullable=False)
    reason = Column(String(255), nullable=True)
    changed_at = Column(DateTime, server_default=func.now())

    user = relationship("User")
    alarm = relationship("Alarm")


class UserBehaviorAnalytic(Base):
    __tablename__ = "user_behavior_analytics"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date = Column(String(10), nullable=False)  # "YYYY-MM-DD"
    wake_up_time = Column(String(8), nullable=True)  # "HH:MM:SS" (actual dismiss time)
    target_wake_up_time = Column(String(8), nullable=True)  # "HH:MM:SS" (scheduled time)
    wake_up_delay = Column(Integer, default=0)  # in seconds
    snooze_count = Column(Integer, default=0)
    challenge_solved = Column(Boolean, default=False)
    challenge_solve_time = Column(Integer, default=0)  # in seconds
    challenge_attempts = Column(Integer, default=0)
    sleep_duration = Column(Float, nullable=True)  # in hours
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User")


class HabitScore(Base):
    __tablename__ = "habit_scores"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date = Column(String(10), nullable=False)  # "YYYY-MM-DD"
    wake_up_consistency = Column(Float, default=0.0)  # 0 to 100
    challenge_completion = Column(Float, default=0.0)  # 0 to 100
    snooze_reduction = Column(Float, default=0.0)  # 0 to 100
    sleep_adherence = Column(Float, default=0.0)  # 0 to 100
    overall_score = Column(Float, default=0.0)  # 0 to 100
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category = Column(String(50), nullable=False)  # "sleep", "challenge", "wakeup", "productivity"
    title = Column(String(150), nullable=False)
    content = Column(String(500), nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User")
