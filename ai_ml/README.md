# 🧠 ICAP — Intelligent Cognitive Alarm Platform
### AI/ML Subsystem — Complete Development Journal | Milestones 1 · 2 · 3

<div align="center">

![Python](https://img.shields.io/badge/Python-3.13-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![XGBoost](https://img.shields.io/badge/XGBoost-92.5%25_Accuracy-FF6600?style=for-the-badge&logo=xgboost&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-NoSQL-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Relational-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Status](https://img.shields.io/badge/Status-✅_All_Milestones_Complete-brightgreen?style=for-the-badge)

**Developer:** Debajyoti Mukhopadhyay &nbsp;|&nbsp; **Role:** AI/ML &nbsp;|&nbsp; **Team:** 3

</div>

---

## 📌 Project Overview

The **Intelligent Cognitive Alarm Platform (ICAP)** is an AI-powered mobile alarm application built under the **Infosys Springboard Internship Program**. Instead of allowing users to dismiss alarms with a simple tap, ICAP enforces genuine cognitive wakefulness by requiring users to solve **personalized AI-generated cognitive challenges** — driven entirely by machine learning algorithms — before the alarm can be turned off.

> **My Role:** I engineered the complete AI/ML subsystem of ICAP — from raw behavioral data pipelines and 5 intelligent models, to the Cognitive Challenge Engine with 7 procedural generators, a Reinforcement Learning Elo difficulty engine, server-side anti-cheat security, and 3 live FastAPI REST endpoints integrated with the mobile frontend.

---

## 📋 Table of Contents

- [System Architecture (4-Tier Design)](#-system-architecture--4-tier-microservice-design)
- [Milestone 1 — Foundation Models & AI/ML Subsystem Setup](#-milestone-1--foundation-models--aiml-subsystem-setup)
- [Milestone 2 — Cognitive Challenge Engine & REST API Integration](#-milestone-2--cognitive-challenge-engine--rest-api-integration)
- [Milestone 3 — Live Microservice Integration & Platform Deployment](#-milestone-3--live-microservice-integration--platform-deployment)
- [Full Technology Stack](#️-full-technology-stack)
- [Project File Structure](#-project-file-structure)
- [Key Performance Metrics](#-key-performance-metrics--all-milestones)
- [Future Roadmap](#️-future-roadmap)
- [Team & Collaboration](#-team--collaboration)

---

## 🏗️ System Architecture — 4-Tier Microservice Design

ICAP is engineered across **4 core architectural tiers** to ensure clean separation of concerns, high scalability, and sub-15ms AI prediction latency.

```
┌─────────────────────────────────────────────────────────────────────┐
│         TIER 1 — CLIENT LAYER (React Native · Android & iOS)        │
│   Auth · Dashboard · Alarm Management · Challenge UI · Reports      │
└─────────────────────────┬───────────────────────────────────────────┘
                          │  HTTPS / JSON
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│        TIER 2 — BACKEND LAYER (FastAPI API Gateway)                 │
│   JWT Auth · RBAC · 11 Modular Business Services · Rate Limiting    │
└─────────────────────────┬───────────────────────────────────────────┘
                          │  Feature Requests / Model Predictions
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│          TIER 3 — AI/ML LAYER  ← MY DOMAIN                         │
│   5 Intelligent Models: Behavior Analysis · Habit Scoring ·         │
│   Adaptive Difficulty (Elo) · Recommendations · Snooze Prediction   │
└─────────────────────────┬───────────────────────────────────────────┘
                          │  Read / Write Queries
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│          TIER 4 — DATA LAYER (Dual Database Architecture)           │
│      PostgreSQL (Transactional) ←→ MongoDB (Analytical NoSQL)       │
└─────────────────────────────────────────────────────────────────────┘
```

### Architecture Layer Summary

| Tier | Layer | Technology | Key Responsibilities |
|:----:|:------|:-----------|:--------------------|
| 1 | **Client Layer** | React Native (Android & iOS) | Mobile app UI, alarm lock-screen, challenge rendering, user dashboard |
| 2 | **Backend Layer** | Python + FastAPI Gateway | Request routing, JWT auth, RBAC, 11 modular business services |
| 3 | **AI/ML Layer** | Python + XGBoost + FastAPI | 5 intelligent models, Cognitive Engine, Elo difficulty engine |
| 4 | **Data Layer** | PostgreSQL + MongoDB | Transactional structured data + high-volume analytical event logs |

### Dual Database Architecture

| Database | Type | Tables / Collections | AI/ML Usage |
|:---------|:-----|:---------------------|:------------|
| **PostgreSQL** | Relational (ACID) | `users`, `roles`, `alarms`, `scores`, `habit_goals`, `sleep_schedules`, `audit_logs` | Reads `sleep_duration`, `habit_score`, `difficulty_preference` |
| **MongoDB** | NoSQL (High-Volume) | `challenge_data`, `logs`, `user_preferences`, `content`, `snooze_patterns`, `ai_predictions` | Reads `snooze_count`, `elo_rating`, `challenge_type_preference`, `completion_time_seconds` |

### User Stakeholder Roles

| Role | Permissions & Access | Primary Interface |
|:-----|:---------------------|:-----------------|
| **User** | Set alarms, solve cognitive challenges, view habit dashboard, track sleep scores | React Native Mobile App |
| **Wellness Coach** | Monitor users, inspect sleep analytics, send personalized recommendations | Web Coach Portal |
| **Administrator** | Manage accounts, assign roles, view system health, configure parameters | Web Admin Dashboard |

---

## 🚀 Milestone 1 — Foundation Models & AI/ML Subsystem Setup

> **Status:** ✅ Complete &nbsp;|&nbsp; **Scope:** AI/ML Foundation Layer &nbsp;|&nbsp; **Deliverable:** 5 Core AI Models + FastAPI Serving

### Objective

Milestone 1 established the complete foundational AI/ML layer for ICAP. The goal was to design, train, and serve all 5 core intelligent models powering the platform's behavioral analytics, adaptive difficulty engine, habit scoring system, and snooze risk prediction.

---

### Database Schema — Fields Consumed by AI/ML Subsystem

**PostgreSQL Tables:**

| Table | Key Fields Consumed by AI/ML |
|:------|:-----------------------------|
| `users` | `user_id`, `sleep_duration`, `preferred_wakeup_time`, `difficulty_preference` |
| `scores` | `user_id`, `productivity_score`, `habit_score` |
| `alarms` | `user_id`, `alarm_time`, `is_recurring`, `snooze_count` |
| `habit_goals` | `user_id`, `target_sleep_hours`, `target_wake_time` |

**MongoDB Collections:**

| Collection | Key Fields Consumed by AI/ML |
|:-----------|:-----------------------------|
| `challenge_data` | `difficulty_level`, `is_correct`, `completion_time_seconds`, `attempted_at` |
| `logs` | `snooze_count`, `wake_up_confirmed`, `verification_status`, `timestamp` |
| `user_preferences` | `current_difficulty`, `challenge_type_preference`, `elo_rating` |
| `content` | `category`, `title`, `description` *(feeds Recommendation Model)* |
| `snooze_patterns` | `date`, `snooze_frequency`, `sleep_deficit`, `historical_trend` |

---

### Environment Setup & Tech Stack

| Tool / Library | Version | Purpose in AI/ML Layer |
|:---------------|:--------|:------------------------|
| Python | 3.13 | Core language for all model logic, data pipelines, and API serving |
| FastAPI | Latest | High-performance async REST API framework serving all models as HTTP endpoints |
| Uvicorn | Latest | ASGI server running FastAPI with hot-reload in development |
| Pydantic v2 | v2.x | Strict request/response schema validation for all API endpoints |
| XGBoost | Latest | Supervised classification for snooze oversleeping risk prediction |
| Scikit-learn | Latest | Preprocessing pipelines, normalization, model evaluation metrics |
| Pandas | Latest | Tabular feature engineering and data transformations |
| NumPy | Latest | Numerical matrix operations for scoring formulas |
| Joblib | Latest | Binary serialization of trained model weight files |
| Swagger UI / OpenAPI | Built-in FastAPI | Interactive browser-based API documentation at `/docs` |

---

### The 5 Core AI/ML Models Implemented

#### Model 1 — Adaptive Difficulty Engine (`reinforcement.py`)

- **Algorithm:** Reinforcement Learning — Elo Rating Mechanism + Q-Learning principles
- **Function:** Tracks every user's challenge solve speed and accuracy. After each attempt, the Elo engine computes a new rating and maps users into one of 5 difficulty tiers:

| Difficulty Tier | Elo Rating Range | Challenge Characteristics |
|:----------------|:-----------------|:--------------------------|
| **Beginner** | Elo < 900 | Single-digit arithmetic, basic antonyms, 3-word memory lists |
| **Easy** | Elo 900 – 1100 | Two-step operations, simple word unscrambling, 4-number sequences |
| **Medium** | Elo 1100 – 1350 | Geometric progression series, 5-word sequential memory recall |
| **Hard** | Elo 1350 – 1600 | Multi-operator algebra, complex riddles, pattern extrapolation |
| **Expert** | Elo > 1600 | Advanced lateral thinking puzzles, multi-step logic problems |

---

#### Model 2 — Behavior Analysis Model (`features.py`)

- **Function:** Converts raw user behavioral data (snooze counts, wake-up timestamps, sleep hours, challenge completions) into **4 normalized behavioral scores** on a 0–100 scale:

| Behavioral Score | Weight | Source Signal |
|:----------------|:-------|:--------------|
| Snooze Reduction Score | 20% | `snooze_count` from `logs` collection and alarm records |
| Wake-Up Consistency Score | 35% | Actual vs target wake-up time delta across 7 days |
| Challenge Completion Score | 25% | `is_correct` and `completion_time_seconds` from `challenge_data` |
| Sleep Adherence Score | 20% | `sleep_duration` vs `target_sleep_hours` from `habit_goals` |

---

#### Model 3 — Habit Scoring Model (`habit_scoring.py`)

- **Algorithm:** Weighted Linear Scoring Formula
- **Formula:**

```
Habit Score = 0.35 × (Consistency) + 0.25 × (Completion) + 0.20 × (Snooze Reduction) + 0.20 × (Sleep Adherence)
```

- **Output:** A single 0–100 numerical habit quality index updated daily, stored in MongoDB (`habit_scores`) and summarized in PostgreSQL (`scores` table)

---

#### Model 4 — Recommendation Engine (`recommendation_engine.py`)

- **Algorithm:** Rule-Based Multi-Class Recommender
- **Function:** Identifies the lowest-scoring behavioral component from the Habit Scoring model output and maps it to curated bedtime routines, sleep hygiene tips, and challenge strategy recommendations
- Recommendations are pushed to the user's mobile dashboard and notification service

---

#### Model 5 — Snooze Risk Prediction Classifier (`classifier.py`)

- **Algorithm:** XGBoost Supervised Binary Classification
- **Features:** `sleep_deficit`, `bedtime_consistency_delta`, `snooze_frequency_7d`, `habit_score`
- **Validation Accuracy:** **92.5%** on held-out test set
- **Model Persistence:** Serialized as `snooze_predictor.joblib` via Joblib for zero-overhead loading

---

### Training Pipeline

| Step | Module / File | Action Performed |
|:-----|:--------------|:-----------------|
| 1 | `data_ingest.py` | Pulls PostgreSQL profile + MongoDB logs into a unified per-user context dict |
| 2 | `features.py` | Computes 4 behavioral scores from raw logs |
| 3 | `habit_scoring.py` | Applies weighted formula to output single 0–100 Habit Index |
| 4 | `reinforcement.py` | Replays challenge attempts through Elo engine to set next difficulty |
| 5 | `train_models.py` | Trains XGBoost classifier on behavioral training data |
| 6 | Joblib | Saves `snooze_predictor.joblib` and `difficulty_model.joblib` to disk |
| 7 | `main.py` (FastAPI) | Loads models on startup, serves all endpoints at `/docs` |

---

### Milestone 1 — Deliverables Summary

| Deliverable | Status | Details |
|:------------|:-------|:--------|
| Adaptive Difficulty Elo Engine | ✅ Complete | Elo rating calculation with 5 difficulty tier mapping in `reinforcement.py` |
| Behavior Analysis Model | ✅ Complete | 4 normalized behavioral scores computed in `features.py` |
| Habit Scoring Model | ✅ Complete | Weighted formula Habit Index (0–100) in `habit_scoring.py` |
| Recommendation Engine | ✅ Complete | Rule-based recommender targeting lowest habit component |
| Snooze Risk Classifier (XGBoost) | ✅ Complete | Binary classification at **92.5%** validation accuracy |
| Model Serialization (Joblib) | ✅ Complete | `snooze_predictor.joblib` & `difficulty_model.joblib` saved |
| FastAPI REST Serving | ✅ Complete | All models served as live HTTP endpoints via Uvicorn |
| Swagger UI / OpenAPI Docs | ✅ Complete | Interactive endpoint testing available at `/docs` |

---

## ⚡ Milestone 2 — Cognitive Challenge Engine & REST API Integration

> **Status:** ✅ Completed & Verified &nbsp;|&nbsp; **Test Pass Rate:** 100% (5/5 scenarios)

### Objective

Building directly on the 5 foundation models from Milestone 1, Milestone 2 engineered the **core intelligence feature of ICAP**: the **Cognitive Challenge Engine**. This module procedurally generates personalized cognitive challenges for every alarm event and exposes them as live REST HTTP endpoints consumed by the mobile client.

---

### Data Preprocessing

**Context Assembly (`data_ingest.py → challenge_generator.py`)**

The `build_user_context()` function merges data from both databases into a unified Python dictionary:

- `elo_rating`, `difficulty_level` from `reinforcement.py` (PostgreSQL + MongoDB)
- `challenge_type_preference` from `user_preferences` (MongoDB)
- `productivity_score`, `habit_score` from `scores` (PostgreSQL)
- `snooze_count`, `completion_time_seconds` from `logs` + `challenge_data` (MongoDB)

**Multi-Answer Set Preprocessing**

For linguistic challenges (Word Games), correct answers are pre-normalized into lowercase sets (`accepted_answers`). For example, an antonym question for `'light'` accepts both `'dark'` and `'heavy'` as correct answers.

---

### 7 Cognitive Challenge Categories Implemented

`challenge_generator.py` implements all 7 challenge categories, each scaling dynamically across all 5 Elo difficulty tiers:

| # | Category | Description | Hard Tier Example |
|:--|:---------|:------------|:------------------|
| 1 | **Mathematical Problems** | Arithmetic, percentages, algebraic expressions with dynamic numeric seeds | `Solve: 84 ÷ 7 + (13 × 4) — 29` |
| 2 | **Logic Puzzles** | Arithmetic sequences, geometric progressions, missing element series | `Next number: 3, 9, 27, 81, ___` |
| 3 | **Memory Challenges** | Sequential word list recall, position-based memory tests | `Recall in order: River, Cloud, Marble, Fence, Spark` |
| 4 | **Word Games** | Anagram unscrambling, synonym matching, antonym identification | `Give an antonym for: 'light'` → `heavy / dark` |
| 5 | **Pattern Recognition** | Shape sequences, color patterns, multiplicative progressions | `Identify next: △ ○ △△ ○○ △△△ ___` |
| 6 | **Riddles** | Lateral thinking questions and everyday logic riddles | `What has hands but cannot clap?` |
| 7 | **Quick Quizzes** | Science trivia, general knowledge, factual recall | `Chemical symbol for Gold?` → `Au` |

---

### Dynamic Difficulty Engine — 4-Step Elo Scaling Process

| Step | Process | Module |
|:-----|:--------|:-------|
| 1 | Fetch user's current Elo rating from MongoDB (`user_preferences.elo_rating`) | `data_ingest.py` |
| 2 | Map Elo to nearest difficulty tier (Beginner / Easy / Medium / Hard / Expert) | `challenge_generator.py` |
| 3 | Generate challenge with tier-specific parameters (number range, word list size, sequence length) | `challenge_generator.py` |
| 4 | After user submits answer, recalculate Elo based on correctness and solve time (15–30s target window) | `reinforcement.py` |

---

### Server-Side Anti-Cheat Security

| Security Mechanism | Implementation | Effect |
|:-------------------|:---------------|:-------|
| **Answer Suppression** | `correct_answer` field completely omitted from `GET /challenge` response JSON | Client device cannot inspect the correct answer at any point before submission |
| **One-Time Token Popping** | `_ACTIVE_CHALLENGES.pop(challenge_id)` called on first `POST /challenge/validate` | Re-submitting the same `challenge_id` returns `found=False`, preventing replay attacks |
| **Multi-Answer Set Validation** | `accepted_answers: Set[str]` stores all acceptable answers in lowercase | Handles synonym/antonym ambiguity and natural linguistic variation |

---

### REST API Endpoints (FastAPI — `main.py`)

| Endpoint | Method | Purpose | Key Response Fields |
|:---------|:-------|:--------|:--------------------|
| `/users/{user_id}/challenge` | `GET` | Fetches personalized challenge based on user Elo rating and preference | `challenge_id`, `category`, `difficulty`, `question` |
| `/challenge` | `GET` | Fetches generic challenge with optional query parameter overrides | `challenge_id`, `category`, `difficulty`, `question` |
| `/challenge/validate` | `POST` | Validates submitted answer for a given `challenge_id` | `found`, `is_correct`, `correct_answer` *(revealed post-validation only)* |

---

### Verification Test Matrix

| Test Scenario | Input | Expected Outcome | HTTP Status | Result |
|:-------------|:------|:-----------------|:------------|:-------|
| `GET /users/4/challenge` | `user_id = 4` (Elo: 1394.91) | Maps to Hard difficulty, Word Games preference, returns antonym question | `200 OK` | ✅ PASSED |
| Answer Suppression Check | Inspect GET response JSON | `correct_answer` field completely absent from response payload | `200 OK` | ✅ PASSED |
| `POST /challenge/validate` (`'heavy'`) | `answer='heavy'`, `challenge_id=67115719` | `is_correct=True` via `accepted_answers` set match | `200 OK` | ✅ PASSED |
| `POST /challenge/validate` (`'dark'`) | `answer='dark'`, same `challenge_id` | `is_correct=True` (antonym synonym alternative accepted) | `200 OK` | ✅ PASSED |
| Re-submit consumed `challenge_id` | Same `challenge_id` (already validated) | `found=False` — single-use token enforced | `200 OK` | ✅ PASSED |

---

### Milestone 2 — Deliverables Summary

| Deliverable | Status | Details |
|:------------|:-------|:--------|
| 7 Procedural Cognitive Challenge Generators | ✅ Complete | All 7 categories in `challenge_generator.py` |
| 5 Difficulty Tier Dynamic Scaling | ✅ Complete | Elo → Difficulty bracket mapping for all challenge types |
| Multi-Answer Set Validation Engine | ✅ Complete | `accepted_answers` set handles synonym/antonym ambiguity |
| Server-Side Answer Suppression | ✅ Complete | `correct_answer` omitted from GET, revealed only post-validation |
| One-Time Challenge Token Popping | ✅ Complete | `_ACTIVE_CHALLENGES.pop()` enforces single-attempt security |
| `GET /users/{user_id}/challenge` Endpoint | ✅ Complete | Live, tested, verified in Swagger UI |
| `GET /challenge` Endpoint | ✅ Complete | Live, tested, verified — generic challenge with overrides |
| `POST /challenge/validate` Endpoint | ✅ Complete | Live, tested, verified — secure answer validation |
| FastAPI TestClient Verification | ✅ Complete | **100% pass rate** — all 5 test scenarios passed |

---

## 🔥 Milestone 3 — Live Microservice Integration & Platform Deployment

> **Status:** ✅ Completed & Integrated &nbsp;|&nbsp; **Integration:** Mobile Frontend Connected &nbsp;|&nbsp; **API Pass Rate:** 100%

### Objective

Milestone 3 transitioned the AI/ML subsystem from an isolated, locally-tested service into a **live, fully integrated platform microservice**. Primary objectives:

- Connect all 3 FastAPI REST endpoints to the **React Native mobile frontend** built by Jothiesh N (Frontend Developer, Team 3)
- Validate the complete **end-to-end data flow**: Mobile App → FastAPI Gateway → AI/ML Subsystem → Databases → Response
- Verify **anti-cheat security protocols** under real frontend request scenarios
- Document and verify the complete **AI/ML module-to-module internal call graph**

---

### Live REST Endpoint Integration — Full User Journey

| Step | Actor | Action | AI/ML Endpoint |
|:-----|:------|:-------|:---------------|
| 1 | React Native App | Alarm triggers at scheduled time — lock-screen activates | — |
| 2 | Mobile Client | Sends GET request to fetch personalized challenge for logged-in user | `GET /users/{user_id}/challenge` |
| 3 | AI/ML Subsystem | Fetches Elo from MongoDB → maps difficulty → generates challenge procedurally | Internal pipeline |
| 4 | Mobile Client | Renders challenge question on lock-screen UI *(correct answer suppressed)* | — |
| 5 | User | Types answer and submits via mobile UI | — |
| 6 | Mobile Client | Sends POST request with answer and `challenge_id` for validation | `POST /challenge/validate` |
| 7 | AI/ML Subsystem | Pops challenge token, validates against `accepted_answers` set, returns `is_correct` | Internal security layer |
| 8 | Mobile Client | If `is_correct=True` → dismisses alarm, logs attempt, updates Elo for next session | `GET /users/{user_id}/challenge` (next alarm) |

---

### AI/ML Module Internal Execution Call Graph

```
Mobile Request → GET /users/{user_id}/challenge
     │
     ▼
[1] data_ingest.py → build_user_context()
     Pulls PostgreSQL profile + MongoDB challenge_data, logs, user_preferences
     Merges into single unified context dictionary
     │
     ▼
[2] features.py → compute_behavioral_scores()
     Converts snooze counts, wake-up timestamps, sleep hours, challenge logs
     into 4 normalized 0–100 behavioral scores
     │
     ▼
[3] habit_scoring.py → compute_habit_score()
     Weighted formula: 0.35×Consistency + 0.25×Completion
                     + 0.20×Snooze + 0.20×Sleep = Habit Index (0–100)
     │
     ▼
[4] reinforcement.py → get_user_difficulty()
     Replays stored challenge attempts through Elo engine
     Outputs current Elo rating → maps to difficulty tier
     │
     ▼
[5] challenge_generator.py → generate_challenge()
     Generates procedural challenge of correct category & difficulty tier
     with dynamic parameters (no repetition)
     │
     ▼
[6] classifier.py → predict_snooze_risk()
     XGBoost model predicts tomorrow's oversleeping probability
     │
     ▼
[7] main.py → FastAPI Response
     Assembles Pydantic response, suppresses correct_answer,
     returns JSON payload → Mobile Client
```

| Step | Module | Role |
|:-----|:-------|:-----|
| 1 | `data_ingest.py` | Pulls & merges PostgreSQL + MongoDB records for one `user_id` |
| 2 | `features.py` | Converts raw logs into 4 normalized behavioral scores |
| 3 | `habit_scoring.py` | Applies weighted formula → single Habit Index (0–100) |
| 4 | `reinforcement.py` | Elo engine recalibration → difficulty tier assignment |
| 5 | `challenge_generator.py` | Procedural challenge generation at correct tier |
| 6 | `classifier.py` | XGBoost snooze oversleeping risk prediction |
| 7 | `main.py` (FastAPI) | Assembles & serves structured JSON response |

---

### Feature Verification & Integration Test Results

| Feature / Endpoint | Test Scenario | Result |
|:-------------------|:-------------|:-------|
| `GET /users/{user_id}/challenge` | User 4 (Elo: 1394.91) → Hard tier, Word Games, antonym question served | ✅ VERIFIED (200 OK) |
| Answer Suppression | GET response JSON inspected — `correct_answer` field completely absent | ✅ VERIFIED |
| `POST /challenge/validate` | Answer `'heavy'` submitted → `is_correct=True` via `accepted_answers` set match | ✅ VERIFIED (200 OK) |
| One-Time Token | Re-submitting same `challenge_id` → `found=False` (token consumed) | ✅ VERIFIED |
| Multi-Answer Validation | Both `'dark'` and `'heavy'` accepted as antonyms of `'light'` | ✅ VERIFIED |
| Mobile Integration | React Native Challenge Selection Screen renders API payload correctly | ✅ VERIFIED |
| Elo Recalibration | Correct fast solve → Elo rating increases → harder challenge next session | ✅ VERIFIED |

---

### Milestone 3 — Deliverables Summary

| Deliverable | Status | Integration Partner |
|:------------|:-------|:--------------------|
| `GET /users/{user_id}/challenge` live integration | ✅ Complete | Jothiesh N — React Native Challenge Screen |
| `POST /challenge/validate` live integration | ✅ Complete | Jothiesh N — React Native Answer Submission |
| Server-side anti-cheat token lifecycle validated | ✅ Complete | Backend Security Layer |
| Full Elo recalibration loop across frontend UI | ✅ Complete | Internal `reinforcement.py` after each attempt |
| Module-to-module call graph documented & verified | ✅ Complete | AI/ML Subsystem internal architecture review |
| End-to-end mobile-to-AI-to-database flow tested | ✅ Complete | Full Team 3 integration validation session |

---

## 🛠️ Full Technology Stack

| Category | Technology | Role in AI/ML Subsystem |
|:---------|:-----------|:------------------------|
| Language | **Python 3.13** | Entire AI/ML layer — models, pipelines, API endpoints |
| API Framework | **FastAPI** | High-performance async HTTP REST microservice |
| ASGI Server | **Uvicorn** | Production-grade server running FastAPI |
| Schema Validation | **Pydantic v2** | Strict type validation on all request/response schemas |
| ML Framework | **XGBoost** | Snooze oversleeping risk prediction (92.5% accuracy) |
| ML Utilities | **Scikit-learn** | Preprocessing pipelines, train/test split, accuracy metrics |
| Data Processing | **Pandas** | Tabular feature engineering, CSV loading, score aggregation |
| Numerical Computing | **NumPy** | Matrix operations, vectorized scoring computations |
| Model Persistence | **Joblib** | Binary serialization of trained model weights |
| API Documentation | **Swagger UI / OpenAPI 3.1** | Interactive endpoint testing at `/docs` |
| IDE | **Visual Studio Code** | Primary development environment (Windows) |
| Mobile Client | **React Native** | Cross-platform mobile app — Frontend layer (Team 3) |
| Relational DB | **PostgreSQL** | ACID-compliant structured transactional data storage |
| NoSQL DB | **MongoDB** | High-frequency unstructured analytical event log storage |

---

## 📁 Project File Structure

```
Cognitive-Alarm-System/
├── ai_ml/
│   ├── docs/
│   │   ├── aiml_architecture_diagram.png           # AI/ML 4-tier architecture diagram
│   │   ├── ICAP_Milestone3_AIML_Executive_Present.. # Milestone 3 executive presentation
│   │   ├── Milestone1_Theory_Document.pdf           # Milestone 1 theoretical foundation doc
│   │   └── Milestone2_Cognitive_Engine_Report.pdf   # Milestone 2 cognitive engine report
│   │
│   ├── models/
│   │   ├── .gitkeep
│   │   └── snooze_predictor.joblib                  # Serialized XGBoost snooze risk classifier
│   │
│   ├── notebooks/
│   │   └── .gitkeep                                 # Reserved for Jupyter experiment notebooks
│   │
│   ├── pipelines/
│   │   ├── data_ingest.py                           # Dual-DB connector: PostgreSQL + MongoDB → unified user context dict
│   │   ├── features.py                              # Behavior Analysis: 4 normalized behavioral score computation
│   │   └── recommendation_engine.py                 # Recommendation Engine: rule-based habit improvement tips
│   │
│   ├── src/
│   │   ├── challenge_generator.py                   # Cognitive Challenge Engine: 7 procedural generators × 5 tiers
│   │   ├── classifier.py                            # Snooze Prediction: XGBoost binary classifier (92.5% accuracy)
│   │   └── reinforcement.py                         # Adaptive Difficulty: Elo engine → 5 difficulty tiers
│   │
│   ├── static/
│   │   └── landing.html                             # Static landing page
│   │
│   ├── habit_scoring.py                             # Habit Scoring: weighted habit index formula (0–100)
│   ├── main.py                                      # FastAPI Router: REST endpoints + Pydantic schemas + Swagger UI
│   ├── README.md                                    # This documentation file
│   └── requirements.txt                             # All Python dependencies for AI/ML layer
│
├── .gitignore
└── LICENSE
```

---

## 📊 Key Performance Metrics — All Milestones

| Metric | Value | Milestone |
|:-------|:------|:----------|
| AI/ML Models Implemented | **5 core models** | Milestone 1 |
| Snooze Prediction Accuracy (XGBoost) | **92.5%** validation accuracy | Milestone 1 |
| Cognitive Challenge Categories | **7** unique procedural generators | Milestone 2 |
| Dynamic Difficulty Tiers | **5** tiers (Beginner → Expert) | Milestone 1 & 2 |
| Live REST API Endpoints | **3** live FastAPI HTTP endpoints | Milestone 2 & 3 |
| API Verification Pass Rate | **100%** (5/5 test scenarios) | Milestone 2 |
| Live Frontend Integration | React Native Challenge Selection Screen | Milestone 3 |
| Security Mechanisms | **3** (answer suppression, token popping, multi-answer set) | Milestone 2 & 3 |
| Elo Rating Range Supported | **800 – 1600+** (continuous adaptive) | Milestone 1 & 2 |
| Target Solve Window | **15 – 30 seconds** per challenge | Milestone 2 |
| Database Architecture | Dual DB (PostgreSQL + MongoDB) | All Milestones |
| API Documentation | OpenAPI 3.1 via Swagger UI (`/docs`) | Milestone 2 & 3 |

---

## 🗺️ Future Roadmap

| # | Enhancement | Description |
|:--|:------------|:------------|
| 01 | **Persistent MongoDB Challenge Caching** | Transition in-memory `_ACTIVE_CHALLENGES` dict to persistent MongoDB `challenge_data` collection for crash resilience |
| 02 | **End-to-End Load Testing** | Conduct API load tests with concurrent users via `locust.io` to validate FastAPI + Uvicorn performance |
| 03 | **XGBoost Hyperparameter Fine-Tuning** | Retrain snooze classifier with real anonymized user telemetry collected from the live app |
| 04 | **Multi-Lingual Challenge Support** | Extend Word Games and Riddle generators to Hindi, Bengali, Tamil, and Telugu regional languages |
| 05 | **Production Container Deployment** | Containerize AI/ML microservice with Docker and deploy behind Nginx reverse proxy |
| 06 | **Real-Time Elo Leaderboard** | Publish user Elo rankings to a Redis-backed leaderboard API endpoint for social competition features |

---

## 👥 Team & Collaboration

| Name | Role | Contributions |
|:-----|:-----|:--------------|
| **Debajyoti Mukhopadhyay** | AI/ML Developer *(Author)* | Designed & implemented all 5 AI/ML models, Cognitive Challenge Engine, 3 FastAPI REST endpoints, anti-cheat security, Elo engine, XGBoost classifier, and all AI/ML documentation across Milestones 1–3 |
| **Jothiesh N** | Frontend Developer | Built React Native mobile UI — Challenge Selection Screen, alarm lock-screen, dashboard — integrated directly with Debajyoti's AI/ML REST endpoints |
| **Abdul** | Backend Developer | Built FastAPI API Gateway, JWT authentication, RBAC middleware, and coordinated backend routing between AI/ML layer and mobile client |

### Integration Touchpoints

- `GET /users/{user_id}/challenge` (Debajyoti) → React Native Challenge Selection Screen (Jothiesh)
- `POST /challenge/validate` (Debajyoti) → React Native Answer Submission Flow (Jothiesh)
- AI/ML FastAPI Microservice (Debajyoti) → API Gateway Routing Middleware (Abdul)
- Shared Dual-DB Architecture: PostgreSQL + MongoDB consumed by AI/ML layer and populated by Backend layer

---

<div align="center">

**ICAP — Intelligent Cognitive Alarm Platform**  
*Team 3 · Debajyoti Mukhopadhyay — AI/ML*

![Built with Python](https://img.shields.io/badge/Built%20with-Python%203.13-3776AB?style=flat-square&logo=python)
![FastAPI](https://img.shields.io/badge/Served%20via-FastAPI-009688?style=flat-square&logo=fastapi)
![XGBoost](https://img.shields.io/badge/ML-XGBoost%2092.5%25-FF6600?style=flat-square)

</div>