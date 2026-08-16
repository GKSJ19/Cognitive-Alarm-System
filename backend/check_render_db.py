import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text


async def main():
    DATABASE_URL = input("Paste your Render DATABASE_URL: ").strip()

    # Convert normal PostgreSQL URL to asyncpg URL
    if DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = DATABASE_URL.replace(
            "postgresql://",
            "postgresql+asyncpg://",
            1
        )

    engine = create_async_engine(
        DATABASE_URL,
        echo=False,
    )

    try:
        async with engine.connect() as conn:
            result = await conn.execute(
                text("""
                    SELECT id, email, full_name, role, is_active
                    FROM users
                    WHERE email = 'user2@gmail.com'
                """)
            )

            user = result.fetchone()

            if user:
                print("\nUSER FOUND IN RENDER DATABASE:")
                print(user)
            else:
                print("\nUSER NOT FOUND IN RENDER DATABASE")

    except Exception as e:
        print("\nDATABASE CONNECTION ERROR:")
        print(e)

    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())