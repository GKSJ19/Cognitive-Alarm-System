"""
Behavioral Analytics Engine
============================

Computes daily, weekly, and monthly behavioural metrics from raw alarm /
challenge / snooze data.  All functions are **pure** — they accept lists
of data-class records and return computed dictionaries.

Metrics computed:

  • Wake-up consistency   — % of days the user woke within ±15 min of alarm
  • Average wake-up delay — mean minutes between alarm fire and dismissal
  • Average snooze count  — mean snoozes per alarm event
  • Sleep schedule adherence — % of nights bedtime was within ±30 min of target
  • Challenge success rate — % of challenges answered correctly
  • Daily productivity score — composite of the above metrics
  • Weekly trends           — aggregated per ISO-week
  • Monthly trends          — aggregated per calendar month
"""

from __future__ import annotations

import logging
from collections import defaultdict
from dataclasses import dataclass
from datetime import date
from typing import Any

import numpy as np

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Data containers for raw input records
# ---------------------------------------------------------------------------
@dataclass
class AlarmEvent:
    """Represents a single alarm fire + dismissal event."""

    event_date: date
    alarm_time_minutes: int       # scheduled alarm (minutes since midnight)
    wake_time_minutes: int        # actual wake (minutes since midnight)
    snooze_count: int = 0
    sleep_duration_hours: float = 0.0
    bedtime_minutes: int = 0      # actual bedtime (minutes since midnight)
    target_bedtime_minutes: int = 0  # target bedtime


@dataclass
class ChallengeEvent:
    """Represents a single challenge attempt."""

    event_date: date
    is_successful: bool = False
    completion_time_seconds: float = 0.0
    difficulty: str = "medium"


# ---------------------------------------------------------------------------
# Pure metric functions (reusable)
# ---------------------------------------------------------------------------

def calc_wake_up_consistency(
    events: list[AlarmEvent], tolerance_minutes: int = 15
) -> float:
    """Percentage of alarm events where the user woke within ±tolerance of alarm. Returns 0.0–100.0."""
    if not events:
        return 0.0
    on_time = sum(
        1 for e in events
        if abs(e.wake_time_minutes - e.alarm_time_minutes) <= tolerance_minutes
    )
    return round(on_time / len(events) * 100, 2)


def calc_avg_wake_up_delay(events: list[AlarmEvent]) -> float:
    """Average delay in minutes between alarm time and actual wake time."""
    if not events:
        return 0.0
    delays = [max(0, e.wake_time_minutes - e.alarm_time_minutes) for e in events]
    return round(float(np.mean(delays)), 2)


def calc_avg_snooze_count(events: list[AlarmEvent]) -> float:
    """Average number of snoozes per alarm event."""
    if not events:
        return 0.0
    return round(float(np.mean([e.snooze_count for e in events])), 2)


def calc_sleep_schedule_adherence(
    events: list[AlarmEvent], tolerance_minutes: int = 30
) -> float:
    """Percentage of nights the user went to bed within ±tolerance of target. Returns 0.0–100.0."""
    applicable = [e for e in events if e.target_bedtime_minutes > 0]
    if not applicable:
        return 0.0
    on_schedule = sum(
        1 for e in applicable
        if abs(e.bedtime_minutes - e.target_bedtime_minutes) <= tolerance_minutes
    )
    return round(on_schedule / len(applicable) * 100, 2)


def calc_challenge_success_rate(events: list[ChallengeEvent]) -> float:
    """Percentage of challenges answered correctly (0–100)."""
    if not events:
        return 0.0
    successes = sum(1 for e in events if e.is_successful)
    return round(successes / len(events) * 100, 2)


def calc_avg_challenge_time(events: list[ChallengeEvent]) -> float:
    """Average challenge completion time in seconds."""
    if not events:
        return 0.0
    return round(float(np.mean([e.completion_time_seconds for e in events])), 2)


