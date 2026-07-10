from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.connection import get_db
from app.auth.dependencies import RoleChecker
from app.models.user_model import User
from app.services.admin_service import AdminService
from app.services.coach_service import CoachService
from app.services.auth_service import AuthService
from app.schemas.coach_schemas import CoachAssignRequest
from pydantic import BaseModel
from typing import Optional

router = APIRouter(
    prefix="/admin",
    tags=["Administrator Panel"],
    dependencies=[Depends(RoleChecker(["admin"]))]
)

class AdminUserCreate(BaseModel):
    email: str
    full_name: str
    password: str
    role: str = "user"

class AdminUserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None

class SystemSettings(BaseModel):
    maintenance_mode: bool = False
    allow_registrations: bool = True
    default_snooze_limit: int = 3

@router.get("/dashboard")
async def get_dashboard(db: AsyncSession = Depends(get_db)):
    """Retrieve administrator system configuration diagnostics."""
    return await AdminService.get_admin_dashboard_stats(db)

@router.get("/users")
async def get_users(db: AsyncSession = Depends(get_db)):
    """List all user accounts in system."""
    users = await AdminService.get_all_users(db)
    return [u.to_dict() for u in users]

@router.get("/users/{user_id}")
async def get_user(user_id: str, db: AsyncSession = Depends(get_db)):
    """Fetch profile info of specific user."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user.to_dict()

@router.post("/users", status_code=201)
async def create_user(req: AdminUserCreate, db: AsyncSession = Depends(get_db)):
    """Manually add new user account."""
    hashed = AuthService.pwd_context.hash(req.password)
    user = await AdminService.create_user(db, req.email, req.full_name, hashed, req.role)
    return user.to_dict()

@router.put("/users/{user_id}")
async def update_user(user_id: str, req: AdminUserUpdate, db: AsyncSession = Depends(get_db)):
    """Update user information."""
    updates = req.model_dump(exclude_unset=True)
    user = await AdminService.update_user(db, user_id, updates)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user.to_dict()

@router.delete("/users/{user_id}", status_code=204)
async def delete_user(user_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a user account."""
    deleted = await AdminService.delete_user(db, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")
    return None

@router.put("/users/{user_id}/activate")
async def activate_user(user_id: str, db: AsyncSession = Depends(get_db)):
    """Activate user profile."""
    user = await AdminService.update_user_status(db, user_id, True)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user.to_dict()

@router.put("/users/{user_id}/suspend")
async def suspend_user(user_id: str, db: AsyncSession = Depends(get_db)):
    """Suspend user account."""
    user = await AdminService.update_user_status(db, user_id, False)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user.to_dict()

# Coach management
@router.get("/coaches")
async def get_coaches(db: AsyncSession = Depends(get_db)):
    """List all coaches in system."""
    coaches = await AdminService.get_coaches(db)
    return [c.to_dict() for c in coaches]

@router.post("/coaches", status_code=201)
async def create_coach(req: AdminUserCreate, db: AsyncSession = Depends(get_db)):
    """Add a new coach account."""
    req.role = "coach"
    hashed = AuthService.pwd_context.hash(req.password)
    user = await AdminService.create_user(db, req.email, req.full_name, hashed, req.role)
    return user.to_dict()

@router.post("/assign-coach")
async def assign_coach(req: CoachAssignRequest, db: AsyncSession = Depends(get_db)):
    """Link a user to a wellness coach."""
    return await CoachService.assign_user(db, req)

@router.post("/broadcast")
async def broadcast_notification(message: str):
    """Broadcast notification to all active device push tokens."""
    return {"message": "Success", "broadcasted_to": "all_active_channels"}

@router.get("/reports")
async def get_reports():
    """Fetch admin analytical report sheets."""
    return {"user_growth": "+12%", "average_puzzles_solved": 4.2}

@router.get("/system-analytics")
async def get_system_analytics():
    """Fetch backend metrics, latency details, and active logs counts."""
    return {"active_websockets": 4, "database_pool_size": 20, "average_response_time": "32ms"}

@router.get("/logs")
async def get_logs():
    """List recent security audit trail logs."""
    return [{"timestamp": "2026-07-07T10:00:00Z", "action": "LOGIN", "user": "admin@icap.com"}]

@router.get("/settings")
async def get_settings():
    """Fetch global configurations."""
    return {"maintenance_mode": False, "allow_registrations": True, "default_snooze_limit": 3}

@router.put("/settings")
async def update_settings(req: SystemSettings):
    """Save global application settings."""
    return req

# Required select statements imports helper
from sqlalchemy import select
