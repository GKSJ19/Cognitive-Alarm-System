ICAP — Intelligent Cognitive Alarm Platform
AI/ML Subsystem — Complete Development Journal
Developer: Debajyoti Mukhopadhyay  ·  Role: AI/ML    ·  Team – 3

📌 Project Overview
The Intelligent Cognitive Alarm Platform (ICAP) is an AI-powered mobile alarm application built for the Infosys Springboard Internship Program. Instead of allowing users to dismiss alarms with a simple tap, ICAP enforces genuine cognitive wakefulness by requiring users to solve personalized cognitive challenges — driven by AI/ML algorithms — before the alarm can be turned off.
This README documents the complete AI/ML engineering journey across all three milestones, covering model design, training, implementation, API development, platform integration, and verification results.
  Platform: ICAP     Role: AI/ML Developer     Milestones: 1 → 2 → 3     Status: ✅ Completed & Verified   

📋 Table of Contents
1. Project Overview
2. System Architecture (4-Tier Design)
3. Milestone 1 — Foundation Models & AI/ML Subsystem Setup
   3.1 Objective & Scope
   3.2 Dataset & Database Architecture
   3.3 Environment Setup & Tech Stack
   3.4 AI/ML Models Designed & Implemented
   3.5 Training Pipeline & Results
   3.6 Milestone 1 Deliverables Summary
4. Milestone 2 — Cognitive Challenge Engine & REST API Integration
   4.1 Objective & Scope
   4.2 Data Sources & Preprocessing
   4.3 7 Cognitive Challenge Categories Implemented
   4.4 Dynamic Difficulty Engine (5 Elo Tiers)
   4.5 Server-Side Anti-Cheat Security
   4.6 REST API Endpoints (FastAPI)
   4.7 Verification Test Matrix
   4.8 Milestone 2 Deliverables Summary
5. Milestone 3 — Live Microservice Integration & Platform Deployment
   5.1 Objective & Scope
   5.2 Live REST Endpoint Integration with Mobile Frontend
   5.3 AI/ML Module Execution Flow (Module-to-Module Call Graph)
   5.4 Feature Verification & Test Results
   5.5 Milestone 3 Deliverables Summary
6. Full Technology Stack
7. Project File Structure
8. Key Performance Metrics (All Milestones)
9. Future Roadmap
10. Team & Collaborations

🏗️ Section 1 — System Architecture (4-Tier Microservice Design)
ICAP follows a strict 4-Tier Microservice Architecture that ensures clean separation of concerns, high scalability, and sub-15ms AI prediction latency.
1.1 Architecture Layer Summary
Tier	Layer Name	Technology Stack	Key Responsibilities
Tier 1	Client Layer	React Native (Android & iOS)	Mobile app UI, alarm lock-screen, challenge rendering, user dashboard
Tier 2	Backend Layer	Python + FastAPI API Gateway	Request routing, JWT auth, RBAC, 11 modular business services
Tier 3	AI/ML Layer	Python + XGBoost + FastAPI	5 intelligent models: Behavior Analysis, Habit Scoring, Elo Engine, Recommendations, Snooze Prediction
Tier 4	Data Layer	PostgreSQL + MongoDB (Dual DB)	Transactional structured data (PostgreSQL) + Analytical event logs (MongoDB)

1.2 Dual Database Architecture
Database	Type	Tables / Collections	AI/ML Usage
PostgreSQL	Relational (ACID)	users, roles, alarms, scores, habit_goals, sleep_schedules, audit_logs	Reads sleep_duration, habit_score, difficulty_preference
MongoDB	NoSQL (High-Volume)	challenge_data, logs, user_preferences, content, snooze_patterns, ai_predictions	Reads snooze_count, elo_rating, challenge_type_preference, completion_time_seconds

1.3 User Stakeholder Roles
Role	Permissions & Access	Primary Interface
User	Set alarms, solve cognitive challenges, view habit dashboard, track sleep consistency scores	React Native Mobile App
Wellness Coach	Monitor assigned users, inspect sleep analytics, send personalized bedtime recommendations	Web Coach Portal / App
Administrator	Manage accounts, assign roles, view system health, configure platform-level parameters	Web Admin Dashboard


