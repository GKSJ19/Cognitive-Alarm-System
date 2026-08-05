# Firebase Google Sign-In — Addendum to Milestone 2

This is an **optional add-on**, not part of the original milestone plan (which listed OAuth2 login as a stretch goal). It's built to be safe to merge even if the team ultimately decides not to use it — Firebase stays completely inactive unless `FIREBASE_CREDENTIALS_PATH` is set in `.env`.

## What This Adds

| File | Change |
|---|---|
| `app/firebase.py` | **New** — initializes Firebase Admin SDK, verifies Firebase ID tokens |
| `app/models.py` | `hashed_password` is now nullable; added `firebase_uid` column |
| `app/schemas.py` | Added `GoogleSignInRequest` |
| `app/routes/auth_routes.py` | Added `POST /auth/google`; login route now safely rejects Google-only accounts instead of crashing |
| `app/main.py` | Calls `init_firebase()` at startup (no-ops if not configured) |
| `requirements.txt` | Added `firebase-admin` |
| `migration_firebase.sql` | **New** — run this against your existing database |
| `tests/test_google_signin.py` | **New** — 3 tests, including 2 with mocked Firebase verification |

## New Endpoint

```
POST /auth/google
Body: { "firebase_id_token": "string" }
Success (200): { "access_token", "refresh_token", "token_type" }
Errors:
  401 - invalid/expired Firebase token
  503 - Firebase not configured on this server
  400 - Google account has no email
```

**Behavior:**
1. Verifies the Firebase ID token against Firebase's servers
2. Looks up an existing user by `firebase_uid`
3. If none found, checks for an existing email/password account with the same email and **links** it (avoids duplicate accounts)
4. If truly new, creates a fresh user (no password — `hashed_password` is `NULL`)
5. Returns the exact same `access_token`/`refresh_token` pair as `/auth/login` — **everything downstream (`/users/me`, alarms, etc.) works identically, regardless of how the user signed in**

## Setup — Getting This Running

### 1. Get a Firebase service account key (the RIGHT way this time)
- Firebase Console → Project Settings → Service Accounts → **Generate new private key**
- Save the downloaded file somewhere **outside your Git repo** — e.g. `C:\secrets\firebase-key.json`, not inside `Cognitive-Alarm-System\`
- **Never** paste its contents anywhere, commit it, or send it over chat — treat it exactly like a database password

### 2. Point your `.env` at it
```
FIREBASE_CREDENTIALS_PATH=C:\secrets\firebase-key.json
```
Leave this blank to keep Firebase disabled — the app runs fine either way.

### 3. Install the new dependency
```bash
pip install -r requirements.txt
```

### 4. Run the migration
In pgAdmin's Query Tool, run `migration_firebase.sql` (after `migration.sql` from Milestone 2, if you haven't already).

### 5. Restart the server
```bash
uvicorn app.main:app --reload
```
If `FIREBASE_CREDENTIALS_PATH` is set correctly, it initializes silently on startup. If the path is wrong, you'll get a clear error at startup (not a silent failure).

## Testing

**Automated (works without any real Firebase project):**
```bash
python -m pytest tests/ -v
```
Expect `15 passed` — the 3 new tests use a mocked Firebase verification, since generating a real Firebase ID token requires an actual signed-in Flutter app.

**Manual, with Firebase not configured (default state):**
- `POST /auth/google` with any body → expect `503` — confirms it fails safely rather than crashing

**Manual, with a real Firebase project configured:**
- You'll need Flutter's Google Sign-In flow to actually produce a real ID token — this can't be faked from Postman/Swagger alone
- Once Member 4 has a real token, test `POST /auth/google` with it → expect `200` with a token pair
- Confirm `GET /users/me` with that access token works identically to an email/password login

## Design Decisions Worth Flagging to the Team

- **Existing accounts get linked, not duplicated** — if someone registered with email/password first and later signs in with Google using the same email, it's treated as the same account.
- **`hashed_password` is nullable now** — a Google-only user has no password at all. `/auth/login` correctly rejects these accounts with a normal `401` rather than crashing.
- **Firebase is fully optional** — nothing breaks if `FIREBASE_CREDENTIALS_PATH` is left blank; the endpoint just returns a clear `503` instead of being silently broken or crashing the whole app.
