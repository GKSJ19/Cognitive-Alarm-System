from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.database import get_session
from app.schemas.habit import SleepLogCreate, HabitScoreOut, GoalMetricCreate, RecommendationOut
from app.models.analytics import SleepLog, HabitScore, GoalMetric, Recommendation

router = APIRouter()


@router.get("/", response_model=list[HabitScoreOut])
async def list_habits(session: AsyncSession = Depends(get_session), current_user=Depends(get_current_user)):
    return []


@router.post("/sleep", response_model=dict)
async def create_sleep_log(payload: SleepLogCreate, session: AsyncSession = Depends(get_session), current_user=Depends(get_current_user)):
    return {"detail": "Sleep log recorded"}


@router.post("/goals", response_model=dict)
async def create_goal(payload: GoalMetricCreate, session: AsyncSession = Depends(get_session), current_user=Depends(get_current_user)):
    return {"detail": "Goal metric recorded"}


@router.get("/recommendations", response_model=list[RecommendationOut])
async def list_recommendations(session: AsyncSession = Depends(get_session), current_user=Depends(get_current_user)):
    return []
