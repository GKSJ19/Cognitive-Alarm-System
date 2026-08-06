from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ChallengeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    type: str
    goal_type: Optional[str]
    difficulty: Optional[str]
    question: str
    source: str
    embedding_ref: Optional[str]
    created_at: datetime


class ChallengeFilter(BaseModel):
    challenge_type: Optional[str] = None
    difficulty: Optional[str] = None


class ChallengeSubmission(BaseModel):
    challenge_id: str
    answer: str


class ChallengeResult(BaseModel):
    correct: bool
    expected_answer: str
    challenge_id: str
    message: str
