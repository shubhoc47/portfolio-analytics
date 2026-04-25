"""
Shared FastAPI dependencies.

Endpoints should import dependencies from here to keep imports consistent and simple.
"""

from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings, get_settings
from app.db.session import get_db
from app.providers.alert.base import AlertDetector
from app.providers.alert.rule_based import RuleBasedAlertDetector
from app.providers.news.base import NewsProvider
from app.providers.news.mock import MockNewsProvider
from app.providers.ratings.base import RatingsProvider
from app.providers.ratings.mock import MockRatingsProvider
from app.providers.sentiment.base import SentimentProvider
from app.providers.sentiment.rule_based import RuleBasedSentimentProvider
from app.providers.summary.base import SummaryProvider
from app.providers.summary.template import TemplateSummaryProvider
from app.services.alert_service import AlertService
from app.services.analytics_service import AnalyticsService
from app.providers.benchmark.base import BenchmarkProvider
from app.providers.benchmark.mock import MockBenchmarkProvider
from app.providers.market_data.finnhub import FinnhubMarketDataProvider
from app.services.benchmark_service import BenchmarkService
from app.services.holding_service import HoldingService
from app.services.market_data_service import MarketDataService
from app.services.quote_cache import QuoteCache
from app.services.news_service import NewsService
from app.services.portfolio_service import PortfolioService
from app.services.ratings_service import RatingsService
from app.services.seed_service import SeedService
from app.services.sentiment_service import SentimentService
from app.services.summary_service import SummaryService


DBSessionDep = Annotated[AsyncSession, Depends(get_db)]

SettingsDep = Annotated[Settings, Depends(get_settings)]


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


def get_ratings_provider() -> RatingsProvider:
    """Dependency that provides a mock analyst ratings source."""
    return MockRatingsProvider()


RatingsProviderDep = Annotated[RatingsProvider, Depends(get_ratings_provider)]


async def get_ratings_service(
    db: DBSessionDep,
    ratings_provider: RatingsProviderDep,
) -> RatingsService:
    """Dependency that provides a portfolio-aware ratings enrichment service."""
    return RatingsService(db, ratings_provider)


RatingsServiceDep = Annotated[RatingsService, Depends(get_ratings_service)]


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


def get_summary_provider() -> SummaryProvider:
    """Dependency that provides a template-based summary generator (no external news fetch)."""
    return TemplateSummaryProvider()


SummaryProviderDep = Annotated[SummaryProvider, Depends(get_summary_provider)]


async def get_summary_service(
    db: DBSessionDep,
    summary_provider: SummaryProviderDep,
) -> SummaryService:
    """Dependency that provides hierarchical summary generation."""
    return SummaryService(db, summary_provider)


SummaryServiceDep = Annotated[SummaryService, Depends(get_summary_service)]


def get_alert_detector() -> AlertDetector:
    """Dependency that provides a deterministic keyword/rule alerts detector."""
    return RuleBasedAlertDetector()


AlertDetectorDep = Annotated[AlertDetector, Depends(get_alert_detector)]


async def get_alert_service(
    db: DBSessionDep,
    alert_detector: AlertDetectorDep,
) -> AlertService:
    """Dependency that provides a portfolio-aware alerts engine service."""
    return AlertService(db, alert_detector)


AlertServiceDep = Annotated[AlertService, Depends(get_alert_service)]


def get_market_data_provider(settings: SettingsDep) -> FinnhubMarketDataProvider:
    """Finnhub-backed quote client (works with optional empty key; service skips HTTP when unset)."""
    return FinnhubMarketDataProvider(api_key=settings.FINNHUB_API_KEY)


MarketDataProviderDep = Annotated[FinnhubMarketDataProvider, Depends(get_market_data_provider)]

_quote_cache_singleton: QuoteCache | None = None


def get_quote_cache(settings: SettingsDep) -> QuoteCache:
    """One QuoteCache per process (TTL fixed at first request in this process)."""
    global _quote_cache_singleton
    if _quote_cache_singleton is None:
        _quote_cache_singleton = QuoteCache(ttl_seconds=float(settings.MARKET_DATA_CACHE_TTL_SECONDS))
    return _quote_cache_singleton


QuoteCacheDep = Annotated[QuoteCache, Depends(get_quote_cache)]


async def get_market_data_service(
    db: DBSessionDep,
    settings: SettingsDep,
    market_data_provider: MarketDataProviderDep,
    quote_cache: QuoteCacheDep,
) -> MarketDataService:
    """Dependency that provides market data refresh and quote lookups."""
    return MarketDataService(db, market_data_provider, settings, quote_cache)


MarketDataServiceDep = Annotated[MarketDataService, Depends(get_market_data_service)]

