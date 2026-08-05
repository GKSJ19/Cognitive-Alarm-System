from pydantic_settings import BaseSettings
from pydantic import field_validator


class Settings(BaseSettings):
    """
    Loads configuration from environment variables / .env file.
    Never hardcode secrets directly in code.
    """
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Firebase: EITHER a file path (local dev) OR the raw JSON as a string
    # (cloud hosts like Railway/Render -- easier to paste into an env var
    # than to upload a file). Leave both blank to disable Firebase entirely.
    FIREBASE_CREDENTIALS_PATH: str = ""
    FIREBASE_CREDENTIALS_JSON: str = ""

    # --- Account lockout (Milestone 3) ---
    MAX_FAILED_LOGIN_ATTEMPTS: int = 5
    LOCKOUT_DURATION_MINUTES: int = 15

    # --- Password reset (Milestone 3) ---
    PASSWORD_RESET_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"

    @field_validator("DATABASE_URL")
    @classmethod
    def normalize_database_url(cls, v: str) -> str:
        """
        Some hosts (Railway, Heroku, Render) provide DATABASE_URL starting
        with 'postgres://', but SQLAlchemy's psycopg2 dialect requires
        'postgresql://'. Normalize automatically so deployment doesn't
        silently break on this.
        """
        if v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql://", 1)
        return v


settings = Settings()
