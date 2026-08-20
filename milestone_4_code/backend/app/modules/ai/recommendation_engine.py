"""
Recommendation Engine
=====================

Generates personalised recommendations dynamically using a **rule-based**
system.  Each rule inspects a user's aggregated metrics and, if its
condition is met, emits a recommendation with a title, description,
category, and priority.

Rules
-----
| ID   | Condition                    | Recommendation                          |
|------|------------------------------|-----------------------------------------|
| R001 | snooze_count > 5             | Recommend earlier bedtime               |
| R002 | challenge_accuracy < 50 %    | Recommend easier difficulty             |
| R003 | wake_up_consistency > 90 %   | Recommend increasing challenge level    |
| R004 | sleep_duration < 6 hours     | Recommend increasing sleep duration     |
| R005 | wake_up_consistency < 50 %   | Recommend consistent alarm times        |
| R006 | snooze trending up           | Place alarm further from bed            |
| R007 | accuracy trending up         | Congratulate; suggest harder challenges |
| R008 | sleep_duration > 9 hours     | Recommend optimising sleep schedule     |
| R009 | challenge_time > 90 s avg    | Recommend practice sessions             |
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Data containers
# ---------------------------------------------------------------------------
@dataclass
class UserMetricsSnapshot:
    """Aggregated user metrics that the rules evaluate against."""

    avg_snooze_count: float = 0.0
    challenge_accuracy_pct: float = 0.0        # 0-100
    wake_up_consistency_pct: float = 0.0       # 0-100
    avg_sleep_duration_hours: float = 7.0
    avg_challenge_time_seconds: float = 0.0
    snooze_trend: str = "stable"               # "up", "down", "stable"
    accuracy_trend: str = "stable"             # "up", "down", "stable"
    current_difficulty: str = "medium"


@dataclass
class RecommendationItem:
    """A single recommendation emitted by a rule."""

    rule_id: str
    title: str
    description: str
    category: str       # sleep | challenge | snooze | consistency
    priority: str       # low | medium | high | critical


# ---------------------------------------------------------------------------
# Rule definitions
# ---------------------------------------------------------------------------
_RULES: list[dict[str, Any]] = [
    {
        "id": "R001",
        "condition": lambda m: m.avg_snooze_count > 5,
        "title": "Try Going to Bed Earlier",
        "description": (
            "Your average snooze count is above 5. This often indicates "
            "insufficient sleep. Try moving your bedtime 30 minutes earlier "
            "to wake up feeling more refreshed."
        ),
        "category": "sleep",
        "priority": "high",
    },
    {
        "id": "R002",
        "condition": lambda m: m.challenge_accuracy_pct < 50,
        "title": "Consider an Easier Difficulty",
        "description": (
            "Your challenge accuracy is below 50 %. Reducing the difficulty "
            "will help build confidence and gradually improve your cognitive "
            "performance in the morning."
        ),
        "category": "challenge",
        "priority": "medium",
    },
    {
        "id": "R003",
        "condition": lambda m: m.wake_up_consistency_pct > 90,
        "title": "Ready for a Tougher Challenge!",
        "description": (
            "Fantastic consistency — you've been waking up on time over 90 % "
            "of the time! Consider increasing your challenge difficulty to "
            "keep your brain sharp."
        ),
        "category": "challenge",
        "priority": "low",
    },
    {
        "id": "R004",
        "condition": lambda m: m.avg_sleep_duration_hours < 6,
        "title": "Increase Your Sleep Duration",
        "description": (
            "You're averaging less than 6 hours of sleep. Adults need 7–9 "
            "hours for optimal cognitive function. Try setting an earlier "
            "bedtime alarm."
        ),
        "category": "sleep",
        "priority": "critical",
    },
    {
        "id": "R005",
        "condition": lambda m: m.wake_up_consistency_pct < 50,
        "title": "Set Consistent Alarm Times",
        "description": (
            "Your wake-up consistency is below 50 %. Setting the same alarm "
            "time every day — including weekends — helps regulate your "
            "circadian rhythm and makes mornings easier."
        ),
        "category": "consistency",
        "priority": "high",
    },
    {
        "id": "R006",
        "condition": lambda m: m.snooze_trend == "up",
        "title": "Place Your Alarm Further Away",
        "description": (
            "Your snooze usage has been trending upward. Placing your phone "
            "or alarm clock across the room forces you to physically get up, "
            "reducing the temptation to snooze."
        ),
        "category": "snooze",
        "priority": "medium",
    },
    {
        "id": "R007",
        "condition": lambda m: m.accuracy_trend == "up" and m.challenge_accuracy_pct > 70,
        "title": "Great Progress — Level Up!",
        "description": (
            "Your challenge accuracy has been steadily improving. "
            "Consider stepping up to a harder difficulty to maintain "
            "the cognitive benefit of your morning challenges."
        ),
        "category": "challenge",
        "priority": "low",
    },
    {
        "id": "R008",
        "condition": lambda m: m.avg_sleep_duration_hours > 9,
        "title": "Optimise Your Sleep Schedule",
        "description": (
            "You're sleeping more than 9 hours on average. While rest is "
            "important, oversleeping can cause grogginess. Try setting a "
            "consistent wake-up time to find your optimal sleep window."
        ),
        "category": "sleep",
        "priority": "low",
    },
    {
        "id": "R009",
        "condition": lambda m: m.avg_challenge_time_seconds > 90,
        "title": "Practice Makes Perfect",
        "description": (
            "Your average challenge completion time exceeds 90 seconds. "
            "Try doing a few practice challenges before bed to sharpen "
            "your skills and speed up your morning routine."
        ),
        "category": "challenge",
        "priority": "medium",
    },
]


# ---------------------------------------------------------------------------
# Engine
# ---------------------------------------------------------------------------
class RecommendationEngine:
    """
    Stateless rule-based recommendation engine.

    Usage::

        engine = RecommendationEngine()
        snapshot = UserMetricsSnapshot(avg_snooze_count=6, ...)
        recs = engine.generate(snapshot)
        # recs == [RecommendationItem(rule_id="R001", ...)]
    """

    def __init__(self, rules: list[dict[str, Any]] | None = None):
        self._rules = rules or _RULES

    def generate(
        self,
        metrics: UserMetricsSnapshot,
        *,
        exclude_rule_ids: set[str] | None = None,
    ) -> list[RecommendationItem]:
        """
        Evaluate all rules against the given metrics.

        Parameters
        ----------
        metrics : UserMetricsSnapshot
            Current aggregated metrics for the user.
        exclude_rule_ids : set[str], optional
            Rule IDs to skip (e.g. already-active recommendations).

        Returns
        -------
        list[RecommendationItem]
            Recommendations sorted by priority (critical → low).
        """
        exclude = exclude_rule_ids or set()
        results: list[RecommendationItem] = []

        for rule in self._rules:
            if rule["id"] in exclude:
                continue
            try:
                if rule["condition"](metrics):
                    results.append(
                        RecommendationItem(
                            rule_id=rule["id"],
                            title=rule["title"],
                            description=rule["description"],
                            category=rule["category"],
                            priority=rule["priority"],
                        )
                    )
            except Exception:
                logger.exception("Error evaluating rule %s", rule["id"])

        # Sort by priority: critical > high > medium > low
        priority_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
        results.sort(key=lambda r: priority_order.get(r.priority, 99))

        return results

    @property
    def rule_ids(self) -> list[str]:
        """Return all registered rule IDs."""
        return [r["id"] for r in self._rules]
