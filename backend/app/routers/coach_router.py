from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.connection import get_db
from app.auth.dependencies import RoleChecker, get_current_user
from app.models.user_model import User
from app.schemas.coach_schemas import (
    CoachMessageResponse,
    CoachMessageCreate,
    CoachAssignRequest,
    CoachAssignmentResponse
)
from app.services.coach_service import CoachService
from typing import Optional

router = APIRouter(
    prefix="/coach",
    tags=["Coach Panel"],
    dependencies=[Depends(RoleChecker(["coach", "admin"]))]
)

@router.get("/dashboard")
async def get_dashboard(
    current_user: User = Depends(RoleChecker(["coach", "admin"])),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve coach dashboard summary overview and recent notifications for assigned clients."""
    return await CoachService.get_coach_dashboard_overview(db, current_user.id)

@router.get("/my-users")
async def get_my_users(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    current_user: User = Depends(RoleChecker(["coach", "admin"])),
    db: AsyncSession = Depends(get_db)
):
    """List all users assigned to the logged-in coach with metrics, search, and status filtering."""
    return await CoachService.get_assigned_users_detailed(db, current_user.id, search=search, filter_status=status)

@router.get("/user-analytics/{user_id}")
async def get_assigned_user_analytics(
    user_id: str,
    current_user: User = Depends(RoleChecker(["coach", "admin"])),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve full analytics page for an assigned client user.
    Enforces strict Role-Based Access Control (RBAC): Returns 403 Forbidden if user is not assigned to coach!
    """
    # Admins bypass assignment check, coaches must be assigned
    if current_user.role != "admin":
        is_assigned = await CoachService.verify_coach_access(db, current_user.id, user_id)
        if not is_assigned:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access Denied: You do not have permission to view analytics for users assigned to another coach."
            )
    
    try:
        return await CoachService.get_assigned_user_analytics(db, current_user.id if current_user.role != "admin" else "admin", user_id)
    except PermissionError as pe:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))

@router.get("/notifications")
async def get_notifications(
    current_user: User = Depends(RoleChecker(["coach", "admin"])),
    db: AsyncSession = Depends(get_db)
):
    """Fetch smart alert notifications for assigned client milestones, score drops, inactivity, and streaks."""
    return await CoachService.get_coach_notifications(db, current_user.id)

@router.get("/users")
async def get_users(
    current_user: User = Depends(RoleChecker(["coach", "admin"])),
    db: AsyncSession = Depends(get_db)
):
    """List all users assigned to this coach."""
    users = await CoachService.get_assigned_users(db, current_user.id)
    return [u.to_dict() for u in users]

@router.get("/user-progress/{user_id}")
async def get_user_progress(
    user_id: str,
    current_user: User = Depends(RoleChecker(["coach", "admin"])),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve history progress and alarm logs for an assigned client user."""
    if current_user.role != "admin":
        is_assigned = await CoachService.verify_coach_access(db, current_user.id, user_id)
        if not is_assigned:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access Denied: Unassigned client")
    return await CoachService.get_user_progress(db, user_id)

@router.post("/message", response_model=CoachMessageResponse)
async def send_message(
    req: CoachMessageCreate,
    current_user: User = Depends(RoleChecker(["coach", "admin"])),
    db: AsyncSession = Depends(get_db)
):
    """Deliver a motivational or reminder message to an assigned client."""
    if current_user.role != "admin":
        is_assigned = await CoachService.verify_coach_access(db, current_user.id, req.user_id)
        if not is_assigned:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access Denied: Unassigned client")
    return await CoachService.send_coach_message(db, current_user.id, req)

@router.delete("/message/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_message(
    message_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Delete motivational message."""
    deleted = await CoachService.delete_coach_message(db, message_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
    return None
