"""
ORM models package.

Import all models here so that tools like Alembic can discover them
by importing `app.models`.
"""

from .portfolio import Portfolio
from .holding import Holding
from .market_snapshot import MarketSnapshot
from .news_article import NewsArticle
from .article_sentiment import ArticleSentiment
from .alert import Alert
from .analyst_rating import AnalystRating
from .benchmark_data import BenchmarkData
from .ai_summary import AISummary
from .job_run import JobRun

__all__ = [
    "Portfolio",
    "Holding",
    "MarketSnapshot",
    "NewsArticle",
    "ArticleSentiment",
    "Alert",
    "AnalystRating",
    "BenchmarkData",
    "AISummary",
    "JobRun",
]
