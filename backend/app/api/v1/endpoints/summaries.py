"""
Summary and brief generation endpoints (Part 11C).
"""

from typing import Annotated

from fastapi import APIRouter, Body, Path

from app.api.deps import CurrentUserDep, SummaryServiceDep
from app.schemas.summary import (
    DailyBriefsRequest,
    DailyBriefsResponse,
    PortfolioSummaryRequest,
    PortfolioSummaryResponse,
    WeeklyHoldingSummariesRequest,
    WeeklyHoldingSummariesResponse,
)

router = APIRouter()


@router.post(
    "/portfolios/{portfolio_id}/daily-briefs",
    response_model=DailyBriefsResponse,
)
async def generate_daily_briefs(
    portfolio_id: Annotated[int, Path(ge=1)],
    service: SummaryServiceDep,
    current_user: CurrentUserDep,
    body: DailyBriefsRequest | None = Body(default=None),
) -> DailyBriefsResponse:
    """Generate one daily holding brief per holding from locally stored articles."""
    payload = body or DailyBriefsRequest()
    return await service.generate_daily_briefs(portfolio_id, current_user.id, payload.summary_date)


@router.post(
    "/portfolios/{portfolio_id}/weekly-holding-summaries",
    response_model=WeeklyHoldingSummariesResponse,
)
async def generate_weekly_holding_summaries(
    portfolio_id: Annotated[int, Path(ge=1)],
    service: SummaryServiceDep,
    current_user: CurrentUserDep,
    body: WeeklyHoldingSummariesRequest | None = Body(default=None),
) -> WeeklyHoldingSummariesResponse:
    """Roll up stored daily briefs into weekly per-holding summaries (7-day window)."""
    payload = body or WeeklyHoldingSummariesRequest()
    return await service.generate_weekly_holding_summaries(
        portfolio_id,
        current_user.id,
        payload.window_end_date,
    )


@router.post(
    "/portfolios/{portfolio_id}/portfolio-summary",
    response_model=PortfolioSummaryResponse,
)
async def generate_portfolio_summary(
    portfolio_id: Annotated[int, Path(ge=1)],
    service: SummaryServiceDep,
    current_user: CurrentUserDep,
    body: PortfolioSummaryRequest | None = Body(default=None),
) -> PortfolioSummaryResponse:
    """Generate a portfolio-wide summary from weekly holding summaries or daily briefs."""
    payload = body or PortfolioSummaryRequest()
    return await service.generate_portfolio_summary(portfolio_id, current_user.id, payload.anchor_date)
