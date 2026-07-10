from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import configure_logging
from app.database.base import Base
from app.database.session import engine, async_session_maker
from app.database.seed import seed_data
from app.middleware.request_logging import RequestLoggingMiddleware
from app.routers.health import router as health_router
from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.roles import router as roles_router
from app.routers.dashboard import router as dashboard_router

# Import models so they are registered with Base.metadata
import app.models  # noqa: F401

logger = logging.getLogger("app")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: create tables and seed data on startup."""
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

    yield


def create_app() -> FastAPI:
    """Factory function to create and configure the FastAPI application."""
    app = FastAPI(
        title=settings.app_name,
        version="0.1.0",
        description="API for the Intelligent Cognitive Alarm Platform",
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

    # Routers
    app.include_router(
        health_router, prefix=settings.api_v1_prefix, tags=["health"]
    )
    app.include_router(
        auth_router, prefix=f"{settings.api_v1_prefix}/auth", tags=["auth"]
    )
    app.include_router(
        users_router, prefix=f"{settings.api_v1_prefix}/users", tags=["users"]
    )
    app.include_router(
        roles_router, prefix=f"{settings.api_v1_prefix}/roles", tags=["roles"]
    )
    app.include_router(
        dashboard_router,
        prefix=f"{settings.api_v1_prefix}/dashboard",
        tags=["dashboard"],
    )

    return app


app = create_app()
