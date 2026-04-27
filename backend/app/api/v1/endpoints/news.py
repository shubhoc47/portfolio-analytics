"""
News ingestion endpoints.
"""

from typing import Annotated

from fastapi import APIRouter, Path, Query

from app.api.deps import CurrentUserDep, NewsServiceDep
from app.schemas.news import NewsRefreshResponse, PortfolioNewsListResponse

router = APIRouter()


@router.post(
    "/portfolios/{portfolio_id}/refresh",
    response_model=NewsRefreshResponse,
)
async def refresh_portfolio_news(
    portfolio_id: Annotated[int, Path(ge=1)],
    service: NewsServiceDep,
    current_user: CurrentUserDep,
) -> NewsRefreshResponse:
    """Fetch, normalize, deduplicate, and persist portfolio-relevant news."""
    return await service.refresh_portfolio_news(portfolio_id, current_user.id)


@router.get(
    "/portfolios/{portfolio_id}",
    response_model=PortfolioNewsListResponse,
)
async def list_portfolio_news(
    portfolio_id: Annotated[int, Path(ge=1)],
    service: NewsServiceDep,
    current_user: CurrentUserDep,
    limit: Annotated[int, Query(ge=1, le=200)] = 100,
) -> PortfolioNewsListResponse:
    """List persisted news for a portfolio."""
    return await service.list_portfolio_news(portfolio_id, current_user.id, limit=limit)

