"""
Benchmark comparison response schemas.
"""

from typing import Literal

from pydantic import BaseModel, Field


ComparisonStatus = Literal["outperformed", "underperformed", "matched"]
PriceSource = Literal["holding_current_price", "mock_price", "average_cost_fallback"]


class HoldingReturnBreakdownRead(BaseModel):
    """Per-holding return details used in benchmark comparison."""

    ticker: str
    invested_value: float = Field(ge=0)
    current_value: float = Field(ge=0)
    absolute_return: float
    return_percent: float
    price_used: float = Field(ge=0)
    price_source: PriceSource
    notes: list[str] = Field(default_factory=list)


class PortfolioReturnRead(BaseModel):
    """Portfolio-level return metrics."""

    invested_value: float = Field(ge=0)
    current_value: float = Field(ge=0)
    absolute_return: float
    return_percent: float


class BenchmarkRead(BaseModel):
    """Benchmark metrics used for comparison."""

    name: str
    symbol: str
    return_percent: float


class BenchmarkComparisonSummaryRead(BaseModel):
    """Relative performance output against benchmark."""

    status: ComparisonStatus
    relative_performance_percent: float
    summary: str


class BenchmarkComparisonRead(BaseModel):
    """Full benchmark comparison response payload."""

    portfolio_id: int
    portfolio_name: str
    portfolio: PortfolioReturnRead
    benchmark: BenchmarkRead
    comparison: BenchmarkComparisonSummaryRead
    holdings: list[HoldingReturnBreakdownRead] = Field(default_factory=list)
    notes: list[str] = Field(default_factory=list)
