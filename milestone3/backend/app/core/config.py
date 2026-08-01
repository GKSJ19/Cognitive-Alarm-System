from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Intelligent Cognitive Alarm Platform"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "d4924a73229b4e18af2b89d889b6c4eb"  # In production, use env var
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8 # 8 days
    
    # MongoDB settings
    MONGODB_URL: str = "mongodb+srv://tejaswachinnu_db_user:1V2puULZYwtg4sBt@alaram.fifboex.mongodb.net/?appName=Alaram"
    MONGODB_DB_NAME: str = "ai_alarm_platform"

    class Config:
        case_sensitive = True

settings = Settings()
