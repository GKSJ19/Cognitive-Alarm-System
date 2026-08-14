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
    assigned_by_admin: Mapped[str | None] = mapped_column(String(36), nullable=True)
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
            "assigned_by_admin": self.assigned_by_admin,
            "assigned_date": self.assigned_date.isoformat() if self.assigned_date else None,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
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
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class CoachNotification(Base):
    __tablename__ = "coach_notifications"

    notification_id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    coach_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    type: Mapped[str] = mapped_column(String(100), nullable=False) # HIGH_SCORE, MISSED_ALARMS, SCORE_DROP, INACTIVE, STREAK
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(String(1000), nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "notification_id": self.notification_id,
            "coach_id": self.coach_id,
            "user_id": self.user_id,
            "type": self.type,
            "title": self.title,
            "message": self.message,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
