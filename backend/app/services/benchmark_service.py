"""
Benchmark comparison service.
"""

from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.providers.benchmark.base import BenchmarkProvider
from app.repositories.holding import HoldingRepository
from app.repositories.portfolio import PortfolioRepository
from app.schemas.benchmark import (
    BenchmarkComparisonRead,
    BenchmarkComparisonSummaryRead,
    BenchmarkRead,
    HoldingReturnBreakdownRead,
    PortfolioReturnRead,
)


class BenchmarkService:
    """Business logic for portfolio-vs-benchmark comparisons."""

    MATCH_TOLERANCE_PERCENT = Decimal("0.05")

    def __init__(self, db: AsyncSession, benchmark_provider: BenchmarkProvider) -> None:
        self.db = db
        self.benchmark_provider = benchmark_provider
        self.portfolio_repository = PortfolioRepository(db)
        self.holding_repository = HoldingRepository(db)

    async def compare_portfolio(self, portfolio_id: int) -> BenchmarkComparisonRead:
        portfolio = await self.portfolio_repository.get_by_id(portfolio_id)
        if portfolio is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Portfolio with id {portfolio_id} not found",
            )

        holdings = await self.holding_repository.list_by_portfolio(portfolio_id)
        benchmark_snapshot = self.benchmark_provider.get_benchmark_snapshot()
        if not benchmark_snapshot:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Benchmark data provider is unavailable.",
            )

        notes: list[str] = [
            "Benchmark comparison uses deterministic mock benchmark and pricing data.",
        ]
        holding_breakdown: list[HoldingReturnBreakdownRead] = []

        total_invested = Decimal("0")
        total_current = Decimal("0")

        for holding in holdings:
            holding_notes: list[str] = []
            invested_value = holding.quantity * holding.average_cost

            if holding.current_price is not None:
                price_used = holding.current_price
                price_source = "holding_current_price"
            else:
                mock_price = self.benchmark_provider.get_mock_current_price(holding.ticker)
                if mock_price is not None:
                    price_used = mock_price
                    price_source = "mock_price"
                    holding_notes.append(
                        f"Used mock current price for ticker {holding.ticker}."
                    )
                else:
                    price_used = holding.average_cost
                    price_source = "average_cost_fallback"
                    fallback_note = (
                        f"Missing mock current price for ticker {holding.ticker}; "
                        "used average_cost as neutral fallback."
                    )
                    holding_notes.append(fallback_note)
                    notes.append(fallback_note)

            current_value = holding.quantity * price_used
            absolute_return = current_value - invested_value
            return_percent = (
                Decimal("0")
                if invested_value == 0
                else (absolute_return / invested_value) * Decimal("100")
            )

            total_invested += invested_value
            total_current += current_value

            holding_breakdown.append(
                HoldingReturnBreakdownRead(
                    ticker=holding.ticker,
                    invested_value=self._to_float(invested_value),
                    current_value=self._to_float(current_value),
                    absolute_return=self._to_float(absolute_return),
                    return_percent=self._to_float(return_percent),
                    price_used=self._to_float(price_used),
                    price_source=price_source,
                    notes=holding_notes,
                )
            )

        absolute_return = total_current - total_invested
        portfolio_return_percent = (
            Decimal("0")
            if total_invested == 0
            else (absolute_return / total_invested) * Decimal("100")
        )
        benchmark_return_percent = benchmark_snapshot.return_percent
        relative_performance = portfolio_return_percent - benchmark_return_percent

        comparison = self._build_comparison(relative_performance)

        if not holdings:
            notes.append("Portfolio has no holdings; portfolio return is 0.00%.")

        return BenchmarkComparisonRead(
            portfolio_id=portfolio.id,
            portfolio_name=portfolio.name,
            portfolio=PortfolioReturnRead(
                invested_value=self._to_float(total_invested),
                current_value=self._to_float(total_current),
                absolute_return=self._to_float(absolute_return),
                return_percent=self._to_float(portfolio_return_percent),
            ),
            benchmark=BenchmarkRead(
                name=benchmark_snapshot.name,
                symbol=benchmark_snapshot.symbol,
                return_percent=self._to_float(benchmark_return_percent),
            ),
            comparison=comparison,
            holdings=holding_breakdown,
            notes=sorted(set(notes)),
        )

    def _build_comparison(
        self, relative_performance: Decimal
    ) -> BenchmarkComparisonSummaryRead:
        relative_value = self._to_float(relative_performance)
        gap_abs = self._to_float(abs(relative_performance))

        if abs(relative_performance) <= self.MATCH_TOLERANCE_PERCENT:
            status_value = "matched"
            summary = "Portfolio matched the S&P 500 benchmark performance."
        elif relative_performance > 0:
            status_value = "outperformed"
            summary = (
                "Portfolio outperformed the S&P 500 by "
                f"{gap_abs:.2f} percentage points."
            )
        else:
            status_value = "underperformed"
            summary = (
                "Portfolio underperformed the S&P 500 by "
                f"{gap_abs:.2f} percentage points."
            )

        return BenchmarkComparisonSummaryRead(
            status=status_value,
            relative_performance_percent=relative_value,
            summary=summary,
        )

    @staticmethod
    def _to_float(value: Decimal) -> float:
        return round(float(value), 2)
