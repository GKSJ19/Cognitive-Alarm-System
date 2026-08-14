# Intelligent Cognitive Alarm Platform (ICAP)

ICAP is an AI-powered mobile alarm application where alarms can only be dismissed after completing an AI-selected cognitive challenge.

## Project Structure

```text
ICAP/
├── mobile/      # React Native Expo Mobile App
├── backend/     # FastAPI Backend Service
├── database/    # SQL/NoSQL Database schemas and migrations (Database Team)
├── ai_ml/       # Challenge generation and habit modeling (AI/ML Team)
├── docs/        # Project documentation
└── assets/      # Media and design assets
```

## Tech Stack

- **Mobile:** React Native, TypeScript, Redux Toolkit, Axios, React Native Paper, Expo
- **Backend:** FastAPI, JWT Authentication, Pydantic v2, SQLAlchemy (PostgreSQL / SQLite)
- **Database:** PostgreSQL (structured logs/users/alarms), MongoDB (cognitive challenges/recommendations)

## Development Setup

### Backend Setup
1. Navigate to `/backend`
2. Create virtual environment: `python -m venv venv`
3. Activate virtual environment:
   - Windows: `venv\Scripts\activate`
   - Unix/macOS: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Create `.env` file from `.env.example`
6. Run server: `python run.py`

### Mobile Setup
1. Navigate to `/mobile`
2. Install dependencies: `npm install`
3. Start Expo: `npx expo start`
