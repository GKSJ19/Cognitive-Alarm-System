"""
Data Ingestion Pipeline

Pulls raw data from both databases used by the platform:
- PostgreSQL: users, alarms, habits, scores (structural/static data)
- MongoDB: challenge_data, logs, user_preferences (event-level/dynamic data)

For now, this module works against local sample data (JSON/dict form,
matching the real schema confirmed from Abdul's dump and MongoDB samples).
Once real DB connections are available, only the `fetch_*` functions
need to change internally — everything downstream (reinforcement.py,
features.py, classifier.py) stays the same.
"""

from typing import List, Dict, Any


# ---------------------------------------------------------------------------
# SAMPLE DATA (stand-ins for real DB calls, matching confirmed schema shapes)
# ---------------------------------------------------------------------------

# Matches: mongodb/challenge_data.json
SAMPLE_CHALLENGE_DATA = [
    {
        "challenge_id": "CH001",
        "user_id": 1,
        "challenge_type": "Math Problems",
        "difficulty_level": "Easy",
        "is_correct": True,
        "completion_time_seconds": 12,
        "attempted_at": "2026-07-05T06:00:00",
        "status": "completed",
    },
    {
        "challenge_id": "CH002",
        "user_id": 2,
        "challenge_type": "Logic Puzzles",
        "difficulty_level": "Easy",
        "is_correct": True,
        "completion_time_seconds": 20,
        "attempted_at": "2026-07-05T06:05:00Z",
        "status": "completed",
    },
]

# Matches: mongodb/logs.json
SAMPLE_LOGS = [
    {
        "log_id": "LG001",
        "user_id": 1,
        "alarm_id": "A001",
        "challenge_id": "CH001",
        "verification_status": "Verified",
        "snooze_count": 0,
        "wake_up_confirmed": True,
        "verified_at": "2026-07-05T07:00:00Z",
    },
    {
        "log_id": "LG002",
        "user_id": 2,
        "alarm_id": "A002",
        "challenge_id": "CH002",
        "verification_status": "Verified",
        "snooze_count": 1,
        "wake_up_confirmed": True,
        "verified_at": "2026-07-05T07:05:00Z",
    },
]

# Matches: mongodb/user_preferences.json
SAMPLE_USER_PREFERENCES = [
    {
        "preference_id": "UP001",
        "user_id": 1,
        "preferred_difficulty": "Beginner",
        "current_difficulty": "Beginner",
        "challenge_type_preference": "Math Problems",
    },
    {
        "preference_id": "UP002",
        "user_id": 2,
        "preferred_difficulty": "Easy",
        "current_difficulty": "Easy",
        "challenge_type_preference": "Logic Puzzles",
    },
]

# Matches: postgresql users table (trimmed to fields we actually use)
SAMPLE_USERS = [
    {
        "user_id": 1,
        "full_name": "Abdul Raheem",
        "preferred_wakeup_time": "06:00:00",
        "sleep_duration": 7.50,
        "difficulty_preference": "Medium",
    },
    {
        "user_id": 2,
        "full_name": "Priya Sharma",
        "preferred_wakeup_time": "05:30:00",
        "sleep_duration": 8.00,
        "difficulty_preference": "Easy",
    },
]

# Matches: postgresql scores table
SAMPLE_SCORES = [
    {
        "user_id": 1,
        "wakeup_consistency_score": 95.50,
        "habit_adherence_score": 90.00,
        "challenge_completion_score": 92.50,
        "productivity_score": 94.00,
        "sleep_routine_score": 91.00,
    },
    {
        "user_id": 2,
        "wakeup_consistency_score": 88.00,
        "habit_adherence_score": 85.50,
        "challenge_completion_score": 87.00,
        "productivity_score": 89.50,
        "sleep_routine_score": 86.00,
    },
]


# ---------------------------------------------------------------------------
# FETCH FUNCTIONS (swap internals for real DB calls later)
# ---------------------------------------------------------------------------

def fetch_challenge_attempts(user_id: int = None) -> List[Dict[str, Any]]:
    """
    Returns challenge attempt records (from MongoDB challenge_data collection).
    Optionally filters by user_id.
    """
    data = SAMPLE_CHALLENGE_DATA
    if user_id is not None:
        data = [row for row in data if row["user_id"] == user_id]
    return data


def fetch_logs(user_id: int = None) -> List[Dict[str, Any]]:
    """
    Returns wake-up verification / snooze logs (from MongoDB logs collection).
    Optionally filters by user_id.
    """
    data = SAMPLE_LOGS
    if user_id is not None:
        data = [row for row in data if row["user_id"] == user_id]
    return data


def fetch_user_preferences(user_id: int) -> Dict[str, Any]:
    """
    Returns a single user's current difficulty state
    (from MongoDB user_preferences collection).
    """
    for row in SAMPLE_USER_PREFERENCES:
        if row["user_id"] == user_id:
            return row
    return None


def fetch_user_profile(user_id: int) -> Dict[str, Any]:
    """
    Returns static profile data for a user (from PostgreSQL users table).
    """
    for row in SAMPLE_USERS:
        if row["user_id"] == user_id:
            return row
    return None


def fetch_user_scores(user_id: int) -> Dict[str, Any]:
    """
    Returns the latest computed scores for a user (from PostgreSQL scores table).
    """
    for row in SAMPLE_SCORES:
        if row["user_id"] == user_id:
            return row
    return None


def build_user_context(user_id: int) -> Dict[str, Any]:
    """
    Combines all data sources for a single user into one dictionary.
    This is the main entry point other modules (reinforcement.py,
    features.py, classifier.py) should use.
    """
    return {
        "profile": fetch_user_profile(user_id),
        "scores": fetch_user_scores(user_id),
        "preferences": fetch_user_preferences(user_id),
        "challenge_attempts": fetch_challenge_attempts(user_id),
        "logs": fetch_logs(user_id),
    }


if __name__ == "__main__":
    # Quick manual test
    print("=== Data Ingestion: Demo ===\n")
    context = build_user_context(user_id=1)
    for key, value in context.items():
        print(f"{key}:")
        print(f"  {value}\n")