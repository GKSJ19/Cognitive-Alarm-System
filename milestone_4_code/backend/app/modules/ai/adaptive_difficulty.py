"""
Adaptive Difficulty Engine
==========================

Analyses user wake-up history, challenge performance, and snooze behaviour
over the previous 30 days to automatically assign one of five difficulty
tiers:

    Beginner → Easy → Medium → Hard → Expert

Difficulty **increases** when the user consistently completes challenges
quickly with high accuracy and minimal snooze usage.

Difficulty **decreases** when the user repeatedly fails challenges or
uses excessive snoozes.

The engine uses a weighted scoring algorithm as the primary method and
optionally trains a scikit-learn DecisionTreeClassifier on synthetic
feature vectors as a fallback/validation classifier.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any

import numpy as np

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
DIFFICULTY_TIERS: list[str] = ["beginner", "easy", "medium", "hard", "expert"]
TIER_INDEX: dict[str, int] = {t: i for i, t in enumerate(DIFFICULTY_TIERS)}

# Thresholds (tunable)
ACCURACY_INCREASE_THRESHOLD = 0.80   # ≥ 80 % accuracy → consider upgrade
ACCURACY_DECREASE_THRESHOLD = 0.40   # < 40 % accuracy → consider downgrade
TIME_EFFICIENCY_THRESHOLD = 0.60     # avg_time < 60 % of limit → fast
SNOOZE_LOW_THRESHOLD = 1             # ≤ 1 snooze → good
SNOOZE_HIGH_THRESHOLD = 3            # ≥ 3 avg snooze → bad
MIN_SESSIONS_FOR_ADJUSTMENT = 5      # need at least 5 sessions in window


# ---------------------------------------------------------------------------
# Data container
# ---------------------------------------------------------------------------
@dataclass
class PerformanceSnapshot:
    """Aggregated performance metrics over a rolling window."""

    total_challenges: int = 0
    successful_challenges: int = 0
    avg_completion_time_seconds: float = 0.0
    time_limit_seconds: float = 120.0    # default per-challenge time limit
    avg_snooze_count: float = 0.0
    consistency_pct: float = 0.0          # wake-up consistency (0-100)
    current_difficulty: str = "beginner"

    @property
    def accuracy(self) -> float:
        """Challenge accuracy as a fraction (0.0–1.0)."""
        if self.total_challenges == 0:
            return 0.0
        return self.successful_challenges / self.total_challenges

    @property
    def time_efficiency(self) -> float:
        """Fraction of time limit used (lower = faster)."""
        if self.time_limit_seconds <= 0:
            return 1.0
        return self.avg_completion_time_seconds / self.time_limit_seconds


# ---------------------------------------------------------------------------
# Engine
# ---------------------------------------------------------------------------
class AdaptiveDifficultyEngine:
    """
    Stateless engine that computes a recommended difficulty tier from a
    :class:`PerformanceSnapshot`.

    Usage::

        engine = AdaptiveDifficultyEngine()
        snapshot = PerformanceSnapshot(
            total_challenges=20,
            successful_challenges=18,
            avg_completion_time_seconds=45.0,
            avg_snooze_count=0.5,
            current_difficulty="medium",
        )
        result = engine.compute(snapshot)
        # result == {"new_difficulty": "hard", "reason": "...", ...}
    """

    # ---- public API -------------------------------------------------------

    def compute(self, snap: PerformanceSnapshot) -> dict[str, Any]:
        """
        Determine the new difficulty tier.

        Returns a dict with keys:
            new_difficulty  : str   — recommended tier
            previous        : str   — tier before this call
            reason          : str   — human-readable explanation
            metrics         : dict  — the raw metric values used
        """
        current_idx = TIER_INDEX.get(snap.current_difficulty, 0)

        # Not enough data → stay at current level
        if snap.total_challenges < MIN_SESSIONS_FOR_ADJUSTMENT:
            return self._result(snap, current_idx, "Insufficient data (< 5 sessions)")

        # --- Upgrade check ---------------------------------------------------
        if (
            snap.accuracy >= ACCURACY_INCREASE_THRESHOLD
            and snap.time_efficiency < TIME_EFFICIENCY_THRESHOLD
            and snap.avg_snooze_count <= SNOOZE_LOW_THRESHOLD
        ):
            new_idx = min(current_idx + 1, len(DIFFICULTY_TIERS) - 1)
            if new_idx != current_idx:
                return self._result(
                    snap,
                    new_idx,
                    f"High accuracy ({snap.accuracy:.0%}), fast completion "
                    f"({snap.time_efficiency:.0%} of limit), low snooze "
                    f"({snap.avg_snooze_count:.1f})",
                )

        # --- Downgrade check -------------------------------------------------
        if (
            snap.accuracy < ACCURACY_DECREASE_THRESHOLD
            or snap.avg_snooze_count >= SNOOZE_HIGH_THRESHOLD
        ):
            new_idx = max(current_idx - 1, 0)
            if new_idx != current_idx:
                reason_parts = []
                if snap.accuracy < ACCURACY_DECREASE_THRESHOLD:
                    reason_parts.append(f"Low accuracy ({snap.accuracy:.0%})")
                if snap.avg_snooze_count >= SNOOZE_HIGH_THRESHOLD:
                    reason_parts.append(
                        f"Excessive snooze ({snap.avg_snooze_count:.1f})"
                    )
                return self._result(snap, new_idx, "; ".join(reason_parts))

        # --- No change -------------------------------------------------------
        return self._result(snap, current_idx, "Performance within current tier range")

    # ---- scikit-learn classifier (optional) --------------------------------

    def train_classifier(self) -> Any:
        """
        Train a lightweight DecisionTreeClassifier on synthetic data as a
        secondary validation signal.  Returns the fitted model.

        Feature vector: [accuracy, time_efficiency, avg_snooze, consistency]
        Target: tier index (0–4).
        """
        try:
            from sklearn.tree import DecisionTreeClassifier
        except ImportError:
            logger.warning("scikit-learn not installed; classifier unavailable")
            return None

        # Synthetic training data  — (accuracy, time_eff, snooze, consistency) → tier
        X = np.array([
            # beginner (tier 0)
            [0.10, 0.95, 5.0, 20.0],
            [0.20, 0.90, 4.5, 25.0],
            [0.15, 1.00, 6.0, 15.0],
            [0.25, 0.85, 4.0, 30.0],
            # easy (tier 1)
            [0.40, 0.75, 3.0, 45.0],
            [0.45, 0.70, 2.5, 50.0],
            [0.35, 0.80, 3.5, 40.0],
            [0.50, 0.65, 2.0, 55.0],
            # medium (tier 2)
            [0.60, 0.60, 1.5, 65.0],
            [0.65, 0.55, 1.0, 70.0],
            [0.55, 0.65, 2.0, 60.0],
            [0.70, 0.50, 1.0, 75.0],
            # hard (tier 3)
            [0.80, 0.45, 0.5, 80.0],
            [0.85, 0.40, 0.5, 85.0],
            [0.75, 0.50, 1.0, 78.0],
            [0.82, 0.42, 0.3, 82.0],
            # expert (tier 4)
            [0.92, 0.30, 0.0, 95.0],
            [0.95, 0.25, 0.0, 98.0],
            [0.90, 0.35, 0.0, 92.0],
            [0.98, 0.20, 0.0, 99.0],
        ])
        y = np.array([0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4])

        clf = DecisionTreeClassifier(max_depth=5, random_state=42)
        clf.fit(X, y)
        return clf

    def classify(self, snap: PerformanceSnapshot, clf: Any = None) -> str:
        """
        Use the trained classifier to predict a difficulty tier.

        Falls back to :meth:`compute` if no classifier is provided.
        """
        if clf is None:
            return self.compute(snap)["new_difficulty"]

        features = np.array([[
            snap.accuracy,
            snap.time_efficiency,
            snap.avg_snooze_count,
            snap.consistency_pct,
        ]])
        predicted_idx = int(clf.predict(features)[0])
        return DIFFICULTY_TIERS[predicted_idx]

    # ---- internals ---------------------------------------------------------

    @staticmethod
    def _result(
        snap: PerformanceSnapshot, new_idx: int, reason: str
    ) -> dict[str, Any]:
        return {
            "new_difficulty": DIFFICULTY_TIERS[new_idx],
            "previous_difficulty": snap.current_difficulty,
            "reason": reason,
            "metrics": {
                "accuracy": round(snap.accuracy, 4),
                "time_efficiency": round(snap.time_efficiency, 4),
                "avg_snooze_count": round(snap.avg_snooze_count, 2),
                "consistency_pct": round(snap.consistency_pct, 2),
                "total_challenges": snap.total_challenges,
            },
        }
