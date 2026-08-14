from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.connection import get_db
from app.auth.dependencies import RoleChecker, get_current_user
from app.models.user_model import User
from app.services.admin_service import AdminService
from app.services.coach_service import CoachService
from app.services.auth_service import AuthService
from app.schemas.admin_schemas import (
    CoachAssignRequest,
    CoachReassignRequest,
    AdminUserCreate,
    AdminUserUpdate,
    SystemSettings
)
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
    """Retrieve administrator system overview cards, charts, and recent activities."""
    return await AdminService.get_admin_dashboard_overview(db)

@router.get("/users-detailed")
async def get_users_detailed(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    coach_status: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all users with complete monitoring stats, habit scores, streaks, and coach info."""
    return await AdminService.get_detailed_users(
        db,
        search=search,
        filter_status=status,
        filter_coach_status=coach_status
    )

@router.get("/user-analytics/{user_id}")
async def get_user_analytics(user_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve full analytics page data for a specific user (profile, challenges, habit score, alarms, charts)."""
    try:
        return await AdminService.get_user_full_analytics(db, user_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.get("/coaches-detailed")
async def get_coaches_detailed(db: AsyncSession = Depends(get_db)):
    """List all registered coaches with assigned client counts and performance metrics."""
    return await AdminService.get_detailed_coaches(db)

@router.post("/assign-coach")
async def assign_coach(
    req: CoachAssignRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Assign or link a coach to a user."""
    try:
        assignment = await AdminService.assign_coach(db, req.coach_id, req.user_id, current_user.id)
        return assignment.to_dict()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/reassign-coach")
async def reassign_coach(
    req: CoachReassignRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Reassign a user to a different coach."""
    try:
        assignment = await AdminService.assign_coach(db, req.new_coach_id, req.user_id, current_user.id)
        return assignment.to_dict()
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.delete("/remove-assignment/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_coach_assignment(user_id: str, db: AsyncSession = Depends(get_db)):
    """Unassign a coach from a user."""
    removed = await AdminService.remove_coach_assignment(db, user_id)
    if not removed:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Coach assignment not found")
    return None

@router.get("/users")
async def get_users(db: AsyncSession = Depends(get_db)):
    """List all user accounts in system."""
    users = await AdminService.get_all_users(db)
    return [u.to_dict() for u in users]

@router.get("/users/{user_id}")
async def get_user(user_id: str, db: AsyncSession = Depends(get_db)):
    """Fetch profile info of specific user."""
    users = await AdminService.get_all_users(db)
    user = next((u for u in users if u.id == user_id), None)
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

@router.delete("/coaches/{coach_id}", status_code=204)
async def delete_coach(coach_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a coach account."""
    deleted = await AdminService.delete_user(db, coach_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Coach not found")
    return None
