from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.connection import get_db
from app.auth.dependencies import RoleChecker
from app.models.user_model import User
from app.schemas.coach_schemas import (
    CoachDashboardResponse,
    CoachMessageResponse,
    CoachMessageCreate,
    CoachAssignRequest,
    CoachAssignmentResponse
)
from app.services.coach_service import CoachService

router = APIRouter(
    prefix="/coach",
    tags=["Coach Panel"],
    dependencies=[Depends(RoleChecker(["coach", "admin"]))]
)

@router.get("/dashboard", response_model=CoachDashboardResponse)
async def get_dashboard(
    current_user: User = Depends(RoleChecker(["coach", "admin"])),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve coach panel dashboard summary analytics."""
    return await CoachService.get_coach_dashboard_stats(db, current_user.id)

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
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all habits progress and alarm logs for a specific client user."""
    return await CoachService.get_user_progress(db, user_id)

@router.get("/habits/{user_id}")
async def get_user_habits(
    user_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve habit telemetry logs for user."""
    progress = await CoachService.get_user_progress(db, user_id)
    return progress["habits"]

@router.get("/alarms/{user_id}")
async def get_user_alarms(
    user_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve alarms schedule telemetry for user."""
    progress = await CoachService.get_user_progress(db, user_id)
    return progress["alarms"]

@router.get("/challenges/{user_id}")
async def get_user_challenges(
    user_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve challenge accuracy metrics for user."""
    progress = await CoachService.get_user_progress(db, user_id)
    return progress["alarm_history"]

@router.get("/reports")
async def get_reports():
    """Get system weekly/monthly summary reports."""
    return {"message": "Success", "reports": {"daily_active_users": 15, "average_sleep_duration": "7.5 hrs"}}

@router.get("/analytics")
async def get_analytics():
    """Get system activity charts and metrics."""
    return {"message": "Success", "analytics": {"weekly_completion_rate": 84.5}}

@router.post("/message", response_model=CoachMessageResponse)
async def send_message(
    req: CoachMessageCreate,
    current_user: User = Depends(RoleChecker(["coach", "admin"])),
    db: AsyncSession = Depends(get_db)
):
    """Deliver a motivational or reminder message to a client."""
    return await CoachService.send_coach_message(db, current_user.id, req)

@router.delete("/message/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_message(
    message_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Delete motivational or reminder message."""
    deleted = await CoachService.delete_coach_message(db, message_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
    return None

@router.post("/assign-user", response_model=CoachAssignmentResponse)
async def assign_user(
    req: CoachAssignRequest,
    db: AsyncSession = Depends(get_db)
):
    """Assign client user to coach."""
    return await CoachService.assign_user(db, req)

@router.delete("/remove-user/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_user(
    user_id: str,
    current_user: User = Depends(RoleChecker(["coach", "admin"])),
    db: AsyncSession = Depends(get_db)
):
    """Remove user assignment link."""
    removed = await CoachService.remove_user(db, current_user.id, user_id)
    if not removed:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
    return None
