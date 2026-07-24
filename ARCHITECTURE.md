# Technical Architecture — Milestone 2

## 🏗️ System Overview
The platform uses a clean, layered asynchronous architecture powered by Python 3.11+ and FastAPI.

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                           │
│        (Flutter Mobile App / React Web Dashboard)           │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / REST API
┌──────────────────────────────▼──────────────────────────────┐
│                     FastAPI Layer                           │
│  ├── Middleware: Request Logging, CORS, Exception Handler   │
│  └── Routers: Auth, Alarms, Challenges, Habits, Progress    │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    Business Logic Layer                     │
│  ├── Cognitive Challenge Engine (7 Generators)              │
│  ├── Adaptive Difficulty Manager                            │
│  ├── XP & Reward Evaluator                                  │
│  └── Firebase Cloud Messaging (FCM) Service Stub            │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
┌──────────────▼──────────────┐  ┌────────────▼──────────────┐
│   PostgreSQL 16 (asyncpg)   │  │   MongoDB 7 (Motor)        │
│ Relational Core Data:       │  │ Document Logs & Metrics:   │
│ - Users, Roles, Profiles    │  │ - Challenge Attempt Logs   │
│ - Alarms & Schedule         │  │ - Detailed Timings         │
│ - Habit Streaks & Badges    │  │ - Performance Metrics      │
└─────────────────────────────┘  └────────────────────────────┘
```

## 💾 Dual-Database Pattern
- **PostgreSQL**: Ensures ACID compliance for transactional data (User identity, passwords, alarm configuration, streak state).
- **MongoDB**: Optimized for high-write, flexible document logging (Every challenge prompt generated, user input, exact milliseconds taken, question text).

## ⚡ Stateless Challenge Validation
Challenges are generated statelessly or with lightweight session IDs. Upon submission, the engine verifies the user's answer, computes base score + time bonus + XP multiplier, updates the PostgreSQL streak record, inserts a detailed audit log into MongoDB, and evaluates any newly unlocked badges.
