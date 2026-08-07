from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date as date_type

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.habit_score import HabitScore
from app.services.habit_score_service import calculate_habit_score

router = APIRouter()

@router.get("/score")
def get_habit_score(
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    breakdown = calculate_habit_score(current_user, db)
    today = date_type.today()

    if breakdown["insufficient_data"]:
        return {"date": today, **breakdown}

    existing = db.query(HabitScore).filter(
        HabitScore.user_id == current_user,
        HabitScore.date == today,
    ).first()

    scorable = {
        "wake_consistency_score": breakdown["wake_consistency_score"],
        "challenge_success_score": breakdown["challenge_success_score"],
        "snooze_reduction_score": breakdown["snooze_reduction_score"],
        "sleep_adherence_score": breakdown["sleep_adherence_score"],
        "total_score": breakdown["total_score"],
    }
    # Renormalised scoring may leave an unmeasured component as None —
    # store 0 in the DB row for those (the API response above still
    # shows the true None), so the Numeric column never gets a None.
    scorable_for_db = {k: (v if v is not None else 0) for k, v in scorable.items()}

    if existing:
        for field, value in scorable_for_db.items():
            setattr(existing, field, value)
        db.commit()
        db.refresh(existing)
        record = existing
    else:
        record = HabitScore(user_id=current_user, date=today, **scorable_for_db)
        db.add(record)
        db.commit()
        db.refresh(record)

    return {"date": record.date, **breakdown}