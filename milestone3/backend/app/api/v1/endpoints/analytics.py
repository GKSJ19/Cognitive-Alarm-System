from fastapi import APIRouter, Depends
from typing import Any, Dict
from app.core.database import get_db
from app.models.user import UserModel
from app.api.deps import get_current_active_user

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard_stats(
    current_user: UserModel = Depends(get_current_active_user),
    db = Depends(get_db)
) -> Any:
    """
    Get statistics for the user dashboard.
    """
    user_id_str = str(current_user.id)
    
    # Calculate some mock stats initially
    total_alarms = await db["alarms"].count_documents({"user_id": user_id_str})
    
    # Calculate habit score (mocked for now)
    habit_score = 85
    
    # Calculate wake up success rate
    total_logs = await db["alarm_logs"].count_documents({"user_id": user_id_str})
    passed_logs = await db["alarm_logs"].count_documents({"user_id": user_id_str, "verification_passed": True})
    
    success_rate = (passed_logs / total_logs * 100) if total_logs > 0 else 100
    
    return {
        "habit_score": habit_score,
        "total_alarms": total_alarms,
        "wake_up_success_rate": success_rate,
        "productivity_score": 90, # mock
        "challenge_accuracy": 92 # mock
    }
