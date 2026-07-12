from sqlalchemy import Boolean, Column, Enum, ForeignKey, Integer, String, Text, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import Base
from app.models.enums import ChallengeType, DifficultyLevel, GoalType, ChallengeSource


class Challenge(Base):
    __tablename__ = "challenges"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default="gen_random_uuid()")
    type = Column(Enum(ChallengeType), nullable=False)
    goal_type = Column(Enum(GoalType), nullable=True)
    difficulty = Column(Enum(DifficultyLevel), nullable=True)
    question = Column(Text, nullable=False)
    correct_answer = Column(Text, nullable=False)
    source = Column(Enum(ChallengeSource), nullable=False, server_default="question_bank")
    embedding_ref = Column(String(120), nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default="CURRENT_TIMESTAMP")

    attempts = relationship("ChallengeAttempt", back_populates="challenge")


class ChallengeAttempt(Base):
    __tablename__ = "challenge_attempts"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default="gen_random_uuid()")
    alarm_trigger_id = Column(UUID(as_uuid=True), ForeignKey("alarm_triggers.id", ondelete="CASCADE"), nullable=False)
    challenge_id = Column(UUID(as_uuid=True), ForeignKey("challenges.id", ondelete="CASCADE"), nullable=False)
    attempt_number = Column(Integer, nullable=False, server_default="1")
    is_correct = Column(Boolean, nullable=False, server_default="false")
    time_taken_seconds = Column(Integer, nullable=True)
    answered_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default="CURRENT_TIMESTAMP")

    alarm_trigger = relationship("AlarmTrigger", back_populates="attempts")
    challenge = relationship("Challenge", back_populates="attempts")
