from fastapi import FastAPI
from app.database import engine, Base
from app.routes.auth import router as auth_router
from app.routes.protected import router as protected_router

# Initialize database schemas (auto-creates tables for SQLite/PostgreSQL if they don't exist)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Intelligent Cognitive Alarm - Authentication API",
    description="Authentication and Role-Based Authorization Module",
    version="1.0.0"
)

# Include API routers
app.include_router(auth_router)
app.include_router(protected_router)

@app.get("/")
def read_root():
    """Welcome route confirming the API status."""
    return {
        "status": "online",
        "service": "Intelligent Cognitive Alarm Platform (Auth Module)",
        "docs_url": "/docs"
    }
