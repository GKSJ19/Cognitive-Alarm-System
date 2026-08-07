import uuid
from sqlalchemy import Column, Date, DateTime, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base

class HabitScore(Base):
    __tablename__ = "habit_scores"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    wake_consistency_score = Column(Numeric, default=0)
    challenge_success_score = Column(Numeric, default=0)
    snooze_reduction_score = Column(Numeric, default=0)
    sleep_adherence_score = Column(Numeric, default=0)
    total_score = Column(Numeric, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())