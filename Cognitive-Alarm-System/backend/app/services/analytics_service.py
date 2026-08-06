"""
Analytics Service & BI — Business logic service layer.

Responsibilities
----------------
1.  Ingest raw analytics events from client or internal services.
2.  Compute and upsert per-user daily statistics (DailyUserStat).
3.  Compute and upsert platform-wide aggregated KPIs (PlatformStat).
4.  Generate BI report records and delegate export work to a background job.
5.  Query personal dashboards and admin BI dashboards.

Design notes
------------
* Aggregation jobs (`_compute_daily_user_stat`, `_compute_platform_stat`) are
  called explicitly.  In production, wire them to a Celery beat task or a
  scheduled FastAPI background task.
* The BI export (`generate_report`) is a stub that marks the report as
  "completed" immediately.  Replace with a real CSV/JSON writer + object-
  storage upload.
"""

from __future__ import annotations

import csv
import io
import logging
from datetime import date, datetime, timedelta, timezone
from typing import Any, Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.analytics_bi import AnalyticsEvent, BiReport, DailyUserStat, PlatformStat
from app.models.enums import AnalyticsEventType, BiReportType
from app.repositories.analytics_repository import AnalyticsRepository
from app.schemas.analytics import BiReportCreate, EventTrackIn

logger = logging.getLogger(__name__)


