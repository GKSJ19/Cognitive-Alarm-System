"""
Analytics Service & BI — SQLAlchemy repository layer.

All DB reads/writes for analytics data live here.
The service layer never accesses the ORM session directly.
"""

from __future__ import annotations

from datetime import date, datetime, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.analytics_bi import AnalyticsEvent, DailyUserStat, PlatformStat, BiReport
from app.models.enums import AnalyticsEventType, BiReportType


class AnalyticsRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    # ------------------------------------------------------------------
    # AnalyticsEvent — append-only
    # ------------------------------------------------------------------

    async def track_event(self, event: AnalyticsEvent) -> AnalyticsEvent:
        """Append a single analytics event."""
        self.session.add(event)
        await self.session.commit()
        await self.session.refresh(event)
        return event

    async def track_events_bulk(self, events: list[AnalyticsEvent]) -> list[AnalyticsEvent]:
        """Batch-insert multiple events in one transaction."""
        for e in events:
            self.session.add(e)
        await self.session.commit()
        for e in events:
            await self.session.refresh(e)
        return events

    async def list_events_by_user(
        self,
        user_id: UUID,
        *,
        event_type: Optional[AnalyticsEventType] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> list[AnalyticsEvent]:
        stmt = select(AnalyticsEvent).where(AnalyticsEvent.user_id == user_id)
        if event_type:
            stmt = stmt.where(AnalyticsEvent.event_type == event_type)
        if start_date:
            stmt = stmt.where(AnalyticsEvent.occurred_at >= datetime(start_date.year, start_date.month, start_date.day))
        if end_date:
            stmt = stmt.where(AnalyticsEvent.occurred_at < datetime(end_date.year, end_date.month, end_date.day + 1))
        stmt = stmt.order_by(AnalyticsEvent.occurred_at.desc()).limit(limit).offset(offset)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def count_events_by_type(
        self,
        event_type: AnalyticsEventType,
        *,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> int:
        """Platform-wide count of a specific event type in a date range."""
        stmt = select(func.count()).select_from(AnalyticsEvent).where(
            AnalyticsEvent.event_type == event_type
        )
        if start_date:
            stmt = stmt.where(AnalyticsEvent.occurred_at >= datetime(start_date.year, start_date.month, start_date.day))
        if end_date:
            stmt = stmt.where(AnalyticsEvent.occurred_at < datetime(end_date.year, end_date.month, end_date.day + 1))
        result = await self.session.execute(stmt)
        return result.scalar_one()

    # ------------------------------------------------------------------
    # DailyUserStat — personal dashboard
    # ------------------------------------------------------------------

    async def get_daily_stat(self, user_id: UUID, stat_date: date) -> DailyUserStat | None:
        result = await self.session.execute(
            select(DailyUserStat).where(
                and_(
                    DailyUserStat.user_id == user_id,
                    DailyUserStat.date == stat_date,
                )
            )
        )
        return result.scalars().first()

    async def list_daily_stats(
        self,
        user_id: UUID,
        *,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        limit: int = 30,
    ) -> list[DailyUserStat]:
        stmt = select(DailyUserStat).where(DailyUserStat.user_id == user_id)
        if start_date:
            stmt = stmt.where(DailyUserStat.date >= start_date)
        if end_date:
            stmt = stmt.where(DailyUserStat.date <= end_date)
        stmt = stmt.order_by(DailyUserStat.date.desc()).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def upsert_daily_stat(self, stat: DailyUserStat) -> DailyUserStat:
        """Insert or update a daily user stat row."""
        existing = await self.get_daily_stat(stat.user_id, stat.date)
        if existing is None:
            self.session.add(stat)
            await self.session.commit()
            await self.session.refresh(stat)
            return stat
        for field, value in stat.__dict__.items():
            if field.startswith("_") or field in ("id", "user_id", "date", "created_at"):
                continue
            setattr(existing, field, value)
        await self.session.commit()
        await self.session.refresh(existing)
        return existing

    # ------------------------------------------------------------------
    # PlatformStat — admin / BI
    # ------------------------------------------------------------------

    async def get_platform_stat(self, stat_date: date) -> PlatformStat | None:
        result = await self.session.execute(
            select(PlatformStat).where(PlatformStat.date == stat_date)
        )
        return result.scalars().first()

    async def list_platform_stats(
        self,
        *,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        limit: int = 30,
        offset: int = 0,
    ) -> list[PlatformStat]:
        stmt = select(PlatformStat)
        if start_date:
            stmt = stmt.where(PlatformStat.date >= start_date)
        if end_date:
            stmt = stmt.where(PlatformStat.date <= end_date)
        stmt = stmt.order_by(PlatformStat.date.desc()).limit(limit).offset(offset)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def upsert_platform_stat(self, stat: PlatformStat) -> PlatformStat:
        existing = await self.get_platform_stat(stat.date)
        if existing is None:
            self.session.add(stat)
            await self.session.commit()
            await self.session.refresh(stat)
            return stat
        for field, value in stat.__dict__.items():
            if field.startswith("_") or field in ("id", "date", "created_at"):
                continue
            setattr(existing, field, value)
        await self.session.commit()
        await self.session.refresh(existing)
        return existing

    async def aggregate_platform_summary(
        self, start_date: date, end_date: date
    ) -> dict:
        """
        Returns a scalar summary over a date range.
        Used for the platform-overview BI card.
        """
        result = await self.session.execute(
            select(
                func.avg(PlatformStat.daily_active_users).label("avg_dau"),
                func.max(PlatformStat.daily_active_users).label("peak_dau"),
                func.sum(PlatformStat.new_signups).label("total_new_signups"),
                func.avg(PlatformStat.alarm_success_rate).label("avg_alarm_success_rate"),
                func.avg(PlatformStat.challenge_pass_rate).label("avg_challenge_pass_rate"),
                func.avg(PlatformStat.avg_sleep_duration_mins).label("avg_sleep_duration_mins"),
                func.avg(PlatformStat.avg_habit_score).label("avg_habit_score"),
                func.avg(PlatformStat.notification_read_rate).label("avg_notification_read_rate"),
            ).where(
                and_(PlatformStat.date >= start_date, PlatformStat.date <= end_date)
            )
        )
        row = result.one()
        return {
            "period_start": start_date,
            "period_end": end_date,
            "avg_dau": float(row.avg_dau or 0),
            "peak_dau": int(row.peak_dau or 0),
            "total_new_signups": int(row.total_new_signups or 0),
            "avg_alarm_success_rate": float(row.avg_alarm_success_rate) if row.avg_alarm_success_rate else None,
            "avg_challenge_pass_rate": float(row.avg_challenge_pass_rate) if row.avg_challenge_pass_rate else None,
            "avg_sleep_duration_mins": float(row.avg_sleep_duration_mins) if row.avg_sleep_duration_mins else None,
            "avg_habit_score": float(row.avg_habit_score) if row.avg_habit_score else None,
            "avg_notification_read_rate": float(row.avg_notification_read_rate) if row.avg_notification_read_rate else None,
        }

    # ------------------------------------------------------------------
    # BiReport CRUD
    # ------------------------------------------------------------------

    async def create_report(self, report: BiReport) -> BiReport:
        self.session.add(report)
        await self.session.commit()
        await self.session.refresh(report)
        return report

    async def get_report_by_id(self, report_id: UUID) -> BiReport | None:
        result = await self.session.execute(
            select(BiReport).where(BiReport.id == report_id)
        )
        return result.scalars().first()

    async def list_reports(
        self,
        *,
        report_type: Optional[BiReportType] = None,
        limit: int = 20,
        offset: int = 0,
    ) -> list[BiReport]:
        stmt = select(BiReport)
        if report_type:
            stmt = stmt.where(BiReport.report_type == report_type)
        stmt = stmt.order_by(BiReport.created_at.desc()).limit(limit).offset(offset)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def update_report(self, report: BiReport) -> BiReport:
        await self.session.commit()
        await self.session.refresh(report)
        return report

    async def delete_report(self, report: BiReport) -> None:
        await self.session.delete(report)
        await self.session.commit()
