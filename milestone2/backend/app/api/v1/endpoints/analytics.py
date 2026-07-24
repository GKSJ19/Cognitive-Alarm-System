from fastapi import APIRouter, Depends
from typing import Any, List, Dict
from bson import ObjectId

from app.core.database import get_db
from app.models.analytics import ChallengeAnalyticsModel
from app.models.user import UserModel
from app.api.deps import get_current_active_user

router = APIRouter()

@router.get("/challenges", response_model=Dict[str, Any])
async def get_challenge_analytics(
    current_user: UserModel = Depends(get_current_active_user),
    db = Depends(get_db)
) -> Any:
    """Get aggregated analytics for challenges."""
    cursor = db["challenge_attempts"].find({"user_id": str(current_user.id)})
    attempts = await cursor.to_list(length=1000)
    
    if not attempts:
        return {
            "total_attempts": 0,
            "success_rate": 0,
            "average_time_seconds": 0,
            "most_played": "None"
        }
        
    total = len(attempts)
    successful = sum(1 for a in attempts if a.get("is_correct", False))
    total_time = sum(a.get("time_taken_seconds", 0) for a in attempts)
    
    return {
        "total_attempts": total,
        "success_rate": round((successful / total) * 100, 2) if total > 0 else 0,
        "average_time_seconds": round(total_time / total, 2) if total > 0 else 0,
        "most_played": "Math" # simplified
    }

@router.get("/user", response_model=Dict[str, Any])
async def get_user_analytics(
    current_user: UserModel = Depends(get_current_active_user),
    db = Depends(get_db)
) -> Any:
    """Get overall user performance analytics."""
    cursor = db["wakeup_verifications"].find({"user_id": str(current_user.id)})
    verifications = await cursor.to_list(length=1000)
    
    total = len(verifications)
    passed = sum(1 for v in verifications if v.get("status") == "passed")
    
    return {
        "total_verifications": total,
        "passed_verifications": passed,
        "pass_rate": round((passed / total) * 100, 2) if total > 0 else 0
    }

@router.get("/history", response_model=List[ChallengeAnalyticsModel])
async def get_analytics_history(
    current_user: UserModel = Depends(get_current_active_user),
    db = Depends(get_db)
) -> Any:
    """Get raw analytics history."""
    return []
