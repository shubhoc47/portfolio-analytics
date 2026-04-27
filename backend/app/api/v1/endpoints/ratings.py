"""
Analyst ratings enrichment endpoints (Part 11E).
"""

from typing import Annotated

from fastapi import APIRouter, Path, Query

from app.api.deps import CurrentUserDep, RatingsServiceDep
from app.schemas.ratings import PortfolioRatingsListResponse, RatingsRefreshResponse

router = APIRouter()


@router.post(
    "/portfolios/{portfolio_id}/refresh",
    response_model=RatingsRefreshResponse,
)
async def refresh_portfolio_ratings(
    portfolio_id: Annotated[int, Path(ge=1)],
    service: RatingsServiceDep,
    current_user: CurrentUserDep,
) -> RatingsRefreshResponse:
    """Fetch, normalize, and upsert analyst ratings for a portfolio's holdings."""
    return await service.refresh_portfolio_ratings(portfolio_id, current_user.id)


@router.get(
    "/portfolios/{portfolio_id}",
    response_model=PortfolioRatingsListResponse,
)
async def list_portfolio_ratings(
    portfolio_id: Annotated[int, Path(ge=1)],
    service: RatingsServiceDep,
    current_user: CurrentUserDep,
    limit: Annotated[int, Query(ge=1, le=200)] = 100,
) -> PortfolioRatingsListResponse:
    """List currently stored analyst ratings for the selected portfolio."""
    return await service.list_portfolio_ratings(portfolio_id, current_user.id, limit=limit)