🚀 Section 2 — Milestone 1: Foundation Models & AI/ML Subsystem Setup
  Status: ✅ Completed     Scope: AI/ML Foundation Layer     Deliverable: 5 Core AI Models + FastAPI Serving   
2.1 Objective & Scope
Milestone 1 established the complete foundational AI/ML layer for ICAP. The goal was to design, train, and serve all 5 core intelligent models that power the platform's behavioral analytics, adaptive difficulty engine, habit scoring system, and snooze risk prediction.
The milestone covered: environment setup, data schema design, all 5 model implementations, model training and serialization (Joblib), and serving the models as live REST HTTP endpoints via FastAPI.
2.2 Dataset & Database Architecture
The AI/ML layer consumes user behavioral data from a dual-database architecture designed specifically to separate transactional data (PostgreSQL) from high-frequency analytical logs (MongoDB):
PostgreSQL Tables Used by AI/ML Subsystem:
Table Name	Key Fields Consumed by AI/ML
users	user_id, sleep_duration, preferred_wakeup_time, difficulty_preference
scores	user_id, productivity_score, habit_score
alarms	user_id, alarm_time, is_recurring, snooze_count
habit_goals	user_id, target_sleep_hours, target_wake_time

MongoDB Collections Used by AI/ML Subsystem:
Collection Name	Key Fields Consumed by AI/ML
challenge_data	difficulty_level, is_correct, completion_time_seconds, attempted_at
logs	snooze_count, wake_up_confirmed, verification_status, timestamp
user_preferences	current_difficulty, challenge_type_preference, elo_rating
content	category, title, description (feeds Recommendation Model)
snooze_patterns	date, snooze_frequency, sleep_deficit, historical_trend

2.3 Environment Setup & Tech Stack
The AI/ML module was built locally using Python 3.13 on a Windows development machine using VS Code as primary IDE:
Tool / Library	Version	Purpose in AI/ML Layer
Python	3.13	Core programming language for all model logic, data pipelines, and API serving
FastAPI	Latest	High-performance async REST API framework serving all 5 models as HTTP endpoints
Uvicorn	Latest	ASGI server running the FastAPI application with hot-reload in development
Pydantic v2	v2.x	Strict request/response schema validation for all API endpoints
XGBoost	Latest	Supervised classification model for snooze oversleeping risk prediction
Scikit-learn	Latest	Preprocessing pipelines, data normalization, and model evaluation metrics
Pandas	Latest	Tabular data structure for feature engineering and data transformations
NumPy	Latest	Numerical matrix operations for scoring formulas and probability computations
Joblib	Latest	Binary serialization and persistence of trained model weight files
Swagger UI / OpenAPI	Built-in FastAPI	Interactive browser-based API documentation and live endpoint testing

2.4 The 5 Core AI/ML Models Designed & Implemented
Model 1: Adaptive Difficulty Model (reinforcement.py)
Algorithm: Reinforcement Learning using an Elo Rating Mechanism combined with Q-Learning principles.
Functionality: Tracks every user's challenge solve speed and accuracy across multiple attempts. After each attempt, the Elo engine computes a new rating using the standard Elo formula. This rating is then mapped to one of 5 discrete difficulty tiers:
Difficulty Tier	Elo Rating Range	Challenge Characteristics
Beginner	Elo < 900	Single-digit arithmetic, basic antonyms, 3-word memory lists
Easy	Elo 900 – 1100	Two-step operations, simple word unscrambling, 4-number sequences
Medium	Elo 1100 – 1350	Geometric progression series, 5-word sequential memory recall
Hard	Elo 1350 – 1600	Multi-operator algebra, complex riddles, pattern extrapolation
Expert	Elo > 1600	Advanced lateral thinking puzzles, multi-step logic problems

Model 2: Behavior Analysis Model (features.py)
Functionality: Converts raw user behavioral data (snooze counts, wake-up timestamps, sleep hours, challenge completions) into 4 normalized behavioral scores on a 0–100 scale:
Behavioral Score	Weight in Habit Formula	Source Signal
Snooze Reduction Score	20%	snooze_count from logs collection, alarm records
Wake-Up Consistency Score	35%	actual vs target wake-up time delta across 7 days
Challenge Completion Score	25%	is_correct & completion_time_seconds from challenge_data
Sleep Adherence Score	20%	sleep_duration vs target_sleep_hours from habit_goals

