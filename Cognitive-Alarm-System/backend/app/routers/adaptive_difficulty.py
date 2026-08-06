"""
Adaptive Difficulty Router — REST API Endpoints.

Exposes endpoints for ML-based difficulty predictions and adaptive challenge selection.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.database import get_session
from app.schemas.challenge import ChallengeOut
from app.services.adaptive_difficulty_service import AdaptiveDifficultyService

router = APIRouter()


@router.get("/predict", response_model=dict, summary="Predict next challenge difficulty using ML")
async def predict_difficulty(
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """
    Evaluates historical cognitive solve times, accuracy rates, snooze history,
    and sleep metrics to predict optimal challenge difficulty.
    """
    service = AdaptiveDifficultyService(session)
    try:
        prediction = await service.predict_next_difficulty(current_user.id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    return prediction


@router.get("/next-challenge", response_model=ChallengeOut, summary="Get ML-selected adaptive challenge")
async def get_adaptive_challenge(
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """
    Fetches a challenge matching the user's ML-predicted optimal difficulty.
    """
    service = AdaptiveDifficultyService(session)
    challenge = await service.get_adaptive_challenge(current_user.id)
    if not challenge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No adaptive challenge found")
    return challenge
