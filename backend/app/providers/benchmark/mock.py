"""
Mock benchmark provider for local development.
"""

from decimal import Decimal

from app.providers.benchmark.base import BenchmarkSnapshot


class MockBenchmarkProvider:
    """Deterministic benchmark and current-price source for demo comparisons."""

    BENCHMARK_NAME = "S&P 500"
    BENCHMARK_SYMBOL = "SPY"
    BENCHMARK_RETURN_PERCENT = Decimal("8.50")

    MOCK_CURRENT_PRICE_BY_TICKER: dict[str, Decimal] = {
        "AAPL": Decimal("213.00"),
        "NVDA": Decimal("824.50"),
        "MSFT": Decimal("426.20"),
        "VOO": Decimal("506.00"),
        "QQQ": Decimal("474.10"),
        "VTI": Decimal("292.00"),
        "KO": Decimal("63.40"),
        "JNJ": Decimal("167.25"),
        "PG": Decimal("171.35"),
    }

    def get_benchmark_snapshot(self) -> BenchmarkSnapshot:
        return BenchmarkSnapshot(
            name=self.BENCHMARK_NAME,
            symbol=self.BENCHMARK_SYMBOL,
            return_percent=self.BENCHMARK_RETURN_PERCENT,
        )

    def get_mock_current_price(self, ticker: str) -> Decimal | None:
        return self.MOCK_CURRENT_PRICE_BY_TICKER.get(ticker.strip().upper())