Model 3: Habit Scoring Model (habit_scoring.py)
Algorithm: Weighted Linear Scoring Formula.
Formula: Habit Score = 0.35 × (Consistency) + 0.25 × (Completion) + 0.20 × (Snooze Reduction) + 0.20 × (Sleep Adherence)
Output: A single 0–100 numerical habit quality index updated daily, stored in MongoDB (habit_scores collection) and summarized in PostgreSQL (scores table).
Model 4: Recommendation Engine (recommendation_engine.py)
Algorithm: Rule-Based Multi-Class Recommender.
Functionality: Identifies the lowest-scoring behavioral component from the Habit Scoring model output and maps it to a curated set of targeted bedtime routines, sleep hygiene tips, and challenge strategy recommendations. Recommendations are pushed to the user's mobile dashboard and notification service.
Model 5: Snooze Prediction Classifier (classifier.py)
Algorithm: XGBoost Supervised Binary Classification.
Training Data: Historical behavioral feature vectors (sleep_deficit, bedtime_consistency_delta, snooze_frequency_7d, habit_score) labeled with a binary oversleep risk flag.
Validation Accuracy: 92.5% on held-out test set.
Model Persistence: Serialized and saved as snooze_predictor.joblib using Joblib for zero-overhead loading on server startup.
2.5 Training Pipeline & Results
Pipeline Stage	Module / File	Action Performed
1. Data Ingestion	data_ingest.py	Pulls PostgreSQL profile + MongoDB logs into a unified per-user context dictionary
2. Feature Extraction	features.py	Computes 4 behavioral scores from raw logs using time-delta and ratio calculations
3. Habit Scoring	habit_scoring.py	Applies weighted scoring formula to output a single 0–100 Habit Index
4. Elo Recalibration	reinforcement.py	Replays all challenge attempts through Elo engine to set next session difficulty
5. Model Training	train_models.py	Trains XGBoost classifier and difficulty model on synthetic behavioral training data
6. Serialization	Joblib	Saves snooze_predictor.joblib and difficulty_model.joblib to disk
7. REST Serving	main.py (FastAPI)	Loads serialized models on startup and serves all endpoints at /docs (Swagger UI)

2.6 Milestone 1 Deliverables Summary
Deliverable	Status	Details
Adaptive Difficulty Elo Engine	✅ Complete	Elo rating calculation with 5 difficulty tier mapping in reinforcement.py
Behavior Analysis Model	✅ Complete	4 normalized behavioral scores computed in features.py
Habit Scoring Model	✅ Complete	Weighted formula Habit Index (0–100) computed in habit_scoring.py
Recommendation Engine	✅ Complete	Rule-based recommender targeting lowest habit component
Snooze Risk Classifier (XGBoost)	✅ Complete	Binary classification at 92.5% validation accuracy
Model Serialization (Joblib)	✅ Complete	snooze_predictor.joblib & difficulty_model.joblib saved to disk
FastAPI REST Serving	✅ Complete	All models served as live HTTP endpoints via Uvicorn
Swagger UI / OpenAPI Docs	✅ Complete	Interactive endpoint testing available at /docs


⚡ Section 3 — Milestone 2: Cognitive Challenge Engine & REST API Integration
  Status: ✅ Completed & Verified     Scope: Cognitive Engine + FastAPI Endpoints     Test Rate: 100% Pass Rate (5/5 Scenarios)   
