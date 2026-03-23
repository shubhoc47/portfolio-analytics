"""
Analyst ratings repository.
"""

from datetime import date

from sqlalchemy import Select, select, tuple_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.analyst_rating import AnalystRating
from app.models.holding import Holding
from app.schemas.ratings import AnalystRatingWrite


class RatingsRepository:
    """Database operations for the AnalystRating model."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_existing_by_natural_keys(
        self,
        keys: set[tuple[int, str, str, date]],
    ) -> dict[tuple[int, str, str, date], AnalystRating]:
        if not keys:
            return {}

        stmt = select(AnalystRating).where(
            tuple_(
                AnalystRating.holding_id,
                AnalystRating.provider_name,
                AnalystRating.firm_name,
                AnalystRating.rating_date,
            ).in_(keys)
        )
        result = await self.db.execute(stmt)
        rows = list(result.scalars().all())
        return {
            (
                row.holding_id or 0,
                row.provider_name,
                row.firm_name,
                row.rating_date,
            ): row
            for row in rows
        }

    async def upsert_many(
        self,
        payloads: list[AnalystRatingWrite],
    ) -> tuple[list[AnalystRating], int, int]:
        if not payloads:
            return [], 0, 0

        keys = {
            (payload.holding_id, payload.provider_name, payload.firm_name, payload.as_of_date)
            for payload in payloads
        }
        existing_by_key = await self.get_existing_by_natural_keys(keys)

        rows: list[AnalystRating] = []
        created_count = 0
        updated_count = 0

        for payload in payloads:
            key = (payload.holding_id, payload.provider_name, payload.firm_name, payload.as_of_date)
            existing = existing_by_key.get(key)
            if existing is not None:
                existing.ticker = payload.ticker
                existing.provider_name = payload.provider_name
                existing.firm_name = payload.firm_name
                existing.analyst_name = payload.analyst_name
                existing.rating_raw = payload.raw_rating
                existing.rating_normalized = payload.normalized_rating
                existing.target_price = payload.price_target
                existing.notes = payload.notes
                rows.append(existing)
                updated_count += 1
                continue

            row = AnalystRating(
                holding_id=payload.holding_id,
                ticker=payload.ticker,
                provider_name=payload.provider_name,
                firm_name=payload.firm_name,
                analyst_name=payload.analyst_name,
                rating_raw=payload.raw_rating,
                rating_normalized=payload.normalized_rating,
                target_price=payload.price_target,
                rating_date=payload.as_of_date,
                notes=payload.notes,
            )
            self.db.add(row)
            rows.append(row)
            created_count += 1

        await self.db.flush()
        for row in rows:
            await self.db.refresh(row)
        return rows, created_count, updated_count

    async def list_by_portfolio(
        self,
        portfolio_id: int,
        *,
        limit: int = 200,
    ) -> list[AnalystRating]:
        stmt: Select[tuple[AnalystRating]] = (
            select(AnalystRating)
            .join(Holding, AnalystRating.holding_id == Holding.id)
            .where(Holding.portfolio_id == portfolio_id)
            .order_by(
                AnalystRating.rating_date.desc(),
                AnalystRating.ticker.asc(),
                AnalystRating.id.desc(),
            )
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
