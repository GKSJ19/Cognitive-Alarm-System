from fastapi import FastAPI
from app.database import engine, Base
from app.routes.auth import router as auth_router
from app.routes.protected import router as protected_router
from app.routes.alarms import router as alarms_router

# Initialize database schemas (auto-creates tables for SQLite/PostgreSQL if they don't exist)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Intelligent Cognitive Alarm - API Service",
    description="Authentication, Role-Based Authorization, and Alarm Scheduling Module",
    version="1.0.0"
)

# Include API routers
app.include_router(auth_router)
app.include_router(protected_router)
app.include_router(alarms_router)

@app.get("/")
def read_root():
    """Welcome route confirming the API status."""
    return {
        "status": "online",
        "service": "Intelligent Cognitive Alarm Platform",
        "docs_url": "/docs"
    }

