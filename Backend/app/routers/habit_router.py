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
    HabitCompleteRequest
)
from app.services.habit_service import HabitService

router = APIRouter(prefix="/habits", tags=["Habit Management"])

@router.get("", response_model=list[HabitResponse])
async def get_habits(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all habits for the authenticated user."""
    return await HabitService.get_habits_by_user(db, current_user.id)

@router.post("", response_model=HabitResponse, status_code=status.HTTP_201_CREATED)
async def create_habit(
    req: HabitCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new habit task."""
    return await HabitService.create_habit(db, current_user.id, req)

@router.put("/{habit_id}", response_model=HabitResponse)
async def update_habit(
    habit_id: str,
    req: HabitUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a specific habit's details."""
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
    """Delete a specific habit."""
    deleted = await HabitService.delete_habit(db, current_user.id, habit_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found")
    return None

@router.get("/progress", response_model=list[HabitProgressResponse])
async def get_progress(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get completion records for all user's habits."""
    return await HabitService.get_habit_progress(db, current_user.id)

@router.post("/complete", response_model=HabitProgressResponse)
async def complete_habit(
    req: HabitCompleteRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Mark a habit completed or missed for a specific date."""
    progress = await HabitService.complete_habit(db, current_user.id, req)
    if not progress:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found")
    return progress
