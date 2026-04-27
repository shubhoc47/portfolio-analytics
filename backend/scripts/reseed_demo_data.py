"""
Clear all portfolios (and related rows) and insert canonical demo data.

Usage:
    cd backend
    python scripts/reseed_demo_data.py

Requires PostgreSQL (or your configured DATABASE_URL) and APP_ENV != production.
For a full reset without running the API, use this script instead of POST /dev/reseed.
"""

import asyncio
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.db.session import AsyncSessionLocal
from app.core.security import hash_password
from app.repositories.user import UserRepository
from app.schemas.auth import UserCreate
from app.services.seed_service import SeedService


async def main() -> None:
    async with AsyncSessionLocal() as db:
        user_repository = UserRepository(db)
        user = await user_repository.get_by_email("demo@portfolioiq.local")
        if user is None:
            user = await user_repository.create(
                payload=UserCreate(
                    email="demo@portfolioiq.local",
                    password="PortfolioIQ123!",
                    full_name="PortfolioIQ Demo User",
                ),
                hashed_password=hash_password("PortfolioIQ123!"),
            )
        service = SeedService(db)
        result = await service.reseed_demo_data(user.id)
        print(result.model_dump_json(indent=2))


if __name__ == "__main__":
    asyncio.run(main())
