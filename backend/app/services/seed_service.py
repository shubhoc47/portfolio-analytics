"""
Development seed service.

Creates demo portfolios and holdings for local testing.
"""

from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.data.demo_seed_data import DEMO_PORTFOLIOS
from app.models.analyst_rating import AnalystRating
from app.models.holding import Holding
from app.models.job_run import JobRun
from app.models.news_article import NewsArticle
from app.models.portfolio import Portfolio
from app.repositories.holding import HoldingRepository
from app.repositories.portfolio import PortfolioRepository
from app.schemas.holding import HoldingCreate
from app.schemas.portfolio import PortfolioCreate
from app.schemas.seed import ReseedResultRead, SeedResultRead


class SeedService:
    """Creates demo data for development/testing environments."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.portfolio_repository = PortfolioRepository(db)
        self.holding_repository = HoldingRepository(db)
        self.settings = get_settings()

    def _reject_production(self) -> None:
        if self.settings.APP_ENV.lower() == "production":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Seed and reseed endpoints disabled in production",
            )

    async def _count_portfolios(self) -> int:
        stmt = select(func.count()).select_from(Portfolio)
        return int((await self.db.execute(stmt)).scalar_one())

    async def _count_holdings(self) -> int:
        stmt = select(func.count()).select_from(Holding)
        return int((await self.db.execute(stmt)).scalar_one())

    async def _count_news_linked_to_holdings(self) -> int:
        stmt = (
            select(func.count())
            .select_from(NewsArticle)
            .where(NewsArticle.holding_id.is_not(None))
        )
        return int((await self.db.execute(stmt)).scalar_one())

    async def _count_ratings_linked_to_holdings(self) -> int:
        stmt = (
            select(func.count())
            .select_from(AnalystRating)
            .where(AnalystRating.holding_id.is_not(None))
        )
        return int((await self.db.execute(stmt)).scalar_one())

    async def _count_job_runs_with_portfolio(self) -> int:
        stmt = (
            select(func.count())
            .select_from(JobRun)
            .where(JobRun.portfolio_id.is_not(None))
        )
        return int((await self.db.execute(stmt)).scalar_one())

    async def _clear_portfolio_domain_data(self) -> dict[str, int]:
        """
        Remove rows that reference portfolios/holdings or would orphan on delete.

        Order: news (linked to holdings) -> analyst ratings (linked) -> job runs -> portfolios.
        Deleting portfolios CASCADE-removes holdings, alerts, ai_summary, market_snapshot, etc.
        """
        news_n = await self._count_news_linked_to_holdings()
        ratings_n = await self._count_ratings_linked_to_holdings()
        jobs_n = await self._count_job_runs_with_portfolio()
        portfolios_n = await self._count_portfolios()
        holdings_n = await self._count_holdings()

        await self.db.execute(
            delete(NewsArticle).where(NewsArticle.holding_id.is_not(None))
        )
        await self.db.execute(
            delete(AnalystRating).where(AnalystRating.holding_id.is_not(None))
        )
        await self.db.execute(
            delete(JobRun).where(JobRun.portfolio_id.is_not(None))
        )
        await self.db.execute(delete(Portfolio))

        return {
            "portfolios_removed": portfolios_n,
            "holdings_removed": holdings_n,
            "news_articles_removed": news_n,
            "analyst_ratings_removed": ratings_n,
            "job_runs_removed": jobs_n,
        }

    async def _insert_demo_portfolios_and_holdings(self) -> tuple[int, int]:
        portfolios_created = 0
        holdings_created = 0
        for item in DEMO_PORTFOLIOS:
            portfolio_payload = PortfolioCreate(**item["portfolio"])
            portfolio = await self.portfolio_repository.create(portfolio_payload)
            portfolios_created += 1
            base_currency = portfolio.base_currency

            for holding_item in item["holdings"]:
                row: dict[str, Any] = dict(holding_item)
                holding_payload = HoldingCreate(
                    ticker=row["ticker"],
                    company_name=row.get("company_name"),
                    asset_type=row["asset_type"],
                    sector=row.get("sector"),
                    quantity=row["quantity"],
                    average_cost=row["average_cost"],
                    current_price=row.get("current_price"),
                    currency=base_currency,
                    weight_percent=row.get("weight_percent"),
                )
                await self.holding_repository.create(portfolio.id, holding_payload)
                holdings_created += 1

        return portfolios_created, holdings_created

    async def seed_demo_data(self) -> SeedResultRead:
        """
        Populate demo portfolios and holdings when the database has no portfolios.

        Safety:
        - Disabled in production.
        - If any portfolio already exists, seeding is skipped to avoid duplication.
        """

        self._reject_production()

        if await self._count_portfolios() > 0:
            return SeedResultRead(
                message=(
                    "Seed skipped: portfolios already exist. "
                    "Use POST /api/v1/dev/reseed or scripts/reseed_demo_data.py for a full reset."
                ),
                portfolios_created=0,
                holdings_created=0,
            )

        try:
            portfolios_created, holdings_created = await self._insert_demo_portfolios_and_holdings()
            await self.db.commit()
        except Exception:
            await self.db.rollback()
            raise

        return SeedResultRead(
            message="Seed data created successfully",
            portfolios_created=portfolios_created,
            holdings_created=holdings_created,
        )

    async def reseed_demo_data(self) -> ReseedResultRead:
        """
        Clear all portfolio-domain data, then insert canonical demo portfolios and holdings.

        Preserves benchmark_data (not tied to portfolios). Disabled in production.
        """

        self._reject_production()

        try:
            removed = await self._clear_portfolio_domain_data()
            portfolios_created, holdings_created = await self._insert_demo_portfolios_and_holdings()
            await self.db.commit()
        except Exception:
            await self.db.rollback()
            raise

        return ReseedResultRead(
            message="Demo portfolios and holdings reseeded successfully",
            portfolios_removed=removed["portfolios_removed"],
            holdings_removed=removed["holdings_removed"],
            news_articles_removed=removed["news_articles_removed"],
            analyst_ratings_removed=removed["analyst_ratings_removed"],
            job_runs_removed=removed["job_runs_removed"],
            portfolios_created=portfolios_created,
            holdings_created=holdings_created,
        )
