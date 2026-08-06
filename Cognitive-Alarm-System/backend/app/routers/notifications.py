"""
Notification & Reminder System — FastAPI router.

Endpoints
---------
User-facing
  GET    /api/notifications/               — inbox list (supports ?unread_only)
  GET    /api/notifications/{id}           — single notification
  POST   /api/notifications/mark-read      — batch mark-as-read
  POST   /api/notifications/mark-all-read  — mark all as read
  DELETE /api/notifications/{id}           — delete notification

Reminder schedules (user-facing)
  POST   /api/notifications/reminders/           — create schedule
  GET    /api/notifications/reminders/           — list user schedules
  PUT    /api/notifications/reminders/{id}       — update schedule
  DELETE /api/notifications/reminders/{id}       — delete schedule

Notification preferences (user-facing)
  GET    /api/notifications/preferences          — get preferences
  PATCH  /api/notifications/preferences          — update preferences

Admin
  GET    /api/notifications/templates/           — list templates
  POST   /api/notifications/templates/           — create template
  PUT    /api/notifications/templates/{type}     — update template
  DELETE /api/notifications/templates/{type}     — delete template
  POST   /api/notifications/send                 — admin dispatch notification
"""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.database import get_session
from app.models.enums import NotificationType
from app.schemas.notification import (
    NotificationCreate,
    NotificationListOut,
    NotificationMarkRead,
    NotificationOut,
    NotificationPreferenceOut,
    NotificationPreferenceUpdate,
    NotificationTemplateCreate,
    NotificationTemplateOut,
    NotificationTemplateUpdate,
    ReminderScheduleCreate,
    ReminderScheduleOut,
    ReminderScheduleUpdate,
)
from app.services.notification_service import NotificationService

router = APIRouter()


# ---------------------------------------------------------------------------
# Inbox
# ---------------------------------------------------------------------------


@router.get(
    "/",
    response_model=NotificationListOut,
    summary="Get notification inbox",
)
async def list_notifications(
    unread_only: bool = Query(False, description="Return only unread notifications"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """Return the authenticated user's notification inbox, newest-first."""
    svc = NotificationService(session)
    result = await svc.list_notifications(
        current_user.id, unread_only=unread_only, limit=limit, offset=offset
    )
    return result


@router.get(
    "/{notification_id}",
    response_model=NotificationOut,
    summary="Get a single notification",
)
async def get_notification(
    notification_id: UUID,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    svc = NotificationService(session)
    n = await svc.get_notification(notification_id)
    if not n or str(n.user_id) != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    return n


@router.post(
    "/mark-read",
    summary="Batch mark notifications as read",
)
async def mark_read(
    payload: NotificationMarkRead,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    svc = NotificationService(session)
    updated = await svc.mark_read(current_user.id, payload.ids)
    return {"detail": f"{updated} notification(s) marked as read"}


@router.post(
    "/mark-all-read",
    summary="Mark all notifications as read",
)
async def mark_all_read(
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    svc = NotificationService(session)
    updated = await svc.mark_all_read(current_user.id)
    return {"detail": f"{updated} notification(s) marked as read"}


@router.delete(
    "/{notification_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a notification",
)
async def delete_notification(
    notification_id: UUID,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    svc = NotificationService(session)
    try:
        await svc.delete_notification(current_user.id, notification_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")


# ---------------------------------------------------------------------------
# Reminder schedules
# ---------------------------------------------------------------------------


@router.post(
    "/reminders/",
    response_model=ReminderScheduleOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a reminder schedule",
)
async def create_reminder(
    payload: ReminderScheduleCreate,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    svc = NotificationService(session)
    return await svc.create_reminder(current_user.id, payload)


@router.get(
    "/reminders/",
    response_model=list[ReminderScheduleOut],
    summary="List reminder schedules",
)
async def list_reminders(
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    svc = NotificationService(session)
    return await svc.list_reminders(current_user.id)


@router.put(
    "/reminders/{schedule_id}",
    response_model=ReminderScheduleOut,
    summary="Update a reminder schedule",
)
async def update_reminder(
    schedule_id: UUID,
    payload: ReminderScheduleUpdate,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    svc = NotificationService(session)
    try:
        return await svc.update_reminder(current_user.id, schedule_id, payload)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder schedule not found")


@router.delete(
    "/reminders/{schedule_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a reminder schedule",
)
async def delete_reminder(
    schedule_id: UUID,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    svc = NotificationService(session)
    try:
        await svc.delete_reminder(current_user.id, schedule_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reminder schedule not found")


# ---------------------------------------------------------------------------
# Notification preferences
# ---------------------------------------------------------------------------


@router.get(
    "/preferences",
    response_model=NotificationPreferenceOut,
    summary="Get notification preferences",
)
async def get_preferences(
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    svc = NotificationService(session)
    pref = await svc.get_preferences(current_user.id)
    if pref is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification preferences not configured yet. Use PATCH to set them.",
        )
    return pref


@router.patch(
    "/preferences",
    response_model=NotificationPreferenceOut,
    summary="Update notification preferences",
)
async def update_preferences(
    payload: NotificationPreferenceUpdate,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    svc = NotificationService(session)
    return await svc.update_preferences(current_user.id, payload)


# ---------------------------------------------------------------------------
# Admin — notification templates
# ---------------------------------------------------------------------------


@router.get(
    "/templates/",
    response_model=list[NotificationTemplateOut],
    summary="[Admin] List notification templates",
)
async def list_templates(
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    svc = NotificationService(session)
    return await svc.list_templates()


@router.post(
    "/templates/",
    response_model=NotificationTemplateOut,
    status_code=status.HTTP_201_CREATED,
    summary="[Admin] Create a notification template",
)
async def create_template(
    payload: NotificationTemplateCreate,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    svc = NotificationService(session)
    return await svc.create_template(payload)


@router.put(
    "/templates/{notification_type}",
    response_model=NotificationTemplateOut,
    summary="[Admin] Update a notification template",
)
async def update_template(
    notification_type: NotificationType,
    payload: NotificationTemplateUpdate,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    svc = NotificationService(session)
    try:
        return await svc.update_template(notification_type, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.delete(
    "/templates/{notification_type}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="[Admin] Delete a notification template",
)
async def delete_template(
    notification_type: NotificationType,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    svc = NotificationService(session)
    try:
        await svc.delete_template(notification_type)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


# ---------------------------------------------------------------------------
# Admin — manual dispatch
# ---------------------------------------------------------------------------


@router.post(
    "/send",
    response_model=NotificationOut,
    status_code=status.HTTP_201_CREATED,
    summary="[Admin] Manually dispatch a notification",
)
async def send_notification(
    payload: NotificationCreate,
    session: AsyncSession = Depends(get_session),
    current_user=Depends(get_current_user),
):
    """
    Admin endpoint to send an arbitrary notification to any user.

    In production, add a role guard: require UserRole.admin.
    """
    svc = NotificationService(session)
    return await svc.send_notification(payload)
