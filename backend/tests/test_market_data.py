"""
Tests for market-data endpoints (dependency overrides; no Finnhub network calls).
"""

from datetime import UTC, datetime
from unittest.mock import AsyncMock, MagicMock

from app.api import deps
from app.core.config import get_settings
from app.main import app
from app.schemas.market_data import (
    MarketQuoteRead,
    PortfolioPriceRefreshResponse,
    PriceRefreshQuoteRead,
    RefreshAllPricesResponse,
)


def test_quote_without_api_key_returns_503(client, monkeypatch):
    # Force empty key so environment overrides any FINNHUB value from a local .env file.
    monkeypatch.setenv("FINNHUB_API_KEY", "")
    get_settings.cache_clear()
    try:
        response = client.get("/api/v1/market-data/quote/AAPL")
        assert response.status_code == 503
        assert "not configured" in response.json()["detail"].lower()
    finally:
        get_settings.cache_clear()


def test_refresh_prices_with_service_override(client):
    fetched = datetime(2026, 4, 24, 10, 0, 0, tzinfo=UTC)
    body = PortfolioPriceRefreshResponse(
        portfolio_id=1,
        tickers_requested=["AAPL", "MSFT"],
        updated_count=2,
        failed_count=0,
        skipped_count=0,
        updated_quotes=[
            PriceRefreshQuoteRead(
                ticker="AAPL",
                current_price=213.45,
                provider="finnhub",
                quote_source="finnhub",
                fetched_at=fetched,
            ),
            PriceRefreshQuoteRead(
                ticker="MSFT",
                current_price=426.2,
                provider="finnhub",
                quote_source="finnhub",
                fetched_at=fetched,
            ),
        ],
        failures=[],
        notes=[],
        cache_hit_count=0,
        provider_call_count=2,
    )

    mock_service = MagicMock()
    mock_service.refresh_portfolio_prices = AsyncMock(return_value=body)

    async def override_market_data_service():
        return mock_service

    app.dependency_overrides[deps.get_market_data_service] = override_market_data_service
    try:
        response = client.post("/api/v1/market-data/portfolios/1/refresh-prices")
        assert response.status_code == 200
        data = response.json()
        assert data["portfolio_id"] == 1
        assert data["tickers_requested"] == ["AAPL", "MSFT"]
        assert data["updated_count"] == 2
        assert data["failed_count"] == 0
        assert len(data["updated_quotes"]) == 2
        mock_service.refresh_portfolio_prices.assert_awaited_once_with(1)
    finally:
        app.dependency_overrides.pop(deps.get_market_data_service, None)


def test_quote_with_service_override(client):
    fetched = datetime(2026, 4, 24, 12, 0, 0, tzinfo=UTC)
    quote = MarketQuoteRead(
        ticker="AAPL",
        current_price=199.99,
        provider="finnhub",
        quote_source="finnhub",
        fetched_at=fetched,
    )
    mock_service = MagicMock()
    mock_service.get_quote_for_ticker = AsyncMock(return_value=quote)

    async def override_market_data_service():
        return mock_service

    app.dependency_overrides[deps.get_market_data_service] = override_market_data_service
    try:
        response = client.get("/api/v1/market-data/quote/aapl")
        assert response.status_code == 200
        data = response.json()
        assert data["ticker"] == "AAPL"
        assert data["current_price"] == 199.99
        assert data["provider"] == "finnhub"
        assert data["quote_source"] == "finnhub"
        mock_service.get_quote_for_ticker.assert_awaited_once_with("aapl")
    finally:
        app.dependency_overrides.pop(deps.get_market_data_service, None)


def test_refresh_all_prices_with_service_override(client):
    body = RefreshAllPricesResponse(
        portfolios_processed=2,
        unique_tickers_requested=["AAPL", "MSFT"],
        updated_holdings_count=4,
        provider_call_count=2,
        cache_hit_count=0,
        failed_count=0,
        failures=[],
        notes=[],
    )
    mock_service = MagicMock()
    mock_service.refresh_all_prices = AsyncMock(return_value=body)

    async def override_market_data_service():
        return mock_service

    app.dependency_overrides[deps.get_market_data_service] = override_market_data_service
    try:
        response = client.post("/api/v1/market-data/refresh-all-prices")
        assert response.status_code == 200
        data = response.json()
        assert data["portfolios_processed"] == 2
        assert data["unique_tickers_requested"] == ["AAPL", "MSFT"]
        assert data["updated_holdings_count"] == 4
        assert data["provider_call_count"] == 2
        assert data["cache_hit_count"] == 0
        mock_service.refresh_all_prices.assert_awaited_once()
    finally:
        app.dependency_overrides.pop(deps.get_market_data_service, None)


def test_quote_cache_ttl_zero_always_fetches():
    """TTL 0 disables cache storage hits; QuoteCache.get_quote delegates every time."""
    import asyncio

    from app.providers.market_data.base import MarketQuote, QuoteFetchResult
    from app.services.quote_cache import QuoteCache
    from decimal import Decimal

    calls = 0

    async def fake_fetch(sym: str):
        nonlocal calls
        calls += 1

        q = MarketQuote(
            ticker=sym,
            current_price=Decimal("1.00"),
            provider="finnhub",
            fetched_at=datetime.now(UTC),
        )
        return QuoteFetchResult(ticker=sym, provider="finnhub", ok=True, quote=q)

    async def run():
        cache = QuoteCache(ttl_seconds=0)
        _, hit1 = await cache.get_quote("AAA", fake_fetch)
        _, hit2 = await cache.get_quote("AAA", fake_fetch)
        return hit1, hit2

    hit1, hit2 = asyncio.run(run())
    assert calls == 2
    assert hit1 is False and hit2 is False
