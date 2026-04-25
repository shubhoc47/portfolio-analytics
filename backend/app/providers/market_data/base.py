"""
Market data provider abstractions (live or mock quotes).
"""

from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from typing import Protocol


@dataclass(frozen=True)
class MarketQuote:
    """A successfully resolved live or mock quote for one ticker."""

    ticker: str
    current_price: Decimal
    provider: str
    fetched_at: datetime
    raw: dict | None = None


@dataclass(frozen=True)
class QuoteFetchResult:
    """Outcome of a single-ticker quote request (never raises to callers)."""

    ticker: str
    provider: str
    ok: bool
    quote: MarketQuote | None = None
    failure_reason: str | None = None


class MarketDataProvider(Protocol):
    """Provider interface for fetching a current price by ticker."""

    async def get_quote(self, ticker: str) -> QuoteFetchResult:
        """Return a structured success or failure for one ticker."""
