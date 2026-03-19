"""
Shared FastAPI dependencies.

Endpoints should import dependencies from here to keep imports consistent and simple.
"""

from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.providers.news.base import NewsProvider
from app.providers.news.mock import MockNewsProvider
from app.providers.sentiment.base import SentimentProvider
from app.providers.sentiment.rule_based import RuleBasedSentimentProvider
from app.services.analytics_service import AnalyticsService
from app.providers.benchmark.base import BenchmarkProvider
from app.providers.benchmark.mock import MockBenchmarkProvider
from app.services.benchmark_service import BenchmarkService
from app.services.holding_service import HoldingService
from app.services.news_service import NewsService
from app.services.portfolio_service import PortfolioService
from app.services.seed_service import SeedService
from app.services.sentiment_service import SentimentService


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


def get_news_provider() -> NewsProvider:
    """Dependency that provides a mock news data source."""
    return MockNewsProvider()


NewsProviderDep = Annotated[NewsProvider, Depends(get_news_provider)]


async def get_news_service(
    db: DBSessionDep,
    news_provider: NewsProviderDep,
) -> NewsService:
    """Dependency that provides a portfolio-aware news service instance."""
    return NewsService(db, news_provider)


NewsServiceDep = Annotated[NewsService, Depends(get_news_service)]


def get_sentiment_provider() -> SentimentProvider:
    """Dependency that provides a rule-based sentiment analyzer."""
    return RuleBasedSentimentProvider()


SentimentProviderDep = Annotated[SentimentProvider, Depends(get_sentiment_provider)]


async def get_sentiment_service(
    db: DBSessionDep,
    sentiment_provider: SentimentProviderDep,
) -> SentimentService:
    """Dependency that provides a portfolio sentiment analysis service."""
    return SentimentService(db, sentiment_provider)


SentimentServiceDep = Annotated[SentimentService, Depends(get_sentiment_service)]

