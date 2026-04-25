"""
Deterministic mock market data provider for tests and local development.
"""

from datetime import UTC, datetime
from decimal import Decimal

from app.providers.market_data.base import MarketQuote, QuoteFetchResult

PROVIDER_NAME = "mock_market_data"


class MockMarketDataProvider:
    """Returns fixed prices for a small ticker set (aligned with benchmark mock map where useful)."""

    _PRICES: dict[str, Decimal] = {
        "AAPL": Decimal("213.00"),
        "NVDA": Decimal("824.50"),
        "MSFT": Decimal("426.20"),
        "VOO": Decimal("506.00"),
        "QQQ": Decimal("474.10"),
        "VTI": Decimal("292.00"),
        "KO": Decimal("63.40"),
        "JNJ": Decimal("167.25"),
        "PG": Decimal("171.35"),
    }

    async def get_quote(self, ticker: str) -> QuoteFetchResult:
        sym = ticker.strip().upper()
        if not sym:
            return QuoteFetchResult(
                ticker=ticker,
                provider=PROVIDER_NAME,
                ok=False,
                failure_reason="Empty or invalid ticker.",
            )

        price = self._PRICES.get(sym)
        if price is None:
            return QuoteFetchResult(
                ticker=sym,
                provider=PROVIDER_NAME,
                ok=False,
                failure_reason="No mock price for this ticker.",
            )

        fetched_at = datetime.now(UTC)
        quote = MarketQuote(
            ticker=sym,
            current_price=price,
            provider=PROVIDER_NAME,
            fetched_at=fetched_at,
            raw={"c": float(price), "mock": True},
        )
        return QuoteFetchResult(
            ticker=sym,
            provider=PROVIDER_NAME,
            ok=True,
            quote=quote,
        )
