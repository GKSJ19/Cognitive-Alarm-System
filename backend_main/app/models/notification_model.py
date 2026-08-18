import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.connection import Base

class BroadcastNotification(Base):
    __tablename__ = "broadcast_notifications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    priority: Mapped[str] = mapped_column(String(50), default="normal", nullable=False) # low, normal, high, urgent
    created_by_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    created_by_name: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    creator = relationship("User", foreign_keys=[created_by_id])

    def to_dict(self, is_read: bool = False):
        return {
            "id": self.id,
            "title": self.title,
            "message": self.message,
            "priority": self.priority,
            "created_by_id": self.created_by_id,
            "created_by_name": self.created_by_name,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "is_read": is_read
        }

class NotificationRead(Base):
    __tablename__ = "notification_reads"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    notification_id: Mapped[str] = mapped_column(String(36), ForeignKey("broadcast_notifications.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    read_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
