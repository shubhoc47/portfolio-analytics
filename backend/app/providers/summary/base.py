"""
Summary provider abstractions.

Providers receive only pre-selected local text inputs; they must not fetch news.
"""

from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class ArticleSummaryInput:
    """Single local article fields passed into summarization."""

    title: str
    snippet: str | None
    sentiment_label: str | None = None


@dataclass(frozen=True)
class ArticleBatchSummaryInput:
    """Batch of local articles for one holding/day."""

    ticker: str
    company_name: str | None
    articles: list[ArticleSummaryInput]


@dataclass(frozen=True)
class DailyBriefSummaryInput:
    """Inputs for the daily holding brief step."""

    provider_key: str
    target_word_limit: int
    batch: ArticleBatchSummaryInput


@dataclass(frozen=True)
class WeeklyBriefLineInput:
    """One stored daily brief line for weekly rollup."""

    summary_date: str
    content: str


@dataclass(frozen=True)
class WeeklyHoldingSummaryInput:
    """Inputs for weekly holding summary from stored daily briefs."""

    ticker: str
    company_name: str | None
    daily_briefs: list[WeeklyBriefLineInput]
    provider_key: str
    target_word_limit: int


@dataclass(frozen=True)
class PortfolioSummaryInput:
    """Inputs for portfolio-wide summary from holding-level summaries."""

    portfolio_name: str
    lines: list[tuple[str, str]]
    """(ticker, summary_text) from weekly or daily briefs."""
    provider_key: str
    target_word_limit: int


@dataclass(frozen=True)
class SummaryResult:
    """Structured summary output."""

    content: str
    word_count: int
    provider_name: str


class SummaryProvider(Protocol):
    """Summarizes local inputs only; does not retrieve external news."""

    def summarize_daily_brief(self, payload: DailyBriefSummaryInput) -> SummaryResult:
        """Generate one daily brief for one holding from local article inputs."""

    def summarize_weekly_holding(self, payload: WeeklyHoldingSummaryInput) -> SummaryResult:
        """Generate weekly holding summary from stored daily brief texts."""

    def summarize_portfolio(self, payload: PortfolioSummaryInput) -> SummaryResult:
        """Generate portfolio summary from holding-level summary texts."""
