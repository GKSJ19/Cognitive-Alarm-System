from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class ChallengeEvaluation(Base):
    __tablename__ = "challenge_evaluations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    challenge_id = Column(Integer, nullable=False)
    score = Column(Integer, nullable=False)
    attempts = Column(Integer, nullable=False)
    time_taken = Column(Integer, nullable=False)   # seconds
    status = Column(String, nullable=False)        # Passed / Failed
    evaluated_at = Column(DateTime(timezone=True), server_default=func.now())