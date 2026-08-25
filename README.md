# Intelligent Cognitive Alarm Platform (ICAP)

## Developer Details
- **Team Member:** Ratnesh Kumar
- **Branch:** `AI_ML_Integration`
- **Project :** Intelligent Cognitive Alarm Platform 

---

## 🚀 Project Overview

The **Intelligent Cognitive Alarm Platform (ICAP)** is a full-stack, AI-powered systems solution designed to transform wake-up routines. Instead of regular alarms that can be easily dismissed with a single tap, ICAP enforces cognitive challenges (e.g., mathematics, memory puzzles, logic riddles) to ensure cognitive wakefulness before the alarm is dismissed.

The system incorporates behavioral analytics, habit scoring, and adaptive challenge difficulty adjustments to dynamically tune the morning routine experience to the user's cognitive performance over time.

---

## 🏗️ System Architecture & Layout

```text
Cognitive-Alarm-System/
├── backend/                        # FastAPI REST API Backend
│   ├── app/
│   │   ├── adaptive_engine/        # Dynamic difficulty adaptation logic
│   │   ├── behavioral_analytics/   # Tracks user snooze habits & wake delays
│   │   ├── dashboard/              # User & wellness coach overview statistics
│   │   ├── habit_scoring/          # Multi-weight overall consistency scoring
│   │   ├── recommendation_engine/  # Proactive routine tips & LLM configurations
│   │   ├── models/                 # SQLAlchemy database schemas
│   │   ├── routes/                 # REST Router endpoints (Auth, Alarms, Reports)
│   │   ├── schemas/                # Pydantic schemas for verification
│   │   ├── services/               # Core utility services (PDF export reports)
│   │   ├── database.py             # SQLAlchemy session and engine setups
│   │   ├── logging_config.py       # Custom log formatting & file outputs
│   │   └── main.py                 # Application entrypoint & middlewares
│   ├── static/                     # User uploads storage (profile pictures)
│   ├── scripts/                    # Maintenance utilities (database backups)
│   ├── tests/                      # Pytest integration & performance test suites
│   ├── requirements.txt            # Python dependencies manifest
│   └── Dockerfile                  # Backend container configuration
│
├── frontend/                       # React Native Expo Frontend Client
│   ├── src/
│   │   ├── components/             # Reusable UI widgets (cards, inputs, dialogues)
│   │   ├── config/                 # Axios clients and base URLs
│   │   ├── hooks/                  # Global hooks (useAuth, useProfile, useAlarms)
│   │   ├── navigation/             # Drawer and Tab routing navigation
│   │   ├── screens/                # Mobile views (Login, Alarms, Dashboard, Profile)
│   │   ├── store/                  # Redux Toolkit slice store configs
│   │   └── theme/                  # Material design tokens (colors, typography)
│   ├── App.tsx                     # Entry React client component
│   └── package.json                # NPM configuration details
│
└── docker-compose.yml              # Container orchestration configuration
```

---

## 💻 Tech Stack

* **Backend:** FastAPI (Python), SQLAlchemy ORM, Uvicorn, SQLite/PostgreSQL, ReportLab (PDF Engine)
* **Frontend:** React Native (Expo), TypeScript, Redux Toolkit (State Management), React Native Paper, React Navigation
* **DevOps:** Docker, Docker Compose, Pytest Integration framework

---

## 🚀 Local Installation & Execution Guide

### 1. Backend Server Setup
1. **Navigate to the Backend directory:**
   ```bash
   cd backend
   ```
2. **Create and Activate a Virtual Environment:**
   * **Windows:**
     ```powershell
     python -m venv .venv
     .venv\Scripts\activate
     ```
   * **macOS/Linux:**
     ```bash
     python -m venv .venv
     source .venv/bin/activate
     ```
3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
4. **Run the Uvicorn Dev Server:**
   ```bash
   .venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   * *Swagger API docs will be active at:* **`http://127.0.0.1:8000/docs`**

### 2. Frontend Client Setup
1. **Navigate to the Frontend directory:**
   ```bash
   cd ../frontend
   ```
2. **Install Node Modules:**
   ```bash
   npm install
   ```
3. **Start the Expo Bundler:**
   ```bash
   npx expo start
   ```
   * Press `w` to run in your local web browser.
   * Scan the QR code with your Expo Go app on iOS or Android for live mobile testing.

---

## 🗄️ Database Schema & ORM Relationships

The database layer uses SQLAlchemy ORM to manage relational schema layouts. Below is the relationship map and core tables:

### 1. Users and Profiles
* `users`: Stores user identification credentials, password hashes, external OAuth provider IDs (`google_id`, `apple_id`), and system roles (`user`, `wellness_coach`, `admin`).
* `user_profiles`: Holds demographic and wake/sleep goals linked via `user_id` (with cascade delete rules).

