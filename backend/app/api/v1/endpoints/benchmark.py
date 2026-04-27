"""
Benchmark comparison endpoints.
"""

from typing import Annotated

from fastapi import APIRouter, Path

from app.api.deps import BenchmarkServiceDep, CurrentUserDep
from app.schemas.benchmark import BenchmarkComparisonRead

router = APIRouter()


@router.get("/portfolios/{portfolio_id}/compare", response_model=BenchmarkComparisonRead)
async def compare_portfolio_with_benchmark(
    portfolio_id: Annotated[int, Path(ge=1)],
    service: BenchmarkServiceDep,
    current_user: CurrentUserDep,
) -> BenchmarkComparisonRead:
    """Compare a portfolio's return to the S&P 500 benchmark."""
    return await service.compare_portfolio(portfolio_id, current_user.id)
