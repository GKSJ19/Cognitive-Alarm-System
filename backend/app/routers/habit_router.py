from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.connection import get_db
from app.auth.dependencies import get_current_user
from app.models.user_model import User
from app.schemas.habit_schemas import (
    HabitResponse,
    HabitCreate,
    HabitUpdate,
    HabitProgressResponse,
    HabitCompleteRequest,
    ChallengeResultCreate,
    ChallengeResultResponse,
    HabitScoreDashboardData
)
from app.services.habit_service import HabitService

router = APIRouter(prefix="/habits", tags=["Habit Score"])

# --- Automated Habit Score System Endpoints ---

@router.post("/score", response_model=ChallengeResultResponse, status_code=status.HTTP_201_CREATED)
async def record_challenge_score(
    req: ChallengeResultCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Save cognitive challenge result and calculate Habit Score automatically.
    Calculates score based on difficulty, time taken (seconds), correctness, and first attempt bonus.
    """
    return await HabitService.record_challenge_result(db, current_user.id, req)

@router.get("/score/latest")
async def get_latest_habit_score(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve the latest calculated Habit Score for authenticated user."""
    score = await HabitService.get_latest_habit_score(db, current_user.id)
    return {"user_id": current_user.id, "latest_habit_score": score}

@router.get("/history", response_model=list[ChallengeResultResponse])
async def get_challenge_history(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve cognitive challenge result history."""
    return await HabitService.get_challenge_history(db, current_user.id, limit=limit)

@router.get("/analytics", response_model=HabitScoreDashboardData)
async def get_habit_dashboard_analytics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve comprehensive Habit Score dashboard data and analytics."""
    return await HabitService.get_habit_score_analytics(db, current_user.id)

# --- Legacy Habit Management Endpoints (Preserved for API stability) ---

@router.get("", response_model=list[HabitResponse])
async def get_habits(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve habits (legacy)."""
    return await HabitService.get_habits_by_user(db, current_user.id)

@router.post("", response_model=HabitResponse, status_code=status.HTTP_201_CREATED)
async def create_habit(
    req: HabitCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new habit task (legacy)."""
    return await HabitService.create_habit(db, current_user.id, req)

@router.put("/{habit_id}", response_model=HabitResponse)
async def update_habit(
    habit_id: str,
    req: HabitUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update habit details (legacy)."""
    habit = await HabitService.update_habit(db, current_user.id, habit_id, req)
    if not habit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found")
    return habit

@router.delete("/{habit_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_habit(
    habit_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a habit (legacy)."""
    deleted = await HabitService.delete_habit(db, current_user.id, habit_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found")
    return None

@router.get("/progress", response_model=list[HabitProgressResponse])
async def get_progress(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get completion records (legacy)."""
    return await HabitService.get_habit_progress(db, current_user.id)

@router.post("/complete", response_model=HabitProgressResponse)
async def complete_habit(
    req: HabitCompleteRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Mark habit status (legacy)."""
    progress = await HabitService.complete_habit(db, current_user.id, req)
    if not progress:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found")
    return progress
