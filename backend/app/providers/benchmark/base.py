"""
Benchmark provider abstractions.
"""

from dataclasses import dataclass
from decimal import Decimal
from typing import Protocol


@dataclass(frozen=True)
class BenchmarkSnapshot:
    """Benchmark metadata and return value for comparison."""

    name: str
    symbol: str
    return_percent: Decimal


class BenchmarkProvider(Protocol):
    """Provider interface for benchmark and mock price lookups."""

    def get_benchmark_snapshot(self) -> BenchmarkSnapshot:
        """Return benchmark return data used in comparisons."""

    def get_mock_current_price(self, ticker: str) -> Decimal | None:
        """Return a demo current price for a ticker, if available."""
