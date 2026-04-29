"""
Deterministic mock market data provider for tests and local development.
"""

from datetime import UTC, datetime
from decimal import Decimal

from app.providers.market_data.base import (
    MarketQuote,
    QuoteFetchResult,
    SymbolSearchResult,
    SymbolSearchResultSet,
)

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

    _SYMBOLS: tuple[tuple[str, str, str], ...] = (
        ("AAPL", "Apple Inc", "Common Stock"),
        ("MSFT", "Microsoft Corp", "Common Stock"),
        ("NVDA", "NVIDIA Corp", "Common Stock"),
        ("VOO", "Vanguard S&P 500 ETF", "ETF"),
        ("QQQ", "Invesco QQQ Trust", "ETF"),
        ("VTI", "Vanguard Total Stock Market ETF", "ETF"),
        ("KO", "Coca-Cola Co", "Common Stock"),
        ("JNJ", "Johnson & Johnson", "Common Stock"),
        ("PG", "Procter & Gamble Co", "Common Stock"),
    )

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

    async def search_symbols(self, query: str) -> SymbolSearchResultSet:
        q = query.strip()
        if not q:
            return SymbolSearchResultSet(
                query=query,
                provider=PROVIDER_NAME,
                ok=False,
                failure_reason="Search query is required.",
            )

        needle = q.upper()
        results = [
            SymbolSearchResult(
                symbol=symbol,
                description=description,
                display_symbol=symbol,
                type=result_type,
                provider=PROVIDER_NAME,
            )
            for symbol, description, result_type in self._SYMBOLS
            if needle in symbol or needle in description.upper()
        ]
        return SymbolSearchResultSet(
            query=q,
            provider=PROVIDER_NAME,
            ok=True,
            results=results,
        )
