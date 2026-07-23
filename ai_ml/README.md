# AI/ML Module — Intelligent Cognitive Alarm Platform

This folder contains the AI/ML layer for the Cognitive Alarm System project.

## Architecture

See `docs/aiml_architecture_diagram.png` for the full toolstack and file structure.

## Progress Status

All 5 required models from the system architecture are built and tested:

| Model | File | Status |
|---|---|---|
| Adaptive Difficulty Model | `src/reinforcement.py` | ✅ Complete, live-tested via API |
| Habit Scoring Model | `habit_scoring.py` | ✅ Complete, live-tested via API |
| Behavior Analysis Model | `pipelines/features.py` | ✅ Complete, verified on real users |
| Recommendation Model | `pipelines/recommendation_engine.py` | ✅ Complete, live-tested via API |
| Prediction Model | `src/classifier.py` + `models/snooze_predictor.joblib` | ✅ Complete, 92.5% validation accuracy |

Supporting infrastructure:
- `pipelines/data_ingest.py` — combines data from PostgreSQL (users, alarms, habits, scores) and MongoDB (challenge_data, logs, user_preferences, content)
- `main.py` — FastAPI service exposing all models as live endpoints

## Known Gaps (Disclosed)

- `data_ingest.py` currently uses hardcoded sample data as a stand-in for live database connections
- `classifier.py` was trained on synthetic labeled data, since real historical usage data is not yet available at volume
- Real MongoDB sample data currently covers only 5–7 users

## Documentation

See `docs/Milestone1_Theory_Document.docx` for the full write-up: project description, dataset, environment setup, data exploration, proposed system, training pipeline & results, and conclusion.

## Setup

```bash
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

## Endpoints

- `POST /users/{user_id}/predict-difficulty`
- `GET /users/{user_id}/habit-score`
- `GET /users/{user_id}/recommendation`
- `GET /users/{user_id}/risk-prediction`