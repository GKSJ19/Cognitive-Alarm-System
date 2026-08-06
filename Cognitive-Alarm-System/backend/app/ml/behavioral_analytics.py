"""
Behavioral Analytics Engine — Machine Learning Engine.

Analyzes user interaction logs, wake-up responsiveness, sleep consistency,
snooze habituation, and cognitive latency trends to detect behavioral patterns
and user archetypes.
"""

from __future__ import annotations

import logging
import statistics
from datetime import date, datetime
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

USER_ARCHETYPES = [
    "consistent_early_riser",
    "struggling_night_owl",
    "habitual_snoozer",
    "adaptive_achiever",
    "variable_sleeper",
]


class BehavioralAnalyticsEngine:
    """
    ML Engine for behavioral modeling, pattern detection, and habit scoring.
    """

    def calculate_scores(self, user_history: List[Dict[str, Any]]) -> Dict[str, float]:
        """
        Calculates granular habit scores:
        - wake_consistency_score (0-100)
        - challenge_success_score (0-100)
        - snooze_reduction_score (0-100)
        - sleep_adherence_score (0-100)
        - total_score (0-100)
        """
        if not user_history:
            return {
                "wake_consistency_score": 70.0,
                "challenge_success_score": 70.0,
                "snooze_reduction_score": 70.0,
                "sleep_adherence_score": 70.0,
                "total_score": 70.0,
            }

        # 1. Wake consistency score (variance in wake time)
        wake_times = [item.get("wake_time_minutes") for item in user_history if item.get("wake_time_minutes") is not None]
        if len(wake_times) >= 2:
            stdev = statistics.stdev(wake_times)
            wake_consistency_score = max(0.0, min(100.0, 100.0 - (stdev * 0.8)))
        else:
            wake_consistency_score = 75.0

        # 2. Challenge success score
        attempts = [item for item in user_history if "is_correct" in item]
        if attempts:
            passed = sum(1 for a in attempts if a.get("is_correct", False))
            challenge_success_score = (passed / len(attempts)) * 100.0
        else:
            challenge_success_score = 80.0

        # 3. Snooze reduction score (0 snoozes = 100, 1 = 80, 2 = 50, 3+ = 20)
        snooze_counts = [item.get("snooze_count", 0) for item in user_history if "snooze_count" in item]
        if snooze_counts:
            avg_snoozes = sum(snooze_counts) / len(snooze_counts)
            snooze_reduction_score = max(0.0, min(100.0, 100.0 - (avg_snoozes * 25.0)))
        else:
            snooze_reduction_score = 85.0

        # 4. Sleep adherence score (target: 7-9 hours = 420-540 mins)
        sleep_logs = [item.get("sleep_duration_mins") for item in user_history if item.get("sleep_duration_mins") is not None]
        if sleep_logs:
            ideal_count = sum(1 for d in sleep_logs if 420 <= d <= 540)
            sleep_adherence_score = (ideal_count / len(sleep_logs)) * 100.0
        else:
            sleep_adherence_score = 75.0

        # Total weighted score
        total_score = (
            (wake_consistency_score * 0.30) +
            (challenge_success_score * 0.25) +
            (snooze_reduction_score * 0.25) +
            (sleep_adherence_score * 0.20)
        )

        return {
            "wake_consistency_score": round(wake_consistency_score, 2),
            "challenge_success_score": round(challenge_success_score, 2),
            "snooze_reduction_score": round(snooze_reduction_score, 2),
            "sleep_adherence_score": round(sleep_adherence_score, 2),
            "total_score": round(total_score, 2),
        }

    def detect_user_archetype(self, scores: Dict[str, float], user_history: List[Dict[str, Any]]) -> str:
        """
        Classifies user into a behavioral archetype.
        """
        wake_cons = scores.get("wake_consistency_score", 70.0)
        snooze_score = scores.get("snooze_reduction_score", 70.0)
        challenge_score = scores.get("challenge_success_score", 70.0)

        snooze_counts = [item.get("snooze_count", 0) for item in user_history if "snooze_count" in item]
        avg_snooze = sum(snooze_counts) / len(snooze_counts) if snooze_counts else 0.0

        if avg_snooze >= 2.0 or snooze_score < 50.0:
            return "habitual_snoozer"
        elif wake_cons >= 85.0 and snooze_score >= 80.0:
            return "consistent_early_riser"
        elif challenge_score >= 85.0 and scores.get("total_score", 0) >= 80.0:
            return "adaptive_achiever"
        elif wake_cons < 55.0:
            return "struggling_night_owl"
        else:
            return "variable_sleeper"

    def analyze_patterns(self, user_history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Runs comprehensive behavioral analysis.
        """
        scores = self.calculate_scores(user_history)
        archetype = self.detect_user_archetype(scores, user_history)

        snooze_counts = [item.get("snooze_count", 0) for item in user_history if "snooze_count" in item]
        avg_snooze = sum(snooze_counts) / len(snooze_counts) if snooze_counts else 0.0

        anomalies = []
        if avg_snooze > 2.5:
            anomalies.append("Frequent snooze dependency detected (>2.5 snoozes per alarm).")
        if scores["sleep_adherence_score"] < 50.0:
            anomalies.append("Irregular sleep duration detected; risk of sleep debt.")
        if scores["wake_consistency_score"] < 50.0:
            anomalies.append("High wake-time fluctuation (>45 min variance).")

        return {
            "archetype": archetype,
            "habit_scores": scores,
            "avg_snooze_count": round(avg_snooze, 2),
            "detected_anomalies": anomalies,
            "cognitive_alertness_trend": "improving" if scores["challenge_success_score"] >= 75 else "needs_attention",
        }
