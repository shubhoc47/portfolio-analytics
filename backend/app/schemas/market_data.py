"""
Schemas for market data refresh and quote responses.
"""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


QuoteSource = Literal["finnhub", "cache", "mock"]


class PriceRefreshQuoteRead(BaseModel):
    """One successfully updated quote."""

    ticker: str
    current_price: float
    provider: str
    quote_source: QuoteSource
    fetched_at: datetime


class PriceRefreshFailureRead(BaseModel):
    """One ticker that did not yield a usable price."""

    ticker: str
    reason: str


class PortfolioPriceRefreshResponse(BaseModel):
    """Summary of POST .../refresh-prices."""

    portfolio_id: int
    tickers_requested: list[str]
    updated_count: int
    failed_count: int
    skipped_count: int
    updated_quotes: list[PriceRefreshQuoteRead]
    failures: list[PriceRefreshFailureRead]
    notes: list[str] = Field(default_factory=list)
    cache_hit_count: int = 0
    provider_call_count: int = 0


class RefreshAllPricesResponse(BaseModel):
    """Summary of POST .../refresh-all-prices."""

    portfolios_processed: int
    unique_tickers_requested: list[str]
    updated_holdings_count: int
    provider_call_count: int
    cache_hit_count: int
    failed_count: int
    failures: list[PriceRefreshFailureRead]
    notes: list[str] = Field(default_factory=list)


class MarketQuoteRead(BaseModel):
    """Single-ticker quote for GET .../quote/{ticker} (no persistence)."""

    ticker: str
    current_price: float
    provider: str
    quote_source: QuoteSource
    fetched_at: datetime
