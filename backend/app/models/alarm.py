from sqlalchemy import String, Integer, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Alarm(Base):
    __tablename__ = "alarms"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    user_id: Mapped[int] = mapped_column(Integer)

    title: Mapped[str] = mapped_column(String(100))

    alarm_time: Mapped[str] = mapped_column(String(10))

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    challenge_type: Mapped[str] = mapped_column(String(20))

    difficulty: Mapped[str] = mapped_column(String(20), default="easy")