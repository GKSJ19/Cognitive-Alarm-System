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