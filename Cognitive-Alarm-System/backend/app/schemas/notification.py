"""
Pydantic schemas for the Notification & Reminder System.
"""

from __future__ import annotations

from datetime import datetime, time
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import (
    NotificationChannel,
    NotificationPriority,
    NotificationStatus,
    NotificationType,
)


class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    type: NotificationType
    channel: NotificationChannel
    priority: NotificationPriority
    status: NotificationStatus
    title: Optional[str]
    message: str
    action_url: Optional[str]
    scheduled_at: Optional[datetime]
    sent_at: Optional[datetime]
    delivered_at: Optional[datetime]
    read_at: Optional[datetime]
    created_at: datetime


class NotificationListOut(BaseModel):
    items: list[NotificationOut]
    total: int
    unread_count: int


class NotificationMarkRead(BaseModel):
    ids: list[UUID] = Field(..., min_length=1, description="Notification IDs to mark as read")


class NotificationCreate(BaseModel):
    user_id: UUID
    type: NotificationType
    channel: NotificationChannel = NotificationChannel.in_app
    priority: NotificationPriority = NotificationPriority.normal
    title: Optional[str] = None
    message: str
    action_url: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    delivery_meta: Optional[dict[str, Any]] = None


class NotificationTemplateCreate(BaseModel):
    type: NotificationType
    channel: NotificationChannel = NotificationChannel.in_app
    title_template: Optional[str] = None
    body_template: str
    variables: Optional[list[str]] = None
    is_active: bool = True


class NotificationTemplateUpdate(BaseModel):
    title_template: Optional[str] = None
    body_template: Optional[str] = None
    variables: Optional[list[str]] = None
    is_active: Optional[bool] = None


class NotificationTemplateOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    type: NotificationType
    channel: NotificationChannel
    title_template: Optional[str]
    body_template: str
    variables: Optional[list[str]]
    is_active: bool
    created_at: datetime
    updated_at: datetime


class ReminderScheduleCreate(BaseModel):
    type: NotificationType
    channel: NotificationChannel = NotificationChannel.in_app
    remind_at_time: time = Field(..., description="Local time for the reminder, e.g. 22:00:00")
    days_of_week: Optional[str] = Field(
        None,
        description="Comma-separated ISO weekdays (1=Mon…7=Sun). Null means every day.",
    )
    is_active: bool = True


class ReminderScheduleUpdate(BaseModel):
    remind_at_time: Optional[time] = None
    days_of_week: Optional[str] = None
    is_active: Optional[bool] = None


class ReminderScheduleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    type: NotificationType
    channel: NotificationChannel
    remind_at_time: time
    days_of_week: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime


class NotificationPreferenceUpdate(BaseModel):
    in_app_enabled: Optional[bool] = None
    push_enabled: Optional[bool] = None
    email_enabled: Optional[bool] = None
    push_token: Optional[str] = None
    quiet_hours_start: Optional[time] = None
    quiet_hours_end: Optional[time] = None
    min_priority_during_quiet: Optional[NotificationPriority] = None


class NotificationPreferenceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    in_app_enabled: bool
    push_enabled: bool
    email_enabled: bool
    push_token: Optional[str]
    quiet_hours_start: Optional[time]
    quiet_hours_end: Optional[time]
    min_priority_during_quiet: NotificationPriority
    created_at: datetime
    updated_at: datetime
