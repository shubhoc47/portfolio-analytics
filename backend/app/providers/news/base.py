"""
News provider abstractions.
"""

from dataclasses import dataclass
from datetime import datetime
from typing import Protocol


@dataclass(frozen=True)
class ProviderArticle:
    """Raw article shape returned by external news providers."""

    external_id: str | None
    title: str
    source: str
    url: str
    published_at: datetime
    ticker: str | None
    summary: str | None
    content: str | None
    author: str | None = None


class NewsProvider(Protocol):
    """Provider interface for portfolio-aware news retrieval."""

    def fetch_articles(
        self,
        tickers: list[str],
        *,
        portfolio_name: str | None = None,
    ) -> list[ProviderArticle]:
        """Fetch raw articles relevant to the provided tickers."""