def calc_avg_sleep_duration(events: list[AlarmEvent]) -> float:
    """Average sleep duration in hours."""
    applicable = [e for e in events if e.sleep_duration_hours > 0]
    if not applicable:
        return 0.0
    return round(float(np.mean([e.sleep_duration_hours for e in applicable])), 2)


def calc_daily_productivity_score(
    wake_consistency: float,
    challenge_success: float,
    snooze_reduction: float,
    sleep_adherence: float,
) -> float:
    """
    Composite daily productivity score (0–100).
    Uses the same weighting as the habit score for consistency:
        35 % consistency + 25 % challenge + 20 % snooze + 20 % sleep
    """
    score = (
        0.35 * wake_consistency
        + 0.25 * challenge_success
        + 0.20 * snooze_reduction
        + 0.20 * sleep_adherence
    )
    return round(max(0.0, min(100.0, score)), 2)


def detect_trend(values: list[float]) -> str:
    """Detect whether a series of values is trending up, down, or stable."""
    if len(values) < 3:
        return "stable"
    x = np.arange(len(values), dtype=float)
    y = np.array(values, dtype=float)
    slope = float(np.polyfit(x, y, 1)[0])
    if slope > 0.5:
        return "up"
    if slope < -0.5:
        return "down"
    return "stable"


