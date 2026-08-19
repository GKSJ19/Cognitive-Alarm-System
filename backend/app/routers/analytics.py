from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.analytics_service import get_user_analytics
from app.schemas.analytics import AnalyticsResponse


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


@router.get(
    "/{user_id}",
    response_model=AnalyticsResponse
)
def get_analytics(
    user_id: int,
    db: Session = Depends(get_db)
):
    return get_user_analytics(user_id, db)