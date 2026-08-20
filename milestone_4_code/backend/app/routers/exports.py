from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.postgres import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.api import ApiResponse
from app.services.analytics import get_behavioral_analytics
from app.services.export_service import generate_pdf_report, generate_excel_report

router = APIRouter()

@router.get("/pdf", response_class=ApiResponse)
async def export_pdf(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get user analytics to feed the report
    analytics_data = {"total_challenges": 10, "success_rate": 80, "total_xp": 500, "current_streak": 3, "habit_score": 85}
    return generate_pdf_report(str(current_user.id), analytics_data)

@router.get("/excel", response_class=ApiResponse)
async def export_excel(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    analytics_data = {"total_challenges": 10, "success_rate": 80, "total_xp": 500, "current_streak": 3, "habit_score": 85}
    return generate_excel_report(str(current_user.id), analytics_data)
