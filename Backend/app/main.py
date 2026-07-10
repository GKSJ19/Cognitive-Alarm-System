import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config.settings import settings
from app.database.connection import engine, Base
from app.routers import auth_router, profile_router, habit_router, alarm_router, coach_router, admin_router

# Ensure uploads directory exists on startup
os.makedirs(os.path.join("static", "uploads", "profiles"), exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create tables on startup (convenient for local dev and sqlite/postgres testing)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown tasks (if any) go here

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Intelligent Cognitive Alarm Platform (ICAP) API Layer",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware config to allow React Native local clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to app domains and mobile schemes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static folder
app.mount("/static", StaticFiles(directory="static"), name="static")

# Register Routers
app.include_router(auth_router.router)
app.include_router(profile_router.router)
app.include_router(habit_router.router)
app.include_router(alarm_router.router)
app.include_router(coach_router.router)
app.include_router(admin_router.router)

@app.get("/")
async def root():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "version": "1.0.0"
    }
