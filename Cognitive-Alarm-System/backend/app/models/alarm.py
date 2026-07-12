from sqlalchemy import ARRAY, Boolean, Column, Enum, ForeignKey, Integer, String, TIMESTAMP, Time
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import Base
from app.models.enums import AlarmType, ChallengeType, VerificationStatus


class Alarm(Base):
    __tablename__ = "alarms"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default="gen_random_uuid()")
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    time = Column(Time, nullable=False)
    alarm_type = Column(Enum(AlarmType), nullable=False, server_default="daily")
    days_of_week = Column(ARRAY(Integer), nullable=True)
    is_active = Column(Boolean, nullable=False, server_default="true")
    label = Column(String(100), nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default="CURRENT_TIMESTAMP")

    user = relationship("User", back_populates="alarms")
    triggers = relationship("AlarmTrigger", back_populates="alarm")


class AlarmTrigger(Base):
    __tablename__ = "alarm_triggers"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default="gen_random_uuid()")
    alarm_id = Column(UUID(as_uuid=True), ForeignKey("alarms.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    triggered_at = Column(TIMESTAMP(timezone=True), nullable=True)
    dismissed_at = Column(TIMESTAMP(timezone=True), nullable=True)
    verification_status = Column(Enum(VerificationStatus), nullable=False, server_default="pending")
    snooze_count = Column(Integer, nullable=False, server_default="0")
    total_attempts = Column(Integer, nullable=False, server_default="0")
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default="CURRENT_TIMESTAMP")

    alarm = relationship("Alarm", back_populates="triggers")
    user = relationship("User", back_populates="triggers")
    attempts = relationship("ChallengeAttempt", back_populates="alarm_trigger")
