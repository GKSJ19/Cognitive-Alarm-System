"""
Data Ingestion Pipeline

Pulls raw data from both databases used by the platform:
- PostgreSQL: users, alarms, habits, scores (structural/static data)
- MongoDB: challenge_data, logs, user_preferences (event-level/dynamic data)

For now, this module works against local sample data (JSON/dict form,
matching the real schema and real records confirmed from Abdul's
PostgreSQL dump and the MongoDB collection exports).
Once real DB connections are available, only the `fetch_*` functions
need to change internally — everything downstream (reinforcement.py,
features.py, classifier.py) stays the same.
"""

from typing import List, Dict, Any


# ---------------------------------------------------------------------------
# SAMPLE DATA (stand-ins for real DB calls, matching confirmed schema + real records)
# ---------------------------------------------------------------------------

# Matches: mongodb/challenge_data.json (all 7 real entries currently seeded)
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
    {
        "challenge_id": "CH003",
        "user_id": 3,
        "challenge_type": "Memory Challenges",
        "difficulty_level": "Medium",
        "is_correct": True,
        "completion_time_seconds": 18,
        "attempted_at": "2026-07-05T06:10:00Z",
        "status": "completed",
    },
    {
        "challenge_id": "CH004",
        "user_id": 4,
        "challenge_type": "Word Games",
        "difficulty_level": "Easy",
        "is_correct": True,
        "completion_time_seconds": 16,
        "attempted_at": "2026-07-05T06:15:00Z",
        "status": "completed",
    },
    {
        "challenge_id": "CH005",
        "user_id": 5,
        "challenge_type": "Pattern Recognition",
        "difficulty_level": "Medium",
        "is_correct": True,
        "completion_time_seconds": 15,
        "attempted_at": "2026-07-05T06:20:00Z",
        "status": "completed",
    },
    {
        "challenge_id": "CH006",
        "user_id": 6,
        "challenge_type": "Riddles",
        "difficulty_level": "Medium",
        "is_correct": True,
        "completion_time_seconds": 22,
        "attempted_at": "2026-07-05T06:25:00Z",
        "status": "completed",
    },
    {
        "challenge_id": "CH007",
        "user_id": 7,
        "challenge_type": "Quick Quizzes",
        "difficulty_level": "Easy",
        "is_correct": True,
        "completion_time_seconds": 10,
        "attempted_at": "2026-07-05T06:30:00Z",
        "status": "completed",
    },
]

# Matches: mongodb/logs.json (all 5 real entries currently seeded)
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
    {
        "log_id": "LG003",
        "user_id": 3,
        "alarm_id": "A003",
        "challenge_id": "CH003",
        "verification_status": "Verified",
        "snooze_count": 0,
        "wake_up_confirmed": True,
        "verified_at": "2026-07-05T07:10:00Z",
    },
    {
        "log_id": "LG004",
        "user_id": 4,
        "alarm_id": "A004",
        "challenge_id": "CH004",
        "verification_status": "Pending",
        "snooze_count": 2,
        "wake_up_confirmed": False,
        "verified_at": "2026-07-05T07:15:00Z",
    },
    {
        "log_id": "LG005",
        "user_id": 5,
        "alarm_id": "A005",
        "challenge_id": "CH005",
        "verification_status": "Verified",
        "snooze_count": 0,
        "wake_up_confirmed": True,
        "verified_at": "2026-07-05T07:20:00Z",
    },
]

# Matches: mongodb/user_preferences.json (all 5 real entries currently seeded)
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
    {
        "preference_id": "UP003",
        "user_id": 3,
        "preferred_difficulty": "Medium",
        "current_difficulty": "Medium",
        "challenge_type_preference": "Memory Challenges",
    },
    {
        "preference_id": "UP004",
        "user_id": 4,
        "preferred_difficulty": "Hard",
        "current_difficulty": "Hard",
        "challenge_type_preference": "Word Games",
    },
    {
        "preference_id": "UP005",
        "user_id": 5,
        "preferred_difficulty": "Expert",
        "current_difficulty": "Expert",
        "challenge_type_preference": "Pattern Recognition",
    },
]

