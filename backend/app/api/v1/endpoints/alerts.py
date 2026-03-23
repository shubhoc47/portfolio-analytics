"""
Alerts engine endpoints.
"""

from typing import Annotated

from fastapi import APIRouter, Path, Query

from app.api.deps import AlertServiceDep
from app.schemas.alert import AlertRefreshResponse, PortfolioAlertsListResponse

router = APIRouter()


@router.post(
    "/portfolios/{portfolio_id}/refresh",
    response_model=AlertRefreshResponse,
)
async def refresh_portfolio_alerts(
    portfolio_id: Annotated[int, Path(ge=1)],
    service: AlertServiceDep,
) -> AlertRefreshResponse:
    """Generate or update active alerts from local stored portfolio data."""
    return await service.refresh_portfolio_alerts(portfolio_id)


@router.get(
    "/portfolios/{portfolio_id}",
    response_model=PortfolioAlertsListResponse,
)
async def list_portfolio_active_alerts(
    portfolio_id: Annotated[int, Path(ge=1)],
    service: AlertServiceDep,
    limit: Annotated[int, Query(ge=1, le=200)] = 100,
) -> PortfolioAlertsListResponse:
    """List active alerts currently stored for the portfolio."""
    return await service.list_portfolio_active_alerts(portfolio_id, limit=limit)