# ---------------------------------------------------------------------------
# Engine class
# ---------------------------------------------------------------------------
class BehavioralAnalyticsEngine:
    """
    Computes all behavioural analytics from raw event data.

    Usage::

        engine = BehavioralAnalyticsEngine()
        daily = engine.compute_daily(alarm_events, challenge_events, target_date)
        weekly = engine.compute_weekly_trends(alarm_events, challenge_events)
        monthly = engine.compute_monthly_trends(alarm_events, challenge_events)
    """

    def compute_daily(
        self,
        alarm_events: list[AlarmEvent],
        challenge_events: list[ChallengeEvent],
        target_date: date | None = None,
    ) -> dict[str, Any]:
        """Compute analytics for a single day."""
        if target_date:
            alarms = [e for e in alarm_events if e.event_date == target_date]
            challenges = [e for e in challenge_events if e.event_date == target_date]
        else:
            alarms = alarm_events
            challenges = challenge_events

        wake_consistency = calc_wake_up_consistency(alarms)
        avg_delay = calc_avg_wake_up_delay(alarms)
        avg_snooze = calc_avg_snooze_count(alarms)
        sleep_adherence = calc_sleep_schedule_adherence(alarms)
        challenge_rate = calc_challenge_success_rate(challenges)
        avg_challenge_time = calc_avg_challenge_time(challenges)
        avg_sleep = calc_avg_sleep_duration(alarms)

        # Normalise snooze reduction: 0 snoozes = 100, ≥ 10 = 0
        snooze_reduction = max(0.0, min(100.0, (1 - avg_snooze / 10) * 100))

        productivity = calc_daily_productivity_score(
            wake_consistency, challenge_rate, snooze_reduction, sleep_adherence
        )

        return {
            "analytics_date": target_date,
            "wake_up_consistency": wake_consistency,
            "avg_wake_up_delay_minutes": avg_delay,
            "avg_snooze_count": avg_snooze,
            "sleep_schedule_adherence": sleep_adherence,
            "challenge_success_rate": challenge_rate,
            "daily_productivity_score": productivity,
            "avg_sleep_duration_hours": avg_sleep,
            "total_snooze_count": sum(e.snooze_count for e in alarms),
            "total_challenges_attempted": len(challenges),
            "total_challenges_successful": sum(1 for c in challenges if c.is_successful),
            "avg_challenge_completion_time": avg_challenge_time,
        }

    def compute_weekly_trends(
        self,
        alarm_events: list[AlarmEvent],
        challenge_events: list[ChallengeEvent],
        weeks: int = 4,
    ) -> list[dict[str, Any]]:
        """Compute weekly aggregated trends for the past *weeks* weeks."""
        if not alarm_events and not challenge_events:
            return []

        alarm_by_week: dict[tuple[int, int], list[AlarmEvent]] = defaultdict(list)
        challenge_by_week: dict[tuple[int, int], list[ChallengeEvent]] = defaultdict(list)

        for e in alarm_events:
            key = e.event_date.isocalendar()[:2]
            alarm_by_week[key].append(e)
        for e in challenge_events:
            key = e.event_date.isocalendar()[:2]
            challenge_by_week[key].append(e)

        all_weeks = sorted(set(alarm_by_week.keys()) | set(challenge_by_week.keys()))
        all_weeks = all_weeks[-weeks:]

        results = []
        for wk in all_weeks:
            a_events = alarm_by_week.get(wk, [])
            c_events = challenge_by_week.get(wk, [])
            daily = self.compute_daily(a_events, c_events)

            dates = [e.event_date for e in a_events]
            c_dates = [e.event_date for e in c_events]
            all_dates = dates + c_dates
            week_start = min(all_dates) if all_dates else date.today()
            week_end = max(all_dates) if all_dates else date.today()

            results.append({
                "week_start": week_start.isoformat(),
                "week_end": week_end.isoformat(),
                "avg_habit_score": daily["daily_productivity_score"],
                "avg_consistency": daily["wake_up_consistency"],
                "avg_challenge_accuracy": daily["challenge_success_rate"],
                "avg_snooze_count": daily["avg_snooze_count"],
                "total_challenges": daily["total_challenges_attempted"],
            })

        return results

    def compute_monthly_trends(
        self,
        alarm_events: list[AlarmEvent],
        challenge_events: list[ChallengeEvent],
        months: int = 3,
    ) -> list[dict[str, Any]]:
        """Compute monthly aggregated trends for the past *months* months."""
        if not alarm_events and not challenge_events:
            return []

        alarm_by_month: dict[str, list[AlarmEvent]] = defaultdict(list)
        challenge_by_month: dict[str, list[ChallengeEvent]] = defaultdict(list)

        for e in alarm_events:
            key = e.event_date.strftime("%Y-%m")
            alarm_by_month[key].append(e)
        for e in challenge_events:
            key = e.event_date.strftime("%Y-%m")
            challenge_by_month[key].append(e)

        all_months = sorted(set(alarm_by_month.keys()) | set(challenge_by_month.keys()))
        all_months = all_months[-months:]

        results = []
        for mo in all_months:
            a_events = alarm_by_month.get(mo, [])
            c_events = challenge_by_month.get(mo, [])
            daily = self.compute_daily(a_events, c_events)

            results.append({
                "month": mo,
                "avg_habit_score": daily["daily_productivity_score"],
                "avg_consistency": daily["wake_up_consistency"],
                "avg_challenge_accuracy": daily["challenge_success_rate"],
                "avg_snooze_count": daily["avg_snooze_count"],
                "total_challenges": daily["total_challenges_attempted"],
            })

        return results

    def detect_snooze_trend(self, alarm_events: list[AlarmEvent]) -> str:
        """Detect snooze usage trend from daily data."""
        if len(alarm_events) < 3:
            return "stable"
        daily_snooze: dict[date, list[int]] = defaultdict(list)
        for e in alarm_events:
            daily_snooze[e.event_date].append(e.snooze_count)

        daily_avg = [
            float(np.mean(counts))
            for _, counts in sorted(daily_snooze.items())
        ]
        return detect_trend(daily_avg)

    def detect_accuracy_trend(self, challenge_events: list[ChallengeEvent]) -> str:
        """Detect challenge accuracy trend from daily data."""
        if len(challenge_events) < 3:
            return "stable"
        daily_acc: dict[date, list[int]] = defaultdict(list)
        for e in challenge_events:
            daily_acc[e.event_date].append(1 if e.is_successful else 0)

        daily_rates = [
            float(np.mean(vals)) * 100
            for _, vals in sorted(daily_acc.items())
        ]
        return detect_trend(daily_rates)
