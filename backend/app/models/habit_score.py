from sqlalchemy import Column, Integer, Float, String
from app.database import Base

class HabitScore(Base):
    __tablename__ = "habit_score"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    wakeup_score = Column(Float)
    challenge_score = Column(Float)
    snooze_score = Column(Float)
    sleep_score = Column(Float)
    overall_score = Column(Float)
    grade = Column(String)