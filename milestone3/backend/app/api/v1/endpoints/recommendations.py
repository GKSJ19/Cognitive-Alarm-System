from fastapi import APIRouter, Depends
from typing import Any
from app.core.database import get_db
from app.models.user import UserModel
from app.api.deps import get_current_active_user

router = APIRouter()


@router.get("/challenge-type")
async def recommend_challenge_type(
    current_user: UserModel = Depends(get_current_active_user),
    db = Depends(get_db)
) -> Any:
    """
    Recommend the next challenge type and difficulty based on
    the user's recent attempt history.
    Member 3's Adaptive Difficulty Engine can override this with
    its own model output by calling PUT /alarms/{id} with is_adaptive=True.
    """
    user_id = str(current_user.id)

    # Get last 10 challenge attempts
    attempts_cursor = db["challenge_attempts"].find(
        {"user_id": user_id}
    ).sort("attempted_at", -1).limit(10)
    attempts = await attempts_cursor.to_list(length=10)

    if not attempts:
        return {
            "recommended_difficulty": "Easy",
            "recommended_challenge_type": "Math",
            "reason": "No history found. Starting with Easy Math.",
            "is_adaptive": False,
        }

    total = len(attempts)
    correct = sum(1 for a in attempts if a.get("is_correct"))
    accuracy = correct / total if total > 0 else 0

    # Simple rule-based recommendation (Member 3 replaces this with ML)
    if accuracy >= 0.8:
        difficulty = "Hard"
        reason = "High accuracy — increasing difficulty."
    elif accuracy >= 0.5:
        difficulty = "Medium"
        reason = "Moderate accuracy — maintaining Medium difficulty."
    else:
        difficulty = "Easy"
        reason = "Low accuracy — reducing difficulty to Easy."

    # Recommend least-used challenge type
    type_counts: dict = {}
    for a in attempts:
        ct = a.get("challenge_type", "Math")
        type_counts[ct] = type_counts.get(ct, 0) + 1

    all_types = ["Math", "Logic", "Memory", "Pattern", "Word", "Riddle", "Quick Quiz"]
    recommended_type = min(all_types, key=lambda t: type_counts.get(t, 0))

    return {
        "recommended_difficulty": difficulty,
        "recommended_challenge_type": recommended_type,
        "accuracy_last_10": round(accuracy * 100, 1),
        "reason": reason,
        "is_adaptive": False,  # True when Member 3 engine drives this
    }


@router.get("/alarm-schedule")
async def recommend_alarm_schedule(
    current_user: UserModel = Depends(get_current_active_user),
    db = Depends(get_db)
) -> Any:
    """
    Recommend optimal alarm schedule based on past dismissal behaviour.
    Returns suggested alarm time adjustment based on snooze patterns.
    """
    user_id = str(current_user.id)

    logs_cursor = db["alarm_logs"].find({"user_id": user_id}).sort("ring_time", -1).limit(20)
    logs = await logs_cursor.to_list(length=20)

    if not logs:
        return {
            "suggestion": "No alarm history yet. Keep your current schedule.",
            "avg_snooze_count": 0,
            "avg_challenge_accuracy": None,
        }

    avg_snooze = sum(l.get("snooze_count", 0) for l in logs) / len(logs)
    accuracies = [l["challenge_accuracy"] for l in logs if l.get("challenge_accuracy") is not None]
    avg_accuracy = round(sum(accuracies) / len(accuracies), 2) if accuracies else None

    if avg_snooze >= 3:
        suggestion = "You snooze frequently. Consider setting your alarm 15 minutes earlier."
    elif avg_snooze >= 1:
        suggestion = "Occasional snoozing detected. Try going to bed 30 minutes earlier."
    else:
        suggestion = "Great discipline! Your current alarm schedule is working well."

    return {
        "suggestion": suggestion,
        "avg_snooze_count": round(avg_snooze, 1),
        "avg_challenge_accuracy": avg_accuracy,
    }


@router.get("/habit-score")
async def get_habit_score(
    current_user: UserModel = Depends(get_current_active_user),
    db = Depends(get_db)
) -> Any:
    """
    Compute a real habit score from alarm_logs data.
    Score = weighted combination of:
      - Wake-up success rate (50%)
      - Challenge accuracy (30%)
      - On-time dismissal rate (20%)
    Range: 0–100
    """
    user_id = str(current_user.id)

    logs_cursor = db["alarm_logs"].find({"user_id": user_id}).limit(30)
    logs = await logs_cursor.to_list(length=30)

    if not logs:
        return {"habit_score": 0, "breakdown": {}, "message": "No alarm history yet."}

    total = len(logs)
    passed = sum(1 for l in logs if l.get("verification_passed"))
    success_rate = passed / total

    accuracies = [l["challenge_accuracy"] for l in logs if l.get("challenge_accuracy") is not None]
    avg_accuracy = sum(accuracies) / len(accuracies) if accuracies else 0.5

    on_time = [l["dismissed_on_time"] for l in logs if l.get("dismissed_on_time") is not None]
    on_time_rate = sum(1 for x in on_time if x) / len(on_time) if on_time else 0.5

    habit_score = round(
        (success_rate * 50) + (avg_accuracy * 30) + (on_time_rate * 20),
        1
    )

    return {
        "habit_score": habit_score,
        "breakdown": {
            "wake_up_success_rate": round(success_rate * 100, 1),
            "avg_challenge_accuracy": round(avg_accuracy * 100, 1),
            "on_time_dismissal_rate": round(on_time_rate * 100, 1),
        },
        "total_alarms_checked": total,
    }
