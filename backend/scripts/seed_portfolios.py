"""
Seed sample portfolios for local development.

Note: For a full wipe + canonical demo data (5 portfolios, 10–15 holdings each), use
`scripts/reseed_demo_data.py` or `POST /api/v1/dev/reseed` instead. This script uses
a separate, legacy sample list and only inserts missing portfolio names.

Usage:
    cd backend
    python scripts/seed_portfolios.py
"""

import asyncio
import sys
from pathlib import Path

from sqlalchemy import select

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.db.session import AsyncSessionLocal
from app.models.portfolio import Portfolio


SAMPLE_PORTFOLIOS = [
    {
        "name": "Long-Term Growth",
        "description": "Core portfolio focused on long-term compound growth stocks.",
        "base_currency": "USD",
        "owner_name": "Shubham",
    },
    {
        "name": "Dividend Income",
        "description": "Income-oriented portfolio targeting high-quality dividend payers.",
        "base_currency": "USD",
        "owner_name": "Shubham",
    },
    {
        "name": "India Opportunities",
        "description": "Portfolio for Indian equities with a 3-5 year horizon.",
        "base_currency": "INR",
        "owner_name": "Shubham",
    },
]


async def seed_portfolios() -> None:
    """Insert sample portfolios if they do not already exist."""

    async with AsyncSessionLocal() as db:
        existing_names = (
            await db.execute(select(Portfolio.name))
        ).scalars().all()
        existing_name_set = {name.lower() for name in existing_names}

        to_insert = [
            Portfolio(**portfolio)
            for portfolio in SAMPLE_PORTFOLIOS
            if portfolio["name"].lower() not in existing_name_set
        ]

        if not to_insert:
            print("Sample data already present. Nothing to insert.")
            return

        db.add_all(to_insert)
        await db.commit()
        print(f"Inserted {len(to_insert)} sample portfolio(s).")


if __name__ == "__main__":
    asyncio.run(seed_portfolios())
