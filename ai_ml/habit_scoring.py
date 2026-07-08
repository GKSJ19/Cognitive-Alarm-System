"""
Habit Scoring Engine
Computes a user's overall habit score based on the weighted model:
- Wake-Up Consistency: 35%
- Challenge Completion Success: 25%
- Snooze Reduction: 20%
- Sleep Schedule Adherence: 20%
"""

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


if __name__ == "__main__":
    # Quick manual test
    example_score = calculate_habit_score(
        wake_up_consistency=80,
        challenge_completion=70,
        snooze_reduction=60,
        sleep_schedule_adherence=90,
    )
    print(f"Example Habit Score: {example_score}")