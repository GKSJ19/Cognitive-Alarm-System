# REST API Documentation — Milestone 2

All endpoints are prefixed with `/api/v1`. Interactive Swagger docs available at `/api/docs`.

---

## 🔒 1. Authentication Router (`/auth`)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/auth/register` | Register a new user account | Public |
| `POST` | `/auth/login` | Authenticate and obtain JWT access token | Public |
| `POST` | `/auth/refresh` | Refresh an expired access token | Refresh Token |
| `GET` | `/auth/me` | Fetch authenticated user profile & role | Bearer JWT |

---

## ⏰ 2. Alarms Router (`/alarms`)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/alarms/` | List all active alarms for current user | Bearer JWT |
| `POST` | `/alarms/` | Create a new alarm schedule | Bearer JWT |
| `GET` | `/alarms/{id}` | Get specific alarm details | Bearer JWT |
| `PUT` | `/alarms/{id}` | Update alarm (time, days, category, difficulty) | Bearer JWT |
| `DELETE` | `/alarms/{id}` | Delete an alarm | Bearer JWT |

---

## 🧩 3. Cognitive Challenges Router (`/challenges`)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/challenges/generate` | Generate a new challenge for a given alarm ID | Bearer JWT |
| `POST` | `/challenges/submit` | Submit user's answer, compute score/XP/badges | Bearer JWT |
| `GET` | `/challenges/history` | Paginated challenge session history | Bearer JWT |

---

## 📊 4. Progress & Analytics Router (`/progress`)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/progress/summary` | Overall stats (Total XP, level, streak, accuracy) | Bearer JWT |
| `GET` | `/progress/categories` | Per-category breakdown (attempts, accuracy, XP) | Bearer JWT |
| `GET` | `/progress/leaderboard` | Global XP ranking leaderboard | Bearer JWT |

---

## 🎯 5. Habits & Streaks Router (`/habits`)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/habits/analytics` | Retrieve streak status and recent rewards | Bearer JWT |

---

## 🩺 6. System Router (`/health`)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/health` | Application & database health status | Public |
