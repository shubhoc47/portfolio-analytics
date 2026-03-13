"""
Portfolio CRUD endpoints.
"""

from typing import Annotated

from fastapi import APIRouter, Path, Response, status

from app.api.deps import PortfolioServiceDep
from app.schemas.portfolio import PortfolioCreate, PortfolioRead, PortfolioUpdate

router = APIRouter()


@router.post("", response_model=PortfolioRead, status_code=status.HTTP_201_CREATED)
async def create_portfolio(
    payload: PortfolioCreate,
    service: PortfolioServiceDep,
) -> PortfolioRead:
    """Create a new portfolio."""
    return await service.create_portfolio(payload)


@router.get("", response_model=list[PortfolioRead])
async def list_portfolios(service: PortfolioServiceDep) -> list[PortfolioRead]:
    """List all portfolios."""
    return await service.list_portfolios()


@router.get("/{portfolio_id}", response_model=PortfolioRead)
async def get_portfolio(
    portfolio_id: Annotated[int, Path(ge=1)],
    service: PortfolioServiceDep,
) -> PortfolioRead:
    """Get a single portfolio by id."""
    return await service.get_portfolio(portfolio_id)


@router.put("/{portfolio_id}", response_model=PortfolioRead)
async def update_portfolio(
    payload: PortfolioUpdate,
    portfolio_id: Annotated[int, Path(ge=1)],
    service: PortfolioServiceDep,
) -> PortfolioRead:
    """Update a portfolio by id."""
    return await service.update_portfolio(portfolio_id, payload)


@router.delete("/{portfolio_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_portfolio(
    portfolio_id: Annotated[int, Path(ge=1)],
    service: PortfolioServiceDep,
) -> Response:
    """Delete a portfolio by id."""
    await service.delete_portfolio(portfolio_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
