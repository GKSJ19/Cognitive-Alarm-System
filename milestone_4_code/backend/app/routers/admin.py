from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.postgres import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.api import ApiResponse

router = APIRouter()

@router.get("/users", response_model=ApiResponse)
async def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    users = db.query(User).all()
    user_data = [{"id": str(u.id), "email": u.email, "full_name": u.full_name, "is_active": u.is_active} for u in users]
    return {"status": "success", "data": user_data}

@router.get("/stats", response_model=ApiResponse)
async def get_platform_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_users = db.query(User).count()
    return {
        "status": "success",
        "data": {
            "total_users": total_users,
            "active_challenges": total_users * 3, # Mocked metric
            "system_health": "Optimal"
        }
    }
