# 🧠 Intelligent Cognitive Alarm Platform (ICAP)

<div align="center">

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-0.86-61DAFB?logo=react&logoColor=black)
![Expo](https://img.shields.io/badge/Expo-57-000020?logo=expo&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)
![Milestone](https://img.shields.io/badge/Milestone-4-brightgreen)

**An AI-powered alarm system that wakes you up smarter — not louder.**

*Revolutionizing morning routines through adaptive cognitive challenges, behavioral analytics, and personalized recommendations.*

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Endpoints](#-api-endpoints)
- [ML Engine](#-ml-engine)
- [Mobile App Screens](#-mobile-app-screens)
- [Milestone Roadmap](#-milestone-roadmap)
- [Documentation](#-documentation)
- [Contributors](#-contributors)
- [License](#-license)

---

## 🌟 Overview

The **Intelligent Cognitive Alarm Platform (ICAP)** is a full-stack mobile application that replaces traditional alarm snoozing with engaging cognitive challenges. Instead of blindly hitting snooze, users must solve puzzles — math problems, memory games, pattern recognition, and more — calibrated to their cognitive ability by an integrated ML engine.

The platform tracks behavioral patterns, adapts challenge difficulty in real-time, and provides personalized recommendations to help users build healthier wake-up habits over time.

---

## 🎯 Key Features

### 🔐 Authentication & Authorization
- JWT-based secure authentication with access & refresh tokens
- bcrypt password hashing with salt rounds
- Role-Based Access Control (RBAC) — **Admin**, **User**, **Coach**
- Email verification and password recovery flows

### ⏰ Smart Alarm Management
- Create, edit, and schedule alarms with repeat patterns
- Snooze protection with mandatory cognitive challenges
- Custom alarm tones and vibration patterns
- Multi-timezone support

### 🧩 Cognitive Challenges
- **Math Puzzles** — Arithmetic and logic problems
- **Memory Games** — Sequence recall and pattern matching
- **Pattern Recognition** — Visual and spatial reasoning
- Difficulty adapts based on user performance (ML-driven)

### 📊 Analytics & Insights
- Wake-up consistency tracking and streak monitoring
- Cognitive performance scoring with trend analysis
- Sleep pattern visualization with charts and gauges
- Weekly/monthly behavioral reports

### 🤖 Machine Learning Engine
- **Adaptive Difficulty** — Auto-calibrates challenge complexity per user
- **Behavioral Analytics** — Detects patterns in wake-up behavior
- **Recommendation Engine** — Personalized tips for better morning routines

### 🔔 Notification System
- Push notification scheduling and management
- Smart reminders based on sleep patterns
- Configurable notification preferences

### 🏋️ Habit Tracking
- Morning routine habit builder
- Streak tracking with calendar heatmaps
- Breakdown analytics per habit category

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Mobile App (Expo)                       │
│           React Native · TypeScript · Zustand                │
│    ┌──────────┬──────────┬───────────┬──────────────┐       │
│    │  Alarms  │Challenges│ Dashboard │  Settings    │       │
│    │  Screen  │  Screen  │  Screen   │   Screen     │       │
│    └────┬─────┴────┬─────┴─────┬─────┴──────┬───────┘       │
│         │          │           │            │                │
│         └──────────┴─────┬─────┴────────────┘                │
│                          │                                   │
│                    Axios HTTP Client                         │
└──────────────────────────┬───────────────────────────────────┘
                           │ REST API (HTTPS)
┌──────────────────────────┴───────────────────────────────────┐
│                    Backend (FastAPI)                          │
│    ┌─────────────────────────────────────────────────┐       │
│    │              API Router Layer                    │       │
│    │  Auth · Alarms · Challenges · Habits · Admin    │       │
│    │  Analytics · Notifications · Recommendations    │       │
│    └──────────────────────┬──────────────────────────┘       │
│    ┌──────────────────────┴──────────────────────────┐       │
│    │            Service / Repository Layer            │       │
│    └──────────────────────┬──────────────────────────┘       │
│    ┌──────────────────────┴──────────────────────────┐       │
│    │               ML Engine Layer                    │       │
│    │  Adaptive Difficulty · Behavioral Analytics     │       │
│    │          Recommendation Engine                   │       │
│    └──────────────────────┬──────────────────────────┘       │
│    ┌──────────────────────┴──────────────────────────┐       │
│    │        SQLAlchemy 2.x (Async) + Alembic         │       │
│    └──────────────────────┬──────────────────────────┘       │
└──────────────────────────┬───────────────────────────────────┘
                           │
                ┌──────────┴──────────┐
                │   PostgreSQL 15+    │
                │   (Supabase)        │
                └─────────────────────┘
```

---

## 🛠 Tech Stack

| Layer | Technology | Version |
|---|---|---|
| **Frontend** | React Native + Expo | 0.86 / SDK 57 |
| **Language** | TypeScript | 6.0 |
| **State Management** | Zustand | 5.x |
| **UI Library** | React Native Paper | 5.x |
| **Animations** | React Native Reanimated | 4.x |
| **Forms** | React Hook Form + Yup | 7.x / 1.x |
| **Backend** | FastAPI | 0.111 |
| **Language** | Python | 3.11+ |
| **ORM** | SQLAlchemy (Async) | 2.0 |
| **Database** | PostgreSQL (Supabase) | 15+ |
| **Auth** | JWT (python-jose) + bcrypt | — |
| **Containerization** | Docker | — |

---

## 📁 Project Structure

```
Cognitive-Alarm-System/
├── backend/                        # FastAPI Backend
│   ├── app/
│   │   ├── auth/                   # Authentication utilities
│   │   ├── core/                   # App settings & configuration
│   │   ├── middleware/             # Error handlers & middleware
│   │   ├── ml/                     # 🤖 Machine Learning Engine
│   │   │   ├── adaptive_difficulty.py
│   │   │   ├── behavioral_analytics.py
│   │   │   └── recommendation_engine.py
│   │   ├── models/                 # SQLAlchemy ORM models
│   │   ├── repositories/          # Data access layer
│   │   ├── routers/               # API route handlers
│   │   ├── schemas/               # Pydantic request/response schemas
│   │   ├── services/              # Business logic layer
│   │   ├── utils/                 # Helper utilities
│   │   ├── database.py            # Async database connection
│   │   └── main.py                # FastAPI app factory
│   ├── tests/                     # Backend test suite
│   ├── Dockerfile                 # Container configuration
│   └── requirements.txt           # Python dependencies
│
├── mobile-app/                    # React Native (Expo) Frontend
│   ├── src/
│   │   ├── app/                   # File-based routing (Expo Router)
│   │   │   ├── auth/              # Login, Register, Forgot Password
│   │   │   ├── dashboard/         # User, Admin, Coach dashboards
│   │   │   ├── alarm-ringing/     # Alarm trigger screen
│   │   │   ├── challenge/         # Cognitive challenge screens
│   │   │   ├── habits/            # Habit tracker views
│   │   │   ├── notifications/     # Notification center
│   │   │   ├── recommendations/   # ML-powered suggestions
│   │   │   ├── reports/           # Analytics reports
│   │   │   ├── settings/          # App settings
│   │   │   ├── sleep/             # Sleep logging
│   │   │   ├── goals/             # Productivity goals
│   │   │   └── onboarding/        # User onboarding flow
│   │   ├── components/            # Reusable UI components
│   │   │   ├── alarms/            # Alarm-specific components
│   │   │   ├── buttons/           # Button variants (FAB, Primary)
│   │   │   ├── cards/             # Card layouts
│   │   │   ├── challenges/        # Challenge shell components
│   │   │   ├── charts/            # BarChart, ScoreGauge
│   │   │   ├── common/            # Shared UI (Header, Screen, etc.)
│   │   │   ├── forms/             # Input fields
│   │   │   └── loaders/           # Loading states
│   │   ├── services/api/          # Axios API client & endpoints
│   │   ├── store/                 # Zustand state stores
│   │   ├── theme/                 # Design tokens (colors, typography)
│   │   ├── types/                 # TypeScript type definitions
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── data/                  # Mock data for development
│   │   └── utils/                 # Utility functions
│   ├── package.json
│   └── tsconfig.json
│
├── database/                      # Database schema & seed scripts
│   ├── schema/                    # SQL schema definitions
│   └── seed/                      # Seed data scripts
│
├── Docs/                          # Milestone documentation
│   ├── Milestone1_Theory_Document.docx
│   ├── Milestone2_Backend.pptx
│   └── Milestone3_Adaptive_Intelligence&Backend_Frontend_Integration.pptx
│
├── .gitignore
├── LICENSE                        # MIT License
└── README.md                      # ← You are here
```

---

## 🚀 Getting Started

### Prerequisites

- **Python** 3.11+
- **Node.js** 18+
- **PostgreSQL** 15+ (or a [Supabase](https://supabase.com) project)
- **Expo CLI** (`npm install -g expo-cli`)
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/GKSJ19/Cognitive-Alarm-System.git
cd Cognitive-Alarm-System
```

### 2. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL=postgresql+psycopg://user:password@host:port/dbname
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
PROJECT_NAME=ICAP
ALLOWED_ORIGINS=["http://localhost:8081"]
```

Start the backend server:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API docs will be available at:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### 3. Mobile App Setup

```bash
cd mobile-app

# Install dependencies
npm install
```

Create a `.env` file in the `mobile-app/` directory:

```env
EXPO_PUBLIC_API_URL=http://<your-local-ip>:8000
```

Start the Expo development server:

```bash
npx expo start
```

Scan the QR code with **Expo Go** on your phone, or run on an emulator:

```bash
# Android
npx expo start --android

# iOS
npx expo start --ios
```

---

## 🔌 API Endpoints

| Category | Endpoint | Description |
|---|---|---|
| **Health** | `GET /api/health` | Server health check |
| **Auth** | `POST /api/auth/register` | User registration |
| | `POST /api/auth/login` | User login (JWT) |
| **Users** | `GET /api/users/me` | Get current user profile |
| **Alarms** | `GET /api/alarms` | List user alarms |
| | `POST /api/alarms` | Create new alarm |
| | `PUT /api/alarms/{id}` | Update alarm |
| | `DELETE /api/alarms/{id}` | Delete alarm |
| **Challenges** | `GET /api/challenges` | Get available challenges |
| | `POST /api/challenges/verify` | Submit challenge answer |
| **Habits** | `GET /api/habits` | List tracked habits |
| | `POST /api/habits` | Create habit entry |
| **Notifications** | `GET /api/notifications` | Get user notifications |
| | `POST /api/notifications` | Create notification |
| **Analytics** | `GET /api/analytics` | Get user analytics |
| | `GET /api/analytics/reports` | Generate reports |
| **ML: Difficulty** | `GET /api/adaptive-difficulty` | Get difficulty level |
| | `POST /api/adaptive-difficulty/adjust` | Recalibrate difficulty |
| **ML: Behavior** | `GET /api/behavioral-analytics` | Get behavioral insights |
| **ML: Recommend** | `GET /api/recommendations` | Get personalized tips |
| **Admin** | `GET /api/admin/users` | Admin user management |
| **Coaches** | `GET /api/coaches` | Coach dashboard data |

> 📝 Full interactive API docs available at `/docs` when the server is running.

---

## 🤖 ML Engine

The platform includes three ML modules that work together to create a personalized experience:

### Adaptive Difficulty Engine
Dynamically adjusts cognitive challenge complexity based on:
- Historical solve rates and response times
- Time-of-day performance patterns
- Progressive skill development curves

### Behavioral Analytics Engine
Analyzes user wake-up behavior to identify:
- Consistency patterns and anomalies
- Snooze frequency and duration trends
- Optimal challenge types per user

### Recommendation Engine
Generates personalized suggestions including:
- Ideal bedtime and wake-up windows
- Challenge type preferences
- Habit-building strategies for better mornings

---

## 📱 Mobile App Screens

| Screen | Description |
|---|---|
| **Auth** | Login, Register, Forgot Password |
| **Onboarding** | Profile setup and preference configuration |
| **Dashboard** | Role-based dashboards (User / Admin / Coach) |
| **Alarms** | Create, edit, and manage alarms |
| **Alarm Ringing** | Alarm trigger with challenge initiation |
| **Challenges** | Cognitive puzzle interface with success/failure flows |
| **Habits** | Habit tracker with calendar heatmap and breakdowns |
| **Analytics & Reports** | Charts, gauges, and performance reports |
| **Notifications** | Notification center with settings |
| **Recommendations** | ML-powered personalized suggestions |
| **Sleep Log** | Sleep pattern logging |
| **Settings** | Account, Theme, Difficulty, Timezone |

---

## 🗺 Milestone Roadmap

### ✅ Milestone 1 — Foundation & Authentication
> *Establish the enterprise-grade backend and authentication system.*

- [x] Project scaffolding and architecture design
- [x] PostgreSQL database schema and Alembic migrations
- [x] JWT authentication with bcrypt password hashing
- [x] Role-Based Access Control (Admin, User, Coach)
- [x] Core API endpoints (Auth, Users, Health)
- [x] FastAPI project structure with service-repository pattern

### ✅ Milestone 2 — Backend Core Features
> *Build out the full backend API with alarm, challenge, and habit systems.*

- [x] Alarm CRUD operations with scheduling logic
- [x] Cognitive challenge system with verification
- [x] Habit tracking endpoints
- [x] Admin and Coach management APIs
- [x] Error handling middleware
- [x] Docker containerization

### ✅ Milestone 3 — Adaptive Intelligence & Frontend Integration 
> *Integrate ML engines and build the complete mobile frontend.*

- [x] ML Adaptive Difficulty Engine
- [x] ML Behavioral Analytics Engine
- [x] ML Recommendation Engine
- [x] Analytics and reporting system
- [x] Push notification service
- [x] Complete React Native (Expo) mobile app
- [x] Backend-Frontend API integration
- [x] State management with Zustand
- [x] Theme system (Light/Dark mode)
- [x] Reusable component library

### ✅ Milestone 4 — Analytics, Testing & Deployment
> *Executive dashboards, BI reports, unit testing, container deployment, and final documentation.*

- [x] Build executive dashboards (Admin, User, Coach)
- [x] Add reports and visualization modules (BarChart, ScoreGauge, PDF/Excel export triggers)
- [x] Implement testing and validations (pytest backend suite for health & ML services)
- [x] Deploy platform using Docker and cloud services (docker-compose & Dockerfile setup)
- [x] Prepare final documentation and presentation

---

## 📚 Documentation

Detailed documentation is available in the following locations:

### Project Docs (`/Docs`)
| Document | Format |
|---|---|
| Milestone 1 Theory Document | `.docx` |
| Milestone 2 Backend | `.pptx` |
| Milestone 3 Adaptive Intelligence & Integration | `.pptx` |
| Milestone 4 Cognitive Alarm System | `.pptx` |

### Mobile App Docs (`/mobile-app`)
- [Project Overview](mobile-app/PROJECT_OVERVIEW.md)
- [Features](mobile-app/FEATURES.md)
- [Architecture](mobile-app/ARCHITECTURE.md)
- [Folder Structure](mobile-app/FOLDER_STRUCTURE.md)
- [Installation Guide](mobile-app/INSTALLATION_GUIDE.md)
- [Configuration](mobile-app/CONFIGURATION.md)
- [Dependencies](mobile-app/DEPENDENCIES.md)
- [Database Documentation](mobile-app/DATABASE_DOCUMENTATION.md)
- [API Documentation](mobile-app/API_DOCUMENTATION.md)
- [Testing Guide](mobile-app/TESTING_GUIDE.md)
- [Changelog](mobile-app/CHANGELOG.md)

---

## 👥 Contributors

| Role | Team |
|---|---|
| **Organization** | [GKSJ19](https://github.com/GKSJ19) |
| **Developer** | Venu Aravind D |

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for smarter mornings**

*Intelligent Cognitive Alarm Platform © 2026 GKSJ19*

</div>
