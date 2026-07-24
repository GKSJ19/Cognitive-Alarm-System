import uuid
from sqlalchemy import Column, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base

class ChallengeAttempt(Base):
    __tablename__ = "challenge_attempts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    alarm_trigger_id = Column(UUID(as_uuid=True), ForeignKey("alarm_triggers.id"), nullable=True)
    challenge_id = Column(UUID(as_uuid=True), ForeignKey("challenges.id"), nullable=False)
    attempt_number = Column(Integer, default=1)
    is_correct = Column(Boolean, default=False)
    time_taken_seconds = Column(Integer, nullable=True)
    answered_at = Column(DateTime(timezone=True), server_default=func.now())