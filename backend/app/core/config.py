"""
Application configuration and settings.

This uses Pydantic's BaseSettings so we can:
- define all settings in one place
- have sensible defaults for local development
- override values using environment variables or a .env file
"""

from functools import lru_cache
from typing import List

from pydantic import Field, field_validator
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

    # Authentication
    SECRET_KEY: str = Field(
        default="change-me-in-production",
        description="Secret key used to sign JWT access tokens",
    )
    ALGORITHM: str = Field(default="HS256", description="JWT signing algorithm")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        default=60,
        ge=1,
        description="Access token lifetime in minutes",
    )

    # CORS
    # Configure as JSON list in .env:
    # ALLOWED_ORIGINS='["http://localhost:3000","http://localhost:5173","http://localhost:8000"]'
    ALLOWED_ORIGINS: List[str] = Field(
        default_factory=lambda: [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:8000",
        ],
        description="List of allowed CORS origins",
    )

    # Logging
    LOG_LEVEL: str = Field(default="INFO", description="Log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)")

    # Database (Part 3)
    # Note: the app can start without a running DB because we won't connect until a session is used.
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/portfolioiq",
        description="Database connection URL (async SQLAlchemy)",
    )

    # Finnhub (optional — live quotes; benchmark uses Holding.current_price when set)
    FINNHUB_API_KEY: str | None = Field(
        default=None,
        description="Finnhub API token for /quote (optional in local dev)",
    )

    MARKET_DATA_CACHE_TTL_SECONDS: int = Field(
        default=300,
        ge=0,
        description="In-memory quote cache TTL in seconds; 0 disables caching",
    )

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_allowed_origins(cls, v):
        # Keep support for comma-separated values when provided programmatically.
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v


@lru_cache
def get_settings() -> Settings:
    """
    Cached settings instance.

    Using lru_cache means we only construct Settings once,
    and every import that calls get_settings() gets the same object.
    """

    return Settings()


