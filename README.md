# Intelligent Cognitive Alarm Platform

## Team Member
**Kanishka**

## Branch
Kanishka

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

## 💻 Frontend Data Models & Redux Store Schema

This branch contains the frontend client application. The client application manages state using Redux Toolkit and interacts with the backend using Axios. Below are the key frontend data schemas and state structures.

### 1. TypeScript Interface Models

#### `User` (Authentication User Object)
Tracks session owner profiles and roles:
- `id` (string): Unique identifier of the user.
- `full_name` (string): The user's full name.
- `email` (string): User's registered email address.
- `role` (string): User authorization role (`'user' | 'coach' | 'admin'`).
- `is_active` (boolean): Flag to toggle account status.
- `is_verified` (boolean): Email verification status.

#### `Profile` (Detailed User Routine Preferences)
Stores demographic details and sleep schedule configurations:
- `profile_id` (string): Unique profile identifier.
- `user_id` (string): Reference linking to the owner user.
- `profile_photo` (string | null): Relative path/URI to user avatar.
- `phone_number` (string | null): Contact phone.
- `gender` (string | null): Self-identified gender.
- `date_of_birth` (string | null): Birth date.
- `occupation` (string | null): User profession.
- `timezone` (string): Preferred timezone.
- `preferred_wakeup_time` (string | null): Target wake-up time (e.g. `06:30`).
- `preferred_sleep_time` (string | null): Target bed time (e.g. `22:30`).
- `bio` (string | null): Personal bio.

#### `Alarm` (Alarm Schedule Config Scheme)
Controls alarm triggers and dismiss conditions:
- `alarm_id` (string): Unique identifier of the alarm.
- `user_id` (string): Reference to the creator user.
- `title` (string): Name/Title of the alarm.
- `alarm_time` (string): Trigger time (e.g. `07:30`).
- `repeat_days` (string | null): Comma-separated active days (e.g. `1,2,3,4,5` for weekdays).
- `challenge_required` (boolean): Flag to force cognitive puzzle completion.
- `challenge_type` (string): Type of cognitive puzzle to solve (e.g. `'math'`).
- `difficulty` (string): Puzzle difficulty level (`'easy' | 'hard'`).
- `vibrate` (boolean): Toggle device vibration.
- `snooze_enabled` (boolean): Toggle snooze button.
- `snooze_duration` (number): Snooze length in minutes.
- `is_active` (boolean): Toggle alarm on or off.

---

### 2. Redux Store State Schema

The Redux root state maps the application state as follows:

```typescript
export interface RootState {
  auth: {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
  };
  profile: {
    profile: Profile | null;
    isLoading: boolean;
    error: string | null;
  };
  alarms: {
    alarms: Alarm[];
    history: AlarmHistory[];
    isLoading: boolean;
    error: string | null;
  };
}
```

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