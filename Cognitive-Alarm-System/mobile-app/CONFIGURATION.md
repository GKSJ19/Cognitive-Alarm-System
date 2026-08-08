# Configuration

ICAP utilizes environment variables to securely manage configuration across environments without hardcoding secrets.

## Backend Configuration

The backend looks for a `.env` file located in the `backend/` root directory. These values are automatically loaded and validated via Pydantic (`app/config/settings.py`).

### Standard `.env` File (Milestone 1)

```env
# Database configuration (Defaults to local SQLite)
DATABASE_URL=sqlite+aiosqlite:///./icap.db

# JWT Authentication
# In production, replace this with a secure random hex string
JWT_SECRET_KEY=09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Application Settings
ENVIRONMENT=local
DEBUG=false

# CORS settings for frontend communication
BACKEND_CORS_ORIGINS=http://localhost:5173
```

## Frontend Configuration

The frontend utilizes Vite's built-in environment variable handling. While Milestone 1 relies primarily on default fallbacks, you can configure the frontend by placing a `.env` file in the `frontend/` directory.

### Standard `.env` File

```env
# The base URL pointing to the FastAPI backend
VITE_API_BASE_URL=http://localhost:8000/api/v1
```
*(Note: Ensure variables start with `VITE_` to be exposed to the React application).*
