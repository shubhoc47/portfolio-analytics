"""
Market data service: refresh holding current_price from a quote provider.
"""

from __future__ import annotations

import asyncio
from decimal import Decimal
from typing import Literal

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings
from app.models.holding import Holding
from app.providers.market_data.base import MarketDataProvider, QuoteFetchResult
from app.repositories.holding import HoldingRepository
from app.repositories.portfolio import PortfolioRepository
from app.schemas.market_data import (
    MarketQuoteRead,
    PortfolioPriceRefreshResponse,
    PriceRefreshFailureRead,
    PriceRefreshQuoteRead,
    RefreshAllPricesResponse,
)
from app.services.quote_cache import QuoteCache

# Light throttle between Finnhub calls (free tier) after a real provider request.
_QUOTE_DELAY_SEC = 0.2

QuoteSource = Literal["finnhub", "cache", "mock"]


class MarketDataService:
    """Load portfolio holdings, fetch quotes, update Holding.current_price."""

    def __init__(
        self,
        db: AsyncSession,
        market_provider: MarketDataProvider,
        settings: Settings,
        quote_cache: QuoteCache,
    ) -> None:
        self.db = db
        self.market_provider = market_provider
        self.settings = settings
        self.quote_cache = quote_cache
        self.portfolio_repository = PortfolioRepository(db)
        self.holding_repository = HoldingRepository(db)

    @staticmethod
    def _map_provider_to_source(provider: str) -> QuoteSource:
        p = (provider or "").lower()
        if p == "cache":
            return "cache"
        if "mock" in p:
            return "mock"
        return "finnhub"

    async def _resolve_quote(
        self,
        ticker: str,
    ) -> tuple[QuoteFetchResult, QuoteSource, bool, bool]:
        """
        Returns (QuoteFetchResult, quote_source, cache_hit, provider_invoked).

        On failure, quote_source is a placeholder; callers should not use it.
        """
        sym = ticker.strip().upper()
        if self.settings.MARKET_DATA_CACHE_TTL_SECONDS <= 0:
            result = await self.market_provider.get_quote(sym)
            if result.ok and result.quote is not None:
                return (
                    result,
                    self._map_provider_to_source(result.quote.provider),
                    False,
                    True,
                )
            return result, "finnhub", False, True

        result, cache_hit = await self.quote_cache.get_quote(sym, self.market_provider.get_quote)
        if result.ok and result.quote is not None:
            return (
                result,
                self._map_provider_to_source(result.quote.provider),
                cache_hit,
                not cache_hit,
            )
        return result, "finnhub", False, not cache_hit

    async def refresh_portfolio_prices(self, portfolio_id: int) -> PortfolioPriceRefreshResponse:
        from app.providers.market_data.base import QuoteFetchResult

        portfolio = await self.portfolio_repository.get_by_id(portfolio_id)
        if portfolio is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Portfolio with id {portfolio_id} not found",
            )

        holdings = await self.holding_repository.list_by_portfolio(portfolio_id)
        tickers_requested = self._dedupe_tickers(holdings)

        if not holdings:
            return PortfolioPriceRefreshResponse(
                portfolio_id=portfolio.id,
                tickers_requested=[],
                updated_count=0,
                failed_count=0,
                skipped_count=0,
                updated_quotes=[],
                failures=[],
                notes=["Portfolio has no holdings; nothing to refresh."],
                cache_hit_count=0,
                provider_call_count=0,
            )

        has_key = bool(self.settings.FINNHUB_API_KEY and self.settings.FINNHUB_API_KEY.strip())

        if not has_key:
            return PortfolioPriceRefreshResponse(
                portfolio_id=portfolio.id,
                tickers_requested=tickers_requested,
                updated_count=0,
                failed_count=0,
                skipped_count=len(tickers_requested),
                updated_quotes=[],
                failures=[],
                notes=[
                    "FINNHUB_API_KEY is not set; skipped live quote requests. "
                    "Benchmark still uses mock prices or existing Holding.current_price."
                ],
                cache_hit_count=0,
                provider_call_count=0,
            )

        updated_quotes: list[PriceRefreshQuoteRead] = []
        failures: list[PriceRefreshFailureRead] = []
        ticker_to_price: dict[str, Decimal] = {}
        cache_hit_count = 0
        provider_call_count = 0

        for i, ticker in enumerate(tickers_requested):
            result, quote_source, cache_hit, provider_called = await self._resolve_quote(ticker)

            if provider_called:
                provider_call_count += 1
                if (
                    not result.ok
                    and result.failure_reason
                    and "429" in result.failure_reason
                ):
                    await asyncio.sleep(1.0)
                if i < len(tickers_requested) - 1:
                    await asyncio.sleep(_QUOTE_DELAY_SEC)
            elif cache_hit:
                cache_hit_count += 1

            if result.ok and result.quote is not None:
                q = result.quote
                ticker_to_price[q.ticker] = q.current_price
                updated_quotes.append(
                    PriceRefreshQuoteRead(
                        ticker=q.ticker,
                        current_price=float(q.current_price),
                        provider=quote_source,
                        quote_source=quote_source,
                        fetched_at=q.fetched_at,
                    )
                )
            else:
                failures.append(
                    PriceRefreshFailureRead(
                        ticker=result.ticker,
                        reason=result.failure_reason or "Unknown error.",
                    )
                )

        updated_count = 0
        if ticker_to_price:
            try:
                updated_count = await self.holding_repository.apply_current_prices_for_portfolio(
                    portfolio_id,
                    ticker_to_price,
                )
                await self.db.commit()
            except Exception:
                await self.db.rollback()
                raise

        return PortfolioPriceRefreshResponse(
            portfolio_id=portfolio.id,
            tickers_requested=tickers_requested,
            updated_count=updated_count,
            failed_count=len(failures),
            skipped_count=0,
            updated_quotes=updated_quotes,
            failures=failures,
            notes=[],
            cache_hit_count=cache_hit_count,
            provider_call_count=provider_call_count,
        )

    async def refresh_all_prices(self) -> RefreshAllPricesResponse:
        holdings = await self.holding_repository.list_all()

        if not holdings:
            return RefreshAllPricesResponse(
                portfolios_processed=0,
                unique_tickers_requested=[],
                updated_holdings_count=0,
                provider_call_count=0,
                cache_hit_count=0,
                failed_count=0,
                failures=[],
                notes=["No holdings in the database; nothing to refresh."],
            )

        portfolio_ids = {h.portfolio_id for h in holdings}
        portfolios_processed = len(portfolio_ids)
        tickers_requested = self._dedupe_tickers(holdings)

        has_key = bool(self.settings.FINNHUB_API_KEY and self.settings.FINNHUB_API_KEY.strip())
        if not has_key:
            return RefreshAllPricesResponse(
                portfolios_processed=portfolios_processed,
                unique_tickers_requested=tickers_requested,
                updated_holdings_count=0,
                provider_call_count=0,
                cache_hit_count=0,
                failed_count=0,
                failures=[],
                notes=[
                    "FINNHUB_API_KEY is not set; skipped live quote requests for all portfolios."
                ],
            )

        failures: list[PriceRefreshFailureRead] = []
        ticker_to_price: dict[str, Decimal] = {}
        cache_hit_count = 0
        provider_call_count = 0

        for i, ticker in enumerate(tickers_requested):
            result, quote_source, cache_hit, provider_called = await self._resolve_quote(ticker)

            if provider_called:
                provider_call_count += 1
                if (
                    not result.ok
                    and result.failure_reason
                    and "429" in result.failure_reason
                ):
                    await asyncio.sleep(1.0)
                if i < len(tickers_requested) - 1:
                    await asyncio.sleep(_QUOTE_DELAY_SEC)
            elif cache_hit:
                cache_hit_count += 1

            if result.ok and result.quote is not None:
                q = result.quote
                ticker_to_price[q.ticker] = q.current_price
            else:
                failures.append(
                    PriceRefreshFailureRead(
                        ticker=result.ticker,
                        reason=result.failure_reason or "Unknown error.",
                    )
                )

        updated_holdings_count = 0
        if ticker_to_price:
            try:
                updated_holdings_count = (
                    await self.holding_repository.apply_current_prices_globally(ticker_to_price)
                )
                await self.db.commit()
            except Exception:
                await self.db.rollback()
                raise

        return RefreshAllPricesResponse(
            portfolios_processed=portfolios_processed,
            unique_tickers_requested=tickers_requested,
            updated_holdings_count=updated_holdings_count,
            provider_call_count=provider_call_count,
            cache_hit_count=cache_hit_count,
            failed_count=len(failures),
            failures=failures,
            notes=[],
        )

    async def get_quote_for_ticker(self, ticker: str) -> MarketQuoteRead:
        sym = ticker.strip().upper()
        if not sym:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Ticker is required.",
            )

        if not (self.settings.FINNHUB_API_KEY and self.settings.FINNHUB_API_KEY.strip()):
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Finnhub API key is not configured.",
            )

        result, quote_source, _, _ = await self._resolve_quote(sym)
        if not result.ok or result.quote is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=result.failure_reason or "Quote not available.",
            )

        q = result.quote
        return MarketQuoteRead(
            ticker=q.ticker,
            current_price=float(q.current_price),
            provider=quote_source,
            quote_source=quote_source,
            fetched_at=q.fetched_at,
        )

    @staticmethod
    def _dedupe_tickers(holdings: list[Holding]) -> list[str]:
        seen: set[str] = set()
        ordered: list[str] = []
        for h in holdings:
            sym = h.ticker.strip().upper()
            if not sym or sym in seen:
                continue
            seen.add(sym)
            ordered.append(sym)
        return sorted(ordered)
