import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config.settings import settings
from app.database.connection import engine, Base


# ============================================================
# REGISTER ALL SQLALCHEMY MODELS
# ============================================================

import app.models.user_model
import app.models.profile_model
import app.models.habit_model
import app.models.alarm_model
import app.models.coach_model
import app.models.notification_model
import app.models.chat_model


# ============================================================
# IMPORT ROUTERS
# ============================================================

from app.routers import (
    auth_router,
    profile_router,
    habit_router,
    alarm_router,
    coach_router,
    admin_router,
    notification_router,
    chat_router
)


# ============================================================
# CREATE REQUIRED DIRECTORIES
# ============================================================

os.makedirs(
    os.path.join("static", "uploads", "profiles"),
    exist_ok=True
)


# ============================================================
# APPLICATION LIFESPAN
# ============================================================

@asynccontextmanager
async def lifespan(app: FastAPI):

    print("==============================================")
    print("ICAP Backend Starting...")
    print("==============================================")

    print("Creating/checking PostgreSQL tables...")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    print("PostgreSQL tables are ready.")
    print("==============================================")

    yield

    print("ICAP Backend shutting down...")


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Intelligent Cognitive Alarm Platform (ICAP) API Layer",
    version="1.0.0",
    lifespan=lifespan
)


# ============================================================
# CORS CONFIGURATION
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# STATIC FILES
# ============================================================

app.mount(
    "/static",
    StaticFiles(directory="static"),
    name="static"
)


# ============================================================
# REGISTER ROUTERS
# ============================================================

app.include_router(auth_router.router)
app.include_router(profile_router.router)
app.include_router(habit_router.router)
app.include_router(alarm_router.router)
app.include_router(coach_router.router)
app.include_router(admin_router.router)
app.include_router(notification_router.router)
app.include_router(chat_router.router)


# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get("/")
async def root():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "version": "1.0.0"
    }