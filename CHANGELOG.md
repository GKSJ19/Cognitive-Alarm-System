# Changelog — Intelligent Cognitive Alarm Platform

All notable changes to this project will be documented in this file.

## [2.0.0] - Milestone 2 Release - 2026-07-23

### Added
- **7 Cognitive Challenge Generators**: Added Math, Logic, Memory, Word Games, Pattern Recognition, Riddles, and Quick Quizzes.
- **Adaptive Difficulty Manager**: Auto-adjusts difficulty based on last 5 session success rates.
- **Gamification Engine**: Score computation with time bonus, difficulty XP multipliers, and 15 unlockable badges.
- **User Progress APIs**: Created `/api/v1/progress/summary`, `/api/v1/progress/categories`, and `/api/v1/progress/leaderboard`.
- **MongoDB Integration**: Document logging for attempt telemetry via `motor` driver.
- **PostgreSQL Database Support**: Switched primary ORM connection driver to `asyncpg`.
- **Docker Compose Stack**: Multi-service Docker setup with PostgreSQL 16, MongoDB 7, Mongo-Express, and FastAPI backend.
- **Test Suite**: Added unit test coverage for Auth, Alarms, Challenges, and Progress services.
- **Firebase Service Stub**: Push notification wrapper for alarm triggers.

### Changed
- Refactored `app/routers/challenges.py` to route all 7 categories.
- Enhanced `HabitStreak` model with `total_xp` tracking.
