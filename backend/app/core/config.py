from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "ScaleProposal AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # AI Model Settings
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"
    AI_MAX_RETRIES: int = 3
    AI_RETRY_BACKOFF_FACTOR: float = 1.5

    # Input Limits / Cost Control
    MAX_REQUIREMENTS_LENGTH: int = 5000
    MAX_COMPANY_NAME_LENGTH: int = 100
    MAX_PROJECT_TYPE_LENGTH: int = 100

    # Persistence
    DATABASE_URL: str = "sqlite:///./scaleproposal.db"

    # Security & CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://scale-proposal-ai.vercel.app"
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()