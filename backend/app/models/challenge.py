import uuid
from enum import Enum as PyEnum
from sqlalchemy import Column, String, Text, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base

class ChallengeType(str, PyEnum):
    math = "math"
    logic = "logic"
    memory = "memory"
    word_game = "word_game"
    pattern = "pattern"
    riddle = "riddle"
    quiz = "quiz"

class GoalType(str, PyEnum):
    study = "study"
    work = "work"
    fitness = "fitness"

class Difficulty(str, PyEnum):
    beginner = "beginner"
    easy = "easy"
    medium = "medium"
    hard = "hard"
    expert = "expert"

class ChallengeSource(str, PyEnum):
    question_bank = "question_bank"
    ai_generated = "ai_generated"

class Challenge(Base):
    __tablename__ = "challenges"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    type = Column(Enum(ChallengeType, native_enum=False), nullable=False)
    goal_type = Column(Enum(GoalType, native_enum=False), nullable=True)
    difficulty = Column(Enum(Difficulty, native_enum=False), default=Difficulty.medium)
    question = Column(Text, nullable=False)
    correct_answer = Column(Text, nullable=False)
    source = Column(Enum(ChallengeSource, native_enum=False), default=ChallengeSource.question_bank)
    embedding_ref = Column(String(120), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())