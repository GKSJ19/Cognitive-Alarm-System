from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import time
import logging
from starlette.middleware.base import BaseHTTPMiddleware

# Initialize Logger Config
from app.logging_config import setup_logging
setup_logging()

from app.database import engine, Base
from app.routes.auth import router as auth_router
from app.routes.protected import router as protected_router
from app.routes.alarms import router as alarms_router
from app.routes.profile import router as profile_router
from app.routes.challenges import router as challenges_router
from app.routes.notifications import router as notifications_router

# New engine routers
from app.adaptive_engine import router as adaptive_router
from app.behavioral_analytics import router as analytics_router
from app.habit_scoring import router as scoring_router
from app.recommendation_engine import router as recommendation_router
from app.dashboard import router as dashboard_router
from app.routes.reports import router as reports_router

from sqlalchemy import inspect
from app.database import engine, Base, SessionLocal
from app.seed import seed_database
# Import models to register SQLAlchemy models on Base.metadata
import app.models

# Initialize database schemas (auto-creates tables for SQLite/PostgreSQL if they don't exist)
inspector = inspect(engine)
schema_outdated = False
table_names = inspector.get_table_names()

if "alarms" in table_names:
    columns = [c["name"] for c in inspector.get_columns("alarms")]
    if "repeat_days" not in columns:
        schema_outdated = True

if "users" in table_names:
    columns = [c["name"] for c in inspector.get_columns("users")]
    if "google_id" not in columns:
        schema_outdated = True

# Outdated check for new tables and fields
if "alarm_histories" in table_names:
    columns = [c["name"] for c in inspector.get_columns("alarm_histories")]
    if "snooze_count" not in columns:
        schema_outdated = True

if "difficulty_histories" not in table_names or "habit_scores" not in table_names:
    schema_outdated = True

if schema_outdated:
    print("Schema out of date. Recreating tables...")
    Base.metadata.drop_all(bind=engine)


Base.metadata.create_all(bind=engine)

# Seed the database
db = SessionLocal()
try:
    seed_database(db)
finally:
    db.close()


logger = logging.getLogger("app.main")

class LoggingAndExceptionMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        path = request.url.path
        method = request.method
        
        try:
            response = await call_next(request)
            process_time = (time.time() - start_time) * 1000
            logger.info(f"{method} {path} - Status: {response.status_code} - Duration: {process_time:.2f}ms")
            return response
        except Exception as exc:
            process_time = (time.time() - start_time) * 1000
            logger.error(
                f"Unhandled Exception: {method} {path} - FAILED - Duration: {process_time:.2f}ms - Error: {str(exc)}",
                exc_info=True
            )
            return JSONResponse(
                status_code=500,
                content={"detail": "Internal server error. Please try again later."}
            )

app = FastAPI(
    title="Intelligent Cognitive Alarm - API Service",
    description="Authentication, Role-Based Authorization, and Alarm Scheduling Module",
    version="1.0.0"
)

# Global logging and exception middleware
app.add_middleware(LoggingAndExceptionMiddleware)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create static directory
os.makedirs(os.path.join("static", "avatars"), exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include API routers
app.include_router(auth_router)
app.include_router(protected_router)
app.include_router(alarms_router)
app.include_router(profile_router)
app.include_router(challenges_router)
app.include_router(notifications_router)

# Include new engine routers
app.include_router(adaptive_router)
app.include_router(analytics_router)
app.include_router(scoring_router)
app.include_router(recommendation_router)
app.include_router(dashboard_router)
app.include_router(reports_router)



@app.get("/")
def read_root():
    """Welcome route confirming the API status."""
    return {
        "status": "online",
        "service": "Intelligent Cognitive Alarm Platform",
        "docs_url": "/docs"
    }

