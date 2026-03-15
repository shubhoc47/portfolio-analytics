"""
Holding repository.

Contains only data-access logic for holding entities.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.holding import Holding
from app.schemas.holding import HoldingCreate, HoldingUpdate


class HoldingRepository:
    """Database operations for the Holding model."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, portfolio_id: int, payload: HoldingCreate) -> Holding:
        holding = Holding(portfolio_id=portfolio_id, **payload.model_dump())
        self.db.add(holding)
        await self.db.flush()
        await self.db.refresh(holding)
        return holding

    async def list_by_portfolio(self, portfolio_id: int) -> list[Holding]:
        stmt = select(Holding).where(Holding.portfolio_id == portfolio_id).order_by(Holding.id.asc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_by_id(self, holding_id: int) -> Holding | None:
        stmt = select(Holding).where(Holding.id == holding_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def update(self, holding: Holding, payload: HoldingUpdate) -> Holding:
        for field_name, field_value in payload.model_dump(exclude_unset=True).items():
            setattr(holding, field_name, field_value)

        await self.db.flush()
        await self.db.refresh(holding)
        return holding

    async def delete(self, holding: Holding) -> None:
        await self.db.delete(holding)
        await self.db.flush()