3.1 Objective & Scope
Building directly on the 5 foundation models from Milestone 1, Milestone 2 engineered the core intelligence feature of ICAP: the Cognitive Challenge Engine. This module procedurally generates personalized cognitive challenges for every alarm event and exposes them as live REST HTTP endpoints consumed by the mobile client.
3.2 Data Sources & Preprocessing
3.2.1 Score & Rating Normalization
Elo ratings from reinforcement.py span 800–1800+. The preprocessing stage maps each user's current Elo to the nearest of the 5 difficulty baselines, ensuring challenge generation parameters (number ranges, word list sizes, sequence lengths) scale appropriately with skill level.
3.2.2 Context Assembly (data_ingest.py → challenge_generator.py)
The data_ingest.py module's build_user_context() function merges data from both databases into a single unified Python dictionary passed directly to challenge_generator.py:
•	user_id, elo_rating, difficulty_level from reinforcement.py (PostgreSQL + MongoDB)
•	challenge_type_preference from user_preferences (MongoDB)
•	productivity_score, habit_score from scores (PostgreSQL)
•	snooze_count, completion_time_seconds from logs + challenge_data (MongoDB)
3.2.3 Multi-Answer Set Preprocessing
For linguistic challenges (Word Games: synonyms and antonyms), correct answer options are pre-normalized into lower-case sets (accepted_answers) to correctly accept equivalent answers. For example, a question asking for an antonym of 'light' accepts both 'dark' and 'heavy' as correct.
3.3 7 Cognitive Challenge Categories Implemented
The challenge_generator.py module implements all 7 challenge categories from the project specification. Each category is procedurally generated with difficulty parameters that scale across all 5 Elo tiers:
#	Category	Description	Example Challenge (Hard Tier)
1	Mathematical Problems	Arithmetic, percentages, and algebraic expressions generated from dynamic numeric seeds	Solve: 84 ÷ 7 + (13 × 4) — 29
2	Logic Puzzles	Arithmetic sequences, geometric progressions, and missing element series	Next number: 3, 9, 27, 81, ___
3	Memory Challenges	Sequential word list recall and position-based memory tests	Recall 5 words in order: River, Cloud, Marble, Fence, Spark
4	Word Games	Anagram unscrambling, synonym matching, and antonym identification	Give an antonym for: 'light' (Answer: heavy / dark)
5	Pattern Recognition	Shape sequence extrapolation, color patterns, and multiplicative progressions	Identify next element: △ ○ △△ ○○ △△△ ___
6	Riddles	Lateral thinking questions and everyday logic riddles	What has hands but cannot clap?
7	Quick Quizzes	Science trivia, general knowledge, and factual recall questions	What is the chemical symbol for Gold?

3.4 Dynamic Difficulty Engine — 5 Elo Tiers
Challenges are never generated at a static difficulty. Every challenge request goes through a 4-step dynamic scaling process:
Step	Process	Module
1	Fetch user's current Elo rating from MongoDB (user_preferences.elo_rating)	data_ingest.py
2	Map Elo to nearest difficulty tier (Beginner / Easy / Medium / Hard / Expert)	challenge_generator.py
3	Generate challenge with tier-specific parameters (number range, word list size, sequence length)	challenge_generator.py
4	After user submits answer, recalculate Elo based on correctness and solve time (15–30s target window)	reinforcement.py

3.5 Server-Side Anti-Cheat Security
To prevent users from inspecting API responses and bypassing challenges, three security mechanisms were implemented:
Security Mechanism	Implementation	Effect
Answer Suppression	correct_answer field completely omitted from GET /challenge response JSON payload	Client device cannot inspect the correct answer at any point before submission
One-Time Token Popping	_ACTIVE_CHALLENGES.pop(challenge_id) called on first POST /challenge/validate request	Re-submitting the same challenge_id returns found=False, preventing replay and brute-force attacks
Multi-Answer Set Validation	accepted_answers: Set[str] field in ChallengeRecord stores all acceptable answers in lowercase	Handles synonym/antonym ambiguity and natural linguistic variation in responses

3.6 REST API Endpoints (FastAPI — main.py)
Endpoint	Method	Purpose	Key Response Fields
GET /users/{user_id}/challenge	GET	Fetches personalized challenge for a specific user based on their Elo rating and preference	challenge_id, category, difficulty, question, challenge_type
GET /challenge	GET	Fetches a generic challenge with optional query parameter overrides (category, difficulty)	challenge_id, category, difficulty, question
POST /challenge/validate	POST	Validates a submitted answer for a given challenge_id	found, is_correct, correct_answer (revealed post-validation only)

3.7 Verification Test Matrix
All 3 endpoints were tested end-to-end using FastAPI TestClient and verified live via Swagger UI (/docs). Below is the complete verification matrix:
Test Scenario	Input	Expected Outcome	HTTP Status	Result
GET /users/4/challenge	user_id = 4 (Elo: 1394.91)	Maps to Hard difficulty, Word Games preference, returns antonym question	200 OK	✅ PASSED
Answer Suppression Check	Inspect GET response JSON	correct_answer field completely absent from response payload	200 OK	✅ PASSED
POST /challenge/validate ('heavy')	answer='heavy', challenge_id=67115719	is_correct=True (via accepted_answers set match)	200 OK	✅ PASSED
POST /challenge/validate ('dark')	answer='dark', challenge_id=67115719	is_correct=True (antonym synonym alternative)	200 OK	✅ PASSED
Re-submit consumed challenge_id	Same challenge_id (already validated)	found=False (single-use token enforced)	200 OK	✅ PASSED

