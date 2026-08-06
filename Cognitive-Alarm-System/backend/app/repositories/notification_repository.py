"""
Notification & Reminder System — SQLAlchemy repository layer.

All DB interactions for the Notification system live here.
The service layer never touches the session directly.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy import and_, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import (
    Notification,
    NotificationTemplate,
    ReminderSchedule,
    NotificationPreference,
)
from app.models.enums import NotificationStatus, NotificationType


class NotificationRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    # ------------------------------------------------------------------
    # Notification CRUD
    # ------------------------------------------------------------------

    async def create(self, notification: Notification) -> Notification:
        self.session.add(notification)
        await self.session.commit()
        await self.session.refresh(notification)
        return notification

    async def create_bulk(self, notifications: list[Notification]) -> list[Notification]:
        """Batch-insert many notifications in a single transaction."""
        for n in notifications:
            self.session.add(n)
        await self.session.commit()
        for n in notifications:
            await self.session.refresh(n)
        return notifications

    async def get_by_id(self, notification_id: UUID) -> Notification | None:
        result = await self.session.execute(
            select(Notification).where(Notification.id == notification_id)
        )
        return result.scalars().first()

    async def list_by_user(
        self,
        user_id: UUID,
        *,
        unread_only: bool = False,
        limit: int = 50,
        offset: int = 0,
    ) -> list[Notification]:
        stmt = select(Notification).where(Notification.user_id == user_id)
        if unread_only:
            stmt = stmt.where(Notification.read_at.is_(None))
        stmt = stmt.order_by(Notification.created_at.desc()).limit(limit).offset(offset)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def count_by_user(self, user_id: UUID) -> int:
        """Total notification count for a user."""
        result = await self.session.execute(
            select(func.count()).select_from(Notification).where(Notification.user_id == user_id)
        )
        return result.scalar_one()

    async def count_unread_by_user(self, user_id: UUID) -> int:
        """Unread notification count for a user."""
        result = await self.session.execute(
            select(func.count())
            .select_from(Notification)
            .where(
                and_(
                    Notification.user_id == user_id,
                    Notification.read_at.is_(None),
                )
            )
        )
        return result.scalar_one()

    async def mark_read(self, notification_ids: list[UUID], user_id: UUID) -> int:
        """
        Mark a batch of notifications as read.

        Returns the number of rows updated.
        """
        now = datetime.now(timezone.utc)
        result = await self.session.execute(
            update(Notification)
            .where(
                and_(
                    Notification.id.in_(notification_ids),
                    Notification.user_id == user_id,
                    Notification.read_at.is_(None),
                )
            )
            .values(read_at=now, status=NotificationStatus.read)
        )
        await self.session.commit()
        return result.rowcount

    async def mark_all_read(self, user_id: UUID) -> int:
        """Mark every unread notification for a user as read."""
        now = datetime.now(timezone.utc)
        result = await self.session.execute(
            update(Notification)
            .where(
                and_(
                    Notification.user_id == user_id,
                    Notification.read_at.is_(None),
                )
            )
            .values(read_at=now, status=NotificationStatus.read)
        )
        await self.session.commit()
        return result.rowcount

    async def update_status(
        self,
        notification_id: UUID,
        status: NotificationStatus,
        *,
        sent_at: Optional[datetime] = None,
        delivered_at: Optional[datetime] = None,
        failed_at: Optional[datetime] = None,
        failure_reason: Optional[str] = None,
    ) -> Notification | None:
        """Update the delivery status of a notification."""
        values: dict = {"status": status}
        if sent_at:
            values["sent_at"] = sent_at
        if delivered_at:
            values["delivered_at"] = delivered_at
        if failed_at:
            values["failed_at"] = failed_at
        if failure_reason:
            values["failure_reason"] = failure_reason

        await self.session.execute(
            update(Notification).where(Notification.id == notification_id).values(**values)
        )
        await self.session.commit()
        return await self.get_by_id(notification_id)

    async def delete(self, notification: Notification) -> None:
        await self.session.delete(notification)
        await self.session.commit()

    # ------------------------------------------------------------------
    # NotificationTemplate CRUD
    # ------------------------------------------------------------------

    async def get_template_by_type(
        self, notification_type: NotificationType
    ) -> NotificationTemplate | None:
        result = await self.session.execute(
            select(NotificationTemplate).where(
                NotificationTemplate.type == notification_type,
                NotificationTemplate.is_active.is_(True),
            )
        )
        return result.scalars().first()

    async def list_templates(self) -> list[NotificationTemplate]:
        result = await self.session.execute(select(NotificationTemplate))
        return list(result.scalars().all())

    async def create_template(self, template: NotificationTemplate) -> NotificationTemplate:
        self.session.add(template)
        await self.session.commit()
        await self.session.refresh(template)
        return template

    async def update_template(self, template: NotificationTemplate) -> NotificationTemplate:
        await self.session.commit()
        await self.session.refresh(template)
        return template

    async def delete_template(self, template: NotificationTemplate) -> None:
        await self.session.delete(template)
        await self.session.commit()

    # ------------------------------------------------------------------
    # ReminderSchedule CRUD
    # ------------------------------------------------------------------

    async def create_schedule(self, schedule: ReminderSchedule) -> ReminderSchedule:
        self.session.add(schedule)
        await self.session.commit()
        await self.session.refresh(schedule)
        return schedule

    async def get_schedule_by_id(self, schedule_id: UUID) -> ReminderSchedule | None:
        result = await self.session.execute(
            select(ReminderSchedule).where(ReminderSchedule.id == schedule_id)
        )
        return result.scalars().first()

    async def list_schedules_by_user(self, user_id: UUID) -> list[ReminderSchedule]:
        result = await self.session.execute(
            select(ReminderSchedule).where(ReminderSchedule.user_id == user_id)
        )
        return list(result.scalars().all())

    async def list_active_schedules(self) -> list[ReminderSchedule]:
        """Used by the scheduler job to fetch all active reminder schedules."""
        result = await self.session.execute(
            select(ReminderSchedule).where(ReminderSchedule.is_active.is_(True))
        )
        return list(result.scalars().all())

    async def update_schedule(self, schedule: ReminderSchedule) -> ReminderSchedule:
        await self.session.commit()
        await self.session.refresh(schedule)
        return schedule

    async def delete_schedule(self, schedule: ReminderSchedule) -> None:
        await self.session.delete(schedule)
        await self.session.commit()

    # ------------------------------------------------------------------
    # NotificationPreference CRUD
    # ------------------------------------------------------------------

    async def get_preference(self, user_id: UUID) -> NotificationPreference | None:
        result = await self.session.execute(
            select(NotificationPreference).where(NotificationPreference.user_id == user_id)
        )
        return result.scalars().first()

    async def upsert_preference(
        self, user_id: UUID, preference: NotificationPreference
    ) -> NotificationPreference:
        """Create preference if none exists, otherwise update in-place."""
        existing = await self.get_preference(user_id)
        if existing is None:
            self.session.add(preference)
            await self.session.commit()
            await self.session.refresh(preference)
            return preference
        # Update existing row
        for field, value in preference.__dict__.items():
            if field.startswith("_"):
                continue
            if field in ("id", "user_id", "created_at"):
                continue
            setattr(existing, field, value)
        await self.session.commit()
        await self.session.refresh(existing)
        return existing
