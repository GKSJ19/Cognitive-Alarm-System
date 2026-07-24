# Milestone Report: Milestone 2 — Cognitive Challenge Engine

**Project:** Intelligent Cognitive Alarm Platform  
**Milestone:** 2 — Cognitive Challenge Engine  
**Organization:** Anti Gravity Internship  
**Date:** July 2026  

---

## 1. Objectives
- Implement the Cognitive Challenge Engine with 7 categories.
- Build REST APIs for challenge generation, submission, and analytics.
- Integrate PostgreSQL + MongoDB dual-database architecture.
- Implement adaptive difficulty and XP/badge reward system.
- Set up Docker containerization for the entire stack.
- Write comprehensive unit tests for core functionalities.

## 2. Tasks Completed

- **Challenge Engine:** 
  - Implemented 7 distinct challenge categories (Math, Memory, Logic, Trivia, Word, Visual, Audio).
  - Configured 3 difficulty levels (Easy, Medium, Hard).
  - Developed an adaptive algorithm to scale difficulty based on user performance.
- **REST APIs:**
  - Built Auth endpoints for secure user registration and login.
  - Implemented Alarms CRUD operations.
  - Created Challenge generate/submit endpoints.
  - Added Progress analytics and Leaderboard APIs.
- **Database Models:**
  - Configured SQLAlchemy models for `User`, `Alarm`, `ChallengeSession`, `HabitStreak`, and `Reward`.
- **MongoDB Integration:**
  - Set up logging for detailed Challenge sessions and high-volume performance metrics.
- **Docker:**
  - Created a multi-service `docker-compose.yml` including PostgreSQL, MongoDB, and the Backend FastAPI service.
- **Testing:**
  - Wrote unit tests covering auth, alarms, challenges, and progress endpoints.
- **Firebase:**
  - Implemented a notification service stub for FCM integration.

## 3. Technologies Used

| Component | Technology |
|---|---|
| Backend Framework | FastAPI |
| Language | Python 3.11+ |
| Relational DB | PostgreSQL 16 |
| ORM | SQLAlchemy 2.x |
| NoSQL DB | MongoDB 7 |
| Testing | pytest, httpx |
| Containerization | Docker, Docker Compose |
| Authentication | JWT, bcrypt |

## 4. System Architecture
The platform is built on a modular layered architecture to ensure scalability and maintainability:
- **Presentation Layer (Routers):** Manages API endpoints and handles HTTP requests/responses using FastAPI routers.
- **Business Logic Layer (Services):** Contains the core logic for user management, alarm scheduling, and the cognitive challenge engine.
- **Data Access Layer (Models/Database):** Uses SQLAlchemy for relational data persistence and PyMongo for document storage. 

**Data Flow:**
Incoming requests are validated via Pydantic schemas -> Processed by the Service layer -> State is read/written to PostgreSQL (core data) and MongoDB (logs/metrics) -> Responses are returned as JSON to the client.

## 5. API Implementation
Key API endpoint groups implemented in this milestone:
- **Auth:** `/api/v1/auth/register`, `/api/v1/auth/login`
- **Alarms:** `/api/v1/alarms/` (GET, POST, PUT, DELETE)
- **Challenges:** `/api/v1/challenges/generate` (GET), `/api/v1/challenges/submit` (POST)
- **Analytics & Progress:** `/api/v1/progress/summary` (GET), `/api/v1/habits/analytics` (GET)
- **Health:** `/api/v1/health` (GET)

## 6. Database Design
- **PostgreSQL Tables:**
  - `users`: Stores user credentials and profile info.
  - `roles`: RBAC roles.
  - `alarms`: Scheduled alarms configuration.
  - `challenge_sessions`: Records of generated and solved challenges.
  - `habit_streaks`: Tracking consecutive wake-up streaks.
  - `rewards`: Earned badges and XP.
- **MongoDB Collections:**
  - `challenge_logs`: Granular details of challenge attempts and keystrokes.
  - `performance_metrics`: Time-series data for analytics.

## 7. Testing
- **Test Categories:**
  - **Unit Tests:** Validates core logic in the challenge engine and authentication utilities.
  - **Integration Tests:** Ensures APIs correctly interact with PostgreSQL and MongoDB databases.
- **Execution:**
  Tests are run via `pytest -v --tb=short` in the backend directory.

## 8. Challenges Faced
- **Async Database Operations:** Handling asynchronous sessions and connections smoothly with SQLAlchemy 2.x.
- **Dual Database Architecture:** Ensuring consistency and managing transactions across SQL and NoSQL boundaries.
- **Adaptive Difficulty:** Designing a fair and responsive algorithm that correctly gauges user skill levels over time.
- **Stateless Validation:** Implementing challenge validation without maintaining heavy server-side state.

## 9. Future Improvements
- Real-time WebSocket notifications for live updates.
- Machine learning-based difficulty adjustment for better personalization.
- Mobile app integration built with Flutter.
- Social features such as friend challenges and global leaderboards.
- Voice-based cognitive challenges for hands-free interaction.

## 10. Conclusion
Milestone 2 successfully delivered the core backend functionalities for the Intelligent Cognitive Alarm Platform. The robust REST API, dual-database integration, and dynamic cognitive challenge engine lay a solid foundation for the subsequent phases involving real-time features and mobile application development.