3.8 Milestone 2 Deliverables Summary
Deliverable	Status	Details
7 Procedural Cognitive Challenge Generators	✅ Complete	All 7 categories (Math, Logic, Memory, Words, Patterns, Riddles, Quizzes) implemented in challenge_generator.py
5 Difficulty Tier Dynamic Scaling	✅ Complete	Elo rating → Difficulty bracket mapping active for all challenge types
Multi-Answer Set Validation Engine	✅ Complete	accepted_answers set handles synonym/antonym ambiguity
Server-Side Answer Suppression	✅ Complete	correct_answer omitted from GET response, revealed only post-validation
One-Time Challenge Token Popping	✅ Complete	_ACTIVE_CHALLENGES.pop() enforces single-attempt security
GET /users/{user_id}/challenge Endpoint	✅ Complete	Live, tested, verified in Swagger UI — returns personalized challenge
GET /challenge Endpoint	✅ Complete	Live, tested, verified — generic challenge with override parameters
POST /challenge/validate Endpoint	✅ Complete	Live, tested, verified — secure answer validation with set comparison
FastAPI TestClient Verification	✅ Complete	All 5 test scenarios passed (100% pass rate)


🔥 Section 4 — Milestone 3: Live Microservice Integration & Platform Deployment
  Status: ✅ Completed & Integrated     Integration: Mobile Frontend Connected     Verification: 100% API Pass Rate   
4.1 Objective & Scope
Milestone 3 transitioned the AI/ML subsystem from an isolated, locally-tested set of models and endpoints into a live, fully integrated platform microservice. The primary objectives were:
•	Connect all 3 FastAPI REST endpoints to the React Native mobile frontend built by Jothiesh N (Frontend Developer, Team 3)
•	Validate the complete end-to-end data flow: Mobile App → FastAPI Gateway → AI/ML Subsystem → PostgreSQL/MongoDB → Response
•	Verify anti-cheat security protocols under real frontend request scenarios
•	Document and review the complete AI/ML module-to-module internal execution call graph
4.2 Live REST Endpoint Integration with Mobile Frontend
In Milestone 3, all 3 AI/ML REST endpoints were connected directly to the React Native Challenge Selection Screen (Feature 01) developed by Jothiesh N. The integration flow is as follows:
Step	Actor	Action	AI/ML Endpoint Called
1	React Native App	Alarm triggers at scheduled time — lock-screen activates	—
2	Mobile Client	Sends GET request to fetch personalized challenge for logged-in user	GET /users/{user_id}/challenge
3	AI/ML Subsystem	Fetches user Elo rating from MongoDB, maps to difficulty tier, procedurally generates challenge	Internal: data_ingest.py → reinforcement.py → challenge_generator.py
4	Mobile Client	Renders challenge question (correct answer suppressed) on the lock-screen UI	—
5	User	Types answer and submits via mobile UI	—
6	Mobile Client	Sends POST request with answer and challenge_id for validation	POST /challenge/validate
7	AI/ML Subsystem	Pops challenge token, validates against accepted_answers set, returns is_correct	Internal: _ACTIVE_CHALLENGES.pop()
8	Mobile Client	If is_correct=True → dismisses alarm, logs attempt, updates Elo rating	GET /users/{user_id}/challenge (next alarm)

