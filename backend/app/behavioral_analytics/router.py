from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.dependencies import get_db, get_current_user
from app.models import User, UserBehaviorAnalytic
from app.schemas import UserBehaviorAnalyticResponse, UserBehaviorSummaryResponse

router = APIRouter(prefix="/behavioral-analytics", tags=["Behavioral Analytics"])

@router.get("/history", response_model=List[UserBehaviorAnalyticResponse])
def get_behavioral_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve daily behavioral analytic logs for the current user."""
    logs = db.query(UserBehaviorAnalytic).filter(
        UserBehaviorAnalytic.user_id == current_user.id
    ).order_by(UserBehaviorAnalytic.date.desc()).all()
    return logs

@router.get("/summary", response_model=UserBehaviorSummaryResponse)
def get_behavioral_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve summary statistics of morning behaviors for the current user."""
    logs = db.query(UserBehaviorAnalytic).filter(
        UserBehaviorAnalytic.user_id == current_user.id
    ).all()

    total_days = len(logs)
    if total_days == 0:
        return UserBehaviorSummaryResponse(
            average_snooze_count=0.0,
            average_wake_up_delay_seconds=0.0,
            challenge_completion_rate=100.0,  # baseline
            average_sleep_duration_hours=8.0,
            total_tracked_days=0
        )

    total_snoozes = sum(log.snooze_count for log in logs)
    total_delay = sum(log.wake_up_delay for log in logs)
    solved_count = sum(1 for log in logs if log.challenge_solved)
    total_sleep = sum(log.sleep_duration for log in logs if log.sleep_duration is not None)

    return UserBehaviorSummaryResponse(
        average_snooze_count=round(total_snoozes / total_days, 2),
        average_wake_up_delay_seconds=round(total_delay / total_days, 2),
        challenge_completion_rate=round((solved_count / total_days) * 100, 2),
        average_sleep_duration_hours=round(total_sleep / total_days, 2) if total_days > 0 else 8.0,
        total_tracked_days=total_days
    )
