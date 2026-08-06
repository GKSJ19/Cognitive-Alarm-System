"""
Notification & Reminder System — Business logic service layer.

Responsibilities
----------------
1.  Dispatch notifications (in-app, push, email) with channel routing.
2.  Template rendering using simple string-format substitution.
3.  Quiet-hours enforcement before dispatching.
4.  Reminder schedule management (create / list / update / delete).
5.  Notification preference management.
6.  Batch mark-as-read.

Design decisions
----------------
* Channel adapters (push FCM, email SMTP) are thin stubs.  Real
  implementations would inject these as dependencies or use Celery tasks.
* Quiet-hours check is done in-process; a production system would move this
  to the scheduler/worker layer.
"""

from __future__ import annotations

import logging
from datetime import datetime, time, timezone
from typing import Any, Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import (
    NotificationChannel,
    NotificationPriority,
    NotificationStatus,
    NotificationType,
)
from app.models.notification import (
    Notification,
    NotificationPreference,
    NotificationTemplate,
    ReminderSchedule,
)
from app.repositories.notification_repository import NotificationRepository
from app.schemas.notification import (
    NotificationCreate,
    NotificationPreferenceUpdate,
    NotificationTemplateCreate,
    NotificationTemplateUpdate,
    ReminderScheduleCreate,
    ReminderScheduleUpdate,
)

logger = logging.getLogger(__name__)


