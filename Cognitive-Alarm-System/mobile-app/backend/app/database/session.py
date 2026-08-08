from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config.settings import settings


def _get_async_url(url: str) -> str:
    """Convert database URL to async variant if needed."""
    if "sqlite" in url:
        # Ensure aiosqlite driver
        if "aiosqlite" not in url:
            return url.replace("sqlite://", "sqlite+aiosqlite://")
        return url
    # PostgreSQL async driver
    return url.replace("postgresql+psycopg://", "postgresql+psycopg_async://")


engine = create_async_engine(
    _get_async_url(settings.database_url),
    echo=settings.debug,
    future=True,
)

async_session_maker = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that yields database sessions."""
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()
