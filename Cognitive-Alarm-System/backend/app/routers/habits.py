from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.database import get_session
from app.models.analytics import GoalMetric, HabitScore, SleepLog
from app.schemas.habit import GoalMetricCreate, HabitScoreOut, RecommendationOut, SleepLogCreate
from app.services.recommendation_service import RecommendationService

router = APIRouter()


@router.get("/", response_model=list[HabitScoreOut])
async def list_habits(session: AsyncSession = Depends(get_session), current_user=Depends(get_current_user)):
    stmt = select(HabitScore).where(HabitScore.user_id == current_user.id).order_by(HabitScore.date.desc())
    res = await session.execute(stmt)
    scores = res.scalars().all()
    return [
        HabitScoreOut(
            id=str(s.id),
            user_id=str(s.user_id),
            date=s.date,
            wake_consistency_score=int(s.wake_consistency_score) if s.wake_consistency_score is not None else None,
            challenge_success_score=int(s.challenge_success_score) if s.challenge_success_score is not None else None,
            snooze_reduction_score=int(s.snooze_reduction_score) if s.snooze_reduction_score is not None else None,
            sleep_adherence_score=int(s.sleep_adherence_score) if s.sleep_adherence_score is not None else None,
            total_score=int(s.total_score) if s.total_score is not None else None,
            created_at=s.created_at,
        )
        for s in scores
    ]


@router.post("/sleep", response_model=dict)
async def create_sleep_log(payload: SleepLogCreate, session: AsyncSession = Depends(get_session), current_user=Depends(get_current_user)):
    log = SleepLog(
        user_id=current_user.id,
        date=payload.date,
        sleep_start=payload.sleep_start,
        sleep_end=payload.sleep_end,
        duration_mins=payload.duration_mins,
        source=payload.source or "manual",
    )
    session.add(log)
    await session.commit()
    return {"detail": "Sleep log recorded successfully", "id": str(log.id)}


@router.post("/goals", response_model=dict)
async def create_goal(payload: GoalMetricCreate, session: AsyncSession = Depends(get_session), current_user=Depends(get_current_user)):
    metric = GoalMetric(
        user_id=current_user.id,
        date=payload.date,
        goal_type=payload.goal_type,
        metric_label=payload.metric_label,
        metric_value=payload.metric_value,
    )
    session.add(metric)
    await session.commit()
    return {"detail": "Goal metric recorded successfully", "id": str(metric.id)}


@router.get("/recommendations", response_model=list[RecommendationOut])
async def list_recommendations(session: AsyncSession = Depends(get_session), current_user=Depends(get_current_user)):
    service = RecommendationService(session)
    recs = await service.list_recommendations(current_user.id)
    if not recs:
        recs = await service.generate_user_recommendations(current_user.id)

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
