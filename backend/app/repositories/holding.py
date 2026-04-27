"""
Holding repository.

Contains only data-access logic for holding entities.
"""

from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.holding import Holding
from app.models.portfolio import Portfolio
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

    async def list_all(self) -> list[Holding]:
        stmt = select(Holding).order_by(Holding.portfolio_id.asc(), Holding.id.asc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def list_all_for_user(self, user_id: int) -> list[Holding]:
        stmt = (
            select(Holding)
            .join(Portfolio, Holding.portfolio_id == Portfolio.id)
            .where(Portfolio.user_id == user_id)
            .order_by(Holding.portfolio_id.asc(), Holding.id.asc())
        )
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

    async def apply_current_prices_for_portfolio(
        self,
        portfolio_id: int,
        ticker_upper_to_price: dict[str, Decimal],
    ) -> int:
        """
        Set current_price for holdings in this portfolio whose ticker (uppercase)
        appears in ticker_upper_to_price. Returns number of rows updated.
        """
        if not ticker_upper_to_price:
            return 0

        holdings = await self.list_by_portfolio(portfolio_id)
        updated = 0
        for holding in holdings:
            key = holding.ticker.strip().upper()
            if key in ticker_upper_to_price:
                holding.current_price = ticker_upper_to_price[key]
                updated += 1
        await self.db.flush()
        return updated

    async def apply_current_prices_globally(self, ticker_upper_to_price: dict[str, Decimal]) -> int:
        """
        Set current_price for every holding whose uppercase ticker is in the map.
        Returns number of rows updated.
        """
        if not ticker_upper_to_price:
            return 0

        holdings = await self.list_all()
        updated = 0
        for holding in holdings:
            key = holding.ticker.strip().upper()
            if key in ticker_upper_to_price:
                holding.current_price = ticker_upper_to_price[key]
                updated += 1
        await self.db.flush()
        return updated

    async def apply_current_prices_for_user(
        self,
        user_id: int,
        ticker_upper_to_price: dict[str, Decimal],
    ) -> int:
        """
        Set current_price for holdings owned by a user whose uppercase ticker is in the map.
        Returns number of rows updated.
        """
        if not ticker_upper_to_price:
            return 0

        holdings = await self.list_all_for_user(user_id)
        updated = 0
        for holding in holdings:
            key = holding.ticker.strip().upper()
            if key in ticker_upper_to_price:
                holding.current_price = ticker_upper_to_price[key]
                updated += 1
        await self.db.flush()
        return updated

