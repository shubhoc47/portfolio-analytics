"""
Portfolio analytics endpoints.
"""

from typing import Annotated

from fastapi import APIRouter, Path

from app.api.deps import AnalyticsServiceDep
from app.schemas.analytics import (
    AnalyticsSummaryRead,
    DiversificationScoreRead,
    HealthScoreRead,
    RiskScoreRead,
    SectorExposureRead,
)

router = APIRouter()


@router.get("/portfolios/{portfolio_id}/sector-exposure", response_model=SectorExposureRead)
async def get_sector_exposure(
    portfolio_id: Annotated[int, Path(ge=1)],
    service: AnalyticsServiceDep,
) -> SectorExposureRead:
    """Return portfolio sector allocation."""
    return await service.get_sector_exposure(portfolio_id)


@router.get(
    "/portfolios/{portfolio_id}/diversification-score",
    response_model=DiversificationScoreRead,
)
async def get_diversification_score(
    portfolio_id: Annotated[int, Path(ge=1)],
    service: AnalyticsServiceDep,
) -> DiversificationScoreRead:
    """Return diversification score with factor breakdown."""
    return await service.get_diversification_score(portfolio_id)


@router.get("/portfolios/{portfolio_id}/risk-score", response_model=RiskScoreRead)
async def get_risk_score(
    portfolio_id: Annotated[int, Path(ge=1)],
    service: AnalyticsServiceDep,
) -> RiskScoreRead:
    """Return risk score with factor breakdown."""
    return await service.get_risk_score(portfolio_id)


@router.get("/portfolios/{portfolio_id}/health-score", response_model=HealthScoreRead)
async def get_health_score(
    portfolio_id: Annotated[int, Path(ge=1)],
    service: AnalyticsServiceDep,
) -> HealthScoreRead:
    """Return portfolio health score with factor breakdown."""
    return await service.get_health_score(portfolio_id)


@router.get("/portfolios/{portfolio_id}/summary", response_model=AnalyticsSummaryRead)
async def get_analytics_summary(
    portfolio_id: Annotated[int, Path(ge=1)],
    service: AnalyticsServiceDep,
) -> AnalyticsSummaryRead:
    """Return a combined analytics summary for a portfolio."""
    return await service.get_summary(portfolio_id)

