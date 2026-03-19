"""
Sentiment provider abstractions.
"""

from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class SentimentArticleInput:
    """Normalized local-article input used for sentiment analysis."""

    article_id: int
    ticker: str
    title: str
    summary: str | None = None
    content: str | None = None


@dataclass(frozen=True)
class SentimentResult:
    """Provider output for one article sentiment analysis."""

    sentiment_label: str
    sentiment_score: float
    confidence: float | None
    provider_name: str
    rule_key: str | None = None


class SentimentProvider(Protocol):
    """Provider interface for deriving sentiment from local article data."""

    def analyze(self, article: SentimentArticleInput) -> SentimentResult:
        """Return sentiment for one normalized article input."""