### 2. Alarms and Challenges
* `alarms`: Tracks scheduled wake timings, custom day listings (`repeat_days`), volume controls, sound configurations (`ringtone`), puzzle types (`challenge_type`), and adaptive difficulties.
* `challenges`: Stores math, pattern, or logic questions with correct answers for cognitive tests.
* `challenge_attempts`: Logs individual puzzle submissions during alarm clearances to track user response correctness.
* `challenge_results`: Stores accuracy rates and completion speeds for final evaluation reports.

### 3. Analytics and Engines
* `alarm_histories`: Logs wake consistency delays and snooze clicks for daily reviews.
* `difficulty_histories`: Tracks when and why an alarm difficulty was changed.
* `user_behavior_analytics`: Aggregates day-wise metrics (wake delay, snooze counts, sleep hours).
* `habit_scores`: Logs daily habit scores computed across wake consistency, snooze rates, and sleep compliance.
* `recommendations`: Houses personalized advice tailored to behavioral history trends.

---

## 📅 Week-Wise & Step-Wise Development Log

The following section outlines the complete roadmap of how the Intelligent Cognitive Alarm Platform was built step-by-step:

### Week 1: Foundation, Initial Environment Setup & Groundwork
* **Step 1.1:** Created the repository directory structure separating `/backend` (FastAPI) and `/frontend` (React Native Expo).
* **Step 1.2:** Configured project-level ignore patterns (`.gitignore`), template configs (`.env.example`), and virtual environments.
* **Step 1.3:** Setup Git branching policy on the development branch `ratnesh`.

### Week 2: Secure Authentication & Role-Based Authorization
* **Step 2.1:** Configured the SQLAlchemy database session generator in `backend/app/database.py`.
* **Step 2.2:** Formulated the primary relational schema layout for `User` and `UserProfile` in `backend/app/models/models.py`.
* **Step 2.3:** Integrated JWT-based security middleware handling hashing configurations and credential validations (`security.py`).
* **Step 2.4:** Developed endpoints in `backend/app/routes/auth.py` for user registration, JWT login, and token refreshments.
* **Step 2.5:** Programmed Role-Based Access Controls (RBAC) to enforce security authorization:
  * `user`: Standard personal alarms and stats access.
  * `wellness_coach`: Client tracking privileges.
  * `admin`: Complete system metrics, backups, and log supervision.
* **Step 2.6:** Executed a comprehensive pytest unit testing suite validation for token verification and access controls.

### Week 3: User Profile & Personalization Configurations
* **Step 3.1:** Designed Pydantic schemas validating user profile configurations, routine settings, timezones, and sleep goals.
* **Step 3.2:** Created backend endpoints in `backend/app/routes/profile.py` for fetching, modifying, and resetting user profiles.
* **Step 3.3:** Built static file mounting configurations supporting profile picture uploads and local disk storage under `static/avatars/`.
* **Step 3.4:** Setup ownership verifications preventing standard users from viewing or updating other users' profiles.

### Week 4: Alarm Scheduling Engine & CRUDS
* **Step 4.1:** Designed the `Alarm` database model structure mapping repeat types (`once`, `daily`, `weekdays`, `weekends`, `custom`) and custom day sequences.
* **Step 4.2:** Drafted robust Pydantic schemas validating alarm inputs (time validations, positive volume checks, snooze durations).
* **Step 4.3:** Programmed CRUD routes in `backend/app/routes/alarms.py` to create, retrieve, update, toggle, and delete individual alarms.
* **Step 4.4:** Added backend verification checking to verify that users could only view or modify alarms owned by themselves.
* **Step 4.5:** Developed integration test sets verifying alarm creation patterns, overlap checks, and timezone validation configurations.

### Week 5: React Native Expo Mobile Client Integration
* **Step 5.1:** Initialized React Native client environment installing libraries for navigation, state persistence, and styling.
* **Step 5.2:** Programmed global state management slices utilizing Redux Toolkit:
  * `authSlice`: Handles login status, JWT token caching, and user details.
  * `profileSlice`: Manages profile settings, goals, and static avatar fetches.
  * `alarmSlice`: Handles local state sync with FastAPI alarms CRUD database.
* **Step 5.3:** Developed core mobile navigation wrappers:
  * `AuthNavigator`: Switchboard for splash screen, signup, login, and recovery.
  * `AppNavigator`: Enforces drawers, bottom tab structures, and profile layouts for signed-in users.
* **Step 5.4:** Drafted screens utilizing React Native Paper templates matching material design rules:
  * `SplashScreen`, `LoginScreen`, `RegisterScreen`, `DashboardScreen`, `AlarmListScreen`, `CreateAlarmScreen`, `ProfileScreen`, and `SettingsScreen`.
* **Step 5.5:** Mapped local Axios API service helpers syncing operations between client actions and backend endpoints.

