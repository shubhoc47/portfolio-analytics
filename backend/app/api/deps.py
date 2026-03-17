"""
Shared FastAPI dependencies.

Endpoints should import dependencies from here to keep imports consistent and simple.
"""

from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.analytics_service import AnalyticsService
from app.providers.benchmark.base import BenchmarkProvider
from app.providers.benchmark.mock import MockBenchmarkProvider
from app.services.benchmark_service import BenchmarkService
from app.services.holding_service import HoldingService
from app.services.portfolio_service import PortfolioService
from app.services.seed_service import SeedService


DBSessionDep = Annotated[AsyncSession, Depends(get_db)]


async def get_portfolio_service(db: DBSessionDep) -> PortfolioService:
    """Dependency that provides a portfolio service instance per request."""
    return PortfolioService(db)


PortfolioServiceDep = Annotated[PortfolioService, Depends(get_portfolio_service)]


async def get_holding_service(db: DBSessionDep) -> HoldingService:
    """Dependency that provides a holding service instance per request."""
    return HoldingService(db)


HoldingServiceDep = Annotated[HoldingService, Depends(get_holding_service)]


async def get_seed_service(db: DBSessionDep) -> SeedService:
    """Dependency that provides a seed service instance per request."""
    return SeedService(db)


SeedServiceDep = Annotated[SeedService, Depends(get_seed_service)]


async def get_analytics_service(db: DBSessionDep) -> AnalyticsService:
    """Dependency that provides an analytics service instance per request."""
    return AnalyticsService(db)


AnalyticsServiceDep = Annotated[AnalyticsService, Depends(get_analytics_service)]


def get_benchmark_provider() -> BenchmarkProvider:
    """Dependency that provides benchmark and mock price data source."""
    return MockBenchmarkProvider()


BenchmarkProviderDep = Annotated[BenchmarkProvider, Depends(get_benchmark_provider)]


async def get_benchmark_service(
    db: DBSessionDep,
    benchmark_provider: BenchmarkProviderDep,
) -> BenchmarkService:
    """Dependency that provides a benchmark comparison service instance."""
    return BenchmarkService(db, benchmark_provider)


BenchmarkServiceDep = Annotated[BenchmarkService, Depends(get_benchmark_service)]

