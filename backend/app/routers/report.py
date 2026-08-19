from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.report_service import get_user_report
from app.schemas.report import ReportResponse


router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)


@router.get(
    "/{user_id}",
    response_model=ReportResponse
)
def get_report(
    user_id: int,
    db: Session = Depends(get_db)
):
    return get_user_report(user_id, db)