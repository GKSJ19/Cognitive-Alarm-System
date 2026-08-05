from typing import Optional
from sqlalchemy.orm import Session

from app.models import AuditLog


def write_audit_log(
    db: Session,
    action: str,
    user_id: Optional[int] = None,
    detail: Optional[str] = None,
    ip_address: Optional[str] = None,
) -> None:
    """
    Appends one audit log entry. Never raises -- a failure to log should
    never break the actual request it's logging (e.g. a login that
    otherwise succeeded shouldn't fail just because logging hiccuped).
    """
    try:
        db.add(AuditLog(action=action, user_id=user_id, detail=detail, ip_address=ip_address))
        db.commit()
    except Exception:
        db.rollback()
