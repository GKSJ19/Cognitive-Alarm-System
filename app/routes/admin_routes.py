from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, AuditLog
from app.schemas import UserResponse, RoleUpdate, StatusUpdate, AuditLogResponse
from app.auth import require_admin
from app.audit import write_audit_log

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users", response_model=List[UserResponse])
def list_users(db: Session = Depends(get_db), _admin: User = Depends(require_admin)):
    """Admin-only: list every user in the system."""
    return db.query(User).all()


@router.patch("/users/{user_id}/status", response_model=UserResponse)
def set_user_status(
    user_id: int,
    payload: StatusUpdate,
    request: Request,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Admin-only: activate or deactivate a user account."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    old_status = user.is_active
    user.is_active = payload.is_active
    db.commit()
    db.refresh(user)

    write_audit_log(
        db, "user_status_changed", user_id=admin.id,
        detail=f"target_user_id={user_id} {old_status}->{payload.is_active}",
        ip_address=request.client.host if request.client else None,
    )
    return user


@router.patch("/users/{user_id}/role", response_model=UserResponse)
def set_user_role(
    user_id: int,
    payload: RoleUpdate,
    request: Request,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Admin-only: change a user's role (user / wellness_coach / admin)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    old_role = user.role.value
    user.role = payload.role
    db.commit()
    db.refresh(user)

    write_audit_log(
        db, "role_changed", user_id=admin.id,
        detail=f"target_user_id={user_id} {old_role}->{payload.role.value}",
        ip_address=request.client.host if request.client else None,
    )
    return user


@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
    limit: int = 100,
):
    """
    Admin-only: retrieve recent security-relevant events -- login attempts
    (success/failure/lockout), password resets, and admin actions
    (role/status changes). Append-only; most recent first.
    """
    return (
        db.query(AuditLog)
        .order_by(AuditLog.created_at.desc())
        .limit(min(limit, 500))
        .all()
    )
