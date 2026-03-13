"""
Portfolio service.

Coordinates portfolio business flow and repository calls.
"""

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.portfolio import Portfolio
from app.repositories.portfolio import PortfolioRepository
from app.schemas.portfolio import PortfolioCreate, PortfolioUpdate


class PortfolioService:
    """Business logic layer for portfolio CRUD."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.repository = PortfolioRepository(db)

    async def create_portfolio(self, payload: PortfolioCreate) -> Portfolio:
        try:
            portfolio = await self.repository.create(payload)
            await self.db.commit()
            return portfolio
        except Exception:
            await self.db.rollback()
            raise

    async def list_portfolios(self) -> list[Portfolio]:
        return await self.repository.list_all()

    async def get_portfolio(self, portfolio_id: int) -> Portfolio:
        portfolio = await self.repository.get_by_id(portfolio_id)
        if portfolio is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Portfolio with id {portfolio_id} not found",
            )
        return portfolio

    async def update_portfolio(self, portfolio_id: int, payload: PortfolioUpdate) -> Portfolio:
        portfolio = await self.get_portfolio(portfolio_id)
        try:
            updated = await self.repository.update(portfolio, payload)
            await self.db.commit()
            return updated
        except Exception:
            await self.db.rollback()
            raise

    async def delete_portfolio(self, portfolio_id: int) -> None:
        portfolio = await self.get_portfolio(portfolio_id)
        try:
            await self.repository.delete(portfolio)
            await self.db.commit()
        except Exception:
            await self.db.rollback()
            raise

