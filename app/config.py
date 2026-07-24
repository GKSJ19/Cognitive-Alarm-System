from pydantic_settings import BaseSettings


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

    class Config:
        env_file = ".env"


settings = Settings()
