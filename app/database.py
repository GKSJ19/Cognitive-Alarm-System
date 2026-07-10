from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

# The engine manages the actual connection to PostgreSQL
engine = create_engine(settings.DATABASE_URL)

# Each request gets its own database session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# All models (tables) will inherit from this Base
Base = declarative_base()


def get_db():
    """
    Dependency used in route functions to get a DB session.
    Ensures the session is always closed after the request finishes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
