from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.dependencies import get_db, get_current_user
from app.models import User, HabitScore
from app.schemas import HabitScoreResponse
from app.habit_scoring.service import calculate_habit_scores

router = APIRouter(prefix="/habit-scoring", tags=["Habit Scoring"])

@router.get("/history", response_model=List[HabitScoreResponse])
def get_habit_score_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve history of habit scores for the current user."""
    history = db.query(HabitScore).filter(
        HabitScore.user_id == current_user.id
    ).order_by(HabitScore.date.desc()).all()
    return history

@router.get("/current", response_model=HabitScoreResponse)
def get_current_habit_score(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Force calculates and returns the current day's habit score for the user."""
    scores = calculate_habit_scores(current_user.id, db)
    return scores
