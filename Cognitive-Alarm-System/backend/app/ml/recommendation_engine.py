"""
Recommendation Engine — Machine Learning Recommendation Module.

Generates dynamic, highly personalized recommendations based on learned user behavior,
cognitive performance trends, difficulty predictions, and circadian preferences.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


class RecommendationEngine:
    """
    ML-driven contextual Recommendation Engine.
    """

    def generate_recommendations(
        self,
        user_profile: Dict[str, Any],
        behavioral_patterns: Dict[str, Any],
        adaptive_difficulty: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Synthesizes behavioral insights, ML difficulty predictions, and user profile
        to construct a prioritized list of personalized recommendations.
        """
        recommendations = []

        archetype = behavioral_patterns.get("archetype", "variable_sleeper")
        scores = behavioral_patterns.get("habit_scores", {})
        anomalies = behavioral_patterns.get("detected_anomalies", [])
        predicted_diff = adaptive_difficulty.get("predicted_difficulty", "medium")

        # 1. Snooze & Wake Responsiveness Recommendations
        avg_snooze = behavioral_patterns.get("avg_snooze_count", 0.0)
        if avg_snooze >= 2.0 or archetype == "habitual_snoozer":
            recommendations.append({
                "category": "alarm_optimization",
                "message": f"You snoozed {avg_snooze:.1f} times on average. Switch to a {predicted_diff.upper()} Cognitive Challenge to prevent falling back asleep.",
                "priority": "high",
                "action_type": "adjust_challenge_difficulty",
                "suggested_value": predicted_diff,
            })
        elif scores.get("snooze_reduction_score", 100) >= 85:
            recommendations.append({
                "category": "progress",
                "message": "Outstanding wake responsiveness! You have minimized your snoozes significantly this week.",
                "priority": "normal",
                "action_type": "reinforce_habit",
                "suggested_value": None,
            })

        # 2. Sleep Adherence & Circadian Alignment
        sleep_score = scores.get("sleep_adherence_score", 70.0)
        pref_wake = user_profile.get("preferred_wake_time", "07:00")
        sleep_dur_mins = user_profile.get("sleep_duration_mins", 480) or 480
        target_sleep_hours = sleep_dur_mins / 60.0

        if sleep_score < 60.0:
            recommendations.append({
                "category": "bedtime_reminder",
                "message": f"Your sleep consistency is below optimal. To wake up fresh at {pref_wake}, aim for a wind-down routine {target_sleep_hours:.1f} hours prior.",
                "priority": "high",
                "action_type": "schedule_bedtime_reminder",
                "suggested_value": f"{target_sleep_hours:.1f}_hours",
            })

        # 3. Adaptive Difficulty Matching
        direction = adaptive_difficulty.get("adaptation_direction", "maintain")
        if direction == "increase":
            recommendations.append({
                "category": "cognitive_boost",
                "message": f"Your challenge solve speed is exceptional! Upgrading next challenge to {predicted_diff.upper()} for higher morning stimulation.",
                "priority": "normal",
                "action_type": "set_difficulty",
                "suggested_value": predicted_diff,
            })
        elif direction == "decrease":
            recommendations.append({
                "category": "cognitive_support",
                "message": f"Easing challenge difficulty to {predicted_diff.upper()} to make wake-up less strenuous during your transition.",
                "priority": "normal",
                "action_type": "set_difficulty",
                "suggested_value": predicted_diff,
            })

        # 4. Goal-aligned Habit Advice
        goal_type = user_profile.get("goal_type", "study")
        if goal_type == "study":
            recommendations.append({
                "category": "habit_tip",
                "message": "Try solving a Memory or Math challenge immediately after wake-up to boost prefrontal cortex activation for studying.",
                "priority": "low",
                "action_type": "recommend_challenge_type",
                "suggested_value": "math",
            })
        elif goal_type == "fitness":
            recommendations.append({
                "category": "habit_tip",
                "message": "Combine your wake-up alarm with a 5-minute hydration habit to accelerate morning alertness.",
                "priority": "low",
                "action_type": "recommend_habit",
                "suggested_value": "hydration",
            })

        # Fallback recommendation if list is small
        if len(recommendations) < 2:
            recommendations.append({
                "category": "general_wellness",
                "message": "Keep maintaining a consistent sleep schedule to improve your cognitive alarm streak!",
                "priority": "low",
                "action_type": "general",
                "suggested_value": None,
            })

        return recommendations
