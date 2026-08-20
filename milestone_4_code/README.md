# 🧠 Intelligent Cognitive Alarm Platform

> An AI-powered alarm system that requires solving cognitive challenges to dismiss, designed to build better morning habits.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](#) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/) [![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)

## Table of Contents
- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Installation & Setup](#installation--setup)
- [Running Tests](#running-tests)
- [Challenge Categories](#challenge-categories)
- [License](#license)

## Project Overview
The Intelligent Cognitive Alarm Platform is a modern alarm application that ensures users wake up by presenting them with cognitive challenges they must solve to dismiss the alarm. 
Key features include:
- **7 Challenge Categories**: From math to memory and trivia.
- **Adaptive Difficulty**: Challenges get harder or easier based on user performance.
- **XP & Badge System**: Gamified experience to encourage consistent wake-up habits.
- **Progress Analytics**: Track performance and wake-up streaks over time.
- **Executive Dashboards**: Daily, weekly, and monthly analytics with charts.
- **PDF & Excel Reports**: Export progress reports.
- **Integration Testing**: End-to-end API test suite.

*   **AI/ML**: `scikit-learn`, `numpy`, `pandas`
*   **Testing**: `pytest`, `httpx`
*   **DevOps**: Docker, Docker Compose, Nginx

Built for the **Anti Gravity Internship**.

## Tech Stack

| Category | Technologies |
|---|---|
| **Backend** | FastAPI, SQLAlchemy 2.x, Pydantic v2 |
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS, Recharts |
| **Database** | PostgreSQL 16 (Relational), MongoDB 7 (NoSQL) |
| **Auth** | JWT (python-jose), bcrypt |
| **AI/ML** | scikit-learn, numpy, pandas |
| **Notifications** | Firebase Cloud Messaging (FCM) |
| **Containerization** | Docker, Docker Compose |
| **Testing** | pytest, httpx |

## Architecture
The platform follows a layered architectural pattern to ensure separation of concerns:
- **Routers**: Handle incoming HTTP requests and route them to appropriate services.
- **Services**: Contain the core business logic, including the challenge generation and validation engine.
- **Models**: Define the data structure and schema for databases (SQLAlchemy models and MongoDB schemas).
- **Database**: Dual-database approach using PostgreSQL for structured relational data (users, alarms, streaks) and MongoDB for document-based logging (challenge session logs, metrics).

*   **Milestone 1:** Core setup, API foundation, database schema, user authentication (JWT), and basic alarm workflows.
*   **Milestone 2:** Gamification (XP/levels), cognitive challenge engine (math, logic, memory), and interactive frontend UI.
*   **Milestone 3:** Adaptive Intelligence — Habit scoring, snooze penalty models, difficulty adaptation, and recommendation engines.
*   **Milestone 4:** Analytics, Testing & Deployment — Executive dashboards, PDF/Excel reports, integration testing, and Docker deployment.

## Project Structure
```text
milestone_4_code/
├── backend/
│   ├── app/
│   │   ├── config/          # Settings & environment config
│   │   ├── core/            # Security, exceptions, logging
│   │   ├── database/        # PostgreSQL & MongoDB connections
│   │   ├── models/          # SQLAlchemy ORM models
│   │   ├── modules/
│   │   │   └── ai/          # AI Engines (Adaptive Difficulty, Habit Scoring, etc.)
│   │   ├── routers/         # API route handlers
│   │   ├── schemas/         # Pydantic request/response schemas
│   │   ├── services/        # Business logic & challenge engine
│   │   └── main.py          # FastAPI app factory
│   ├── tests/               # Integration tests
│   ├── Dockerfile
│   └── pyproject.toml
├── frontend/
│   └── src/
│       ├── pages/           # React page components
│       ├── services/        # API client & analytics API
│       └── types/           # TypeScript type definitions
├── docker-compose.yml
├── .env.example
└── README.md
```

## API Endpoints

| Tag | Method | Endpoint | Description | Auth Required |
|---|---|---|---|---|
| **Auth** | POST | `/api/v1/auth/register` | Register a new user | No |
| **Auth** | POST | `/api/v1/auth/login` | Login and get tokens | No |
| **Auth** | POST | `/api/v1/auth/refresh` | Refresh access token | Yes |
| **Auth** | GET | `/api/v1/auth/me` | Get current user info | Yes |
| **Alarms** | GET | `/api/v1/alarms/` | List user alarms | Yes |
| **Alarms** | POST | `/api/v1/alarms/` | Create a new alarm | Yes |
| **Challenges** | GET | `/api/v1/challenges/generate` | Generate a new challenge | Yes |
| **Challenges** | POST | `/api/v1/challenges/submit` | Submit challenge answer | Yes |
| **Analytics** | GET | `/api/v1/analytics/behavioral` | Get behavioral analytics | Yes |
| **Analytics** | GET | `/api/v1/analytics/habit-score` | Get habit score | Yes |
| **Analytics** | GET | `/api/v1/analytics/recommendations` | Get recommendations | Yes |
| **Analytics** | GET | `/api/v1/analytics/difficulty` | Get adaptive difficulty | Yes |
| **Analytics** | GET | `/api/v1/analytics/dashboard/daily` | Daily dashboard | Yes |
| **Analytics** | GET | `/api/v1/analytics/dashboard/weekly` | Weekly dashboard | Yes |
| **Analytics** | GET | `/api/v1/analytics/dashboard/monthly` | Monthly dashboard | Yes |
| **Exports** | GET | `/api/v1/exports/pdf` | Export PDF report | Yes |
| **Exports** | GET | `/api/v1/exports/excel` | Export Excel report | Yes |
| **Progress** | GET | `/api/v1/progress/summary` | Get progress summary | Yes |
| **Health** | GET | `/api/v1/health` | API Health check | No |

## Installation & Setup

### Prerequisites
- Python 3.11+
- Docker & Docker Compose

### Option 1: Docker (Recommended)
```bash
cp .env.example .env
docker compose up --build
# API is accessible at: http://localhost:8000/api/docs
```

### Option 2: Local Development
```bash
cd backend
pip install -e '.[dev]'
# Set up PostgreSQL and MongoDB locally, update .env
uvicorn app.main:app --reload --port 8000
```

## Running Tests
```bash
cd backend
pytest -v --tb=short
```

## Challenge Categories

| Category | Description / Sub-types |
|---|---|
| **Math** | Arithmetic, Algebra, Sequences |
| **Memory** | Pattern recall, Number memorization |
| **Logic** | Puzzles, Deductive reasoning |
| **Trivia** | General knowledge, Science, History |
| **Word** | Anagrams, Vocabulary, Spelling |
| **Visual** | Shape recognition, Color matching |
| **Audio** | Sound pattern recognition |

## License
This project is licensed under the MIT License.
