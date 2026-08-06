"""
Notification & Reminder System — SQLAlchemy ORM models.

Tables
------
* Notification          — individual notification record per user per event
* NotificationTemplate  — reusable message templates for each NotificationType
* ReminderSchedule      — user-configured reminder schedules (bedtime, habit, etc.)
* NotificationPreference— per-user channel & quiet-hours preferences
"""

from sqlalchemy import (
    Boolean,
    Column,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    Time,
    TIMESTAMP,
    text,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.models.base import Base
from app.models.enums import (
    NotificationType,
    NotificationChannel,
    NotificationPriority,
    NotificationStatus,
)


class Notification(Base):
    """
    One row per notification dispatched to a user.

    Tracks the full lifecycle: pending → sent → delivered → read (or failed).
    Metadata such as FCM message-id or SMTP message-id is stored in
    `delivery_meta` as a JSONB blob so we never need schema migrations for
    provider-specific fields.
    """

    __tablename__ = "notifications"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    type = Column(Enum(NotificationType), nullable=False)
    channel = Column(
        Enum(NotificationChannel),
        nullable=False,
        server_default="in_app",
    )
    priority = Column(
        Enum(NotificationPriority),
        nullable=False,
        server_default="normal",
    )
    status = Column(
        Enum(NotificationStatus),
        nullable=False,
        server_default="pending",
    )

    # Human-readable content
    title = Column(String(200), nullable=True)
    message = Column(Text, nullable=False)

    # Optional deep-link for mobile (e.g. "alarm://123")
    action_url = Column(String(500), nullable=True)

    # Provider-specific delivery metadata (FCM message id, SMTP id, etc.)
    delivery_meta = Column(JSONB, nullable=True)

    # Timestamps
    scheduled_at = Column(TIMESTAMP(timezone=True), nullable=True)
    sent_at = Column(TIMESTAMP(timezone=True), nullable=True)
    delivered_at = Column(TIMESTAMP(timezone=True), nullable=True)
    read_at = Column(TIMESTAMP(timezone=True), nullable=True)
    failed_at = Column(TIMESTAMP(timezone=True), nullable=True)
    failure_reason = Column(Text, nullable=True)

    created_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    # Relationships
    user = relationship("User", back_populates="notifications")


class NotificationTemplate(Base):
    """
    Reusable message templates keyed by NotificationType.

    Supports simple Jinja2-style variable substitution in `title_template`
    and `body_template` (e.g. "Good morning, {{name}}!").
    Variables are documented in the `variables` JSONB field.
    """

    __tablename__ = "notification_templates"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    type = Column(Enum(NotificationType), nullable=False, unique=True)
    channel = Column(
        Enum(NotificationChannel),
        nullable=False,
        server_default="in_app",
    )

    title_template = Column(String(300), nullable=True)
    body_template = Column(Text, nullable=False)

    # JSON array of variable names expected in the templates
    # e.g. ["name", "streak_days"]
    variables = Column(JSONB, nullable=True)

    is_active = Column(Boolean, nullable=False, server_default=text("true"))
    created_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )
    updated_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )


class ReminderSchedule(Base):
    """
    User-level reminder schedule configuration.

    Each row represents one recurring reminder for a user (e.g. a nightly
    bedtime reminder at 22:00).  The scheduler service reads this table to
    enqueue the next notification.
    """

    __tablename__ = "reminder_schedules"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    type = Column(Enum(NotificationType), nullable=False)
    channel = Column(
        Enum(NotificationChannel),
        nullable=False,
        server_default="in_app",
    )

    # Local time at which the reminder fires (stored in user's timezone)
    remind_at_time = Column(Time, nullable=False)

    # Bitmask of ISO weekdays (1=Mon … 7=Sun); NULL means every day
    days_of_week = Column(String(20), nullable=True)

    is_active = Column(Boolean, nullable=False, server_default=text("true"))

    created_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )
    updated_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    # Relationships
    user = relationship("User", back_populates="reminder_schedules")


class NotificationPreference(Base):
    """
    Per-user notification preferences.

    Stores which channels the user wants and optional quiet-hours window
    (quiet_start … quiet_end in the user's local time).
    """

    __tablename__ = "notification_preferences"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,  # one preference row per user
    )

    # Which channels are enabled
    in_app_enabled = Column(Boolean, nullable=False, server_default=text("true"))
    push_enabled = Column(Boolean, nullable=False, server_default=text("true"))
    email_enabled = Column(Boolean, nullable=False, server_default=text("false"))

    # Device push token (FCM / APNs)
    push_token = Column(Text, nullable=True)

    # Quiet hours (no notifications dispatched outside unless priority=critical)
    quiet_hours_start = Column(Time, nullable=True)
    quiet_hours_end = Column(Time, nullable=True)

    # Minimum priority to receive while in quiet hours
    min_priority_during_quiet = Column(
        Enum(NotificationPriority),
        nullable=False,
        server_default="critical",
    )

    created_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )
    updated_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    # Relationships
    user = relationship("User", back_populates="notification_preference")
