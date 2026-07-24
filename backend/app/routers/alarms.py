from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.alarm import Alarm
from app.schema.alarm import AlarmCreateRequest, AlarmUpdateRequest, AlarmResponse

router = APIRouter()

@router.post("/", response_model=AlarmResponse)
def create_alarm(
    payload: AlarmCreateRequest,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    alarm = Alarm(
        user_id=current_user,
        time=payload.time,
        alarm_type=payload.alarm_type,
        days_of_week=payload.days_of_week,
        label=payload.label,
    )
    db.add(alarm)
    db.commit()
    db.refresh(alarm)
    return alarm

@router.get("/", response_model=List[AlarmResponse])
def list_alarms(
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Alarm).filter(Alarm.user_id == current_user, Alarm.is_active == True).all()

@router.put("/{alarm_id}", response_model=AlarmResponse)
def update_alarm(
    alarm_id: UUID,
    payload: AlarmUpdateRequest,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    alarm = db.query(Alarm).filter(Alarm.id == alarm_id, Alarm.user_id == current_user).first()
    if not alarm:
        raise HTTPException(status_code=404, detail="Alarm not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(alarm, field, value)

    db.commit()
    db.refresh(alarm)
    return alarm

@router.delete("/{alarm_id}")
def delete_alarm(
    alarm_id: UUID,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    alarm = db.query(Alarm).filter(Alarm.id == alarm_id, Alarm.user_id == current_user).first()
    if not alarm:
        raise HTTPException(status_code=404, detail="Alarm not found")

    alarm.is_active = False
    db.commit()
    return {"message": "Alarm deactivated"}