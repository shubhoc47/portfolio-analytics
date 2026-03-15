"""
Holding service.

Coordinates holding business flow and repository calls.
"""

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.holding import Holding
from app.repositories.holding import HoldingRepository
from app.repositories.portfolio import PortfolioRepository
from app.schemas.holding import HoldingCreate, HoldingUpdate


class HoldingService:
    """Business logic layer for holding CRUD."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.holding_repository = HoldingRepository(db)
        self.portfolio_repository = PortfolioRepository(db)

    async def create_holding(self, portfolio_id: int, payload: HoldingCreate) -> Holding:
        await self._ensure_portfolio_exists(portfolio_id)
        try:
            holding = await self.holding_repository.create(portfolio_id, payload)
            await self.db.commit()
            return holding
        except IntegrityError as exc:
            await self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    f"Holding with ticker {payload.ticker} already exists "
                    f"in portfolio {portfolio_id}"
                ),
            ) from exc
        except Exception:
            await self.db.rollback()
            raise

    async def list_holdings_by_portfolio(self, portfolio_id: int) -> list[Holding]:
        await self._ensure_portfolio_exists(portfolio_id)
        return await self.holding_repository.list_by_portfolio(portfolio_id)

    async def get_holding(self, holding_id: int) -> Holding:
        holding = await self.holding_repository.get_by_id(holding_id)
        if holding is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Holding with id {holding_id} not found",
            )
        return holding

    async def update_holding(self, holding_id: int, payload: HoldingUpdate) -> Holding:
        holding = await self.get_holding(holding_id)
        try:
            updated = await self.holding_repository.update(holding, payload)
            await self.db.commit()
            return updated
        except IntegrityError as exc:
            await self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    f"Holding with ticker {payload.ticker} already exists "
                    f"in portfolio {holding.portfolio_id}"
                ),
            ) from exc
        except Exception:
            await self.db.rollback()
            raise

    async def delete_holding(self, holding_id: int) -> None:
        holding = await self.get_holding(holding_id)
        try:
            await self.holding_repository.delete(holding)
            await self.db.commit()
        except Exception:
            await self.db.rollback()
            raise

    async def _ensure_portfolio_exists(self, portfolio_id: int) -> None:
        portfolio = await self.portfolio_repository.get_by_id(portfolio_id)
        if portfolio is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Portfolio with id {portfolio_id} not found",
            )