class NotificationService:
    """
    Orchestrates all notification and reminder operations.

    Parameters
    ----------
    session : AsyncSession
        Active SQLAlchemy async session injected per-request.
    """

    def __init__(self, session: AsyncSession) -> None:
        self.repo = NotificationRepository(session)

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _render_template(self, template_body: str, variables: dict[str, Any]) -> str:
        """
        Simple mustache-style rendering: replaces {{key}} with values.

        Falls back gracefully if a key is missing.
        """
        result = template_body
        for key, value in variables.items():
            result = result.replace(f"{{{{{key}}}}}", str(value))
        return result

    async def _is_in_quiet_hours(
        self, user_id: UUID, priority: NotificationPriority
    ) -> bool:
        """
        Returns True if the notification should be suppressed because we are
        inside the user's configured quiet hours and the priority does not
        meet the minimum required.
        """
        pref = await self.repo.get_preference(user_id)
        if pref is None or pref.quiet_hours_start is None or pref.quiet_hours_end is None:
            return False

        now_time = datetime.now(timezone.utc).time().replace(tzinfo=None)
        start: time = pref.quiet_hours_start
        end: time = pref.quiet_hours_end

        # Handle ranges that cross midnight (e.g. 22:00 → 07:00)
        if start <= end:
            in_quiet = start <= now_time <= end
        else:
            in_quiet = now_time >= start or now_time <= end

        if not in_quiet:
            return False

        # Within quiet hours — check minimum priority threshold
        priority_rank = {
            NotificationPriority.low: 0,
            NotificationPriority.normal: 1,
            NotificationPriority.high: 2,
            NotificationPriority.critical: 3,
        }
        min_rank = priority_rank.get(pref.min_priority_during_quiet, 3)
        msg_rank = priority_rank.get(priority, 0)
        return msg_rank < min_rank

    async def _dispatch_channel(
        self,
        notification: Notification,
        pref: NotificationPreference | None,
    ) -> None:
        """
        Route the notification to the appropriate channel adapter.

        Stubs are used here; replace with real FCM / SMTP / webhook calls.
        """
        channel = notification.channel

        if channel == NotificationChannel.push:
            push_token = pref.push_token if pref else None
            if push_token:
                logger.info(
                    "PUSH stub: sending to token=%s  title=%s",
                    push_token[:10] + "…",
                    notification.title,
                )
                # TODO: await fcm_client.send(token=push_token, title=notification.title, body=notification.message)
            else:
                logger.warning(
                    "Push notification skipped: no push_token for user_id=%s", notification.user_id
                )

        elif channel == NotificationChannel.email:
            logger.info(
                "EMAIL stub: sending to user_id=%s  subject=%s",
                notification.user_id,
                notification.title,
            )
            # TODO: await smtp_client.send(to=user_email, subject=notification.title, body=notification.message)

        else:
            # in_app — already persisted in DB; no external dispatch needed
            logger.debug("In-app notification id=%s persisted.", notification.id)

    # ------------------------------------------------------------------
    # Notification dispatch
    # ------------------------------------------------------------------

    async def send_notification(self, payload: NotificationCreate) -> Notification:
        """
        Build, persist, and dispatch a single notification.

        Steps
        -----
        1.  Resolve the template if available.
        2.  Enforce quiet hours (skip if suppressed).
        3.  Persist the notification record (status=pending).
        4.  Call the channel adapter.
        5.  Update the status to sent.
        """
        # 1. Template resolution (optional)
        message = payload.message
        title = payload.title
        template = await self.repo.get_template_by_type(payload.type)
        if template:
            if template.title_template and not title:
                title = template.title_template
            message = self._render_template(template.body_template, {})

        # 2. Quiet-hours check
        if await self._is_in_quiet_hours(payload.user_id, payload.priority):
            logger.info(
                "Notification suppressed (quiet hours): user_id=%s type=%s",
                payload.user_id,
                payload.type,
            )
            # Persist as pending-scheduled; a worker will retry later
            notification = Notification(
                user_id=payload.user_id,
                type=payload.type,
                channel=payload.channel,
                priority=payload.priority,
                status=NotificationStatus.pending,
                title=title,
                message=message,
                action_url=payload.action_url,
                scheduled_at=payload.scheduled_at,
                delivery_meta=payload.delivery_meta,
            )
            return await self.repo.create(notification)

        # 3. Persist
        notification = Notification(
            user_id=payload.user_id,
            type=payload.type,
            channel=payload.channel,
            priority=payload.priority,
            status=NotificationStatus.pending,
            title=title,
            message=message,
            action_url=payload.action_url,
            scheduled_at=payload.scheduled_at,
            delivery_meta=payload.delivery_meta,
        )
        notification = await self.repo.create(notification)

        # 4. Dispatch
        pref = await self.repo.get_preference(payload.user_id)
        try:
            await self._dispatch_channel(notification, pref)
            sent_at = datetime.now(timezone.utc)
            notification = await self.repo.update_status(
                notification.id,
                NotificationStatus.sent,
                sent_at=sent_at,
            )
        except Exception as exc:
            logger.error("Notification dispatch failed: %s", exc, exc_info=True)
            await self.repo.update_status(
                notification.id,
                NotificationStatus.failed,
                failed_at=datetime.now(timezone.utc),
                failure_reason=str(exc),
            )
            raise

        return notification

    async def send_bulk_notifications(
        self, payloads: list[NotificationCreate]
    ) -> list[Notification]:
        """Dispatch multiple notifications in one call (e.g. platform-wide alert)."""
        results = []
        for payload in payloads:
            try:
                n = await self.send_notification(payload)
                results.append(n)
            except Exception:
                logger.error("Failed to send notification for user_id=%s", payload.user_id)
        return results

    # ------------------------------------------------------------------
    # Notification inbox (user-facing)
    # ------------------------------------------------------------------

    async def list_notifications(
        self,
        user_id: UUID,
        *,
        unread_only: bool = False,
        limit: int = 50,
        offset: int = 0,
    ) -> dict:
        items = await self.repo.list_by_user(
            user_id, unread_only=unread_only, limit=limit, offset=offset
        )
        total = await self.repo.count_by_user(user_id)
        unread = await self.repo.count_unread_by_user(user_id)
        return {"items": items, "total": total, "unread_count": unread}

    async def mark_read(self, user_id: UUID, notification_ids: list[UUID]) -> int:
        return await self.repo.mark_read(notification_ids, user_id)

    async def mark_all_read(self, user_id: UUID) -> int:
        return await self.repo.mark_all_read(user_id)

    async def get_notification(self, notification_id: UUID) -> Notification | None:
        return await self.repo.get_by_id(notification_id)

    async def delete_notification(self, user_id: UUID, notification_id: UUID) -> None:
        n = await self.repo.get_by_id(notification_id)
        if not n or str(n.user_id) != str(user_id):
            raise ValueError("Notification not found")
        await self.repo.delete(n)

    # ------------------------------------------------------------------
    # Notification Templates (admin)
    # ------------------------------------------------------------------

    async def create_template(
        self, payload: NotificationTemplateCreate
    ) -> NotificationTemplate:
        template = NotificationTemplate(
            type=payload.type,
            channel=payload.channel,
            title_template=payload.title_template,
            body_template=payload.body_template,
            variables=payload.variables,
            is_active=payload.is_active,
        )
        return await self.repo.create_template(template)

    async def list_templates(self) -> list[NotificationTemplate]:
        return await self.repo.list_templates()

    async def update_template(
        self, notification_type: NotificationType, payload: NotificationTemplateUpdate
    ) -> NotificationTemplate:
        template = await self.repo.get_template_by_type(notification_type)
        if not template:
            raise ValueError(f"Template for type '{notification_type}' not found")
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(template, field, value)
        return await self.repo.update_template(template)

    async def delete_template(self, notification_type: NotificationType) -> None:
        template = await self.repo.get_template_by_type(notification_type)
        if not template:
            raise ValueError(f"Template for type '{notification_type}' not found")
        await self.repo.delete_template(template)

    # ------------------------------------------------------------------
    # Reminder Schedules (user-facing)
    # ------------------------------------------------------------------

    async def create_reminder(
        self, user_id: UUID, payload: ReminderScheduleCreate
    ) -> ReminderSchedule:
        schedule = ReminderSchedule(
            user_id=user_id,
            type=payload.type,
            channel=payload.channel,
            remind_at_time=payload.remind_at_time,
            days_of_week=payload.days_of_week,
            is_active=payload.is_active,
        )
        return await self.repo.create_schedule(schedule)

    async def list_reminders(self, user_id: UUID) -> list[ReminderSchedule]:
        return await self.repo.list_schedules_by_user(user_id)

    async def update_reminder(
        self, user_id: UUID, schedule_id: UUID, payload: ReminderScheduleUpdate
    ) -> ReminderSchedule:
        schedule = await self.repo.get_schedule_by_id(schedule_id)
        if not schedule or str(schedule.user_id) != str(user_id):
            raise ValueError("Reminder schedule not found")
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(schedule, field, value)
        return await self.repo.update_schedule(schedule)

    async def delete_reminder(self, user_id: UUID, schedule_id: UUID) -> None:
        schedule = await self.repo.get_schedule_by_id(schedule_id)
        if not schedule or str(schedule.user_id) != str(user_id):
            raise ValueError("Reminder schedule not found")
        await self.repo.delete_schedule(schedule)

    # ------------------------------------------------------------------
    # Notification Preferences (user-facing)
    # ------------------------------------------------------------------

    async def get_preferences(self, user_id: UUID) -> NotificationPreference | None:
        return await self.repo.get_preference(user_id)

    async def update_preferences(
        self, user_id: UUID, payload: NotificationPreferenceUpdate
    ) -> NotificationPreference:
        existing = await self.repo.get_preference(user_id)
        if existing is None:
            # Bootstrap default preferences
            existing = NotificationPreference(user_id=user_id)
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(existing, field, value)
        return await self.repo.upsert_preference(user_id, existing)
