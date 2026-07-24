# Testing Guide — Milestone 2

The test suite uses `pytest` with `pytest-asyncio` and `httpx`. Database tests run against an isolated in-memory SQLite database (`aiosqlite`) to avoid requiring a live PostgreSQL database during CI/CD.

---

## 🧪 Running Unit Tests

1. Navigate to `backend` directory:
   ```bash
   cd backend
   ```

2. Run tests:
   ```bash
   pytest -v --tb=short
   ```

3. Run test coverage report:
   ```bash
   pytest --cov=app tests/
   ```

---

## 🔬 Test Suite Coverage

- **`tests/test_auth.py`**:
  - User registration, duplicate email handling, login validation, JWT payload verification, `GET /auth/me`.
- **`tests/test_alarms.py`**:
  - Alarm creation, listing, deletion, ownership protection, unauthorized access attempts.
- **`tests/test_progress.py`**:
  - User summary, category breakdown analytics, leaderboard ranking.
- **`tests/test_challenge_engine.py`**:
  - Parametrized tests across all 7 challenge categories and 3 difficulty levels (21 test permutations).
  - Scoring functions, speed bonus logic, and adaptive difficulty calculations.
