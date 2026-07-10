import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.connection import Base

class CoachAssignment(Base):
    __tablename__ = "coach_assignments"

    assignment_id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    coach_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    assigned_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="active", nullable=False) # active, inactive
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    coach = relationship("User", foreign_keys=[coach_id])
    user = relationship("User", foreign_keys=[user_id])

    def to_dict(self):
        return {
            "assignment_id": self.assignment_id,
            "coach_id": self.coach_id,
            "user_id": self.user_id,
            "assigned_date": self.assigned_date,
            "status": self.status,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }

class CoachMessage(Base):
    __tablename__ = "coach_messages"

    message_id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    coach_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(String(2000), nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    coach = relationship("User", foreign_keys=[coach_id])
    user = relationship("User", foreign_keys=[user_id])

    def to_dict(self):
        return {
            "message_id": self.message_id,
            "coach_id": self.coach_id,
            "user_id": self.user_id,
            "title": self.title,
            "message": self.message,
            "is_read": self.is_read,
            "created_at": self.created_at
        }
