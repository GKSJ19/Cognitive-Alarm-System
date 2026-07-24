from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_role
from app.models.user import User

router = APIRouter()

@router.get("/users")
def list_all_users(
    payload: dict = Depends(require_role("administrator")),
    db: Session = Depends(get_db),
):
    users = db.query(User).all()
    return [{"id": str(u.id), "name": u.name, "email": u.email, "role": u.role} for u in users]