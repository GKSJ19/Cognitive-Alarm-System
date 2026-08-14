"""
FastAPI Application Entry Point (ai_ml layer)

Exposes the AI/ML models as HTTP endpoints so the backend/frontend
(Jothiesh, Abdul) can call them instead of only running from a terminal.

Run with:
    cd ai_ml
    uvicorn main:app --reload

Then visit http://127.0.0.1:8000/docs for interactive API docs.
"""

import os
import sys

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# --- Make sibling folders importable (pipelines/, src/) ---------------------
AI_ML_DIR = os.path.dirname(os.path.abspath(__file__))
PIPELINES_DIR = os.path.join(AI_ML_DIR, "pipelines")
SRC_DIR = os.path.join(AI_ML_DIR, "src")

for path in (AI_ML_DIR, PIPELINES_DIR, SRC_DIR):
    if path not in sys.path:
        sys.path.append(path)

from habit_scoring import calculate_habit_score_for_user          # ai_ml/
from recommendation_engine import get_recommendation_for_user      # ai_ml/pipelines/
from classifier import predict_risk_for_user                       # ai_ml/src/
from reinforcement import get_difficulty_for_user                  # ai_ml/src/
from challenge_generator import (                                  # ai_ml/src/
    get_challenge_for_user,
    generate_challenge,
    validate_answer,
    CHALLENGE_TYPES,
)

app = FastAPI(
    title="Intelligent Cognitive Alarm Platform - AI/ML Service",
    description="Behavior Analysis, Habit Scoring, Recommendation, and Prediction models.",
    version="1.0.0",
)


# ---------------------------------------------------------------------------
# Response schemas (pydantic) -- gives auto-validated, documented responses
# ---------------------------------------------------------------------------

class HabitScoreResponse(BaseModel):
    user_id: int
    habit_score: float
    components: dict


class RecommendationResponse(BaseModel):
    user_id: int
    habit_score: float
    weakest_component: str | None
    weakest_score: float
    recommended_category: str
    recommendation: dict | None


class RiskPredictionResponse(BaseModel):
    user_id: int
    risk_label: str
    risk_probability: float
    features_used: dict


class DifficultyResponse(BaseModel):
    user_id: int
    starting_difficulty: str
    current_rating: float
    next_difficulty: str
    attempts_processed: int


class ChallengeResponse(BaseModel):
    challenge_id: str
    challenge_type: str
    subtype: str
    difficulty_level: str
    question: str
    user_id: int | None = None
    source_rating: float | None = None


class ValidateAnswerRequest(BaseModel):
    challenge_id: str
    user_answer: str


class ValidateAnswerResponse(BaseModel):
    found: bool
    is_correct: bool
    correct_answer: str | None = None
    challenge_type: str | None = None
    difficulty_level: str | None = None


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/")
def root():
    return {"status": "ok", "service": "ai_ml", "models": [
        "habit_scoring", "recommendation_engine", "classifier (prediction)",
        "reinforcement (difficulty) - pending wiring",
    ]}


@app.get("/users/{user_id}/habit-score", response_model=HabitScoreResponse)
def get_habit_score(user_id: int):
    """
    Habit Scoring Model: raw logs -> features -> weighted habit score (0-100).
    """
    try:
        result = calculate_habit_score_for_user(user_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Could not compute habit score: {e}")


@app.get("/users/{user_id}/recommendation", response_model=RecommendationResponse)
def get_recommendation(user_id: int):
    """
    Recommendation Model: finds the user's weakest habit-score component
    and returns the matching content-library recommendation.
    """
    try:
        result = get_recommendation_for_user(user_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Could not generate recommendation: {e}")


@app.get("/users/{user_id}/risk-prediction", response_model=RiskPredictionResponse)
def get_risk_prediction(user_id: int):
    """
    Prediction Model (XGBoost): predicts oversleep/snooze risk from
    the user's recent behavior features.
    """
    try:
        result = predict_risk_for_user(user_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Could not compute risk prediction: {e}")


@app.get("/users/{user_id}/difficulty", response_model=DifficultyResponse)
def get_difficulty(user_id: int):
    """
    Adaptive Difficulty Model (Elo-based): replays the user's real
    challenge attempts through the Elo engine and returns their
    current skill rating + recommended next difficulty level.
    """
    try:
        result = get_difficulty_for_user(user_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Could not compute difficulty: {e}")


@app.get("/users/{user_id}/challenge", response_model=ChallengeResponse)
def get_challenge(user_id: int):
    """
    Cognitive Challenge Engine: generates a real challenge for this user,
    driven by their actual Adaptive Difficulty Model rating and their
    stated challenge_type_preference (from user_preferences). The
    correct answer is NOT included in this response -- call
    /users/{user_id}/challenge/validate to check an answer.
    """
    try:
        result = get_challenge_for_user(user_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Could not generate challenge: {e}")


@app.get("/challenge", response_model=ChallengeResponse)
def get_generic_challenge(
    challenge_type: str | None = None,
    difficulty: str = "Easy",
):
    """
    Cognitive Challenge Engine (generic, no user context): generates a
    challenge of a specific type/difficulty directly -- useful for
    frontend testing without needing a real user_id, or for a practice
    mode that isn't tied to the adaptive difficulty pipeline.
    """
    if challenge_type and challenge_type not in CHALLENGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid challenge_type. Must be one of: {CHALLENGE_TYPES}",
        )
    try:
        result = generate_challenge(challenge_type=challenge_type, difficulty=difficulty)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not generate challenge: {e}")


@app.post("/challenge/validate", response_model=ValidateAnswerResponse)
def post_validate_answer(payload: ValidateAnswerRequest):
    """
    Cognitive Challenge Engine: checks a submitted answer against the
    stored challenge (looked up by challenge_id) and reveals the
    correct answer only after checking. Each challenge_id can only be
    validated once (one attempt per generated challenge).
    """
    result = validate_answer(payload.challenge_id, payload.user_answer)
    if not result["found"]:
        raise HTTPException(
            status_code=404,
            detail="Challenge not found -- it may have already been answered, "
                   "expired, or the challenge_id is invalid.",
        )
    return result