from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.dependencies import get_db, get_current_user
from app.models import User, Alarm, AlarmHistory
from app.schemas import AlarmCreate, AlarmUpdate, AlarmResponse, AlarmDismissRequest, AlarmHistoryResponse

router = APIRouter(prefix="/alarms", tags=["Alarms"])

@router.post("", response_model=AlarmResponse, status_code=status.HTTP_201_CREATED)
def create_alarm(alarm_in: AlarmCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Create a new alarm for the currently logged-in user."""
    db_alarm = Alarm(
        user_id=current_user.id,
        title=alarm_in.title,
        alarm_time=alarm_in.alarm_time,
        repeat_type=alarm_in.repeat_type.value,
        custom_days=alarm_in.custom_days,
        challenge_type=alarm_in.challenge_type,
        volume=alarm_in.volume,
        vibration=alarm_in.vibration,
        snooze_enabled=alarm_in.snooze_enabled,
        snooze_duration=alarm_in.snooze_duration,
        is_smart_adaptive=alarm_in.is_smart_adaptive,
        is_active=True,
        # New fields
        repeat_days=alarm_in.repeat_days,
        ringtone=alarm_in.ringtone,
        challenge_required=alarm_in.challenge_required,
        difficulty=alarm_in.difficulty
    )
    db.add(db_alarm)
    db.commit()
    db.refresh(db_alarm)
    return db_alarm


@router.get("", response_model=List[AlarmResponse])
def get_alarms(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Retrieve all alarms belonging to the currently logged-in user."""
    alarms = db.query(Alarm).filter(Alarm.user_id == current_user.id).all()
    return alarms

@router.get("/history", response_model=List[AlarmHistoryResponse])
def get_alarm_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Retrieve all alarm dismissal history belonging to the current user."""
    history = db.query(AlarmHistory).filter(AlarmHistory.user_id == current_user.id).order_by(AlarmHistory.dismissed_at.desc()).all()
    return history


@router.post("/dismiss", response_model=AlarmHistoryResponse, status_code=status.HTTP_201_CREATED)
def dismiss_alarm(dismiss_in: AlarmDismissRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Dismiss an alarm and log its history."""
    alarm = db.query(Alarm).filter(Alarm.id == dismiss_in.alarm_id).first()
    if not alarm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alarm not found"
        )
    if alarm.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to dismiss this alarm"
        )
    
    db_history = AlarmHistory(
        alarm_id=dismiss_in.alarm_id,
        user_id=current_user.id,
        wake_time=dismiss_in.wake_time,
        solved=dismiss_in.solved,
        solve_time=dismiss_in.solve_time
    )
    db.add(db_history)
    db.commit()
    db.refresh(db_history)
    return db_history


@router.get("/{alarm_id}", response_model=AlarmResponse)
def get_alarm(alarm_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Retrieve details of a specific alarm by ID. Requires ownership."""
    alarm = db.query(Alarm).filter(Alarm.id == alarm_id).first()
    if not alarm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alarm not found"
        )
    # Check ownership
    if alarm.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this alarm"
        )
    return alarm

@router.put("/{alarm_id}", response_model=AlarmResponse)
def update_alarm(alarm_id: UUID, alarm_in: AlarmUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Update a specific alarm by ID. Requires ownership."""
    alarm = db.query(Alarm).filter(Alarm.id == alarm_id).first()
    if not alarm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alarm not found"
        )
    # Check ownership
    if alarm.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this alarm"
        )
    
    # Update fields dynamically
    update_data = alarm_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key == "repeat_type" and value is not None:
            setattr(alarm, key, value.value)
        else:
            setattr(alarm, key, value)
            
    db.commit()
    db.refresh(alarm)
    return alarm

@router.delete("/{alarm_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_alarm(alarm_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Delete a specific alarm by ID. Requires ownership."""
    alarm = db.query(Alarm).filter(Alarm.id == alarm_id).first()
    if not alarm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alarm not found"
        )
    # Check ownership
    if alarm.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this alarm"
        )
    
    db.delete(alarm)
    db.commit()
    return None

@router.patch("/{alarm_id}/toggle", response_model=AlarmResponse)
def toggle_alarm(alarm_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Toggle the activation state (is_active) of an alarm. Requires ownership."""
    alarm = db.query(Alarm).filter(Alarm.id == alarm_id).first()
    if not alarm:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alarm not found"
        )
    # Check ownership
    if alarm.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to toggle this alarm"
        )
    
    alarm.is_active = not alarm.is_active
    db.commit()
    db.refresh(alarm)
    return alarm




