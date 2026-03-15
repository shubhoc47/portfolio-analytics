"""
Seed sample holdings for local development.

Usage:
    cd backend
    python scripts/seed_holdings.py
"""

import asyncio
import sys
from decimal import Decimal
from pathlib import Path

from sqlalchemy import select

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.db.session import AsyncSessionLocal
from app.models.holding import Holding
from app.models.portfolio import Portfolio


SAMPLE_HOLDINGS_BY_PORTFOLIO = {
    "Long-Term Growth": [
        {
            "ticker": "AAPL",
            "company_name": "Apple Inc.",
            "asset_type": "Equity",
            "sector": "Technology",
            "quantity": Decimal("12.0000"),
            "average_cost": Decimal("178.2500"),
            "current_price": Decimal("195.1000"),
            "currency": "USD",
            "weight_percent": Decimal("28.50"),
        },
        {
            "ticker": "MSFT",
            "company_name": "Microsoft Corporation",
            "asset_type": "Equity",
            "sector": "Technology",
            "quantity": Decimal("8.0000"),
            "average_cost": Decimal("365.0000"),
            "current_price": Decimal("412.3500"),
            "currency": "USD",
            "weight_percent": Decimal("25.00"),
        },
        {
            "ticker": "GOOGL",
            "company_name": "Alphabet Inc.",
            "asset_type": "Equity",
            "sector": "Communication Services",
            "quantity": Decimal("6.0000"),
            "average_cost": Decimal("142.8000"),
            "current_price": Decimal("168.4000"),
            "currency": "USD",
            "weight_percent": Decimal("17.20"),
        },
    ],
    "Dividend Income": [
        {
            "ticker": "JNJ",
            "company_name": "Johnson & Johnson",
            "asset_type": "Equity",
            "sector": "Healthcare",
            "quantity": Decimal("14.0000"),
            "average_cost": Decimal("151.7500"),
            "current_price": Decimal("159.9000"),
            "currency": "USD",
            "weight_percent": Decimal("22.10"),
        },
        {
            "ticker": "PG",
            "company_name": "Procter & Gamble",
            "asset_type": "Equity",
            "sector": "Consumer Staples",
            "quantity": Decimal("10.0000"),
            "average_cost": Decimal("148.5000"),
            "current_price": Decimal("162.2500"),
            "currency": "USD",
            "weight_percent": Decimal("18.75"),
        },
    ],
    "India Opportunities": [
        {
            "ticker": "RELIANCE",
            "company_name": "Reliance Industries",
            "asset_type": "Equity",
            "sector": "Energy",
            "quantity": Decimal("20.0000"),
            "average_cost": Decimal("2450.0000"),
            "current_price": Decimal("2865.0000"),
            "currency": "INR",
            "weight_percent": Decimal("34.00"),
        },
        {
            "ticker": "TCS",
            "company_name": "Tata Consultancy Services",
            "asset_type": "Equity",
            "sector": "Information Technology",
            "quantity": Decimal("15.0000"),
            "average_cost": Decimal("3600.0000"),
            "current_price": Decimal("3950.0000"),
            "currency": "INR",
            "weight_percent": Decimal("26.50"),
        },
    ],
}


async def seed_holdings() -> None:
    """Insert sample holdings if they do not already exist."""

    async with AsyncSessionLocal() as db:
        portfolio_rows = (
            await db.execute(select(Portfolio.id, Portfolio.name))
        ).all()
        portfolio_map = {name: portfolio_id for portfolio_id, name in portfolio_rows}

        missing_portfolios = [
            name for name in SAMPLE_HOLDINGS_BY_PORTFOLIO if name not in portfolio_map
        ]
        if missing_portfolios:
            print(
                "Missing portfolios for sample holdings. "
                "Run scripts/seed_portfolios.py first.",
            )
            print(f"Missing: {', '.join(missing_portfolios)}")
            return

        existing_pairs = (
            await db.execute(select(Holding.portfolio_id, Holding.ticker))
        ).all()
        existing_pair_set = {(portfolio_id, ticker) for portfolio_id, ticker in existing_pairs}

        to_insert: list[Holding] = []
        for portfolio_name, holdings in SAMPLE_HOLDINGS_BY_PORTFOLIO.items():
            portfolio_id = portfolio_map[portfolio_name]
            for holding in holdings:
                identity = (portfolio_id, holding["ticker"])
                if identity in existing_pair_set:
                    continue
                to_insert.append(Holding(portfolio_id=portfolio_id, **holding))

        if not to_insert:
            print("Sample holdings already present. Nothing to insert.")
            return

        db.add_all(to_insert)
        await db.commit()
        print(f"Inserted {len(to_insert)} sample holding(s).")


if __name__ == "__main__":
    asyncio.run(seed_holdings())
