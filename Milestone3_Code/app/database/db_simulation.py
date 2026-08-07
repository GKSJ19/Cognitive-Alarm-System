from typing import Any

# Simulated user database containing historical behavior
db_users: dict[str, dict[str, Any]] = {
    "user123": {
        "wake_up_time": "07:00",
        "snooze_count": 3,
        "challenge_completion_time_sec": 45,
        "accuracy_percent": 65.0,
        "sleep_duration_hours": 6.0,
        "success_rate": 70.0,
        "current_difficulty": "Medium"
    },
    "user456": {
        "wake_up_time": "06:00",
        "snooze_count": 0,
        "challenge_completion_time_sec": 20,
        "accuracy_percent": 95.0,
        "sleep_duration_hours": 8.0,
        "success_rate": 92.0,
        "current_difficulty": "Easy"
    }
}

def get_user(user_id: str) -> dict[str, Any]:
    return db_users.get(user_id)

def update_user_difficulty(user_id: str, new_level: str):
    if user_id in db_users:
        db_users[user_id]["current_difficulty"] = new_level
