"""
Analyst ratings schemas (Part 11E).
"""

from datetime import date
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field, field_validator


NormalizedRating = Literal["buy", "hold", "sell"]


class AnalystRatingWrite(BaseModel):
    """Internal payload used to upsert one normalized analyst rating row."""

    holding_id: int = Field(ge=1)
    ticker: str = Field(min_length=1, max_length=32)
    provider_name: str = Field(min_length=1, max_length=100)
    firm_name: str = Field(min_length=1, max_length=200)
    analyst_name: str | None = Field(default=None, max_length=200)
    raw_rating: str = Field(min_length=1, max_length=100)
    normalized_rating: NormalizedRating
    as_of_date: date
    price_target: Decimal | None = None
    notes: str | None = None

    @field_validator("ticker")
    @classmethod
    def normalize_ticker(cls, value: str) -> str:
        return value.strip().upper()

    @field_validator("provider_name", "firm_name", "raw_rating")
    @classmethod
    def normalize_required_text(cls, value: str) -> str:
        return value.strip()

    @field_validator("analyst_name", "notes")
    @classmethod
    def normalize_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        return cleaned or None


class AnalystRatingRead(BaseModel):
    """Normalized analyst rating item returned in API responses."""

    id: int
    portfolio_id: int
    holding_id: int | None
    ticker: str
    provider_name: str
    firm_name: str
    analyst_name: str | None
    raw_rating: str
    normalized_rating: NormalizedRating
    as_of_date: date
    price_target: Decimal | None
    notes: str | None


class RatingsRefreshResponse(BaseModel):
    """Response payload for ratings refresh endpoint."""

    portfolio_id: int
    portfolio_name: str
    tickers: list[str] = Field(default_factory=list)
    fetched_count: int = Field(ge=0)
    stored_count: int = Field(ge=0)
    created_count: int = Field(ge=0)
    updated_count: int = Field(ge=0)
    ratings: list[AnalystRatingRead] = Field(default_factory=list)
    notes: list[str] = Field(default_factory=list)


class PortfolioRatingsListResponse(BaseModel):
    """Response payload for listing portfolio ratings."""

    portfolio_id: int
    portfolio_name: str
    tickers: list[str] = Field(default_factory=list)
    total_ratings: int = Field(ge=0)
    ratings: list[AnalystRatingRead] = Field(default_factory=list)
    notes: list[str] = Field(default_factory=list)
