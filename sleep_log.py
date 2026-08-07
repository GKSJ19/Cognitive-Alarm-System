import uuid
from enum import Enum as PyEnum
from sqlalchemy import Column, Date, DateTime, Integer, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base

class SleepSource(str, PyEnum):
    manual = "manual"
    apple_healthkit = "apple_healthkit"
    google_fit = "google_fit"

class SleepLog(Base):
    __tablename__ = "sleep_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    sleep_start = Column(DateTime(timezone=True), nullable=True)
    sleep_end = Column(DateTime(timezone=True), nullable=True)
    duration_mins = Column(Integer, nullable=True)
    source = Column(Enum(SleepSource, native_enum=False), default=SleepSource.manual)