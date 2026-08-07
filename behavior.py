from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.services.behavior_service import get_behavior_patterns

router = APIRouter()

@router.get("/patterns")
def behavior_patterns(
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_behavior_patterns(current_user, db)