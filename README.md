# Intelligent Cognitive Alarm Platform - Backend Service

This repository contains the backend code for the **Intelligent Cognitive Alarm Platform** developed for the `ratnesh` branch. It contains the **Authentication & Authorization Module** and the **Alarm Scheduling Module**.

---

## 📂 Project Structure

```text
Cognitive-Alarm-System/
├── backend/
│   ├── .env                    # Local environment settings (ignored by Git)
│   ├── .env.example            # Environment settings template
│   ├── .gitignore              # Git ignore rules for virtualenv, databases, and caches
│   ├── requirements.txt        # Backend dependencies
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py           # Configuration loader (Pydantic Settings)
│   │   ├── database.py         # SQLAlchemy engine and session setup
│   │   ├── dependencies.py     # Injectable DB and current user dependencies
│   │   ├── main.py             # FastAPI application entrypoint
│   │   ├── models.py           # SQLAlchemy database models
│   │   ├── schemas.py          # Pydantic validation schemas
│   │   ├── security.py         # Bcrypt hashing and JWT utility functions
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── alarms.py       # Alarm CRUD endpoints
│   │       ├── auth.py         # Registration & login endpoints
│   │       └── protected.py    # Demonstration routes for role checks
│   └── tests/
│       ├── __init__.py
│       ├── conftest.py         # Pytest fixtures and database overrides
│       ├── test_alarms.py      # Integration tests for Alarm scheduling
│       ├── test_auth.py        # Integration tests for Registration & Login
│       └── test_protected.py   # Integration tests for Token and RBAC checks
├── LICENSE
└── README.md                   # This file
```

---

## 🗄️ Database Schema & Relationships

The database layer is mapped using SQLAlchemy models and is fully compatible with the PostgreSQL database design. For local testing, it uses an automatic fallback to a local SQLite file database.

### 1. `users` Table
Stores user profile information, authentication hashes, and system permissions.
- `id` (UUID, Primary Key): Unique identifier of the user.
- `full_name` (String): The user's full name.
- `email` (String, Unique, Indexed): User's email address (used as login username).
- `password_hash` (String): Secure Bcrypt password hash.
- `role` (String, default `'user'`): User authorization role. Valid values: `'user'`, `'wellness_coach'`, `'admin'`.
- `is_active` (Boolean, default `True`): Flag to toggle user account access.
- `created_at` / `updated_at` (Timestamp): Timestamps.

### 2. `alarms` Table
Stores schedule configurations for alarm triggers.
- `id` (UUID, Primary Key): Unique identifier of the alarm.
- `user_id` (UUID, Foreign Key referencing `users.id`): Owner of the alarm.
- `title` (String): Name/Title of the alarm schedule.
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
┌──────────────┐             ┌──────────────┐
│    users     │             │    alarms    │
├──────────────┤             ├──────────────┤
│ id   (PK)    │ 1         * │ id   (PK)    │
│ email (UQ)   ├────────────o│ user_id (FK) │
│ password_hash│             │ alarm_time   │
│ role         │             │ repeat_type  │
│ ...          │             │ ...          │
└──────────────┘             └──────────────┘
```
- **Relationship:** One user can own multiple alarm schedules (`1` to `*` relationship). Deleting a user cascadingly purges all of their associated alarms.

---

## 📡 API Documentation

FastAPI automatically provides interactive Swagger API documentation when the server runs.

### 1. Authentication Endpoints (`/auth`)
* `POST /auth/register`: Create a new user account.
  - **Payload:** `{ "email": "user@example.com", "password": "secure_password", "full_name": "John Doe", "role": "user" }`
  - **Response:** `201 Created` returning user detail payload (excluding sensitive password hashes).
* `POST /auth/login`: Authenticate credentials (accepts standard `OAuth2PasswordRequestForm` containing `username` and `password`).
  - **Response:** Returns a bearer JWT access token: `{"access_token": "...", "token_type": "bearer"}`.
* `GET /auth/me`: Retrieve current logged-in user profile (requires valid Bearer token).
* `POST /auth/logout`: Signal logout (client discards access token).

### 2. Alarm Scheduling Endpoints (`/alarms`)
All alarm endpoints require a valid JWT bearer token. Users can only view or manage alarms that belong to them.
* `POST /alarms`: Create a new alarm.
  - **Payload:** `{ "title": "Gym Alarm", "alarm_time": "06:30:00", "repeat_type": "weekdays", "volume": 90 }`
  - **Validation:** Volume must be in `0-100`, snooze duration in `1-30`. If `repeat_type` is `'custom'`, `custom_days` is required.
* `GET /alarms`: Fetch all alarms belonging to the logged-in user.
* `GET /alarms/{alarm_id}`: Fetch details of a single alarm. Returns `403 Forbidden` if the alarm belongs to another user.
* `PUT /alarms/{alarm_id}`: Update alarm configuration. Enforces ownership check.
* `DELETE /alarms/{alarm_id}`: Delete an alarm. Enforces ownership check.
* `PATCH /alarms/{alarm_id}/toggle`: Toggle active state (`is_active`). Enforces ownership check.

### 3. Role Restriction Demo Endpoints (`/protected`)
Used to verify and demonstrate role-based access control (RBAC):
* `GET /protected/any-auth`: Open to any logged-in user.
* `GET /protected/coach-only`: Open to `'wellness_coach'` or `'admin'` roles.
* `GET /protected/admin-only`: Open to `'admin'` role only.

---

## 🚀 Setup & Execution

### 1. Install Dependencies
Ensure you have Python 3.13+ installed:
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate      # Windows Powershell
# source .venv/bin/activate # macOS/Linux
pip install -r requirements.txt
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your secrets/database credentials:
```bash
cp .env.example .env
```
By default, the backend will auto-create and run against a local SQLite file (`cognitive_alarm.db`). To connect to PostgreSQL, configure the `DATABASE_URL` in `.env`.

### 3. Run Development Server
```bash
uvicorn app.main:app --reload
```
Open [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) in your browser to access the Swagger UI documentation.

### 4. Run Automated Test Suite
Run tests using Pytest to verify security constraints and database operations:
```bash
python -m pytest
```
