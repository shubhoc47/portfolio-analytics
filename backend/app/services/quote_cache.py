"""
Process-local in-memory quote cache (TTL).

Not shared across workers or survives restarts. Suitable for dev / single-instance demos.
"""

from __future__ import annotations

import asyncio
import time
from collections.abc import Awaitable, Callable
from dataclasses import dataclass

from app.providers.market_data.base import MarketQuote, QuoteFetchResult


@dataclass
class _CacheEntry:
    quote: MarketQuote
    expires_at_mono: float


class QuoteCache:
    """
    Short-lived cache of successful quotes keyed by uppercase ticker.

    Failures are never cached. TTL uses monotonic clock.
    """

    def __init__(self, ttl_seconds: float) -> None:
        self._ttl_seconds = float(ttl_seconds)
        self._data: dict[str, _CacheEntry] = {}
        self._lock = asyncio.Lock()

    @property
    def ttl_seconds(self) -> float:
        return self._ttl_seconds

    async def get_quote(
        self,
        ticker: str,
        fetch: Callable[[str], Awaitable[QuoteFetchResult]],
    ) -> tuple[QuoteFetchResult, bool]:
        """
        Return (QuoteFetchResult, cache_hit).

        When ttl_seconds <= 0, always calls fetch and returns cache_hit False.
        """
        sym = ticker.strip().upper()
        if not sym:
            result = QuoteFetchResult(
                ticker=ticker,
                provider="",
                ok=False,
                failure_reason="Empty or invalid ticker.",
            )
            return result, False

        if self._ttl_seconds <= 0:
            return await fetch(sym), False

        async with self._lock:
            now = time.monotonic()
            entry = self._data.get(sym)
            if entry is not None and entry.expires_at_mono > now:
                orig = entry.quote
                cached_quote = MarketQuote(
                    ticker=orig.ticker,
                    current_price=orig.current_price,
                    provider="cache",
                    fetched_at=orig.fetched_at,
                    raw=orig.raw,
                )
                return (
                    QuoteFetchResult(
                        ticker=sym,
                        provider="cache",
                        ok=True,
                        quote=cached_quote,
                    ),
                    True,
                )

            result = await fetch(sym)
            if result.ok and result.quote is not None:
                self._data[sym] = _CacheEntry(
                    quote=result.quote,
                    expires_at_mono=now + self._ttl_seconds,
                )
            return result, False
