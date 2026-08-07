# API Reference & Data Models

---

## 1. API Endpoints

### 1.1 `GET /api/dashboard`
Aggregates all analytics, scores, and recommendations into a single view.
- **Parameters:** `user_id` (Query String)
- **Response (200 OK):** Returns a composite JSON object containing the sub-objects for analytics, habit score, recommendations, and adaptive difficulty.

### 1.2 `GET /api/analytics`
Fetches raw behavioral analytics.
- **Parameters:** `user_id` (Query String)
- **Response (200 OK):** `{"user_id": "string", "analytics": {"average_sleep_hours": float, ...}}`

### 1.3 `GET /api/habit-score`
Computes and fetches the user's habit score.
- **Parameters:** `user_id` (Query String)
- **Response (200 OK):** `{"user_id": "string", "habit_score": float, "classification": "string"}`

### 1.4 `GET /api/recommendation`
Fetches personalized recommendations.
- **Parameters:** `user_id` (Query String)
- **Response (200 OK):** `{"user_id": "string", "recommendations": ["string"]}`

### 1.5 `GET /api/adaptive-level`
Fetches and updates the user's recommended difficulty level.
- **Parameters:** `user_id` (Query String)
- **Response (200 OK):** `{"user_id": "string", "current_level": "string", "new_level": "string", "reason": "string"}`

---

## 2. Pydantic Data Models

The following Pydantic schemas (defined in `app/models/schemas.py`) validate all API responses:

### 2.1 `UserData`
Represents the raw user record from the database.
| Field | Type | Description |
|-------|------|-------------|
| `user_id` | `str` | Unique identifier for the user |
| `wake_up_time` | `str` | Target wake-up time (e.g., "07:00") |
| `snooze_count` | `int` | Number of snooze button presses |
| `challenge_completion_time_sec` | `int` | Time taken to complete the challenge (seconds) |
| `accuracy_percent` | `float` | Accuracy of challenge completion (0–100%) |
| `sleep_duration_hours` | `float` | Hours of sleep recorded |
| `success_rate` | `float` | Overall challenge success rate (0–100%) |
| `current_difficulty` | `str` | Current difficulty level (Beginner/Easy/Medium/Hard/Expert) |

### 2.2 `HabitScoreResponse`
Returned by `GET /api/habit-score`.
| Field | Type | Description |
|-------|------|-------------|
| `user_id` | `str` | User identifier |
| `habit_score` | `float` | Computed habit score (0–100) |
| `classification` | `str` | Tier label (Excellent/Good/Average/Needs Improvement) |

### 2.3 `RecommendationResponse`
Returned by `GET /api/recommendation`.
| Field | Type | Description |
|-------|------|-------------|
| `user_id` | `str` | User identifier |
| `recommendations` | `list[str]` | Array of personalized coaching tips |

### 2.4 `AdaptiveLevelResponse`
Returned by `GET /api/adaptive-level`.
| Field | Type | Description |
|-------|------|-------------|
| `user_id` | `str` | User identifier |
| `current_level` | `str` | Difficulty level before adjustment |
| `new_level` | `str` | Difficulty level after adjustment |
| `reason` | `str` | Explanation for the adjustment |

---

## 3. Sample Inputs

**Scenario 1: The Average User (user123)**
```json
{
    "user_id": "user123",
    "wake_up_time": "07:00",
    "snooze_count": 3,
    "challenge_completion_time_sec": 45,
    "accuracy_percent": 65.0,
    "sleep_duration_hours": 6.0,
    "success_rate": 70.0,
    "current_difficulty": "Medium"
}
```

**Scenario 2: The Excellent User (user456)**
```json
{
    "user_id": "user456",
    "wake_up_time": "06:00",
    "snooze_count": 0,
    "challenge_completion_time_sec": 20,
    "accuracy_percent": 95.0,
    "sleep_duration_hours": 8.0,
    "success_rate": 92.0,
    "current_difficulty": "Easy"
}
```

---

## 4. Sample Outputs

**API Output for Scenario 1 (`GET /api/dashboard?user_id=user123`):**
```json
{
  "user_id": "user123",
  "analytics": {
    "average_sleep_hours": 6.0,
    "average_snooze_count": 3.0,
    "average_accuracy": 65.0,
    "is_sleep_deprived": true,
    "high_snooze_dependency": true
  },
  "habit_score": 68.25,
  "classification": "Average",
  "recommendations": [
    "Increase sleep duration to at least 7-8 hours.",
    "Sleep earlier to improve morning alertness.",
    "Reduce snooze usage to avoid sleep fragmentation.",
    "Improve challenge accuracy by practicing more memory puzzles.",
    "Maintain consistency with your wake-up time to boost your habit score."
  ],
  "adaptive_difficulty": {
    "current": "Medium",
    "recommended": "Medium"
  }
}
```

**API Output for Scenario 2 (`GET /api/dashboard?user_id=user456`):**
```json
{
  "user_id": "user456",
  "analytics": {
    "average_sleep_hours": 8.0,
    "average_snooze_count": 0.0,
    "average_accuracy": 95.0,
    "is_sleep_deprived": false,
    "high_snooze_dependency": false
  },
  "habit_score": 91.75,
  "classification": "Excellent",
  "recommendations": [
    "Great job! Maintain your current excellent habits."
  ],
  "adaptive_difficulty": {
    "current": "Easy",
    "recommended": "Medium"
  }
}
```

*(Note how User 456's excellent success rate correctly triggers the Adaptive Difficulty Engine to upgrade their difficulty from Easy to Medium, and their 0 snoozes result in a near-perfect score).*
