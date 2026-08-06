"""
Recommendation Router — REST API Endpoints.

Exposes endpoints for personalized AI/ML recommendations generation, list retrieval,
and status management.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.database import get_session
from app.schemas.habit import RecommendationOut
from app.services.recommendation_service import RecommendationService

router = APIRouter()


@router.get("/", response_model=list[RecommendationOut], summary="List stored recommendations")
async def list_recommendations(
    unread_only: bool = Query(False, description="Filter only unread recommendations"),
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """
    Returns personalized recommendations stored for the user.
    """
    service = RecommendationService(session)
    recs = await service.list_recommendations(current_user.id, unread_only=unread_only)
    return [
        RecommendationOut(
            id=str(r.id),
            message=r.message,
            category=r.category,
            is_read=r.is_read,
            created_at=r.created_at,
        )
        for r in recs
    ]


@router.post("/generate", response_model=list[RecommendationOut], status_code=status.HTTP_201_CREATED, summary="Generate ML personalized recommendations")
async def generate_recommendations(
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """
    Triggers RecommendationEngine ML model to synthesize user behavior, difficulty predictions,
    and profile settings to create new personalized recommendations.
    """
    service = RecommendationService(session)
    try:
        recs = await service.generate_user_recommendations(current_user.id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))

    return [
        RecommendationOut(
            id=str(r.id),
            message=r.message,
            category=r.category,
            is_read=r.is_read,
            created_at=r.created_at,
        )
        for r in recs
    ]


@router.patch("/{recommendation_id}/read", response_model=RecommendationOut, summary="Mark recommendation as read")
async def mark_as_read(
    recommendation_id: UUID,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """
    Marks a recommendation as read.
    """
    service = RecommendationService(session)
    try:
        rec = await service.mark_as_read(current_user.id, recommendation_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))

    return RecommendationOut(
        id=str(rec.id),
        message=rec.message,
        category=rec.category,
        is_read=rec.is_read,
        created_at=rec.created_at,
    )
