from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.dependencies import get_db, get_current_user
from app.models import User, DifficultyHistory
from app.schemas import DifficultyHistoryResponse

router = APIRouter(prefix="/adaptive-difficulty", tags=["Adaptive Difficulty"])

@router.get("/history", response_model=List[DifficultyHistoryResponse])
def get_difficulty_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve history of challenge difficulty adjustments for the current user."""
    history = db.query(DifficultyHistory).filter(
        DifficultyHistory.user_id == current_user.id
    ).order_by(DifficultyHistory.changed_at.desc()).all()
    return history
