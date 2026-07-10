# Intelligent Cognitive Alarm Platform

## Team Member
**Mariya Mallick**

## Branch
MariyaMallick

## Project Overview

The Intelligent Cognitive Alarm Platform is an AI-powered mobile application that helps users build healthy wake-up habits. Instead of simply dismissing an alarm, users must complete cognitive challenges such as math problems, logic puzzles, memory games, riddles, or pattern recognition tasks.

The system analyzes user performance and behavior to adapt challenge difficulty, reduce snooze habits, and provide personalized recommendations for improving sleep and productivity.

---

## My Responsibility

As the AI/ML developer, my responsibilities include:

- AI Challenge Engine
- Adaptive Difficulty Engine
- Behavior Analysis
- Recommendation Engine
- AI Workflow Design
- System Architecture Design
- Database Schema Design

---

## Week 1 Progress

- Completed System Architecture
- Completed Database Schema
- Added AI module structure
- Planned AI workflow
- Initialized AI project structure

---

## Folder Structure

```
ai/
docs/
README.md
PROJECT_PROGRESS.md
```

---

## 🗄️ Database Schema & Relationships

The database layer is mapped using SQLAlchemy models and automatically initializes on application startup.

### 1. `users` Table
Stores user profile information, authentication hashes, and system permissions.
- `id` (UUID, Primary Key): Unique identifier of the user.
- `full_name` (String): The user's full name.
- `email` (String, Unique, Indexed): User's email address (used as login username).
- `password_hash` (String): Secure Bcrypt password hash.
- `role` (String, default `'user'`): User authorization role. Valid values: `'user'`, `'wellness_coach'`, `'admin'`.
- `is_active` (Boolean, default `True`): Flag to toggle user account access.
- `created_at` / `updated_at` (Timestamp): Timestamps.

### 2. `user_profiles` Table
Stores granular sleep routine settings and demographic details for each user.
- `id` (UUID, Primary Key): Unique identifier of the user profile.
- `user_id` (UUID, Foreign Key referencing `users.id` with `ON DELETE CASCADE`, Unique): Links profile to the owner.
- `profile_photo` (String, Nullable): Relative path to user avatar.
- `phone_number` (String, Nullable): Contact phone number.
- `gender` (String, Nullable): Self-identified gender.
- `date_of_birth` (String, Nullable): Birthdate.
- `occupation` (String, Nullable): Profession/Occupation.
- `timezone` (String, default `'UTC'`): User preferred timezone.
- `preferred_wakeup_time` (String, Nullable): Expected wake-up target.
- `preferred_sleep_time` (String, Nullable): Target bed time.
- `bio` (String, Nullable): Personal bio description.
- `created_at` / `updated_at` (Timestamp): Timestamps.

### 3. `alarms` Table
Stores schedule configurations for alarm triggers.
- `id` (UUID, Primary Key): Unique identifier of the alarm.
- `user_id` (UUID, Foreign Key referencing `users.id` with `ON DELETE CASCADE`): Owner of the alarm.
- `title` (String): Custom name/Title of the alarm schedule.
- `alarm_time` (Time): Time of day when the alarm should trigger (e.g. `07:30:00`).
- `repeat_type` (String, default `'daily'`): Recurrence schedule. Valid values: `'once'`, `'daily'`, `'weekdays'`, `'weekends'`, `'custom'`.
- `custom_days` (String, Nullable): Comma-separated list of active days (e.g. `MON,WED,FRI`) when `repeat_type` is `'custom'`.
- `challenge_type` (String, default `'math'`): Type of cognitive puzzle to dismiss the alarm (e.g. `'math'`, `'memory'`, `'logic'`).
- `volume` (Integer, default `80`): Volume level between `0` and `100`.
- `vibration` (Boolean, default `True`): Flag to toggle device vibration.
- `snooze_enabled` (Boolean, default `True`): Flag to toggle snooze functionality.
- `snooze_duration` (Integer, default `5`): Snooze duration in minutes (between `1` and `30`).
- `is_active` (Boolean, default `True`): Flag to toggle alarm schedule on or off.
- `is_smart_adaptive` (Boolean, default `False`): Flag to activate dynamic scheduling based on habit scores.
- `created_at` / `updated_at` (Timestamp): Timestamps.

### Entity Relationship Mapping
```text
┌──────────────┐ 1          1 ┌──────────────┐
│    users     ├──────────────┤user_profiles │
├──────────────┤              ├──────────────┤
│ id   (PK)    │              │ id   (PK)    │
│ email (UQ)   │              │ user_id (FK) │
│ password_hash│              │ timezone     │
│ role         │              │ ...          │
│ ...          │              └──────────────┘
└──────┬───────┘
       │ 1
       │
       │ *
┌──────▼───────┐
│    alarms    │
├──────────────┤
│ id   (PK)    │
│ user_id (FK) │
│ alarm_time   │
│ repeat_type  │
│ ...          │
└──────────────┘
```
- **Relationships:**
  - One user has exactly one profile (`1` to `1` relationship). Deleting a user cascade-purges their profile.
  - One user can own multiple alarm schedules (`1` to `*` relationship). Deleting a user cascade-purges all of their associated alarms.

---

## Technologies

- Python
- FastAPI
- Flutter
- PostgreSQL
- MongoDB
- Scikit-learn
- XGBoost
- Firebase

---

## Status

✅ Week 1 Completed