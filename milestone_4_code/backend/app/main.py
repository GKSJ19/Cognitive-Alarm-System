import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import models so they are registered with Base.metadata
import app.models
from app.config.settings import settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import configure_logging
from app.database.base import Base
from app.database.mongodb import close_mongo_client
from app.database.seed import seed_data
from app.database.session import async_session_maker, engine
from app.middleware.request_logging import RequestLoggingMiddleware
from app.routers.alarms import router as alarms_router
from app.routers.analytics import router as analytics_router
from app.routers.auth import router as auth_router
from app.routers.challenges import router as challenges_router
from app.routers.dashboard import router as dashboard_router
from app.routers.habits import router as habits_router
from app.routers.health import router as health_router
from app.routers.progress import router as progress_router
from app.routers.roles import router as roles_router
from app.routers.users import router as users_router
from app.services.notification_service import NotificationService

logger = logging.getLogger("app")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: create tables, seed data, init services on startup."""
    configure_logging()

    # Auto-create tables (development convenience, use Alembic in production)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created/verified.")

    # Seed default data
    async with async_session_maker() as session:
        try:
            await seed_data(session)
            logger.info("Database seeded successfully.")
        except Exception as e:
            logger.error("Failed to seed database on startup: %s", e)

    # Initialize Firebase Cloud Messaging (no-op if credentials not set)
    NotificationService.initialize(settings.firebase_credentials_path)

    yield

    # Shutdown: close MongoDB client
    await close_mongo_client()


def create_app() -> FastAPI:
    """Factory function to create and configure the FastAPI application."""
    app = FastAPI(
        title=settings.app_name,
        version="2.0.0",
        description=(
            "API for the Intelligent Cognitive Alarm Platform — "
            "AI-powered cognitive challenges to help you wake up smarter."
        ),
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json",
        lifespan=lifespan,
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(RequestLoggingMiddleware)

    # Exception handlers
    register_exception_handlers(app)

    # ── Routers ──────────────────────────────────────────────────────────
    app.include_router(health.router, prefix=settings.api_v1_prefix, tags=["Health"])
    app.include_router(
        auth.router, prefix=f"{settings.api_v1_prefix}/auth", tags=["Authentication"]
    )
    app.include_router(
        users.router, prefix=f"{settings.api_v1_prefix}/users", tags=["Users"]
    )
    app.include_router(
        roles.router, prefix=f"{settings.api_v1_prefix}/roles", tags=["Roles"]
    )
    app.include_router(
        dashboard.router,
        prefix=f"{settings.api_v1_prefix}/dashboard",
        tags=["Dashboard"],
    )
    app.include_router(
        alarms.router,
        prefix=f"{settings.api_v1_prefix}/alarms",
        tags=["Alarms"],
    )
    app.include_router(
        challenges.router,
        prefix=f"{settings.api_v1_prefix}/challenges",
        tags=["Cognitive Challenges"],
    )
    app.include_router(
        habits.router,
        prefix=f"{settings.api_v1_prefix}/habits",
        tags=["Habits & Streaks"],
    )
    app.include_router(
        progress.router,
        prefix=f"{settings.api_v1_prefix}/progress",
        tags=["User Progress & Analytics"],
    )
    app.include_router(
        analytics.router,
        prefix=f"{settings.api_v1_prefix}/analytics",
        tags=["Adaptive Intelligence & Analytics"],
    )
    app.include_router(admin.router, prefix=f"{settings.api_v1_prefix}/admin", tags=["Admin"])
    app.include_router(exports.router, prefix=f"{settings.api_v1_prefix}/exports", tags=["Exports"])
    app.include_router(coach.router, prefix=f"{settings.api_v1_prefix}/coach", tags=["Coach"])

    return app


app = create_app()
