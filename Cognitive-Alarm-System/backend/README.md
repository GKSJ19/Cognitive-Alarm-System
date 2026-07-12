# Intelligent Cognitive Alarm Platform Backend

This backend provides a production-ready FastAPI service for the Intelligent Cognitive Alarm Platform.

## Features
- Authentication and JWT support
- User profile management
- Alarm CRUD and listing
- Challenge retrieval and answer validation
- Habit and analytics endpoints
- Coach and admin endpoints

## Running locally

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Set environment variables:
   - `DATABASE_URL`
   - `SECRET_KEY`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI`
3. Start the app:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

Swagger docs are available at `/docs`.
