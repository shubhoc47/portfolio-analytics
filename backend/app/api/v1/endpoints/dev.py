"""
Development-only endpoints.

Important:
- These routes are for local/dev workflows only.
- Do not expose or enable in production deployments.
"""

from fastapi import APIRouter

from app.api.deps import SeedServiceDep
from app.schemas.seed import SeedResultRead

router = APIRouter()


@router.post("/seed", response_model=SeedResultRead)
async def seed_demo_data(service: SeedServiceDep) -> SeedResultRead:
    """Create demo portfolios and holdings for local testing."""
    return await service.seed_demo_data()

