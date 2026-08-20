"""
Habit Scoring Engine
====================

Implements the exact scoring formula:

    Habit Score =   35 % × Wake-up Consistency
                  + 25 % × Challenge Completion Success
                  + 20 % × Snooze Reduction
                  + 20 % × Sleep Schedule Adherence

Each sub-metric is normalised to 0–100 before weighting.
The final score is clamped to [0, 100].

All functions are **pure** and **reusable** — they accept raw metric values
and return computed results without side-effects or DB access.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

# ---------------------------------------------------------------------------
# Weights (must sum to 1.0)
# ---------------------------------------------------------------------------
WEIGHT_WAKE_UP_CONSISTENCY = 0.35
WEIGHT_CHALLENGE_SUCCESS = 0.25
WEIGHT_SNOOZE_REDUCTION = 0.20
WEIGHT_SLEEP_ADHERENCE = 0.20

# Snooze normalisation: consider 0 snoozes = 100 % reduction,
#                        ≥ MAX_SNOOZE_BASELINE = 0 % reduction
MAX_SNOOZE_BASELINE = 10  # snoozes per 30-day window considered "worst"


# ---------------------------------------------------------------------------
# Data container
# ---------------------------------------------------------------------------
@dataclass
class HabitMetrics:
    """Raw metrics fed into the scoring engine."""

    wake_up_consistency_pct: float = 0.0   # 0–100
    challenge_success_pct: float = 0.0     # 0–100
    avg_snooze_count: float = 0.0          # raw average snoozes per day
    sleep_adherence_pct: float = 0.0       # 0–100


# ---------------------------------------------------------------------------
# Reusable scoring functions
# ---------------------------------------------------------------------------

def normalise_snooze_reduction(avg_snooze: float) -> float:
    """
    Convert average daily snooze count to a 0–100 *reduction* score.

    0 snoozes → 100 (perfect)
    MAX_SNOOZE_BASELINE or more → 0 (worst)
    """
    if avg_snooze <= 0:
        return 100.0
    if avg_snooze >= MAX_SNOOZE_BASELINE:
        return 0.0
    return round((1 - avg_snooze / MAX_SNOOZE_BASELINE) * 100, 2)


def compute_weighted_component(raw_score: float, weight: float) -> float:
    """Apply a weight to a normalised (0–100) raw score."""
    return round(raw_score * weight, 2)


def compute_habit_score(metrics: HabitMetrics) -> dict[str, Any]:
    """
    Compute the habit score and full breakdown.

    Parameters
    ----------
    metrics : HabitMetrics
        Raw (0–100) metrics for each dimension.

    Returns
    -------
    dict with keys:
        total_score                    : float  (0–100)
        wake_up_consistency_raw        : float
        challenge_success_raw          : float
        snooze_reduction_raw           : float
        sleep_adherence_raw            : float
        wake_up_consistency_weighted   : float
        challenge_success_weighted     : float
        snooze_reduction_weighted      : float
        sleep_adherence_weighted       : float
    """
    # Normalise snooze from raw count to a 0–100 reduction score
    snooze_raw = normalise_snooze_reduction(metrics.avg_snooze_count)

    # Clamp inputs to 0–100
    consistency_raw = max(0.0, min(100.0, metrics.wake_up_consistency_pct))
    challenge_raw = max(0.0, min(100.0, metrics.challenge_success_pct))
    adherence_raw = max(0.0, min(100.0, metrics.sleep_adherence_pct))

    # Weighted contributions
    consistency_w = compute_weighted_component(consistency_raw, WEIGHT_WAKE_UP_CONSISTENCY)
    challenge_w = compute_weighted_component(challenge_raw, WEIGHT_CHALLENGE_SUCCESS)
    snooze_w = compute_weighted_component(snooze_raw, WEIGHT_SNOOZE_REDUCTION)
    adherence_w = compute_weighted_component(adherence_raw, WEIGHT_SLEEP_ADHERENCE)

    total = round(consistency_w + challenge_w + snooze_w + adherence_w, 2)
    total = max(0.0, min(100.0, total))

    return {
        "total_score": total,
        # Raw sub-scores (0-100)
        "wake_up_consistency_raw": consistency_raw,
        "challenge_success_raw": challenge_raw,
        "snooze_reduction_raw": snooze_raw,
        "sleep_adherence_raw": adherence_raw,
        # Weighted contributions
        "wake_up_consistency_weighted": consistency_w,
        "challenge_success_weighted": challenge_w,
        "snooze_reduction_weighted": snooze_w,
        "sleep_adherence_weighted": adherence_w,
    }


# ---------------------------------------------------------------------------
# Convenience class wrapper
# ---------------------------------------------------------------------------
class HabitScoringEngine:
    """
    Callable engine wrapper.

    Usage::

        engine = HabitScoringEngine()
        result = engine.score(HabitMetrics(
            wake_up_consistency_pct=85.0,
            challenge_success_pct=72.0,
            avg_snooze_count=1.5,
            sleep_adherence_pct=90.0,
        ))
        print(result["total_score"])  # e.g. 77.25
    """

    @staticmethod
    def score(metrics: HabitMetrics) -> dict[str, Any]:
        """Compute the habit score; delegates to :func:`compute_habit_score`."""
        return compute_habit_score(metrics)

    @staticmethod
    def normalise_snooze(avg_snooze: float) -> float:
        """Expose snooze normalisation for external use."""
        return normalise_snooze_reduction(avg_snooze)
