import uuid
from datetime import datetime
from sqlalchemy import String, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.connection import Base

class UserProfile(Base):
    __tablename__ = "user_profiles"

    profile_id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    profile_photo: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    gender: Mapped[str | None] = mapped_column(String(50), nullable=True)
    date_of_birth: Mapped[str | None] = mapped_column(String(50), nullable=True)
    occupation: Mapped[str | None] = mapped_column(String(100), nullable=True)
    timezone: Mapped[str] = mapped_column(String(100), default="UTC", nullable=False)
    preferred_wakeup_time: Mapped[str | None] = mapped_column(String(50), nullable=True)
    preferred_sleep_time: Mapped[str | None] = mapped_column(String(50), nullable=True)
    bio: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="profile")

    def to_dict(self):
        return {
            "profile_id": self.profile_id,
            "user_id": self.user_id,
            "profile_photo": self.profile_photo,
            "phone_number": self.phone_number,
            "gender": self.gender,
            "date_of_birth": self.date_of_birth,
            "occupation": self.occupation,
            "timezone": self.timezone,
            "preferred_wakeup_time": self.preferred_wakeup_time,
            "preferred_sleep_time": self.preferred_sleep_time,
            "bio": self.bio,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }
