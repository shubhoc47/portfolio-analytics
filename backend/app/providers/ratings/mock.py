"""
Mock ratings provider for local development.
"""

from datetime import date
from decimal import Decimal

from app.providers.ratings.base import ProviderRating


class MockRatingsProvider:
    """Deterministic mock analyst ratings for seeded/demo holdings."""

    PROVIDER_NAME = "mock_ratings_v1"

    _RATINGS: list[ProviderRating] = [
        ProviderRating(
            ticker="AAPL",
            firm_name="Mock Street Research",
            analyst_name="Emily Chen",
            raw_rating="Strong Buy",
            as_of_date=date(2026, 3, 19),
            provider_name=PROVIDER_NAME,
            price_target=Decimal("232.00"),
            notes="Services mix and on-device AI momentum remain supportive.",
        ),
        ProviderRating(
            ticker="AAPL",
            firm_name="North Harbor Capital Insights",
            analyst_name="Daniel Ross",
            raw_rating="Overweight",
            as_of_date=date(2026, 3, 19),
            provider_name=PROVIDER_NAME,
            price_target=Decimal("225.00"),
        ),
        ProviderRating(
            ticker="MSFT",
            firm_name="Mock Street Research",
            analyst_name="Nora Patel",
            raw_rating="Outperform",
            as_of_date=date(2026, 3, 19),
            provider_name=PROVIDER_NAME,
            price_target=Decimal("505.00"),
        ),
        ProviderRating(
            ticker="MSFT",
            firm_name="Blue River Advisory",
            analyst_name="Aiden Brooks",
            raw_rating="Buy",
            as_of_date=date(2026, 3, 20),
            provider_name=PROVIDER_NAME,
            price_target=Decimal("492.00"),
        ),
        ProviderRating(
            ticker="NVDA",
            firm_name="Mock Street Research",
            analyst_name="Liam Wong",
            raw_rating="Market Outperform",
            as_of_date=date(2026, 3, 19),
            provider_name=PROVIDER_NAME,
            price_target=Decimal("1045.00"),
        ),
        ProviderRating(
            ticker="NVDA",
            firm_name="Orchard Analytics",
            analyst_name="Sofia Kim",
            raw_rating="Hold",
            as_of_date=date(2026, 3, 20),
            provider_name=PROVIDER_NAME,
            price_target=Decimal("940.00"),
        ),
        ProviderRating(
            ticker="JNJ",
            firm_name="Blue River Advisory",
            analyst_name="Ava Rodriguez",
            raw_rating="Neutral",
            as_of_date=date(2026, 3, 18),
            provider_name=PROVIDER_NAME,
            price_target=Decimal("171.50"),
        ),
        ProviderRating(
            ticker="KO",
            firm_name="North Harbor Capital Insights",
            analyst_name="Maya Kapoor",
            raw_rating="Equal Weight",
            as_of_date=date(2026, 3, 18),
            provider_name=PROVIDER_NAME,
            price_target=Decimal("66.00"),
        ),
        ProviderRating(
            ticker="VOO",
            firm_name="Index Strategy Desk",
            analyst_name="Ethan Lee",
            raw_rating="Hold",
            as_of_date=date(2026, 3, 21),
            provider_name=PROVIDER_NAME,
            price_target=Decimal("515.00"),
            notes="Broad market ETF expected to track index-level earnings growth.",
        ),
        ProviderRating(
            ticker="QQQ",
            firm_name="Index Strategy Desk",
            analyst_name="Ethan Lee",
            raw_rating="Underperform",
            as_of_date=date(2026, 3, 21),
            provider_name=PROVIDER_NAME,
            price_target=Decimal("432.00"),
            notes="Valuation sensitivity remains elevated relative to broad market.",
        ),
        ProviderRating(
            ticker="VTI",
            firm_name="Mock Street Research",
            analyst_name="Noah Patel",
            raw_rating="Sell",
            as_of_date=date(2026, 3, 21),
            provider_name=PROVIDER_NAME,
            price_target=Decimal("256.00"),
        ),
    ]

    def fetch_ratings(
        self,
        tickers: list[str],
        *,
        portfolio_name: str | None = None,
    ) -> list[ProviderRating]:
        """
        Return mock ratings filtered by requested tickers.

        Output order is stable to keep refresh responses predictable for testing.
        """

        normalized_tickers = {ticker.strip().upper() for ticker in tickers if ticker.strip()}
        if not normalized_tickers:
            return []

        ratings = [
            row for row in self._RATINGS if row.ticker.strip().upper() in normalized_tickers
        ]
        return sorted(ratings, key=lambda row: (row.ticker, row.firm_name, row.as_of_date))
