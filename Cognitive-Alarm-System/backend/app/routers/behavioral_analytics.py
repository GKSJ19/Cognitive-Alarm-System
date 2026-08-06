"""
Behavioral Analytics Router — REST API Endpoints.

Exposes endpoints for ML-based behavioral modeling, archetype identification,
and habit score calculations.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.database import get_session
from app.services.behavioral_analytics_service import BehavioralAnalyticsService

router = APIRouter()


@router.get("/patterns", response_model=dict, summary="Get behavioral patterns & archetype classification")
async def get_behavioral_patterns(
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """
    Analyzes historical alarm responses, snooze counts, challenge latencies,
    and sleep adherence to return user archetype, habit scores, and detected anomalies.
    """
    service = BehavioralAnalyticsService(session)
    return await service.get_user_behavioral_profile(current_user.id)


@router.post("/analyze", response_model=dict, summary="Trigger ML analysis and save daily habit scores")
async def analyze_and_record_habits(
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """
    Runs full ML behavioral analytics and persists a new HabitScore entry in the database.
    """
    service = BehavioralAnalyticsService(session)
    return await service.analyze_and_record_habits(current_user.id)
