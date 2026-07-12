from sqlalchemy import Boolean, Column, Enum, ForeignKey, Integer, Numeric, String, Text, TIMESTAMP, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import Base
from app.models.enums import GoalType, SleepSource, NotificationType, ReportType, ReportFormat


class SleepLog(Base):
    __tablename__ = "sleep_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default="gen_random_uuid()")
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    sleep_start = Column(TIMESTAMP(timezone=True), nullable=True)
    sleep_end = Column(TIMESTAMP(timezone=True), nullable=True)
    duration_mins = Column(Integer, nullable=True)
    source = Column(Enum(SleepSource), nullable=False, server_default="manual")
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default="CURRENT_TIMESTAMP")

    user = relationship("User", back_populates="sleep_logs")


class HabitScore(Base):
    __tablename__ = "habit_scores"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default="gen_random_uuid()")
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    wake_consistency_score = Column(Numeric(5, 2), nullable=True)
    challenge_success_score = Column(Numeric(5, 2), nullable=True)
    snooze_reduction_score = Column(Numeric(5, 2), nullable=True)
    sleep_adherence_score = Column(Numeric(5, 2), nullable=True)
    total_score = Column(Numeric(5, 2), nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default="CURRENT_TIMESTAMP")

    user = relationship("User", back_populates="habit_scores")


class GoalMetric(Base):
    __tablename__ = "goal_metrics"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default="gen_random_uuid()")
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=True)
    goal_type = Column(Enum(GoalType), nullable=True)
    metric_label = Column(String(100), nullable=True)
    metric_value = Column(Numeric(10, 2), nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default="CURRENT_TIMESTAMP")

    user = relationship("User", back_populates="goal_metrics")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default="gen_random_uuid()")
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    message = Column(Text, nullable=False)
    category = Column(String(60), nullable=True)
    is_read = Column(Boolean, nullable=False, server_default="false")
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default="CURRENT_TIMESTAMP")

    user = relationship("User", back_populates="recommendations")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default="gen_random_uuid()")
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(Enum(NotificationType), nullable=True)
    message = Column(Text, nullable=True)
    sent_at = Column(TIMESTAMP(timezone=True), nullable=True)
    read_at = Column(TIMESTAMP(timezone=True), nullable=True)

    user = relationship("User", back_populates="notifications")


class Report(Base):
    __tablename__ = "reports"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default="gen_random_uuid()")
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    report_type = Column(Enum(ReportType), nullable=True)
    format = Column(Enum(ReportFormat), nullable=True)
    file_url = Column(Text, nullable=True)
    generated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default="CURRENT_TIMESTAMP")

    user = relationship("User", back_populates="reports")
