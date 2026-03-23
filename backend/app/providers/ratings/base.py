"""
Ratings provider abstractions.
"""

from dataclasses import dataclass
from datetime import date
from decimal import Decimal
from typing import Protocol


@dataclass(frozen=True)
class ProviderRating:
    """Raw rating shape returned by an external ratings source."""

    ticker: str
    firm_name: str
    raw_rating: str
    as_of_date: date
    provider_name: str
    analyst_name: str | None = None
    price_target: Decimal | None = None
    notes: str | None = None


class RatingsProvider(Protocol):
    """Provider interface for fetching analyst ratings by ticker."""

    def fetch_ratings(
        self,
        tickers: list[str],
        *,
        portfolio_name: str | None = None,
    ) -> list[ProviderRating]:
        """Fetch raw ratings for the requested ticker universe."""
