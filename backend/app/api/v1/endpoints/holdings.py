"""
Holdings CRUD endpoints.
"""

from typing import Annotated

from fastapi import APIRouter, Path, Query, Response, status

from app.api.deps import CurrentUserDep, HoldingServiceDep
from app.schemas.holding import (
    HoldingCreate,
    HoldingRead,
    HoldingSectorSuggestionRead,
    HoldingUpdate,
)

router = APIRouter()


@router.post(
    "/portfolios/{portfolio_id}/holdings",
    response_model=HoldingRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_holding(
    portfolio_id: Annotated[int, Path(ge=1)],
    payload: HoldingCreate,
    service: HoldingServiceDep,
    current_user: CurrentUserDep,
) -> HoldingRead:
    """Create a holding inside a portfolio."""
    return await service.create_holding(portfolio_id, payload, current_user.id)


@router.get("/portfolios/{portfolio_id}/holdings", response_model=list[HoldingRead])
async def list_holdings_by_portfolio(
    portfolio_id: Annotated[int, Path(ge=1)],
    service: HoldingServiceDep,
    current_user: CurrentUserDep,
) -> list[HoldingRead]:
    """List holdings for a single portfolio."""
    return await service.list_holdings_by_portfolio(portfolio_id, current_user.id)


@router.get("/holdings/sector-suggestions", response_model=HoldingSectorSuggestionRead)
async def suggest_holding_sector(
    ticker: Annotated[str, Query(min_length=1, max_length=32)],
    service: HoldingServiceDep,
    current_user: CurrentUserDep,
) -> HoldingSectorSuggestionRead:
    """Suggest a sector from existing holdings with the same ticker."""
    _ = current_user
    return await service.suggest_sector_for_ticker(ticker)


@router.get("/holdings/{holding_id}", response_model=HoldingRead)
async def get_holding(
    holding_id: Annotated[int, Path(ge=1)],
    service: HoldingServiceDep,
    current_user: CurrentUserDep,
) -> HoldingRead:
    """Get a single holding by id."""
    return await service.get_holding(holding_id, current_user.id)


@router.patch("/holdings/{holding_id}", response_model=HoldingRead)
async def update_holding(
    holding_id: Annotated[int, Path(ge=1)],
    payload: HoldingUpdate,
    service: HoldingServiceDep,
    current_user: CurrentUserDep,
) -> HoldingRead:
    """Partially update a holding by id."""
    return await service.update_holding(holding_id, payload, current_user.id)


@router.delete("/holdings/{holding_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_holding(
    holding_id: Annotated[int, Path(ge=1)],
    service: HoldingServiceDep,
    current_user: CurrentUserDep,
) -> Response:
    """Delete a holding by id."""
    await service.delete_holding(holding_id, current_user.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
