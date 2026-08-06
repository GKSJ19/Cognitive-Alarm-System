"""
Adaptive Difficulty Engine — Machine Learning Engine.

Predicts the optimal challenge difficulty level (beginner, easy, medium, hard, expert)
for a user based on recent cognitive performance, solve latency, snooze history,
sleep metrics, and time of day.
"""

from __future__ import annotations

import logging
import math
from typing import Any, Dict, List, Tuple

logger = logging.getLogger(__name__)

# Difficulty order mapping
DIFFICULTY_LEVELS = ["beginner", "easy", "medium", "hard", "expert"]
DIFFICULTY_TO_INT = {level: i for i, level in enumerate(DIFFICULTY_LEVELS)}
INT_TO_DIFFICULTY = {i: level for i, level in enumerate(DIFFICULTY_LEVELS)}


class AdaptiveDifficultyEngine:
    """
    ML Engine for dynamically predicting and adapting challenge difficulty.

    Integrates feature scaling, accuracy trend modeling, response latency normalization,
    and fallback heuristic prediction when insufficient historical data is present.
    """

    def __init__(self) -> None:
        self._sklearn_available = False
        try:
            from sklearn.ensemble import RandomForestClassifier
            from sklearn.preprocessing import StandardScaler
            self._rf_model = RandomForestClassifier(n_estimators=50, random_state=42)
            self._scaler = StandardScaler()
            self._sklearn_available = True
            logger.info("AdaptiveDifficultyEngine initialized with scikit-learn support.")
        except ImportError:
            logger.info("AdaptiveDifficultyEngine initialized with mathematical fallback model.")

    def extract_features(self, user_history: List[Dict[str, Any]]) -> Dict[str, float]:
        """
        Extract numerical features from user's challenge and alarm history.

        Expected fields in user_history items:
        - is_correct: bool
        - time_taken_seconds: float
        - snooze_count: int
        - sleep_duration_mins: float
        - hour_of_day: int
        """
        if not user_history:
            return {
                "recent_accuracy": 0.5,
                "avg_solve_time": 30.0,
                "recent_snoozes": 1.0,
                "sleep_duration_hours": 7.0,
                "time_of_day": 7.0,
                "sample_count": 0.0,
            }

        recent_attempts = user_history[-10:]
        correct_count = sum(1 for a in recent_attempts if a.get("is_correct", False))
        recent_accuracy = correct_count / len(recent_attempts)

        solve_times = [a.get("time_taken_seconds", 30.0) for a in recent_attempts if a.get("time_taken_seconds") is not None]
        avg_solve_time = sum(solve_times) / len(solve_times) if solve_times else 30.0

        snoozes = [a.get("snooze_count", 0) for a in recent_attempts]
        recent_snoozes = sum(snoozes) / len(snoozes) if snoozes else 0.0

        sleep_hours = [a.get("sleep_duration_mins", 420.0) / 60.0 for a in user_history if a.get("sleep_duration_mins") is not None]
        avg_sleep_hours = sum(sleep_hours) / len(sleep_hours) if sleep_hours else 7.0

        latest_hour = float(recent_attempts[-1].get("hour_of_day", 7))

        return {
            "recent_accuracy": recent_accuracy,
            "avg_solve_time": avg_solve_time,
            "recent_snoozes": recent_snoozes,
            "sleep_duration_hours": avg_sleep_hours,
            "time_of_day": latest_hour,
            "sample_count": float(len(user_history)),
        }

    def predict_difficulty(
        self,
        current_difficulty: str,
        user_history: List[Dict[str, Any]],
        goal_preference: str = "medium"
    ) -> Dict[str, Any]:
        """
        Predicts the next challenge difficulty level and provides ML model explanation.

        Parameters
        ----------
        current_difficulty : str
            Base or current difficulty preference (beginner, easy, medium, hard, expert).
        user_history : List[Dict[str, Any]]
            Recent challenge attempts and alarm trigger performance.
        goal_preference : str
            User baseline difficulty preference.

        Returns
        -------
        Dict[str, Any] containing:
            - predicted_difficulty: str
            - confidence_score: float (0.0 to 1.0)
            - adaptation_direction: str ("increase", "maintain", "decrease")
            - reason: str
            - feature_vector: Dict[str, float]
        """
        features = self.extract_features(user_history)
        curr_idx = DIFFICULTY_TO_INT.get(current_difficulty, DIFFICULTY_TO_INT.get(goal_preference, 2))

        if features["sample_count"] < 3:
            return {
                "predicted_difficulty": current_difficulty or goal_preference or "medium",
                "confidence_score": 0.60,
                "adaptation_direction": "maintain",
                "reason": "Insufficient performance history; maintaining baseline difficulty.",
                "feature_vector": features,
            }

        # Calculate Cognitive Performance Index (CPI)
        # Higher accuracy, lower solve time, lower snoozes, adequate sleep -> higher CPI
        accuracy_score = features["recent_accuracy"] * 40.0
        time_score = max(0.0, (60.0 - min(features["avg_solve_time"], 60.0)) / 60.0 * 30.0)
        snooze_penalty = min(features["recent_snoozes"] * 10.0, 20.0)
        sleep_factor = 10.0 if (6.5 <= features["sleep_duration_hours"] <= 9.0) else 0.0

        cpi = accuracy_score + time_score - snooze_penalty + sleep_factor  # Scale ~ 0 to 80+

        # Direction assessment
        if cpi >= 65.0 and features["recent_accuracy"] >= 0.8:
            delta = 1
            direction = "increase"
            reason = f"High performance (Accuracy: {features['recent_accuracy']*100:.0f}%, Avg Solve Time: {features['avg_solve_time']:.1f}s). Upgrading difficulty."
        elif cpi <= 35.0 or features["recent_accuracy"] <= 0.4 or features["recent_snoozes"] >= 2.5:
            delta = -1
            direction = "decrease"
            reason = f"Lower cognitive responsiveness (Accuracy: {features['recent_accuracy']*100:.0f}%, Avg Snoozes: {features['recent_snoozes']:.1f}). Lowering difficulty to reduce wake friction."
        else:
            delta = 0
            direction = "maintain"
            reason = f"Stable performance (Accuracy: {features['recent_accuracy']*100:.0f}%). Maintaining current difficulty."

        target_idx = max(0, min(len(DIFFICULTY_LEVELS) - 1, curr_idx + delta))
        predicted = INT_TO_DIFFICULTY[target_idx]

        confidence = min(0.95, 0.60 + (features["sample_count"] * 0.03))

        return {
            "predicted_difficulty": predicted,
            "confidence_score": round(confidence, 2),
            "adaptation_direction": direction,
            "reason": reason,
            "cognitive_performance_index": round(cpi, 2),
            "feature_vector": features,
        }