### Week 6: Intelligent Engines, Puzzles & Cognitive Workflows
* **Step 6.1:** Added the `ChallengeCategory`, `Challenge`, and `ChallengeAttempt` models to manage cognitive dismissal questions.
* **Step 6.2:** Developed puzzle generation endpoints in `backend/app/routes/challenges.py` supporting math calculations, patterns, and memory checks.
* **Step 6.3:** Programmed the **Habit Scoring Service** (`backend/app/habit_scoring/service.py`) computing overall daily scores (0-100) on a rolling 7-day scale using:
  * *Wake Consistency (30%)* - Speed of dismissing alarm.
  * *Challenge Completion (30%)* - Ratio of successful puzzles cleared.
  * *Snooze Reduction (20%)* - Penalties on snooze triggers.
  * *Sleep Schedule Adherence (20%)* - Comparison of sleep duration against preferences.
* **Step 6.4:** Developed the **Adaptive Difficulty Service** (`backend/app/adaptive_engine/service.py`) automatically tuning alarm challenges:
  * Scales challenge difficulties up (`Easy` -> `Medium` -> `Hard`) if solved quickly with high accuracy.
  * Scales challenge difficulties down if user struggles with response rates.
* **Step 6.5:** Programmed the **Recommendation Engine** (`backend/app/recommendation_engine/service.py`) analyzing behavior history logs to provide health tips.
* **Step 6.6:** Designed the general **Dashboard endpoint** (`backend/app/dashboard/router.py`) assembling stats, habit history graphs, and client overview matrices for coaches.

### Week 7: Reporting Services, Containerization & Deployment Orchestration
* **Step 7.1:** Built the automated report exporter service (`backend/app/services/reports.py`) compiling weekly PDFs of sleep metrics, accuracy charts, and habit score histories.
* **Step 7.2:** Containerized the backend using Docker, crafting a multi-stage `Dockerfile` and custom `.dockerignore`.
* **Step 7.3:** Created `docker-compose.yml` defining environment configurations, SQLite db mapping volumes, log paths, port routing, and auto-restart parameters.
* **Step 7.4:** Programmed a database backup utility script (`backend/scripts/backup_db.py`) executing automated database dumps.
* **Step 7.5:** Finalized complete system tests verifying API performance and database schema alignment.

### Week 8: Coach Communication System, Real-Time Notifications & Final Polish
* **Step 8.1:** Formulated the **Coach Notification Engine** (`backend/app/routes/notifications.py`) and relational database model `CoachNotification` (`backend/app/models/models.py`), enabling wellness coaches to issue real-time advice, reminders, and tips to targeted users.
* **Step 8.2:** Implemented notification endpoints including recipient lookup, inbox fetching (`/notifications/inbox`), coach sent history (`/notifications/sent`), and read status updates (`/notifications/{id}/read`).
* **Step 8.3:** Integrated mobile ringtone pickers and audio playback services (`alarmSoundService.ts`) for custom alarm sound management.
* **Step 8.4:** Added comprehensive unit and security test suites (`backend/tests/test_security.py`) validating JWT authorization and API security boundaries.
* **Step 8.5:** Finalized full system documentation, cross-platform synchronization, and production deployment readiness.

---

## 🔌 API Endpoint Catalog

### Authentication (`/auth`)
* `POST /auth/register` - Creates a new user profile and credentials.
* `POST /auth/login` - Validates credentials and returns JWT access tokens.
* `GET /auth/me` - Retrives details of the authenticated user.

### Alarms (`/alarms`)
* `GET /alarms/` - Fetches all active and inactive alarms for the user.
* `POST /alarms/` - Registers a new alarm scheduler config.
* `GET /alarms/{id}` - Details of a specific alarm.
* `PUT /alarms/{id}` - Updates settings of an alarm.
* `DELETE /alarms/{id}` - Removes an alarm from the database.

### Profiles (`/profile`)
* `GET /profile/` - Fetches current user profile settings.
* `PUT /profile/` - Updates user bio, goals, and timezone preferences.
* `POST /profile/avatar` - Uploads a new user profile picture avatar.

### Challenges & Performance (`/challenges`)
* `GET /challenges/next` - Generates a new puzzle based on user difficulty settings.
* `POST /challenges/verify` - Evaluates accuracy of a puzzle answer.
* `GET /challenges/results` - Details metrics of past solves.

### Notifications (`/notifications`)
* `POST /notifications/send` - Allows coaches or admins to send targeted notifications to users.
* `GET /notifications/inbox` - Fetches unread/read notifications for the current authenticated user.
* `GET /notifications/sent` - Retrieves all notifications sent by the logged-in coach.
* `PATCH /notifications/{id}/read` - Marks a specific notification as read.
* `PATCH /notifications/inbox/read-all` - Marks all user notifications as read.

### Dashboards & Analytics (`/dashboard` & `/analytics`)
* `GET /dashboard/user` - High-level details of habit scores and recommendations.
* `GET /dashboard/coach/clients` - List of clients monitored by the wellness coach.
* `GET /analytics/history` - Aggregates snooze interactions and wake times.

### Reports (`/reports`)
* `GET /reports/pdf` - Generates and downloads a PDF habit metrics report sheet.