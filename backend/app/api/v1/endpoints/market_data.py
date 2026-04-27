"""
Market data endpoints (live quote refresh).
"""

from typing import Annotated

from fastapi import APIRouter, Path

from app.api.deps import CurrentUserDep, MarketDataServiceDep
from app.schemas.market_data import (
    MarketQuoteRead,
    PortfolioPriceRefreshResponse,
    RefreshAllPricesResponse,
)

router = APIRouter()


@router.post(
    "/portfolios/{portfolio_id}/refresh-prices",
    response_model=PortfolioPriceRefreshResponse,
)
async def refresh_portfolio_prices(
    portfolio_id: Annotated[int, Path(ge=1)],
    service: MarketDataServiceDep,
    current_user: CurrentUserDep,
) -> PortfolioPriceRefreshResponse:
    """Fetch Finnhub quotes for distinct tickers and update Holding.current_price."""
    return await service.refresh_portfolio_prices(portfolio_id, current_user.id)


@router.post("/refresh-all-prices", response_model=RefreshAllPricesResponse)
async def refresh_all_portfolio_prices(
    service: MarketDataServiceDep,
    current_user: CurrentUserDep,
) -> RefreshAllPricesResponse:
    """Refresh live prices for all holdings owned by the current user."""
    return await service.refresh_all_prices(current_user.id)


@router.get("/quote/{ticker}", response_model=MarketQuoteRead)
async def get_live_quote(
    ticker: Annotated[str, Path(min_length=1, max_length=32)],
    service: MarketDataServiceDep,
    current_user: CurrentUserDep,
) -> MarketQuoteRead:
    """Return a single live quote (backend only; does not persist to holdings)."""
    return await service.get_quote_for_ticker(ticker)
