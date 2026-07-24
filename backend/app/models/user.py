import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Time, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(120))
    email = Column(String(160), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=True)
    auth_provider = Column(String(20), default="email")
    google_id = Column(String(255), unique=True, nullable=True)
    role = Column(String(30), default="user")
    goal_type = Column(String(30), nullable=True)
    preferred_wake_time = Column(Time, nullable=True)
    sleep_duration_mins = Column(Integer, nullable=True)
    timezone = Column(String(60), default="Asia/Kolkata")
    difficulty_pref = Column(String(20), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())