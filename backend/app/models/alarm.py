import uuid
from enum import Enum as PyEnum
from sqlalchemy import Column, String, Boolean, DateTime, Time, ARRAY, SmallInteger, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base

class AlarmType(str, PyEnum):
    daily = "daily"
    weekday = "weekday"
    weekend = "weekend"
    one_time = "one_time"
    smart_adaptive = "smart_adaptive"

class Alarm(Base):
    __tablename__ = "alarms"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    time = Column(Time, nullable=False)
    alarm_type = Column(Enum(AlarmType, native_enum=False), default=AlarmType.daily)
    days_of_week = Column(ARRAY(SmallInteger), nullable=True)
    is_active = Column(Boolean, default=True)
    label = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())