4.3 AI/ML Module Internal Execution Call Graph
The internal call graph documents the exact module-to-module data path within the AI/ML subsystem from a single user challenge request to final HTTP response:
Step	Module / File	Role & Function Executed
1	data_ingest.py → build_user_context()	Pulls PostgreSQL user profile + MongoDB challenge_data, logs, user_preferences → merges into single context dict
2	features.py → compute_behavioral_scores()	Converts raw snooze counts, wake-up timestamps, sleep hours, challenge completion logs into 4 normalized 0–100 behavioral scores
3	habit_scoring.py → compute_habit_score()	Applies weighted formula: 0.35×Consistency + 0.25×Completion + 0.20×Snooze + 0.20×Sleep to output Habit Index
4	reinforcement.py → get_user_difficulty()	Replays stored challenge attempts through Elo engine to compute current Elo rating and map to difficulty tier
5	challenge_generator.py → generate_challenge()	Generates procedural challenge of the correct type (per user_preferences) at the correct difficulty tier with dynamic parameters
6	classifier.py → predict_snooze_risk()	XGBoost model predicts tomorrow morning's oversleeping risk probability from behavior feature vector
7	main.py (FastAPI Router)	Assembles all outputs into a structured Pydantic response, omits correct_answer, returns JSON payload to mobile client

4.4 Feature Verification & Integration Test Results
Feature / Endpoint	Test Scenario	Result
GET /users/{user_id}/challenge	User 4 (Elo: 1394.91) → Hard tier, Word Games preference, antonym question served	✅ VERIFIED (200 OK)
Answer Suppression	GET response JSON inspected — correct_answer field completely absent	✅ VERIFIED
POST /challenge/validate	Answer 'heavy' submitted → is_correct=True via accepted_answers set match	✅ VERIFIED (200 OK)
One-Time Token	Re-submitting same challenge_id → found=False (token consumed)	✅ VERIFIED
Multi-Answer Validation	Synonym 'dark' and antonym 'heavy' both accepted for antonym of 'light'	✅ VERIFIED
Mobile Integration	React Native Challenge Selection Screen renders challenge from API payload correctly	✅ VERIFIED
Elo Recalibration	Correct answer with fast solve → Elo rating increases for next session	✅ VERIFIED

