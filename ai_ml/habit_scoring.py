"""
Habit Scoring Engine
Computes a user's overall habit score based on the weighted model:
- Wake-Up Consistency: 35%
- Challenge Completion Success: 25%
- Snooze Reduction: 20%
- Sleep Schedule Adherence: 20%
"""

import os
import sys

WEIGHTS = {
    "wake_up_consistency": 0.35,
    "challenge_completion": 0.25,
    "snooze_reduction": 0.20,
    "sleep_schedule_adherence": 0.20,
}


def calculate_habit_score(
    wake_up_consistency: float,
    challenge_completion: float,
    snooze_reduction: float,
    sleep_schedule_adherence: float,
) -> float:
    """
    Each input should be a normalized score between 0 and 100.

    Returns the final weighted habit score (0-100).
    """
    for name, value in [
        ("wake_up_consistency", wake_up_consistency),
        ("challenge_completion", challenge_completion),
        ("snooze_reduction", snooze_reduction),
        ("sleep_schedule_adherence", sleep_schedule_adherence),
    ]:
        if not (0 <= value <= 100):
            raise ValueError(f"{name} must be between 0 and 100, got {value}")

    score = (
        wake_up_consistency * WEIGHTS["wake_up_consistency"]
        + challenge_completion * WEIGHTS["challenge_completion"]
        + snooze_reduction * WEIGHTS["snooze_reduction"]
        + sleep_schedule_adherence * WEIGHTS["sleep_schedule_adherence"]
    )
    return round(score, 2)


def calculate_habit_score_for_user(user_id: int) -> dict:
    """
    Full pipeline version: pulls real data for a user via data_ingest.py,
    computes the four normalized inputs via features.py, then feeds them
    into calculate_habit_score().

    This is what connects habit_scoring.py to the actual data pipeline
    instead of requiring manually typed-in numbers.

    Returns a dict with both the final score and the individual
    component scores (useful later for recommendation_engine.py, which
    needs to know which specific component is weakest).
    """
    # ai_ml/pipelines/ sits one level down from ai_ml/ (where this file lives)
    pipelines_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "pipelines")
    if pipelines_dir not in sys.path:
        sys.path.append(pipelines_dir)

    from data_ingest import build_user_context
    from features import compute_habit_score_inputs

    context = build_user_context(user_id=user_id)
    inputs = compute_habit_score_inputs(context)

    final_score = calculate_habit_score(
        wake_up_consistency=inputs["wake_up_consistency"],
        challenge_completion=inputs["challenge_completion"],
        snooze_reduction=inputs["snooze_reduction"],
        sleep_schedule_adherence=inputs["sleep_schedule_adherence"],
    )

    return {
        "user_id": user_id,
        "habit_score": final_score,
        "components": inputs,
    }


if __name__ == "__main__":
    # Manual test (original behavior, unchanged)
    example_score = calculate_habit_score(
        wake_up_consistency=80,
        challenge_completion=70,
        snooze_reduction=60,
        sleep_schedule_adherence=90,
    )
    print(f"Example Habit Score (manual input): {example_score}\n")

    # Real pipeline test: raw data -> features -> habit score, for all
    # users currently backed by real MongoDB/PostgreSQL sample data (1-5)
    print("=== Habit Scores from Real Data Pipeline ===\n")
    for user_id in range(1, 6):
        result = calculate_habit_score_for_user(user_id)
        print(f"User {result['user_id']}: Habit Score = {result['habit_score']}")
        print(f"  Components: {result['components']}\n")