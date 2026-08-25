"""
Coach Notification Routes
- POST /notifications/send        → Coach sends a notification to a user
- GET  /notifications/inbox       → User fetches their unread notifications
- GET  /notifications/sent        → Coach sees all sent notifications
- PATCH /notifications/{id}/read  → User marks a notification as read
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import datetime

from app.database import SessionLocal
from app.dependencies import get_current_user
from app.models.models import CoachNotification, User

router = APIRouter(prefix="/notifications", tags=["Notifications"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── Schemas ──────────────────────────────────────────────────────────────────

class SendNotificationRequest(BaseModel):
    recipient_id: str
    title: str
    message: str
    notification_type: Optional[str] = "tip"   # tip | warning | praise | reminder


class NotificationOut(BaseModel):
    id: str
    coach_id: str
    coach_name: str
    recipient_id: str
    title: str
    message: str
    notification_type: str
    is_read: bool
    created_at: str

    class Config:
        from_attributes = True


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/send", response_model=NotificationOut, status_code=201)
def send_notification(
    payload: SendNotificationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Coach sends a notification to a specific user."""
    if current_user.role not in ("wellness_coach", "admin"):
        raise HTTPException(status_code=403, detail="Only coaches or admins can send notifications.")

    # Validate recipient exists
    try:
        recipient_uuid = uuid.UUID(payload.recipient_id)
    except (ValueError, AttributeError):
        raise HTTPException(status_code=400, detail="Invalid recipient UUID format.")

    recipient = db.query(User).filter(User.id == recipient_uuid).first()
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient user not found.")

    notif = CoachNotification(
        coach_id=current_user.id,
        recipient_id=recipient_uuid,
        title=payload.title,
        message=payload.message,
        notification_type=payload.notification_type or "tip",
        is_read=False,
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)

    return _serialize(notif, current_user.full_name)


@router.get("/inbox", response_model=list[NotificationOut])
def get_inbox(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return all coach notifications sent to the current user (newest first)."""
    notifications = (
        db.query(CoachNotification)
        .filter(CoachNotification.recipient_id == current_user.id)
        .order_by(CoachNotification.created_at.desc())
        .limit(50)
        .all()
    )
    result = []
    for n in notifications:
        coach = db.query(User).filter(User.id == n.coach_id).first()
        result.append(_serialize(n, coach.full_name if coach else "Coach"))
    return result


@router.get("/sent", response_model=list[NotificationOut])
def get_sent(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return all notifications sent by the current coach (newest first)."""
    if current_user.role not in ("wellness_coach", "admin"):
        raise HTTPException(status_code=403, detail="Only coaches can view sent notifications.")

    notifications = (
        db.query(CoachNotification)
        .filter(CoachNotification.coach_id == current_user.id)
        .order_by(CoachNotification.created_at.desc())
        .limit(100)
        .all()
    )
    return [_serialize(n, current_user.full_name) for n in notifications]


@router.patch("/{notification_id}/read")
def mark_as_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark a specific notification as read."""
    try:
        notif_uuid = uuid.UUID(notification_id)
    except (ValueError, AttributeError):
        raise HTTPException(status_code=400, detail="Invalid notification UUID format.")

    notif = db.query(CoachNotification).filter(
        CoachNotification.id == notif_uuid,
        CoachNotification.recipient_id == current_user.id,
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found.")
    notif.is_read = True
    db.commit()
    return {"status": "marked_read"}


@router.patch("/inbox/read-all")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark all notifications as read for the current user."""
    db.query(CoachNotification).filter(
        CoachNotification.recipient_id == current_user.id,
        CoachNotification.is_read == False,
    ).update({"is_read": True})
    db.commit()
    return {"status": "all_read"}


# ── Helper ────────────────────────────────────────────────────────────────────

def _serialize(n: CoachNotification, coach_name: str) -> dict:
    return {
        "id": str(n.id),
        "coach_id": str(n.coach_id),
        "coach_name": coach_name,
        "recipient_id": str(n.recipient_id),
        "title": n.title,
        "message": n.message,
        "notification_type": n.notification_type,
        "is_read": n.is_read,
        "created_at": n.created_at.isoformat() if n.created_at else datetime.utcnow().isoformat(),
    }
