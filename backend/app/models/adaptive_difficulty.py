from sqlalchemy import Column, Integer, String, Float
from app.database import Base

class AdaptiveDifficulty(Base):
    __tablename__ = "adaptive_difficulty"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    success_rate = Column(Float)
    current_level = Column(String)
    next_level = Column(String)