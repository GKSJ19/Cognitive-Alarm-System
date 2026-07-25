from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database import Base


class Verification(Base):
    __tablename__ = "verification"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, nullable=False)

    challenge_id = Column(Integer, nullable=False)

    user_answer = Column(String, nullable=False)

    correct_answer = Column(String, nullable=False)

    is_correct = Column(Boolean, default=False)

    verified_at = Column(DateTime(timezone=True), server_default=func.now())