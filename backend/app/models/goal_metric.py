import uuid
from enum import Enum as PyEnum
from sqlalchemy import Column, Date, String, Numeric, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

class GoalType(str, PyEnum):
    study = "study"
    work = "work"
    fitness = "fitness"

class GoalMetric(Base):
    __tablename__ = "goal_metrics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    goal_type = Column(Enum(GoalType, native_enum=False), nullable=False)
    metric_label = Column(String(60), nullable=False)
    metric_value = Column(Numeric, nullable=False)