# Matches: postgresql users table (all 30 real users, trimmed to fields we use)
SAMPLE_USERS = [
    {"user_id": 1, "full_name": "Abdul Raheem", "preferred_wakeup_time": "06:00:00", "sleep_duration": 7.50, "difficulty_preference": "Medium"},
    {"user_id": 2, "full_name": "Priya Sharma", "preferred_wakeup_time": "05:30:00", "sleep_duration": 8.00, "difficulty_preference": "Easy"},
    {"user_id": 3, "full_name": "Rahul Verma", "preferred_wakeup_time": "07:00:00", "sleep_duration": 6.50, "difficulty_preference": "Hard"},
    {"user_id": 4, "full_name": "Ananya Patel", "preferred_wakeup_time": "06:20:00", "sleep_duration": 7.00, "difficulty_preference": "Medium"},
    {"user_id": 5, "full_name": "Deepak Nair", "preferred_wakeup_time": "05:50:00", "sleep_duration": 7.50, "difficulty_preference": "Easy"},
    {"user_id": 6, "full_name": "Meera Iyer", "preferred_wakeup_time": "06:40:00", "sleep_duration": 8.00, "difficulty_preference": "Hard"},
    {"user_id": 7, "full_name": "Karthik Rao", "preferred_wakeup_time": "06:10:00", "sleep_duration": 7.20, "difficulty_preference": "Medium"},
    {"user_id": 8, "full_name": "Sneha Joshi", "preferred_wakeup_time": "05:45:00", "sleep_duration": 8.30, "difficulty_preference": "Hard"},
    {"user_id": 9, "full_name": "Arjun Menon", "preferred_wakeup_time": "07:10:00", "sleep_duration": 6.80, "difficulty_preference": "Easy"},
    {"user_id": 10, "full_name": "Nidhi Kapoor", "preferred_wakeup_time": "06:30:00", "sleep_duration": 7.80, "difficulty_preference": "Medium"},
    {"user_id": 11, "full_name": "Vikram Singh", "preferred_wakeup_time": "05:35:00", "sleep_duration": 8.10, "difficulty_preference": "Hard"},
    {"user_id": 12, "full_name": "Pooja Deshmukh", "preferred_wakeup_time": "06:45:00", "sleep_duration": 7.40, "difficulty_preference": "Easy"},
    {"user_id": 13, "full_name": "Suresh Bhatia", "preferred_wakeup_time": "07:20:00", "sleep_duration": 6.70, "difficulty_preference": "Medium"},
    {"user_id": 14, "full_name": "Kavya Reddy", "preferred_wakeup_time": "06:15:00", "sleep_duration": 7.60, "difficulty_preference": "Hard"},
    {"user_id": 15, "full_name": "Mohan Khanna", "preferred_wakeup_time": "05:55:00", "sleep_duration": 8.00, "difficulty_preference": "Medium"},
    {"user_id": 16, "full_name": "Aditi Malhotra", "preferred_wakeup_time": "06:25:00", "sleep_duration": 7.30, "difficulty_preference": "Easy"},
    {"user_id": 17, "full_name": "Rohan Pillai", "preferred_wakeup_time": "07:05:00", "sleep_duration": 6.90, "difficulty_preference": "Hard"},
    {"user_id": 18, "full_name": "Ishita Choudhary", "preferred_wakeup_time": "06:35:00", "sleep_duration": 7.90, "difficulty_preference": "Medium"},
    {"user_id": 19, "full_name": "Aman Gupta", "preferred_wakeup_time": "05:40:00", "sleep_duration": 8.20, "difficulty_preference": "Easy"},
    {"user_id": 20, "full_name": "Sanjana Kulkarni", "preferred_wakeup_time": "06:50:00", "sleep_duration": 7.10, "difficulty_preference": "Hard"},
    {"user_id": 21, "full_name": "Devansh Agarwal", "preferred_wakeup_time": "07:15:00", "sleep_duration": 6.60, "difficulty_preference": "Medium"},
    {"user_id": 22, "full_name": "Ritu Thakur", "preferred_wakeup_time": "06:05:00", "sleep_duration": 7.70, "difficulty_preference": "Easy"},
    {"user_id": 23, "full_name": "Nikhil Sharma", "preferred_wakeup_time": "05:48:00", "sleep_duration": 8.40, "difficulty_preference": "Hard"},
    {"user_id": 24, "full_name": "Mansi Bhosale", "preferred_wakeup_time": "06:55:00", "sleep_duration": 7.00, "difficulty_preference": "Medium"},
    {"user_id": 25, "full_name": "Harish Srinivasan", "preferred_wakeup_time": "06:12:00", "sleep_duration": 7.50, "difficulty_preference": "Easy"},
    {"user_id": 26, "full_name": "Tanya Varma", "preferred_wakeup_time": "05:58:00", "sleep_duration": 8.00, "difficulty_preference": "Hard"},
    {"user_id": 27, "full_name": "Amit Joshi", "preferred_wakeup_time": "07:00:00", "sleep_duration": 6.80, "difficulty_preference": "Medium"},
    {"user_id": 28, "full_name": "Divya Namboodiri", "preferred_wakeup_time": "06:22:00", "sleep_duration": 7.40, "difficulty_preference": "Easy"},
    {"user_id": 29, "full_name": "Bhavya Mishra", "preferred_wakeup_time": "05:42:00", "sleep_duration": 8.10, "difficulty_preference": "Hard"},
    {"user_id": 30, "full_name": "Yogesh Kamat", "preferred_wakeup_time": "06:40:00", "sleep_duration": 7.20, "difficulty_preference": "Medium"},
]

