"""
Finnhub quote provider (async httpx).

GET https://finnhub.io/api/v1/quote?symbol={TICKER}&token={KEY}
Current price field: "c"
"""

from datetime import UTC, datetime
from decimal import Decimal
from typing import Any

import httpx

from app.providers.market_data.base import MarketQuote, QuoteFetchResult

FINNHUB_QUOTE_URL = "https://finnhub.io/api/v1/quote"
PROVIDER_NAME = "finnhub"
DEFAULT_TIMEOUT = 15.0


class FinnhubMarketDataProvider:
    """Fetch last price from Finnhub quote API."""

    def __init__(self, api_key: str | None) -> None:
        self._api_key = api_key.strip() if api_key and api_key.strip() else None

    def _normalize_ticker(self, ticker: str) -> str:
        return ticker.strip().upper()

    def _parse_current_price(self, data: dict[str, Any]) -> Decimal | None:
        raw = data.get("c")
        if raw is None:
            return None
        try:
            price = Decimal(str(raw))
        except Exception:
            return None
        if price <= 0:
            return None
        return price

    async def get_quote(self, ticker: str) -> QuoteFetchResult:
        sym = self._normalize_ticker(ticker)
        if not sym:
            return QuoteFetchResult(
                ticker=ticker,
                provider=PROVIDER_NAME,
                ok=False,
                failure_reason="Empty or invalid ticker.",
            )

        if not self._api_key:
            return QuoteFetchResult(
                ticker=sym,
                provider=PROVIDER_NAME,
                ok=False,
                failure_reason="Finnhub API key not configured.",
            )

        params = {"symbol": sym, "token": self._api_key}
        try:
            async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as client:
                response = await client.get(FINNHUB_QUOTE_URL, params=params)
        except httpx.RequestError as exc:
            return QuoteFetchResult(
                ticker=sym,
                provider=PROVIDER_NAME,
                ok=False,
                failure_reason=f"Network error: {type(exc).__name__}",
            )

        if response.status_code == 429:
            return QuoteFetchResult(
                ticker=sym,
                provider=PROVIDER_NAME,
                ok=False,
                failure_reason="Finnhub rate limit (HTTP 429).",
            )

        if response.status_code >= 400:
            return QuoteFetchResult(
                ticker=sym,
                provider=PROVIDER_NAME,
                ok=False,
                failure_reason=f"Finnhub HTTP {response.status_code}.",
            )

        try:
            payload = response.json()
        except Exception:
            return QuoteFetchResult(
                ticker=sym,
                provider=PROVIDER_NAME,
                ok=False,
                failure_reason="Invalid JSON from Finnhub.",
            )

        if not isinstance(payload, dict):
            return QuoteFetchResult(
                ticker=sym,
                provider=PROVIDER_NAME,
                ok=False,
                failure_reason="Unexpected Finnhub response shape.",
            )

        price = self._parse_current_price(payload)
        if price is None:
            return QuoteFetchResult(
                ticker=sym,
                provider=PROVIDER_NAME,
                ok=False,
                failure_reason="Missing or invalid current price (c).",
            )

        fetched_at = datetime.now(UTC)
        quote = MarketQuote(
            ticker=sym,
            current_price=price,
            provider=PROVIDER_NAME,
            fetched_at=fetched_at,
            raw=payload,
        )
        return QuoteFetchResult(
            ticker=sym,
            provider=PROVIDER_NAME,
            ok=True,
            quote=quote,
        )
