"""
Application configuration and settings.

This uses Pydantic's BaseSettings so we can:
- define all settings in one place
- have sensible defaults for local development
- override values using environment variables or a .env file
"""

from functools import lru_cache
from typing import List, Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables (with defaults)."""

    # Tell Pydantic to also load variables from a .env file if present
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # Core app settings
    APP_NAME: str = Field(default="PortfolioIQ API", description="Application name")
    APP_ENV: str = Field(default="development", description="Environment name (development/staging/production)")
    DEBUG: bool = Field(default=True, description="Enable debug mode")

    # API
    API_V1_PREFIX: str = Field(default="/api/v1", description="Base prefix for v1 API routes")

    # CORS
    # Pydantic can parse a list from an environment variable.
    # Example env value:
    #   ALLOWED_ORIGINS='["http://localhost:3000","http://localhost:8000"]'
    ALLOWED_ORIGINS: List[str] = Field(
        default_factory=lambda: ["http://localhost:3000", "http://localhost:8000"],
        description="List of allowed CORS origins",
    )

    # Logging
    LOG_LEVEL: str = Field(default="INFO", description="Log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)")

    # Database (placeholder for later parts)
    DATABASE_URL: Optional[str] = Field(default=None, description="Database connection URL (not used yet)")


@lru_cache
def get_settings() -> Settings:
    """
    Cached settings instance.

    Using lru_cache means we only construct Settings once,
    and every import that calls get_settings() gets the same object.
    """

    return Settings()


