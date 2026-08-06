from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.settings import settings
from app.middleware.error_handler import register_exception_handlers
from app.routers import (
    adaptive_difficulty,
    admin,
    alarms,
    analytics,
    auth,
    behavioral_analytics,
    challenges,
    coaches,
    habits,
    health,
    notifications,
    recommendations,
    users,
)


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        description="Secure REST API backend for the Intelligent Cognitive Alarm Platform with ML Engines.",
        version="1.0.0",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    register_exception_handlers(app)

    app.include_router(health.router, prefix="/api/health", tags=["Health"])
    app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
    app.include_router(users.router, prefix="/api/users", tags=["Users"])
    app.include_router(alarms.router, prefix="/api/alarms", tags=["Alarms"])
    app.include_router(challenges.router, prefix="/api/challenges", tags=["Challenges"])
    app.include_router(habits.router, prefix="/api/habits", tags=["Habits"])
    app.include_router(coaches.router, prefix="/api/coaches", tags=["Coaches"])
    app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
    app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
    app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
    app.include_router(adaptive_difficulty.router, prefix="/api/adaptive-difficulty", tags=["Adaptive Difficulty (ML)"])
    app.include_router(behavioral_analytics.router, prefix="/api/behavioral-analytics", tags=["Behavioral Analytics (ML)"])
    app.include_router(recommendations.router, prefix="/api/recommendations", tags=["Recommendations (ML)"])

    return app


app = create_app()
