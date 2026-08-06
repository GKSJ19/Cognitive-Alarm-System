"""
Analytics Service & BI — FastAPI router.

Endpoints
---------
Event tracking (user-facing)
  POST   /api/analytics/events              — track a single event
  POST   /api/analytics/events/batch        — batch-track events

Personal dashboard (user-facing)
  GET    /api/analytics/me/stats            — personal daily stats (range)
  POST   /api/analytics/me/compute/{date}   — trigger daily stat computation

Platform / BI dashboard (admin)
  GET    /api/analytics/platform/stats              — platform daily KPIs
  GET    /api/analytics/platform/summary            — aggregated BI overview
  POST   /api/analytics/platform/compute/{date}     — trigger platform stat computation

BI reports (admin)
  POST   /api/analytics/reports/            — generate a BI report
  GET    /api/analytics/reports/            — list BI reports
  GET    /api/analytics/reports/{id}        — get a specific BI report
  DELETE /api/analytics/reports/{id}        — delete a BI report
"""

from __future__ import annotations

from datetime import date
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.database import get_session
from app.models.enums import AnalyticsEventType, BiReportType
from app.schemas.analytics import (
    BiReportCreate,
    BiReportOut,
    DailyUserStatOut,
    EventTrackIn,
    EventTrackOut,
    PlatformStatOut,
    PlatformStatSummary,
    UserStatsRangeOut,
)
from app.services.analytics_service import AnalyticsService

router = APIRouter()


# ---------------------------------------------------------------------------
# Event tracking
# ---------------------------------------------------------------------------


@router.post(
    "/events",
    response_model=EventTrackOut,
    status_code=status.HTTP_201_CREATED,
    summary="Track an analytics event",
)
async def track_event(
    payload: EventTrackIn,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """
    Record a single client-side analytics event.

    The `user_id` is derived from the JWT — clients do not supply it.
    """
    svc = AnalyticsService(session)
    return await svc.track(current_user.id, payload)


@router.post(
    "/events/batch",
    response_model=list[EventTrackOut],
    status_code=status.HTTP_201_CREATED,
    summary="Batch-track analytics events (offline sync)",
)
async def track_events_batch(
    payloads: list[EventTrackIn],
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """
    Ingest multiple events in one request — useful for offline-first mobile apps
    that buffer events locally and flush on reconnect.

    Maximum 200 events per request.
    """
    if len(payloads) > 200:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Maximum 200 events per batch",
        )
    svc = AnalyticsService(session)
    return await svc.track_bulk(current_user.id, payloads)


# ---------------------------------------------------------------------------
# Personal dashboard
# ---------------------------------------------------------------------------


@router.get(
    "/me/stats",
    response_model=UserStatsRangeOut,
    summary="Get personal daily statistics",
)
async def my_stats(
    start_date: Optional[date] = Query(None, description="Inclusive start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Inclusive end date (YYYY-MM-DD)"),
    limit: int = Query(30, ge=1, le=90, description="Max days to return"),
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """
    Return pre-aggregated daily statistics for the authenticated user.

    Data is computed nightly by the analytics worker and reflects the
    previous UTC day.  The most-recent day may be incomplete if the
    worker hasn't run yet.
    """
    svc = AnalyticsService(session)
    items = await svc.get_my_stats(
        current_user.id, start_date=start_date, end_date=end_date, limit=limit
    )
    return {"items": items, "total_days": len(items)}


@router.post(
    "/me/compute/{stat_date}",
    response_model=DailyUserStatOut,
    summary="[Internal] Trigger daily stat computation for current user",
)
async def compute_my_daily_stat(
    stat_date: date,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """
    Recompute the daily stat row for the given date.

    This endpoint is primarily for development / manual back-fill.
    In production, a scheduled background job handles this automatically.
    """
    svc = AnalyticsService(session)
    return await svc.compute_daily_user_stat(current_user.id, stat_date)


# ---------------------------------------------------------------------------
# Platform / BI dashboard (admin)
# ---------------------------------------------------------------------------


@router.get(
    "/platform/stats",
    response_model=list[PlatformStatOut],
    summary="[Admin] Get platform-wide daily KPIs",
)
async def platform_stats(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    limit: int = Query(30, ge=1, le=365),
    offset: int = Query(0, ge=0),
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """
    Return pre-aggregated platform-wide KPIs ordered by date descending.

    Restricted to admin/coach roles in production (add role guard).
    """
    svc = AnalyticsService(session)
    return await svc.get_platform_stats(
        start_date=start_date, end_date=end_date, limit=limit, offset=offset
    )


@router.get(
    "/platform/summary",
    response_model=PlatformStatSummary,
    summary="[Admin] Get BI overview summary for a date range",
)
async def platform_summary(
    start_date: date = Query(..., description="Inclusive start date"),
    end_date: date = Query(..., description="Inclusive end date"),
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """
    Return a single aggregated summary row across a custom date range.

    Powers the 'Platform Overview' KPI card on the admin BI dashboard.
    """
    if start_date > end_date:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="start_date must be before or equal to end_date",
        )
    svc = AnalyticsService(session)
    return await svc.get_platform_summary(start_date, end_date)


@router.post(
    "/platform/compute/{stat_date}",
    response_model=PlatformStatOut,
    summary="[Admin] Trigger platform KPI computation for a specific date",
)
async def compute_platform_stat(
    stat_date: date,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """
    Recompute the platform-wide KPI row for the given date.

    Useful for back-filling historical data or re-running after a bug fix.
    """
    svc = AnalyticsService(session)
    return await svc.compute_platform_stat(stat_date)


# ---------------------------------------------------------------------------
# BI Reports
# ---------------------------------------------------------------------------


@router.post(
    "/reports/",
    response_model=BiReportOut,
    status_code=status.HTTP_202_ACCEPTED,
    summary="[Admin] Generate a BI report",
)
async def generate_report(
    payload: BiReportCreate,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """
    Kick off BI report generation.

    The response is returned immediately with `status=running`.  Poll
    `GET /reports/{id}` until `status=completed` to get the download URL.
    (The stub implementation completes synchronously.)
    """
    svc = AnalyticsService(session)
    return await svc.create_report(current_user.id, payload)


@router.get(
    "/reports/",
    response_model=list[BiReportOut],
    summary="[Admin] List BI reports",
)
async def list_reports(
    report_type: Optional[BiReportType] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    svc = AnalyticsService(session)
    return await svc.list_reports(report_type=report_type, limit=limit, offset=offset)


@router.get(
    "/reports/{report_id}",
    response_model=BiReportOut,
    summary="[Admin] Get a specific BI report",
)
async def get_report(
    report_id: UUID,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    svc = AnalyticsService(session)
    report = await svc.get_report(report_id)
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    return report


@router.delete(
    "/reports/{report_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="[Admin] Delete a BI report",
)
async def delete_report(
    report_id: UUID,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    svc = AnalyticsService(session)
    try:
        await svc.delete_report(report_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
