import uuid
from enum import Enum as PyEnum
from sqlalchemy import Column, Text, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base

class ReportType(str, PyEnum):
    habit = "habit"
    wakeup = "wakeup"
    challenge = "challenge"
    productivity = "productivity"
    sleep = "sleep"

class ReportFormat(str, PyEnum):
    pdf = "pdf"
    excel = "excel"

class Report(Base):
    __tablename__ = "reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    report_type = Column(Enum(ReportType, native_enum=False), nullable=False)
    format = Column(Enum(ReportFormat, native_enum=False), nullable=False)
    file_url = Column(Text, nullable=True)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())