from datetime import datetime

from pydantic import BaseModel, Field


class ChallengeOut(BaseModel):
    id: str
    type: str
    goal_type: str | None
    difficulty: str | None
    question: str
    source: str
    embedding_ref: str | None
    created_at: datetime

    class Config:
        orm_mode = True


class ChallengeFilter(BaseModel):
    challenge_type: str | None = None
    difficulty: str | None = None


class ChallengeSubmission(BaseModel):
    challenge_id: str
    answer: str


class ChallengeResult(BaseModel):
    correct: bool
    expected_answer: str
    challenge_id: str
    message: str
