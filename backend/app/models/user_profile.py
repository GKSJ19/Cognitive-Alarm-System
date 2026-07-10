from sqlalchemy import Column, Integer, String, Time, TIMESTAMP, text
from app.database import Base


class UserProfile(Base):
    __tablename__ = "user_profile"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)

    full_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)

    preferred_wakeup_time = Column(Time, nullable=False)
    sleep_duration = Column(Integer, nullable=False)
    timezone = Column(String(100), nullable=False)

    productivity_goal = Column(String(255))
    difficulty_preference = Column(String(100))
    habit_preference = Column(String(255))

    created_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP")
    )