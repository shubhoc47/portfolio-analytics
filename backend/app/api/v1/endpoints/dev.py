"""
Development-only endpoints.

Important:
- These routes are for local/dev workflows only.
- Do not expose or enable in production deployments.
"""

from fastapi import APIRouter

from app.api.deps import CurrentUserDep, SeedServiceDep
from app.schemas.seed import ReseedResultRead, SeedResultRead

router = APIRouter()


@router.post("/seed", response_model=SeedResultRead)
async def seed_demo_data(
    service: SeedServiceDep,
    current_user: CurrentUserDep,
) -> SeedResultRead:
    """Create demo portfolios and holdings for local testing."""
    return await service.seed_demo_data(current_user.id)


@router.post("/reseed", response_model=ReseedResultRead)
async def reseed_development_demo(
    service: SeedServiceDep,
    current_user: CurrentUserDep,
) -> ReseedResultRead:
    """Clear all portfolios and related demo rows, then insert fresh canonical demo data."""
    return await service.reseed_demo_data(current_user.id)

