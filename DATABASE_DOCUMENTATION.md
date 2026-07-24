# Database Documentation — Milestone 2

The platform uses a hybrid dual-database model combining PostgreSQL (Structured ACID data) and MongoDB (Unstructured analytics & audit logs).

---

## 🐘 1. PostgreSQL Schema (SQLAlchemy ORM)

### `users` Table
- `id` (UUID, Primary Key)
- `email` (String, Unique, Index)
- `hashed_password` (String)
- `full_name` (String, Optional)
- `is_active` (Boolean, Default True)
- `is_superuser` (Boolean, Default False)
- `created_at`, `updated_at` (DateTime UTC)

### `alarms` Table
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key $\rightarrow$ `users.id`)
- `time` (Time / String "HH:MM:SS")
- `days` (String "Mon,Tue,Wed")
- `challenge_type` (String, e.g., "random", "math", "logic")
- `difficulty` (String "adaptive", "easy", "medium", "hard")
- `active` (Boolean, Default True)

### `challenge_sessions` Table
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key $\rightarrow$ `users.id`)
- `challenge_type` (String)
- `sub_type` (String, Optional)
- `difficulty` (String)
- `score` (Integer, Default 0)
- `xp_earned` (Integer, Default 0)
- `time_taken_seconds` (Float, Default 0.0)
- `is_successful` (Boolean, Default False)
- `completed_at` (DateTime UTC)

### `habit_streaks` Table
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key $\rightarrow$ `users.id`, Unique)
- `current_streak` (Integer, Default 0)
- `max_streak` (Integer, Default 0)
- `total_xp` (Integer, Default 0)
- `last_completed_at` (DateTime UTC, Optional)

### `rewards` Table
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key $\rightarrow$ `users.id`)
- `name` (String)
- `description` (String, Optional)
- `icon_name` (String, Optional)
- `earned_at` (DateTime UTC)

---

## 🍃 2. MongoDB Collections (Motor Driver)

### `challenge_logs` Collection
Stores every challenge attempt with full telemetry for analytics:
```json
{
  "_id": "ObjectId(...)",
  "user_id": "uuid-string",
  "challenge_id": "uuid-string",
  "category": "math",
  "sub_type": "algebra",
  "difficulty": "hard",
  "question_text": "Solve for x: 3x + 12 = 45",
  "user_answer": "11",
  "correct_answer": "11",
  "is_correct": true,
  "score": 35,
  "xp_earned": 105,
  "time_taken_seconds": 4.82
}
```