# Matches: postgresql scores table (all 30 real seeded rows)
SAMPLE_SCORES = [
    {"user_id": 1, "wakeup_consistency_score": 95.50, "habit_adherence_score": 90.00, "challenge_completion_score": 92.50, "productivity_score": 94.00, "sleep_routine_score": 91.00},
    {"user_id": 2, "wakeup_consistency_score": 88.00, "habit_adherence_score": 85.50, "challenge_completion_score": 87.00, "productivity_score": 89.50, "sleep_routine_score": 86.00},
    {"user_id": 3, "wakeup_consistency_score": 75.00, "habit_adherence_score": 70.50, "challenge_completion_score": 72.00, "productivity_score": 74.00, "sleep_routine_score": 73.50},
    {"user_id": 4, "wakeup_consistency_score": 84.25, "habit_adherence_score": 81.50, "challenge_completion_score": 79.75, "productivity_score": 82.00, "sleep_routine_score": 80.25},
    {"user_id": 5, "wakeup_consistency_score": 90.50, "habit_adherence_score": 88.25, "challenge_completion_score": 86.50, "productivity_score": 89.00, "sleep_routine_score": 87.75},
    {"user_id": 6, "wakeup_consistency_score": 76.00, "habit_adherence_score": 74.50, "challenge_completion_score": 72.25, "productivity_score": 75.50, "sleep_routine_score": 73.00},
    {"user_id": 7, "wakeup_consistency_score": 87.75, "habit_adherence_score": 85.00, "challenge_completion_score": 83.25, "productivity_score": 86.50, "sleep_routine_score": 84.50},
    {"user_id": 8, "wakeup_consistency_score": 91.25, "habit_adherence_score": 89.50, "challenge_completion_score": 88.00, "productivity_score": 90.75, "sleep_routine_score": 89.25},
    {"user_id": 9, "wakeup_consistency_score": 73.50, "habit_adherence_score": 70.75, "challenge_completion_score": 68.25, "productivity_score": 72.00, "sleep_routine_score": 69.50},
    {"user_id": 10, "wakeup_consistency_score": 88.50, "habit_adherence_score": 86.75, "challenge_completion_score": 84.50, "productivity_score": 87.25, "sleep_routine_score": 85.75},
    {"user_id": 11, "wakeup_consistency_score": 79.25, "habit_adherence_score": 77.00, "challenge_completion_score": 75.50, "productivity_score": 78.75, "sleep_routine_score": 76.25},
    {"user_id": 12, "wakeup_consistency_score": 82.75, "habit_adherence_score": 80.00, "challenge_completion_score": 78.25, "productivity_score": 81.50, "sleep_routine_score": 79.50},
    {"user_id": 13, "wakeup_consistency_score": 92.00, "habit_adherence_score": 90.25, "challenge_completion_score": 89.75, "productivity_score": 91.50, "sleep_routine_score": 90.00},
    {"user_id": 14, "wakeup_consistency_score": 85.50, "habit_adherence_score": 83.75, "challenge_completion_score": 81.25, "productivity_score": 84.00, "sleep_routine_score": 82.50},
    {"user_id": 15, "wakeup_consistency_score": 89.75, "habit_adherence_score": 87.50, "challenge_completion_score": 86.25, "productivity_score": 88.50, "sleep_routine_score": 87.00},
    {"user_id": 16, "wakeup_consistency_score": 81.00, "habit_adherence_score": 79.25, "challenge_completion_score": 77.75, "productivity_score": 80.50, "sleep_routine_score": 78.50},
    {"user_id": 17, "wakeup_consistency_score": 77.50, "habit_adherence_score": 75.75, "challenge_completion_score": 73.50, "productivity_score": 76.25, "sleep_routine_score": 74.00},
    {"user_id": 18, "wakeup_consistency_score": 86.25, "habit_adherence_score": 84.50, "challenge_completion_score": 83.00, "productivity_score": 85.75, "sleep_routine_score": 84.25},
    {"user_id": 19, "wakeup_consistency_score": 93.50, "habit_adherence_score": 91.75, "challenge_completion_score": 90.25, "productivity_score": 92.50, "sleep_routine_score": 91.00},
    {"user_id": 20, "wakeup_consistency_score": 80.75, "habit_adherence_score": 78.50, "challenge_completion_score": 76.75, "productivity_score": 79.25, "sleep_routine_score": 77.25},
    {"user_id": 21, "wakeup_consistency_score": 88.00, "habit_adherence_score": 86.25, "challenge_completion_score": 84.75, "productivity_score": 87.50, "sleep_routine_score": 85.50},
    {"user_id": 22, "wakeup_consistency_score": 74.25, "habit_adherence_score": 72.50, "challenge_completion_score": 70.00, "productivity_score": 73.25, "sleep_routine_score": 71.50},
    {"user_id": 23, "wakeup_consistency_score": 90.25, "habit_adherence_score": 88.75, "challenge_completion_score": 87.50, "productivity_score": 89.50, "sleep_routine_score": 88.25},
    {"user_id": 24, "wakeup_consistency_score": 83.50, "habit_adherence_score": 81.75, "challenge_completion_score": 80.00, "productivity_score": 82.25, "sleep_routine_score": 81.00},
    {"user_id": 25, "wakeup_consistency_score": 78.00, "habit_adherence_score": 76.25, "challenge_completion_score": 74.50, "productivity_score": 77.75, "sleep_routine_score": 75.50},
    {"user_id": 26, "wakeup_consistency_score": 85.25, "habit_adherence_score": 83.50, "challenge_completion_score": 82.00, "productivity_score": 84.75, "sleep_routine_score": 83.25},
    {"user_id": 27, "wakeup_consistency_score": 91.75, "habit_adherence_score": 89.25, "challenge_completion_score": 88.50, "productivity_score": 90.50, "sleep_routine_score": 89.00},
    {"user_id": 28, "wakeup_consistency_score": 87.25, "habit_adherence_score": 85.50, "challenge_completion_score": 84.00, "productivity_score": 86.25, "sleep_routine_score": 85.00},
    {"user_id": 29, "wakeup_consistency_score": 79.50, "habit_adherence_score": 77.75, "challenge_completion_score": 75.25, "productivity_score": 78.50, "sleep_routine_score": 76.75},
    {"user_id": 30, "wakeup_consistency_score": 86.75, "habit_adherence_score": 84.25, "challenge_completion_score": 82.75, "productivity_score": 85.50, "sleep_routine_score": 83.75},
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