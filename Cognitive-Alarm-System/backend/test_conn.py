import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.core.settings import settings

async def test_connection():
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        result = await conn.execute(text("SELECT 1"))
        print("Connected to Supabase! Result:", result.scalar())
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(test_connection())
