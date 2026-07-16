from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os
from app.database import engine, Base
from app.routes.auth import router as auth_router
from app.routes.protected import router as protected_router
from app.routes.alarms import router as alarms_router
from app.routes.profile import router as profile_router
from app.routes.challenges import router as challenges_router


from sqlalchemy import inspect
from app.database import engine, Base, SessionLocal
from app.seed import seed_database

# Initialize database schemas (auto-creates tables for SQLite/PostgreSQL if they don't exist)
inspector = inspect(engine)
schema_outdated = False

if "alarms" in inspector.get_table_names():
    columns = [c["name"] for c in inspector.get_columns("alarms")]
    if "repeat_days" not in columns:
        schema_outdated = True

if "users" in inspector.get_table_names():
    columns = [c["name"] for c in inspector.get_columns("users")]
    if "google_id" not in columns:
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


app = FastAPI(
    title="Intelligent Cognitive Alarm - API Service",
    description="Authentication, Role-Based Authorization, and Alarm Scheduling Module",
    version="1.0.0"
)

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


@app.get("/")
def read_root():
    """Welcome route confirming the API status."""
    return {
        "status": "online",
        "service": "Intelligent Cognitive Alarm Platform",
        "docs_url": "/docs"
    }

