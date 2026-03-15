"""
Development seed service.

Creates demo portfolios and holdings for local testing.
"""

from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.repositories.holding import HoldingRepository
from app.repositories.portfolio import PortfolioRepository
from app.schemas.holding import HoldingCreate
from app.schemas.portfolio import PortfolioCreate
from app.schemas.seed import SeedResultRead


DEMO_DATA = [
    {
        "portfolio": {
            "name": "Tech Growth Portfolio",
            "description": "High-conviction technology growth positions.",
            "base_currency": "USD",
            "owner_name": "Demo User",
        },
        "holdings": [
            {"ticker": "AAPL", "quantity": Decimal("12"), "average_cost": Decimal("182.50")},
            {"ticker": "NVDA", "quantity": Decimal("8"), "average_cost": Decimal("745.00")},
            {"ticker": "MSFT", "quantity": Decimal("10"), "average_cost": Decimal("398.25")},
        ],
    },
    {
        "portfolio": {
            "name": "ETF Portfolio",
            "description": "Diversified broad-market ETF allocation.",
            "base_currency": "USD",
            "owner_name": "Demo User",
        },
        "holdings": [
            {"ticker": "VOO", "quantity": Decimal("15"), "average_cost": Decimal("472.10")},
            {"ticker": "QQQ", "quantity": Decimal("9"), "average_cost": Decimal("438.35")},
            {"ticker": "VTI", "quantity": Decimal("14"), "average_cost": Decimal("271.80")},
        ],
    },
    {
        "portfolio": {
            "name": "Dividend Portfolio",
            "description": "Income-focused positions in stable dividend companies.",
            "base_currency": "USD",
            "owner_name": "Demo User",
        },
        "holdings": [
            {"ticker": "KO", "quantity": Decimal("22"), "average_cost": Decimal("59.40")},
            {"ticker": "JNJ", "quantity": Decimal("16"), "average_cost": Decimal("152.30")},
            {"ticker": "PG", "quantity": Decimal("18"), "average_cost": Decimal("149.75")},
        ],
    },
]


class SeedService:
    """Creates demo data for development/testing environments."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.portfolio_repository = PortfolioRepository(db)
        self.holding_repository = HoldingRepository(db)
        self.settings = get_settings()

    async def seed_demo_data(self) -> SeedResultRead:
        """
        Populate demo portfolios and holdings.

        Safety:
        - Disabled in production.
        - If any portfolio already exists, seeding is skipped to avoid duplication.
        """

        if self.settings.APP_ENV.lower() == "production":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Seed endpoint disabled in production",
            )

        existing_portfolios = await self.portfolio_repository.list_all()
        if existing_portfolios:
            return SeedResultRead(
                message=(
                    "Seed skipped: portfolios already exist. "
                    "Clear database first if you need a fresh demo seed."
                ),
                portfolios_created=0,
                holdings_created=0,
            )

        portfolios_created = 0
        holdings_created = 0

        try:
            for item in DEMO_DATA:
                portfolio_payload = PortfolioCreate(**item["portfolio"])
                portfolio = await self.portfolio_repository.create(portfolio_payload)
                portfolios_created += 1

                for holding_item in item["holdings"]:
                    holding_payload = HoldingCreate(
                        ticker=holding_item["ticker"],
                        quantity=holding_item["quantity"],
                        average_cost=holding_item["average_cost"],
                        asset_type="Equity",
                        currency=portfolio.base_currency,
                    )
                    await self.holding_repository.create(portfolio.id, holding_payload)
                    holdings_created += 1

            await self.db.commit()
        except Exception:
            await self.db.rollback()
            raise

        return SeedResultRead(
            message="Seed data created successfully",
            portfolios_created=portfolios_created,
            holdings_created=holdings_created,
        )