4.5 Milestone 3 Deliverables Summary
Deliverable	Status	Integration Partner
GET /users/{user_id}/challenge live integration	✅ Complete	Jothiesh N — React Native Challenge Screen
POST /challenge/validate live integration	✅ Complete	Jothiesh N — React Native Answer Submission
Server-side anti-cheat token lifecycle validated	✅ Complete	Backend Security Layer (Abdul's Gateway)
Full Elo recalibration loop across frontend UI	✅ Complete	Internal reinforcement.py after each attempt
Module-to-module call graph documented & verified	✅ Complete	AI/ML Subsystem internal architecture review
End-to-end mobile-to-AI-to-database flow tested	✅ Complete	Full Team 3 integration validation session


🛠️ Section 5 — Complete Technology Stack
Category	Technology	Role
Language	Python 3.13	Entire AI/ML layer — all models, pipelines, API endpoints
API Framework	FastAPI	High-performance async HTTP REST microservice serving all AI/ML endpoints
ASGI Server	Uvicorn	Production-grade ASGI server running FastAPI application
Schema Validation	Pydantic v2	Strict type validation on all API request and response schemas
ML Framework	XGBoost	Snooze oversleeping risk prediction (binary classification, 92.5% accuracy)
ML Utilities	Scikit-learn	Preprocessing pipelines, train/test split, accuracy metrics
Data Processing	Pandas	Tabular feature engineering, CSV loading, score aggregation
Numerical Computing	NumPy	Matrix operations, vectorized scoring formula computations
Model Persistence	Joblib	Binary serialization of trained model weights to .joblib files
API Documentation	Swagger UI / OpenAPI 3.1	Interactive browser-based endpoint testing and documentation at /docs
IDE	Visual Studio Code	Primary development environment on Windows
Mobile Client	React Native	Cross-platform mobile application (iOS & Android) — Frontend layer
Relational DB	PostgreSQL	ACID-compliant structured transactional data storage
NoSQL DB	MongoDB	High-frequency unstructured analytical event log storage


📁 Section 6 — Project File Structure (AI/ML Subsystem)
ICAP_AI_ML/
├── src/
│   ├── data_ingest.py           # Dual-DB connector: PostgreSQL + MongoDB → unified user context dict
│   ├── features.py              # Behavior Analysis Model: 4 normalized behavioral score computation
│   ├── habit_scoring.py         # Habit Scoring Model: weighted habit index formula
│   ├── reinforcement.py         # Adaptive Difficulty: Elo rating engine → 5 difficulty tiers
│   ├── challenge_generator.py   # Cognitive Challenge Engine: 7 procedural generators × 5 tiers
│   ├── classifier.py            # Snooze Prediction: XGBoost binary classifier
│   ├── recommendation_engine.py # Recommendation Engine: rule-based habit improvement tips
│   └── main.py                  # FastAPI Router: all REST endpoints + Pydantic schemas + Swagger UI
├── models/
│   ├── snooze_predictor.joblib  # Serialized XGBoost snooze risk classifier (92.5% accuracy)
│   └── difficulty_model.joblib  # Serialized difficulty calibration model
├── training/
│   └── train_models.py          # Model training script: generates synthetic data, trains, serializes
├── tests/
│   └── test_endpoints.py        # FastAPI TestClient unit tests for all 3 challenge endpoints
├── requirements.txt             # All Python dependencies for AI/ML layer
└── README.md                    # This documentation file

📊 Section 7 — Key Performance Metrics (All Milestones)
Metric	Value	Milestone
Number of AI/ML Models Implemented	5 core models	Milestone 1
Snooze Prediction Model Accuracy (XGBoost)	92.5% validation accuracy	Milestone 1
Cognitive Challenge Categories	7 unique procedural generators	Milestone 2
Dynamic Difficulty Tiers	5 tiers (Beginner → Expert)	Milestone 1 & 2
REST API Endpoints (FastAPI)	3 live HTTP endpoints	Milestone 2 & 3
API Endpoint Verification Rate	100% (5/5 test scenarios passed)	Milestone 2
Live Frontend Integration	React Native Challenge Selection Screen	Milestone 3
Security Mechanisms Implemented	3 (answer suppression, token popping, multi-answer set)	Milestone 2 & 3
Elo Rating Range Supported	800 – 1600+ (continuous adaptive)	Milestone 1 & 2
Target Solve Window	15 – 30 seconds per challenge	Milestone 2
Database Architecture	Dual DB (PostgreSQL + MongoDB)	All Milestones
API Documentation	OpenAPI 3.1 via Swagger UI (/docs)	Milestone 2 & 3


🗺️ Section 8 — Future Roadmap (Post-Milestone 3)
Priority	Enhancement	Description
01	Persistent MongoDB Challenge Caching	Transition in-memory _ACTIVE_CHALLENGES dict to persistent MongoDB challenge_data collection for crash resilience and distributed scale
02	Full End-to-End Load Testing	Conduct API load tests with concurrent users via locust.io to validate FastAPI + Uvicorn performance under production traffic
03	XGBoost Hyperparameter Fine-Tuning	Retrain snooze classifier with real anonymized user telemetry data collected from the live mobile application
04	Multi-Lingual Challenge Support	Extend Word Games and Riddle generators to support Hindi, Bengali, Tamil, and Telugu regional language challenges
05	Production Container Deployment	Containerize the AI/ML microservice with Docker and deploy behind a reverse proxy (Nginx) for final demo and production release
06	Real-Time Elo Leaderboard	Publish user Elo rankings to a Redis-backed leaderboard API endpoint for social habit competition features


👥 Section 9 — Team & Collaboration
Name	Role	Contributions
Debajyoti Mukhopadhyay	AI/ML Developer (Author)	Designed & implemented all 5 AI/ML models, Cognitive Challenge Engine, 3 FastAPI REST endpoints, anti-cheat security, Elo engine, XGBoost classifier, and all AI/ML documentation across Milestones 1–3
Jothiesh N	Frontend Developer	Developed React Native mobile UI — Challenge Selection Screen, alarm lock-screen, dashboard — integrated directly with Debajyoti's AI/ML REST endpoints
Abdul	Backend Developer	Built the FastAPI API Gateway, JWT authentication, RBAC middleware, and coordinated backend routing between AI/ML layer and mobile client

Integration Touchpoints
•	Debajyoti's GET /users/{user_id}/challenge endpoint → Jothiesh's React Native Challenge Selection Screen
•	Debajyoti's POST /challenge/validate endpoint → Jothiesh's React Native Answer Submission flow
•	Debajyoti's FastAPI AI/ML microservice → Abdul's API Gateway routing middleware
•	Shared Dual-DB architecture: PostgreSQL + MongoDB consumed by AI/ML layer and populated by Backend layer

ICAP  ·  Intelligent Cognitive Alarm Platform  ·  Infosys Springboard Internship  ·  Debajyoti Mukhopadhyay (AI/ML )
