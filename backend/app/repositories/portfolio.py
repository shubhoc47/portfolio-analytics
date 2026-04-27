"""
Portfolio repository.

Contains only data-access logic for portfolio entities.
"""

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.portfolio import Portfolio
from app.schemas.portfolio import PortfolioCreate, PortfolioUpdate


class PortfolioRepository:
    """Database operations for the Portfolio model."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, payload: PortfolioCreate, *, user_id: int) -> Portfolio:
        portfolio = Portfolio(user_id=user_id, **payload.model_dump())
        self.db.add(portfolio)
        await self.db.flush()
        await self.db.refresh(portfolio)
        return portfolio

    async def list_for_user(self, user_id: int) -> list[Portfolio]:
        stmt = select(Portfolio).where(Portfolio.user_id == user_id).order_by(Portfolio.id.asc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_by_id(self, portfolio_id: int) -> Portfolio | None:
        stmt = select(Portfolio).where(Portfolio.id == portfolio_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_id_for_user(self, portfolio_id: int, user_id: int) -> Portfolio | None:
        stmt = select(Portfolio).where(
            Portfolio.id == portfolio_id,
            Portfolio.user_id == user_id,
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_normalized_name_for_user(
        self,
        normalized_name: str,
        user_id: int,
    ) -> Portfolio | None:
        stmt = select(Portfolio).where(
            func.lower(func.btrim(Portfolio.name)) == normalized_name,
            Portfolio.user_id == user_id,
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_normalized_name_for_user_excluding_id(
        self,
        normalized_name: str,
        user_id: int,
        portfolio_id: int,
    ) -> Portfolio | None:
        stmt = select(Portfolio).where(
            func.lower(func.btrim(Portfolio.name)) == normalized_name,
            Portfolio.user_id == user_id,
            Portfolio.id != portfolio_id,
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def update(self, portfolio: Portfolio, payload: PortfolioUpdate) -> Portfolio:
        for field_name, field_value in payload.model_dump(exclude_unset=True).items():
            setattr(portfolio, field_name, field_value)

        await self.db.flush()
        await self.db.refresh(portfolio)
        return portfolio

    async def delete(self, portfolio: Portfolio) -> None:
        await self.db.delete(portfolio)
        await self.db.flush()

