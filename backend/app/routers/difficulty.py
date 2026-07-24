from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.schema.difficulty import DifficultyResponse
from app.services.difficulty_service import calculate_difficulty

router = APIRouter()

@router.get("/current", response_model=DifficultyResponse)
def get_current_difficulty(
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    difficulty, accuracy, count = calculate_difficulty(current_user, db)
    return {
        "difficulty": difficulty,
        "recent_accuracy_percent": accuracy,
        "recent_attempts_considered": count,
    }