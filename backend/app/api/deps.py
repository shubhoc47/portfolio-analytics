"""
Shared FastAPI dependencies.

Endpoints should import dependencies from here to keep imports consistent and simple.
"""

from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.holding_service import HoldingService
from app.services.portfolio_service import PortfolioService


DBSessionDep = Annotated[AsyncSession, Depends(get_db)]


async def get_portfolio_service(db: DBSessionDep) -> PortfolioService:
    """Dependency that provides a portfolio service instance per request."""
    return PortfolioService(db)


PortfolioServiceDep = Annotated[PortfolioService, Depends(get_portfolio_service)]


async def get_holding_service(db: DBSessionDep) -> HoldingService:
    """Dependency that provides a holding service instance per request."""
    return HoldingService(db)


HoldingServiceDep = Annotated[HoldingService, Depends(get_holding_service)]

