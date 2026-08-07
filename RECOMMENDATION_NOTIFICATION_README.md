# Recommendation Engine & Notification System — Backend

This adds the two modules that were still stubs (`/recommend/ping`,
`/notify/ping`) in the ICAP backend: **Module 9 — Recommendation Engine**
and **Module 11 — Notification & Reminder System**, per the project spec.
Nothing else in the project was modified — no changes to `main.py`,
existing models, existing routers/services, or the `.env` file.

## What was added

```
app/schema/recommendation.py          Pydantic request/response models
app/schema/notification.py            Pydantic request/response models
app/services/recommendation_service.py  Rule-based recommendation engine
app/services/notification_service.py    Reminder/alert rule engine
app/services/push_service.py            FCM/APNS dispatch stub (safe no-op)
app/routers/recommendation.py         Full router (replaces the old ping stub)
app/routers/notification.py           Full router (replaces the old ping stub)
requirements.txt                      Same deps as "requirements .txt" + `requests`
```

`app/main.py` already imported and registered both routers under
`/recommend` and `/notify` — that wiring was left completely untouched.

The two new services reuse the data already produced by the existing
engines (`habit_score_service`, `behavior_service`, `difficulty_service`)
and the existing `Recommendation` / `Notification` models — no schema
changes, no new tables.

## Recommendation Engine (`/recommend`)

Rule-based, not ML — it reads habit score, behavior patterns and challenge
accuracy and turns them into short, actionable messages across the 5
categories from the spec: `sleep`, `wake_up`, `habit`, `productivity`,
`challenge`.

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/recommend/generate` | user | Runs the engine, persists new recommendations, returns what was created |
| GET | `/recommend/` | user | List own recommendations (`?category=`, `?unread_only=`, `?limit=`) |
| GET | `/recommend/summary` | user | Totals, unread count, breakdown by category |
| PATCH | `/recommend/{id}/read` | user | Mark one as read |
| PATCH | `/recommend/read-all` | user | Mark all as read |
| DELETE | `/recommend/{id}` | user | Delete one |
| GET | `/recommend/user/{user_id}` | admin / wellness_coach | View a specific user's recommendations (coaches must have a `coach_assignments` row for that user) |

Calling `/recommend/generate` repeatedly is safe: a category is skipped if a
recommendation for it was already created in the last 20 hours, so it won't
flood the list.

## Notification & Reminder System (`/notify`)

Covers all 6 notification types from the spec: `bedtime`, `wake_up`,
`habit_alert`, `challenge_reminder`, `progress`, `announcement`.

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/notify/generate` | user | Evaluates bedtime/wake-up/habit/challenge/progress rules, persists any that fire |
| GET | `/notify/` | user | List own notifications (`?unread_only=`, `?type=`, `?limit=`) |
| GET | `/notify/unread-count` | user | Unread badge count |
| PATCH | `/notify/{id}/read` | user | Mark one as read |
| PATCH | `/notify/read-all` | user | Mark all as read |
| DELETE | `/notify/{id}` | user | Delete one |
| POST | `/notify/announcement` | admin only | Platform announcement, fanned out to every active user |
| GET | `/notify/user/{user_id}` | admin / wellness_coach | View a specific user's notifications |

Each notification type has its own dedupe window (12h for bedtime / wake-up
/ challenge reminders, 24h for habit alerts / progress) so `/notify/generate`
is safe to call on every app foreground/poll without spamming the user.

**Push delivery:** `app/services/push_service.py` is the integration point
for the "Cloud Messaging (FCM/APNS)" box in the architecture diagram. Every
notification is always saved to the in-app notification center regardless
of push. If `FCM_SERVER_KEY` isn't set in `.env` (it isn't, by default),
push is a logged no-op — nothing breaks. Wiring real push later just means
adding a device-token table, adding `FCM_SERVER_KEY` to `.env`, and
replacing the body of `send_push_notification()` with a real FCM HTTP v1
call — see the docstring in that file.

## Setup (VS Code / Windows or any OS)

The delivered zip does **not** include a `venv/` folder (the one in the
original zip was a Windows-only, machine-specific virtual environment —
recreating it fresh avoids path/OS mismatches and keeps the download small).

1. Open the project folder in VS Code.
2. Create and activate a virtual environment:
   ```
   python -m venv venv
   venv\Scripts\activate        (Windows)
   source venv/bin/activate     (macOS/Linux)
   ```
3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
   > The original `requirements .txt` (with the space in the filename) is
   > still there too and is untouched. The new `requirements.txt` has the
   > exact same versions plus one addition: **`requests`**, which
   > `google-auth`'s `google.auth.transport.requests` needs at import time
   > for the `/users/google-login` route. Without it, the app fails to start
   > entirely (this was already true before this change — it just wasn't
   > exercised until something imported `app.routers.users`).
4. Make sure `.env` has a working `DATABASE_URL` and `JWT_SECRET_KEY` (it
   already does, unchanged).
5. Run it:
   ```
   uvicorn app.main:app --reload
   ```
6. Open `http://127.0.0.1:8000/docs` — `Recommendation` and `Notification`
   will show up as fully documented, interactive tags alongside the rest of
   the API.

No other installs are required — both new modules are pure business logic
on top of packages already in `requirements.txt`.

## Quick manual test (PowerShell), following the existing `# 1. Login.txt` style

```powershell
$response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/users/login" -Method POST -UseBasicParsing `
  -Headers @{ "Content-Type" = "application/json" } `
  -Body '{"email": "test@example.com", "password": "test1234"}'
$token = ($response.Content | ConvertFrom-Json).access_token
$headers = @{ "Authorization" = "Bearer $token" }

# Recommendations
Invoke-WebRequest -Uri "http://127.0.0.1:8000/recommend/generate" -Method POST -UseBasicParsing -Headers $headers
Invoke-WebRequest -Uri "http://127.0.0.1:8000/recommend/" -UseBasicParsing -Headers $headers

# Notifications
Invoke-WebRequest -Uri "http://127.0.0.1:8000/notify/generate" -Method POST -UseBasicParsing -Headers $headers
Invoke-WebRequest -Uri "http://127.0.0.1:8000/notify/unread-count" -UseBasicParsing -Headers $headers
```

## Verification already performed

Both modules were exercised end-to-end (register → login → update profile →
create alarm → generate/list/read/delete recommendations and notifications
→ admin announcement → coach/admin user-scoped views) against a live
FastAPI instance before delivery. All routes returned the expected status
codes, including the dedupe behavior on repeated `/generate` calls.
