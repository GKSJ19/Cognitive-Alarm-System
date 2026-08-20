from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.postgres import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.api import ApiResponse

router = APIRouter()

@router.get("/users/{user_id}/insights", response_model=ApiResponse)
async def get_user_insights(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Mock wellness coach insights
    return {
        "status": "success",
        "data": {
            "user_id": user_id,
            "habit_adherence": "Excellent",
            "sleep_trends": "Consistent",
            "recommendation": "Maintain current routine, slightly increase challenge difficulty."
        }
    }
