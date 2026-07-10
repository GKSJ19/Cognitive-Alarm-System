# Milestone 1 — Registration & Login with JWT

Scope: only `POST /auth/register` and `POST /auth/login`. No protected routes yet — those come in Milestone 2.

## Setup

### 1. Place these files in your repo
Copy this entire structure into your cloned repo folder (the one where you created your branch), merging with any existing files. Do not create a separate nested folder.

### 2. Create and activate a virtual environment
```bash
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Create the PostgreSQL database
In `psql` or pgAdmin:
```sql
CREATE DATABASE alarm_app_db;
```

### 5. Configure environment variables
```bash
cp .env.example .env
```
Edit `.env` and fill in your real PostgreSQL credentials. Generate a real secret key:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```
Paste the output into `SECRET_KEY` in `.env`.

### 6. Run the server
```bash
uvicorn app.main:app --reload
```

## Testing Milestone 1 (checklist)

Open Swagger UI: http://127.0.0.1:8000/docs

1. **Confirm the server starts with no errors**, and check the `users` table was created:
   ```sql
   \c alarm_app_db
   \dt
   ```

2. **Test `POST /auth/register`** with a sample body:
   ```json
   {
     "username": "testuser",
     "email": "test@example.com",
     "password": "TestPass123"
   }
   ```
   Expect a `201 Created` response with the new user's data (no password shown).

3. **Check the database directly** to confirm the row exists and the password is hashed, not plain text:
   ```sql
   SELECT * FROM users;
   ```

4. **Test `POST /auth/login`** with the same email/password:
   ```json
   {
     "email": "test@example.com",
     "password": "TestPass123"
   }
   ```
   Expect a `200 OK` response with an `access_token`.

5. **Test a wrong password** — expect a `401 Unauthorized`, not a server crash.

Once all 5 pass, commit and push:
```bash
git add .
git commit -m "Milestone 1: user registration and login with JWT"
git push origin YourFullName
```

## What's intentionally NOT in this milestone
- `/users/me` or any protected route
- Role-based access (admin checks)
- Token verification/decoding on incoming requests

These are all Milestone 2 — ask me when you're ready to move on.
