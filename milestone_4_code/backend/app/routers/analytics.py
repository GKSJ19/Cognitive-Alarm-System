"""
Analytics Router — Milestone 3 & 4
==================================

Provides JWT-protected API endpoints for:
  • Behavioral Analytics (compute + retrieve)
  • Habit Score (compute + history)
  • Recommendations (generate + list + dismiss)
  • Adaptive Difficulty (compute + history + current)
  • Dashboard (daily / weekly / monthly)
"""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.analytics import (
    BehaviorAnalyticsResponse,
    DifficultyHistoryResponse,
    HabitScoreHistoryItem,
    RecommendationDismissRequest,
    RecommendationResponse,
    UserStatisticsResponse,
)
from app.schemas.responses import ApiResponse
from app.services import analytics_service, difficulty_service

router = APIRouter()


# ═══════════════════════════════════════════════════════════════════════════
# BEHAVIORAL ANALYTICS
# ═══════════════════════════════════════════════════════════════════════════

@router.get(
    "/behavioral",
    summary="Get behavioral analytics",
    response_model=ApiResponse,
)
async def get_behavioral_analytics(
    days: int = Query(default=30, ge=1, le=365, description="Number of days to retrieve"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    records = await analytics_service.get_behavioral_analytics(
        db, current_user.id, days=days
    )
    data = [
        BehaviorAnalyticsResponse.model_validate(r).model_dump() for r in records
    ]
    return ApiResponse(success=True, data=data)


@router.post(
    "/behavioral/compute",
    summary="Compute fresh behavioral analytics",
    response_model=ApiResponse,
)
async def compute_behavioral_analytics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    result = await analytics_service.compute_behavioral_analytics(
        db, current_user.id
    )
    return ApiResponse(success=True, data=result)


# ═══════════════════════════════════════════════════════════════════════════
# HABIT SCORE
# ═══════════════════════════════════════════════════════════════════════════

@router.get(
    "/habit-score",
    summary="Get current habit score",
    response_model=ApiResponse,
)
async def get_habit_score(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    result = await analytics_service.compute_habit_score(db, current_user.id)
    return ApiResponse(success=True, data=result)


@router.get(
    "/habit-score/history",
    summary="Get habit score history",
    response_model=ApiResponse,
)
async def get_habit_score_history(
    days: int = Query(default=30, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    records = await analytics_service.get_habit_score_history(
        db, current_user.id, days=days
    )
    data = [
        HabitScoreHistoryItem(
            score_date=r.score_date,
            total_score=r.total_score,
        ).model_dump()
        for r in records
    ]
    return ApiResponse(success=True, data=data)


# ═══════════════════════════════════════════════════════════════════════════
# RECOMMENDATIONS
# ═══════════════════════════════════════════════════════════════════════════

@router.get(
    "/recommendations",
    summary="Get active recommendations",
    response_model=ApiResponse,
)
async def get_recommendations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    records = await analytics_service.get_active_recommendations(
        db, current_user.id
    )
    data = [
        RecommendationResponse.model_validate(r).model_dump() for r in records
    ]
    return ApiResponse(success=True, data=data)


@router.post(
    "/recommendations/generate",
    summary="Generate fresh recommendations",
    response_model=ApiResponse,
)
async def generate_recommendations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    result = await analytics_service.generate_recommendations(
        db, current_user.id
    )
    return ApiResponse(success=True, data=result)


@router.post(
    "/recommendations/dismiss",
    summary="Dismiss a recommendation",
    response_model=ApiResponse,
)
async def dismiss_recommendation(
    req: RecommendationDismissRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    success = await analytics_service.dismiss_recommendation(
        db, current_user.id, req.recommendation_id
    )
    if not success:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    return ApiResponse(success=True, data={"dismissed": True})


# ═══════════════════════════════════════════════════════════════════════════
# ADAPTIVE DIFFICULTY
# ═══════════════════════════════════════════════════════════════════════════

@router.get(
    "/difficulty",
    summary="Get current difficulty level",
    response_model=ApiResponse,
)
async def get_current_difficulty(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    result = await difficulty_service.get_current_difficulty(db, current_user.id)
    return ApiResponse(success=True, data=result)


@router.get(
    "/difficulty/history",
    summary="Get difficulty change history",
    response_model=ApiResponse,
)
async def get_difficulty_history(
    limit: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    records = await difficulty_service.get_difficulty_history(
        db, current_user.id, limit=limit
    )
    data = [
        DifficultyHistoryResponse.model_validate(r).model_dump() for r in records
    ]
    return ApiResponse(success=True, data=data)


@router.post(
    "/difficulty/compute",
    summary="Recompute adaptive difficulty",
    response_model=ApiResponse,
)
async def compute_difficulty(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    result = await difficulty_service.compute_difficulty(db, current_user.id)
    return ApiResponse(success=True, data=result)


# ═══════════════════════════════════════════════════════════════════════════
# DASHBOARD
# ═══════════════════════════════════════════════════════════════════════════

@router.get(
    "/dashboard/daily",
    summary="Daily dashboard",
    response_model=ApiResponse,
)
async def daily_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    data = await analytics_service.get_dashboard_data(db, current_user.id, "daily")
    return ApiResponse(success=True, data=data)


@router.get(
    "/dashboard/weekly",
    summary="Weekly dashboard",
    response_model=ApiResponse,
)
async def weekly_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    data = await analytics_service.get_dashboard_data(db, current_user.id, "weekly")
    return ApiResponse(success=True, data=data)


@router.get(
    "/dashboard/monthly",
    summary="Monthly dashboard",
    response_model=ApiResponse,
)
async def monthly_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    data = await analytics_service.get_dashboard_data(db, current_user.id, "monthly")
    return ApiResponse(success=True, data=data)


# ═══════════════════════════════════════════════════════════════════════════
# USER STATISTICS
# ═══════════════════════════════════════════════════════════════════════════

@router.get(
    "/statistics",
    summary="Get 30-day user statistics",
    response_model=ApiResponse,
)
async def get_user_statistics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    stats = await analytics_service.get_user_statistics(db, current_user.id)
    if not stats:
        await analytics_service.compute_user_statistics(db, current_user.id)
        stats = await analytics_service.get_user_statistics(db, current_user.id)

    if stats:
        data = UserStatisticsResponse.model_validate(stats).model_dump()
    else:
        data = {}
    return ApiResponse(success=True, data=data)
