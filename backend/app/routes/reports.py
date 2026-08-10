from fastapi import APIRouter, Depends, Query, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional

from app.dependencies import get_db, get_current_user
from app.models import User
from app.services.reports import (
    generate_report_data,
    export_report_excel,
    export_report_pdf
)

router = APIRouter(prefix="/reports", tags=["Reports & Export System"])

def validate_dates(start_date: str, end_date: str):
    """Validates date format and chronological order."""
    try:
        start = datetime.strptime(start_date, "%Y-%m-%d")
        end = datetime.strptime(end_date, "%Y-%m-%d")
        if end < start:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="end_date cannot be earlier than start_date"
            )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Dates must be in YYYY-MM-DD format"
        )

def get_report_response(
    report_type: str,
    start_date: str,
    end_date: str,
    format_type: str,
    user: User,
    db: Session
):
    validate_dates(start_date, end_date)
    format_type = format_type.lower()
    
    if format_type not in ["json", "pdf", "excel"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid format. Must be one of: json, pdf, excel"
        )
        
    report_data = generate_report_data(user.id, report_type, start_date, end_date, db)
    
    if "error" in report_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=report_data["error"]
        )
        
    if format_type == "json":
        return report_data
        
    elif format_type == "excel":
        excel_buffer = export_report_excel(report_type, report_data)
        filename = f"{report_type}_report_{start_date}_to_{end_date}.xlsx"
        return StreamingResponse(
            excel_buffer,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    elif format_type == "pdf":
        pdf_buffer = export_report_pdf(report_type, report_data, user.full_name)
        filename = f"{report_type}_report_{start_date}_to_{end_date}.pdf"
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

@router.get("/habit")
def get_habit_report(
    start_date: str = Query(None, description="Start date (YYYY-MM-DD), defaults to 7 days ago"),
    end_date: str = Query(None, description="End date (YYYY-MM-DD), defaults to today"),
    format: str = Query("json", description="Export format: json, pdf, excel"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve or export the user's habit scores report."""
    if not start_date:
        start_date = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
    if not end_date:
        end_date = datetime.now().strftime("%Y-%m-%d")
        
    return get_report_response("habit", start_date, end_date, format, current_user, db)

@router.get("/wake-up")
def get_wakeup_report(
    start_date: str = Query(None, description="Start date (YYYY-MM-DD), defaults to 7 days ago"),
    end_date: str = Query(None, description="End date (YYYY-MM-DD), defaults to today"),
    format: str = Query("json", description="Export format: json, pdf, excel"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve or export the user's wake-up consistency report."""
    if not start_date:
        start_date = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
    if not end_date:
        end_date = datetime.now().strftime("%Y-%m-%d")
        
    return get_report_response("wake-up", start_date, end_date, format, current_user, db)

@router.get("/challenge-performance")
def get_challenge_report(
    start_date: str = Query(None, description="Start date (YYYY-MM-DD), defaults to 7 days ago"),
    end_date: str = Query(None, description="End date (YYYY-MM-DD), defaults to today"),
    format: str = Query("json", description="Export format: json, pdf, excel"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve or export the user's challenge solving accuracy and speed performance report."""
    if not start_date:
        start_date = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
    if not end_date:
        end_date = datetime.now().strftime("%Y-%m-%d")
        
    return get_report_response("challenge", start_date, end_date, format, current_user, db)

@router.get("/productivity")
def get_productivity_report(
    start_date: str = Query(None, description="Start date (YYYY-MM-DD), defaults to 7 days ago"),
    end_date: str = Query(None, description="End date (YYYY-MM-DD), defaults to today"),
    format: str = Query("json", description="Export format: json, pdf, excel"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve or export the user's routine-based morning productivity report."""
    if not start_date:
        start_date = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
    if not end_date:
        end_date = datetime.now().strftime("%Y-%m-%d")
        
    return get_report_response("productivity", start_date, end_date, format, current_user, db)

@router.get("/sleep-analytics")
def get_sleep_report(
    start_date: str = Query(None, description="Start date (YYYY-MM-DD), defaults to 7 days ago"),
    end_date: str = Query(None, description="End date (YYYY-MM-DD), defaults to today"),
    format: str = Query("json", description="Export format: json, pdf, excel"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve or export the user's sleep schedule consistency and duration report."""
    if not start_date:
        start_date = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
    if not end_date:
        end_date = datetime.now().strftime("%Y-%m-%d")
        
    return get_report_response("sleep", start_date, end_date, format, current_user, db)
