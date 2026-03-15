"""
Holdings CRUD endpoints.
"""

from typing import Annotated

from fastapi import APIRouter, Path, Response, status

from app.api.deps import HoldingServiceDep
from app.schemas.holding import HoldingCreate, HoldingRead, HoldingUpdate

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
) -> HoldingRead:
    """Create a holding inside a portfolio."""
    return await service.create_holding(portfolio_id, payload)


@router.get("/portfolios/{portfolio_id}/holdings", response_model=list[HoldingRead])
async def list_holdings_by_portfolio(
    portfolio_id: Annotated[int, Path(ge=1)],
    service: HoldingServiceDep,
) -> list[HoldingRead]:
    """List holdings for a single portfolio."""
    return await service.list_holdings_by_portfolio(portfolio_id)


@router.get("/holdings/{holding_id}", response_model=HoldingRead)
async def get_holding(
    holding_id: Annotated[int, Path(ge=1)],
    service: HoldingServiceDep,
) -> HoldingRead:
    """Get a single holding by id."""
    return await service.get_holding(holding_id)


@router.patch("/holdings/{holding_id}", response_model=HoldingRead)
async def update_holding(
    holding_id: Annotated[int, Path(ge=1)],
    payload: HoldingUpdate,
    service: HoldingServiceDep,
) -> HoldingRead:
    """Partially update a holding by id."""
    return await service.update_holding(holding_id, payload)


@router.delete("/holdings/{holding_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_holding(
    holding_id: Annotated[int, Path(ge=1)],
    service: HoldingServiceDep,
) -> Response:
    """Delete a holding by id."""
    await service.delete_holding(holding_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
