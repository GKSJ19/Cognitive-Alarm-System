"""
Analytics Service & Business Intelligence — SQLAlchemy ORM models.

Tables
------
* AnalyticsEvent   — raw event stream (append-only fact table)
* DailyUserStat    — pre-aggregated per-user daily KPIs (for personal dashboards)
* PlatformStat     — pre-aggregated platform-wide KPIs (for BI / admin dashboards)
* BiReport         — generated BI report artifacts (CSV / JSON exports)
"""

from sqlalchemy import (
    BigInteger,
    Column,
    Date,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    TIMESTAMP,
    text,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.models.base import Base
from app.models.enums import AnalyticsEventType, BiReportType


class AnalyticsEvent(Base):
    """
    Immutable event record — the raw event stream.

    Every significant user action (alarm dismissed, challenge passed, etc.)
    is appended here.  This table is intentionally denormalised:  it captures
    a snapshot of the context (`properties`) so historical queries remain
    accurate even when the source record is later updated or deleted.

    Design notes
    ------------
    * `user_id` is nullable to allow anonymous / system events.
    * `session_id` ties events from the same app-session together.
    * `properties` is an open JSONB bag for event-specific data.
    * The table has no UPDATE path — rows are never mutated.
    """

    __tablename__ = "analytics_events"

    id = Column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
    )
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    event_type = Column(Enum(AnalyticsEventType), nullable=False, index=True)

    # Optional grouping identifiers
    session_id = Column(UUID(as_uuid=True), nullable=True)
    alarm_id = Column(
        UUID(as_uuid=True),
        ForeignKey("alarms.id", ondelete="SET NULL"),
        nullable=True,
    )

    # Freeform event payload (challenge id, snooze count, duration, etc.)
    properties = Column(JSONB, nullable=True)

    # Client context
    platform = Column(String(30), nullable=True)    # "android" | "ios" | "web"
    app_version = Column(String(20), nullable=True)

    occurred_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
        index=True,
    )

    # Relationships (read-only; no back_populates needed on append-only table)
    user = relationship("User", foreign_keys=[user_id])


class DailyUserStat(Base):
    """
    Pre-aggregated per-user statistics rolled up once per UTC day.

    Written by the analytics worker (nightly cron or Celery beat).
    Indexed on (user_id, date) — one row per user per day.
    """

    __tablename__ = "daily_user_stats"

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
    date = Column(Date, nullable=False, index=True)

    # Wake-up metrics
    alarms_triggered = Column(Integer, nullable=False, server_default=text("0"))
    alarms_dismissed = Column(Integer, nullable=False, server_default=text("0"))
    alarms_snoozed = Column(Integer, nullable=False, server_default=text("0"))
    total_snooze_count = Column(Integer, nullable=False, server_default=text("0"))

    # Challenge metrics
    challenges_attempted = Column(Integer, nullable=False, server_default=text("0"))
    challenges_passed = Column(Integer, nullable=False, server_default=text("0"))
    challenges_failed = Column(Integer, nullable=False, server_default=text("0"))
    avg_challenge_duration_secs = Column(Numeric(8, 2), nullable=True)

    # Sleep metrics (sourced from sleep_logs)
    sleep_duration_mins = Column(Integer, nullable=True)
    sleep_quality_score = Column(Numeric(5, 2), nullable=True)

    # Habit / score metrics
    habit_score = Column(Numeric(5, 2), nullable=True)
    streak_days = Column(Integer, nullable=False, server_default=text("0"))

    # Notification engagement
    notifications_sent = Column(Integer, nullable=False, server_default=text("0"))
    notifications_read = Column(Integer, nullable=False, server_default=text("0"))

    created_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    user = relationship("User", back_populates="daily_stats")


class PlatformStat(Base):
    """
    Platform-wide aggregated KPIs — one row per UTC day.

    Computed by the BI aggregation job and exposed via the admin analytics
    dashboard.  Intentionally kept wide (many columns) so a single query
    can power multiple dashboard widgets without JOINs.
    """

    __tablename__ = "platform_stats"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    date = Column(Date, nullable=False, unique=True, index=True)

    # User activity
    total_registered_users = Column(BigInteger, nullable=False, server_default=text("0"))
    daily_active_users = Column(Integer, nullable=False, server_default=text("0"))
    weekly_active_users = Column(Integer, nullable=False, server_default=text("0"))
    new_signups = Column(Integer, nullable=False, server_default=text("0"))

    # Alarm statistics
    alarms_triggered_total = Column(Integer, nullable=False, server_default=text("0"))
    alarm_success_rate = Column(Numeric(5, 2), nullable=True)   # 0-100 %
    avg_snooze_count = Column(Numeric(5, 2), nullable=True)

    # Challenge statistics
    challenges_attempted_total = Column(Integer, nullable=False, server_default=text("0"))
    challenge_pass_rate = Column(Numeric(5, 2), nullable=True)   # 0-100 %

    # Sleep statistics
    avg_sleep_duration_mins = Column(Numeric(7, 2), nullable=True)

    # Habit / streak statistics
    avg_habit_score = Column(Numeric(5, 2), nullable=True)
    avg_streak_days = Column(Numeric(5, 2), nullable=True)

    # Notification statistics
    notifications_sent_total = Column(Integer, nullable=False, server_default=text("0"))
    notification_read_rate = Column(Numeric(5, 2), nullable=True)   # 0-100 %

    created_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )


class BiReport(Base):
    """
    Generated BI report artifacts.

    The analytics service writes the report file to object storage and records
    the signed URL here.  Admins or coaches can download the file via the API.
    `filters` stores the query parameters used to generate the report so the
    request can be replayed exactly.
    """

    __tablename__ = "bi_reports"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )
    requested_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    report_type = Column(Enum(BiReportType), nullable=False)
    title = Column(String(200), nullable=True)

    # Date range covered by the report
    period_start = Column(Date, nullable=True)
    period_end = Column(Date, nullable=True)

    # Applied filters (goal_type, difficulty, cohort, etc.)
    filters = Column(JSONB, nullable=True)

    # Output
    file_url = Column(Text, nullable=True)          # signed object-storage URL
    row_count = Column(Integer, nullable=True)       # rows in the export

    # Status
    status = Column(
        String(20),
        nullable=False,
        server_default="pending",
    )   # pending | running | completed | failed
    error_message = Column(Text, nullable=True)

    generated_at = Column(TIMESTAMP(timezone=True), nullable=True)
    created_at = Column(
        TIMESTAMP(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    requester = relationship("User", foreign_keys=[requested_by])
