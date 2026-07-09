import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Time, Integer, ForeignKey, func, Uuid
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    full_name = Column(String(120), nullable=False)
    email = Column(String(120), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=True)
    role = Column(String(50), default="user")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationship to Alarms (cascade delete ensures orphans are cleaned up)
    alarms = relationship("Alarm", back_populates="owner", cascade="all, delete-orphan")

class Alarm(Base):
    __tablename__ = "alarms"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(100), nullable=False)
    alarm_time = Column(Time, nullable=False)
    repeat_type = Column(String(20), default="daily")  # once, daily, weekdays, weekends, custom
    custom_days = Column(String(50), nullable=True)     # e.g. "MON,WED,FRI"
    challenge_type = Column(String(50), default="math") # math, memory, logic, etc.
    volume = Column(Integer, default=80)
    vibration = Column(Boolean, default=True)
    snooze_enabled = Column(Boolean, default=True)
    snooze_duration = Column(Integer, default=5)
    is_active = Column(Boolean, default=True)
    is_smart_adaptive = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    owner = relationship("User", back_populates="alarms")