class AnalyticsService:
    """
    Orchestrates all analytics and BI operations.

    Parameters
    ----------
    session : AsyncSession
        Active SQLAlchemy async session injected per-request.
    """

    def __init__(self, session: AsyncSession) -> None:
        self.repo = AnalyticsRepository(session)

    # ------------------------------------------------------------------
    # Event ingestion
    # ------------------------------------------------------------------

    async def track(self, user_id: UUID, payload: EventTrackIn) -> AnalyticsEvent:
        """
        Record a single analytics event.

        The `occurred_at` field defaults to the server's UTC now if the client
        did not supply one, which prevents clock-skew abuse.
        """
        occurred_at = payload.occurred_at or datetime.now(timezone.utc)
        event = AnalyticsEvent(
            user_id=user_id,
            event_type=payload.event_type,
            session_id=payload.session_id,
            alarm_id=payload.alarm_id,
            properties=payload.properties,
            platform=payload.platform,
            app_version=payload.app_version,
            occurred_at=occurred_at,
        )
        return await self.repo.track_event(event)

    async def track_internal(
        self,
        event_type: AnalyticsEventType,
        *,
        user_id: Optional[UUID] = None,
        alarm_id: Optional[UUID] = None,
        properties: Optional[dict[str, Any]] = None,
    ) -> AnalyticsEvent:
        """
        Record an event from internal service code (no HTTP payload).

        Used by other services (e.g. AlarmService, ChallengeService) to emit
        events without going through the HTTP layer.
        """
        event = AnalyticsEvent(
            user_id=user_id,
            event_type=event_type,
            alarm_id=alarm_id,
            properties=properties,
            occurred_at=datetime.now(timezone.utc),
        )
        return await self.repo.track_event(event)

    async def track_bulk(
        self, user_id: UUID, payloads: list[EventTrackIn]
    ) -> list[AnalyticsEvent]:
        """Batch-ingest multiple events (e.g. offline sync)."""
        events = [
            AnalyticsEvent(
                user_id=user_id,
                event_type=p.event_type,
                session_id=p.session_id,
                alarm_id=p.alarm_id,
                properties=p.properties,
                platform=p.platform,
                app_version=p.app_version,
                occurred_at=p.occurred_at or datetime.now(timezone.utc),
            )
            for p in payloads
        ]
        return await self.repo.track_events_bulk(events)

    async def list_events(
        self,
        user_id: UUID,
        *,
        event_type: Optional[AnalyticsEventType] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> list[AnalyticsEvent]:
        return await self.repo.list_events_by_user(
            user_id,
            event_type=event_type,
            start_date=start_date,
            end_date=end_date,
            limit=limit,
            offset=offset,
        )

    # ------------------------------------------------------------------
    # Personal dashboard — DailyUserStat
    # ------------------------------------------------------------------

    async def get_my_stats(
        self,
        user_id: UUID,
        *,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        limit: int = 30,
    ) -> list[DailyUserStat]:
        """Return paginated personal daily stats for the authenticated user."""
        return await self.repo.list_daily_stats(
            user_id, start_date=start_date, end_date=end_date, limit=limit
        )

    async def compute_daily_user_stat(self, user_id: UUID, stat_date: date) -> DailyUserStat:
        """
        Aggregate raw analytics events for `user_id` on `stat_date` and write
        the result into `daily_user_stats`.

        This method queries the event stream and computes KPIs.  It is designed
        to be called from a scheduled background job.
        """

        async def _count(event_type: AnalyticsEventType) -> int:
            return await self.repo.count_events_by_type(
                event_type, start_date=stat_date, end_date=stat_date
            )

        stat = DailyUserStat(
            user_id=user_id,
            date=stat_date,
            alarms_triggered=await _count(AnalyticsEventType.alarm_triggered),
            alarms_dismissed=await _count(AnalyticsEventType.alarm_dismissed),
            alarms_snoozed=await _count(AnalyticsEventType.alarm_snoozed),
            total_snooze_count=await _count(AnalyticsEventType.alarm_snoozed),
            challenges_attempted=(
                await _count(AnalyticsEventType.challenge_started)
            ),
            challenges_passed=await _count(AnalyticsEventType.challenge_passed),
            challenges_failed=await _count(AnalyticsEventType.challenge_failed),
            notifications_sent=await _count(AnalyticsEventType.notification_sent),
            notifications_read=await _count(AnalyticsEventType.notification_read),
        )
        return await self.repo.upsert_daily_stat(stat)

    # ------------------------------------------------------------------
    # Admin / BI dashboard — PlatformStat
    # ------------------------------------------------------------------

    async def get_platform_stats(
        self,
        *,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        limit: int = 30,
        offset: int = 0,
    ) -> list[PlatformStat]:
        """Return paginated platform-wide daily KPIs (admin only)."""
        return await self.repo.list_platform_stats(
            start_date=start_date, end_date=end_date, limit=limit, offset=offset
        )

    async def get_platform_summary(self, start_date: date, end_date: date) -> dict:
        """
        Return a scalar summary across a date range — powers the BI overview card.
        """
        return await self.repo.aggregate_platform_summary(start_date, end_date)

    async def compute_platform_stat(self, stat_date: date) -> PlatformStat:
        """
        Aggregate platform-wide KPIs for a given date.

        Designed to be called nightly by a background job.
        """

        async def _count(event_type: AnalyticsEventType) -> int:
            return await self.repo.count_events_by_type(
                event_type, start_date=stat_date, end_date=stat_date
            )

        triggered = await _count(AnalyticsEventType.alarm_triggered)
        dismissed = await _count(AnalyticsEventType.alarm_dismissed)
        ch_attempted = await _count(AnalyticsEventType.challenge_started)
        ch_passed = await _count(AnalyticsEventType.challenge_passed)
        notif_sent = await _count(AnalyticsEventType.notification_sent)
        notif_read = await _count(AnalyticsEventType.notification_read)

        alarm_success_rate = (dismissed / triggered * 100) if triggered > 0 else None
        challenge_pass_rate = (ch_passed / ch_attempted * 100) if ch_attempted > 0 else None
        notif_read_rate = (notif_read / notif_sent * 100) if notif_sent > 0 else None

        stat = PlatformStat(
            date=stat_date,
            daily_active_users=0,       # Requires session-based DAU query (placeholder)
            weekly_active_users=0,
            new_signups=0,
            total_registered_users=0,
            alarms_triggered_total=triggered,
            alarm_success_rate=alarm_success_rate,
            challenges_attempted_total=ch_attempted,
            challenge_pass_rate=challenge_pass_rate,
            notifications_sent_total=notif_sent,
            notification_read_rate=notif_read_rate,
        )
        return await self.repo.upsert_platform_stat(stat)

    # ------------------------------------------------------------------
    # BI Report generation
    # ------------------------------------------------------------------

    async def create_report(
        self, requested_by: UUID, payload: BiReportCreate
    ) -> BiReport:
        """
        Persist a report request and trigger generation.

        The actual generation is a stub here — in production this would
        enqueue a Celery task or call an async background task.
        """
        report = BiReport(
            requested_by=requested_by,
            report_type=payload.report_type,
            title=payload.title or payload.report_type.value.replace("_", " ").title(),
            period_start=payload.period_start,
            period_end=payload.period_end,
            filters=payload.filters,
            status="running",
        )
        report = await self.repo.create_report(report)

        # Inline generation stub (replace with background task in production)
        try:
            file_url, row_count = await self._generate_report_stub(report)
            report.status = "completed"
            report.file_url = file_url
            report.row_count = row_count
            report.generated_at = datetime.now(timezone.utc)
        except Exception as exc:
            logger.error("BI report generation failed: %s", exc, exc_info=True)
            report.status = "failed"
            report.error_message = str(exc)

        return await self.repo.update_report(report)

    async def _generate_report_stub(self, report: BiReport) -> tuple[str, int]:
        """
        Stub report generator.

        Builds an in-memory CSV and returns a fake object-storage URL.
        Replace with a real writer + S3/GCS upload.
        """
        start = report.period_start or (date.today() - timedelta(days=30))
        end = report.period_end or date.today()

        stats = await self.repo.list_platform_stats(
            start_date=start, end_date=end, limit=1000
        )

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "date", "dau", "new_signups", "alarm_success_rate",
            "challenge_pass_rate", "avg_sleep_duration_mins",
            "notification_read_rate",
        ])
        for s in stats:
            writer.writerow([
                s.date, s.daily_active_users, s.new_signups,
                s.alarm_success_rate, s.challenge_pass_rate,
                s.avg_sleep_duration_mins, s.notification_read_rate,
            ])

        # In production: upload output.getvalue() to S3 and return the signed URL
        fake_url = f"https://storage.example.com/reports/{report.id}.csv"
        return fake_url, len(stats)

    async def list_reports(
        self,
        *,
        report_type: Optional[BiReportType] = None,
        limit: int = 20,
        offset: int = 0,
    ) -> list[BiReport]:
        return await self.repo.list_reports(
            report_type=report_type, limit=limit, offset=offset
        )

    async def get_report(self, report_id: UUID) -> BiReport | None:
        return await self.repo.get_report_by_id(report_id)

    async def delete_report(self, report_id: UUID) -> None:
        report = await self.repo.get_report_by_id(report_id)
        if not report:
            raise ValueError("Report not found")
        await self.repo.delete_report(report)
