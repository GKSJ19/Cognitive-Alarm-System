# Intelligent Cognitive Alarm Platform - Full Stack

## Developer Details
- **Team Member:** Ratnesh Kumar
- **Branch:** ratnesh

---

## Project Overview

The **Intelligent Cognitive Alarm Platform** is a full-stack, AI-powered system designed to help users build healthy wake-up habits. Instead of simply tapping a button to dismiss alarms, users must solve cognitive challenges (such as math equations, logic puzzles, or memory tests).

This repository contains:
1. **FastAPI Backend Server:** An asynchronous API service handling authentication, role-based authorization, alarm scheduling, user profile routine logs, and avatar storage.
2. **React Native Expo Frontend Client:** A cross-platform mobile application powered by Redux Toolkit for state management, React Navigation for drawer/tab transitions, and React Native Paper for a premium material UI design.

---

## 🏗️ System Architecture & Folder Layout

```text
Cognitive-Alarm-System/
├── backend/                  # FastAPI API Service
│   ├── app/
│   │   ├── routes/           # REST Router endpoints (Auth, Profile, Alarms)
│   │   ├── database.py       # SQLAlchemy engine and SQLite session setup
│   │   ├── models.py         # SQLAlchemy ORM schemas (Users, Profiles, Alarms)
│   │   ├── schemas.py        # Pydantic schemas for request/response validation
│   │   └── main.py           # Application entrypoint & CORS middleware configuration
│   ├── static/               # Uploaded static media assets (Avatars)
│   ├── tests/                # Pytest integration test suite (25 test cases)
│   └── requirements.txt      # Python dependencies manifest
│
├── frontend/                 # React Native / Expo Client App
│   ├── src/
│   │   ├── components/       # Common reusable UI elements
│   │   ├── config/           # Base URL and environment variables
│   │   ├── hooks/            # Custom hooks (useAuth, useAlarms, useProfile)
│   │   ├── navigation/       # Navigation routes (AppNavigator, AuthNavigator)
│   │   ├── screens/          # App screens (Login, Register, Dashboard, Alarms, Profile)
│   │   ├── services/         # Axios API clients for backend integration
│   │   ├── store/            # Redux Toolkit store configurations
│   │   ├── theme/            # UI design tokens (color palettes, typography)
│   │   ├── types/            # TypeScript static type declarations
│   │   └── utils/            # Validators and local storage helpers
│   ├── App.tsx               # Client entrypoint
│   ├── app.json              # Expo application manifest
│   └── package.json          # Node dependencies manifest
```

---

## 🚀 Local Installation & Running Guide

### 1. Backend Server Setup
Ensure you have [Python 3.10+](https://www.python.org/) installed.
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   # On Windows:
   .venv\Scripts\activate
   # On macOS/Linux:
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   *The interactive Swagger UI documentation will be available at:* **`http://127.0.0.1:8000/docs`**

---

### 2. Frontend Client Setup
Ensure you have [Node.js](https://nodejs.org/) installed.
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install package dependencies:
   ```bash
   npm install
   ```
3. Run the Expo development server:
   ```bash
   npx expo start
   ```
   - Press **`w`** to run in your local web browser.
   - Scan the **QR Code** using the Expo Go application on your mobile device to test live.

---

## 🗄️ Database Schema & Relationships

The database layer is mapped using SQLAlchemy ORM and automatically initializes tables on startup.

### 1. `users` Table
Stores authentication logs, passwords, and permissions.
- `id` (UUID, PK): Unique identifier.
- `full_name` (String): User's display name.
- `email` (String, Unique, Indexed): User's login ID.
- `password_hash` (String): Secure Bcrypt password hash.
- `role` (String, default `'user'`): Authorization level (`'user' | 'wellness_coach' | 'admin'`).
- `is_active` (Boolean, default `True`): Flag to toggle account access.

### 2. `user_profiles` Table
Stores granular demographic routine preferences.
- `id` (UUID, PK): Profile identifier.
- `user_id` (UUID, FK referencing `users.id` with `ON DELETE CASCADE`, Unique): Profile owner.
- `profile_photo` (String, Nullable): Saved path to user avatar.
- `phone_number` / `gender` / `date_of_birth` / `occupation` (String, Nullable): Personal credentials.
- `timezone` (String, default `'UTC'`): Target timezone location.
- `preferred_wakeup_time` / `preferred_sleep_time` (String, Nullable): Routine targets.
- `bio` (String, Nullable): Short user descriptions.

### 3. `alarms` Table
Stores schedules for alarm alerts.
- `id` (UUID, PK): Alarm identifier.
- `user_id` (UUID, FK referencing `users.id` with `ON DELETE CASCADE`): Alarm owner.
- `title` (String): Display name of the alarm.
- `alarm_time` (Time): Time of day (e.g. `07:30:00`).
- `repeat_type` (String, default `'daily'`): Recurrence rules (`'once' | 'daily' | 'weekdays' | 'weekends' | 'custom'`).
- `custom_days` (String, Nullable): Comma-separated active days (e.g. `MON,WED,FRI`).
- `challenge_type` (String, default `'math'`): Cognitive dismissal puzzle type.
- `volume` (Integer, default `80`): Volume level between `0` and `100`.
- `vibration` / `snooze_enabled` (Boolean, default `True`): Dismiss options.
- `snooze_duration` (Integer, default `5`): Snooze length in minutes.
- `is_active` (Boolean, default `True`): Flag to activate/deactivate.
- `is_smart_adaptive` (Boolean, default `False`): Enables AI habits adjustments.

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

---

## 💻 Frontend Client State & Flow Schema

### Redux RootState Schema
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

### Component Flow Layout
```text
       ┌────────────────────────────────────────────────────────┐
       │               AppNavigator (Navigation Routing)         │
       ├────────────────────────────────────────────────────────┤
       │  AuthNavigator                                         │
       │   ├── SplashScreen                                     │
       │   ├── LoginScreen                                      │
       │   └── RegisterScreen                                   │
       │                                                        │
       │  Drawer/TabNavigator (Authenticated Routes)            │
       │   ├── UserDashboardScreen                              │
       │   ├── AlarmListScreen                                  │
       │   │    ├── AddAlarmScreen                              │
       │   │    └── EditAlarmScreen                             │
       │   ├── ProfileScreen                                    │
       │   │    └── EditProfileScreen                           │
       │   └── SettingsScreen                                   │
       └──────────────────────────┬─────────────────────────────┘
                                  │
                                  ▼
       ┌────────────────────────────────────────────────────────┐
       │             Redux Store (State Management)              │
       ├──────────────────────────┬─────────────────────────────┤
       │  authSlice               │  profileSlice               │
       │   ├── user               │   ├── profile               │
       │   ├── token              │   └── isLoading             │
       │   └── isAuthenticated    │                             │
       ├──────────────────────────┼─────────────────────────────┤
       │  alarmSlice              │  Axios Client (API Sync)    │
       │   ├── alarms             │   ├── Auth Requests         │
       │   └── history            │   ├── Profile Requests      │
       │                          │   └── Alarm Requests        │
       └──────────────────────────┴─────────────────────────────┘
```