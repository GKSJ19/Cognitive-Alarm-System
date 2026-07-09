"""
Behavior Analysis Model / Feature Engineering

Analyzes raw user data (from data_ingest.py) and produces the four
normalized scores (0-100) that habit_scoring.py needs as input:

- Wake-Up Consistency
- Challenge Completion Success
- Snooze Reduction
- Sleep Schedule Adherence

Also covers the diagram's "Behavior Analysis Model" requirements:
snooze pattern analysis, wake-up behavior analysis, sleep pattern analysis.
"""

from typing import Dict, Any, List


def analyze_snooze_pattern(logs: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Analyzes snooze behavior across a user's logs.
    Returns raw stats plus a normalized 0-100 'snooze_reduction' score
    (100 = no snoozing at all, lower = more snoozing).
    """
    if not logs:
        return {"avg_snooze_count": 0, "snooze_reduction_score": 100.0}

    snooze_counts = [log.get("snooze_count", 0) for log in logs]
    avg_snooze = sum(snooze_counts) / len(snooze_counts)

    # Assume 3+ average snoozes = worst case (0 score), 0 snoozes = best (100)
    MAX_EXPECTED_SNOOZE = 3
    snooze_reduction_score = max(0.0, 100 * (1 - avg_snooze / MAX_EXPECTED_SNOOZE))

    return {
        "avg_snooze_count": round(avg_snooze, 2),
        "snooze_reduction_score": round(snooze_reduction_score, 2),
    }


def analyze_wakeup_behavior(logs: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Analyzes wake-up confirmation consistency across logs.
    Returns a normalized 0-100 'wake_up_consistency' score based on
    the proportion of alarms where wake-up was actually confirmed.
    """
    if not logs:
        return {"confirmation_rate": 0.0, "wake_up_consistency_score": 0.0}

    confirmed = [1 for log in logs if log.get("wake_up_confirmed")]
    confirmation_rate = len(confirmed) / len(logs)

    wake_up_consistency_score = round(confirmation_rate * 100, 2)

    return {
        "confirmation_rate": round(confirmation_rate, 2),
        "wake_up_consistency_score": wake_up_consistency_score,
    }


def analyze_challenge_completion(challenge_attempts: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Analyzes challenge attempt success rate.
    Returns a normalized 0-100 'challenge_completion' score based on
    the proportion of attempts answered correctly.
    """
    if not challenge_attempts:
        return {"accuracy_rate": 0.0, "challenge_completion_score": 0.0}

    correct = [1 for a in challenge_attempts if a.get("is_correct")]
    accuracy_rate = len(correct) / len(challenge_attempts)

    challenge_completion_score = round(accuracy_rate * 100, 2)

    return {
        "accuracy_rate": round(accuracy_rate, 2),
        "challenge_completion_score": challenge_completion_score,
    }


def analyze_sleep_schedule(profile: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analyzes sleep schedule adherence based on the user's stated
    sleep_duration versus a healthy target range (7-9 hours).
    Returns a normalized 0-100 'sleep_schedule_adherence' score.
    """
    if not profile or profile.get("sleep_duration") is None:
        return {"sleep_duration": None, "sleep_schedule_adherence_score": 0.0}

    sleep_duration = profile["sleep_duration"]
    TARGET_MIN, TARGET_MAX = 7.0, 9.0

    if TARGET_MIN <= sleep_duration <= TARGET_MAX:
        score = 100.0
    else:
        # Penalize distance from the nearest edge of the healthy range
        distance = min(abs(sleep_duration - TARGET_MIN), abs(sleep_duration - TARGET_MAX))
        score = max(0.0, 100 - (distance * 20))  # lose 20 points per hour off-target

    return {
        "sleep_duration": sleep_duration,
        "sleep_schedule_adherence_score": round(score, 2),
    }


def compute_habit_score_inputs(user_context: Dict[str, Any]) -> Dict[str, float]:
    """
    Full pipeline: takes a user_context dict (from data_ingest.build_user_context)
    and returns exactly the four inputs habit_scoring.calculate_habit_score() needs.
    """
    logs = user_context.get("logs", [])
    challenge_attempts = user_context.get("challenge_attempts", [])
    profile = user_context.get("profile", {})

    snooze_result = analyze_snooze_pattern(logs)
    wakeup_result = analyze_wakeup_behavior(logs)
    challenge_result = analyze_challenge_completion(challenge_attempts)
    sleep_result = analyze_sleep_schedule(profile)

    return {
        "wake_up_consistency": wakeup_result["wake_up_consistency_score"],
        "challenge_completion": challenge_result["challenge_completion_score"],
        "snooze_reduction": snooze_result["snooze_reduction_score"],
        "sleep_schedule_adherence": sleep_result["sleep_schedule_adherence_score"],
    }


if __name__ == "__main__":
    import sys
    import os

    # Allow importing data_ingest.py from the same folder
    sys.path.append(os.path.dirname(__file__))
    from data_ingest import build_user_context

    print("=== Behavior Analysis / Feature Engineering: Demo (Real Data) ===\n")

    # NOTE: Only user_id 1-5 currently have real logs/challenge_attempts
    # entries in MongoDB (logs.json / challenge_data.json). Looping across
    # all 5 shows genuine variation instead of a single flat result,
    # since each user's real logged behavior differs (e.g. user 4's log
    # shows a snooze_count of 2 and wake_up_confirmed = false).
    for user_id in range(1, 6):
        context = build_user_context(user_id=user_id)
        inputs = compute_habit_score_inputs(context)

        print(f"User {user_id}:")
        for key, value in inputs.items():
            print(f"  {key}: {value}")
        print()