import uuid
from enum import Enum as PyEnum
from sqlalchemy import Column, Integer, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base

class VerificationStatus(str, PyEnum):
    pending = "pending"
    in_progress = "in_progress"
    passed = "passed"
    failed = "failed"

class AlarmTrigger(Base):
    __tablename__ = "alarm_triggers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    alarm_id = Column(UUID(as_uuid=True), ForeignKey("alarms.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    triggered_at = Column(DateTime(timezone=True), server_default=func.now())
    dismissed_at = Column(DateTime(timezone=True), nullable=True)
    verification_status = Column(Enum(VerificationStatus, native_enum=False), default=VerificationStatus.pending)
    snooze_count = Column(Integer, default=0)
    total_attempts = Column(Integer, default=0)