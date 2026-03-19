"""
News ingestion and response schemas.
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class NewsNormalizedArticle(BaseModel):
    """Internal normalized article shape shared by providers and services."""

    external_id: str | None = Field(default=None, max_length=255)
    ticker: str = Field(min_length=1, max_length=32)
    title: str = Field(min_length=1, max_length=500)
    source: str = Field(min_length=1, max_length=200)
    url: str = Field(min_length=1, max_length=1000)
    published_at: datetime
    author: str | None = Field(default=None, max_length=200)
    summary: str | None = None
    content: str | None = None
    dedupe_hash: str = Field(min_length=64, max_length=64)
    holding_id: int | None = Field(default=None, ge=1)

    @field_validator("ticker")
    @classmethod
    def normalize_ticker(cls, value: str) -> str:
        return value.strip().upper()

    @field_validator("title", "source", "url")
    @classmethod
    def normalize_required_text(cls, value: str) -> str:
        return value.strip()

    @field_validator("external_id", "author", "summary", "content")
    @classmethod
    def normalize_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        return cleaned or None


class NewsArticleRead(BaseModel):
    """Persisted news article response shape."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    holding_id: int | None
    ticker: str
    external_id: str | None
    title: str
    source: str
    url: str
    published_at: datetime
    author: str | None
    summary: str | None
    content: str | None
    dedupe_hash: str | None
    created_at: datetime


class NewsRefreshResponse(BaseModel):
    """Response payload for portfolio news refresh endpoint."""

    portfolio_id: int
    portfolio_name: str
    tickers: list[str] = Field(default_factory=list)
    fetched_count: int = Field(ge=0)
    inserted_count: int = Field(ge=0)
    deduplicated_count: int = Field(ge=0)
    articles: list[NewsArticleRead] = Field(default_factory=list)
    notes: list[str] = Field(default_factory=list)


class PortfolioNewsListResponse(BaseModel):
    """Response payload for listing persisted portfolio news."""

    portfolio_id: int
    portfolio_name: str
    tickers: list[str] = Field(default_factory=list)
    total_articles: int = Field(ge=0)
    articles: list[NewsArticleRead] = Field(default_factory=list)

