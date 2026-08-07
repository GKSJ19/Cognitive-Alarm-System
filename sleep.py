from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.sleep_log import SleepLog, SleepSource
from app.schema.sleep import SleepLogCreateRequest, SleepLogResponse

router = APIRouter()

@router.post("/log", response_model=SleepLogResponse)
def log_sleep(
    payload: SleepLogCreateRequest,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    duration = payload.duration_mins
    if duration is None and payload.sleep_start and payload.sleep_end:
        duration = int((payload.sleep_end - payload.sleep_start).total_seconds() / 60)

    entry = SleepLog(
        user_id=current_user,
        date=payload.date,
        sleep_start=payload.sleep_start,
        sleep_end=payload.sleep_end,
        duration_mins=duration,
        source=SleepSource(payload.source),
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

@router.get("/history", response_model=List[SleepLogResponse])
def get_sleep_history(
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(SleepLog)
        .filter(SleepLog.user_id == current_user)
        .order_by(SleepLog.date.desc())
        .all()
    )