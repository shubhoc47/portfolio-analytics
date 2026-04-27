"""
Sentiment analysis service.
"""

from collections import defaultdict
from datetime import UTC, datetime
from decimal import Decimal
from typing import Iterable

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.article_sentiment import ArticleSentiment
from app.models.news_article import NewsArticle
from app.providers.sentiment.base import SentimentArticleInput, SentimentProvider
from app.repositories.holding import HoldingRepository
from app.repositories.news import NewsRepository
from app.repositories.portfolio import PortfolioRepository
from app.repositories.sentiment import SentimentRepository
from app.schemas.sentiment import (
    ArticleSentimentRead,
    ArticleSentimentWrite,
    HoldingSentimentSummaryRead,
    PortfolioSentimentSummaryRead,
    SentimentAnalyzeResponse,
    SentimentLabel,
)


class SentimentService:
    """Business logic for article sentiment derivation and aggregation."""

    ANALYZE_LIMIT = 500

    def __init__(self, db: AsyncSession, sentiment_provider: SentimentProvider) -> None:
        self.db = db
        self.sentiment_provider = sentiment_provider
        self.portfolio_repository = PortfolioRepository(db)
        self.holding_repository = HoldingRepository(db)
        self.news_repository = NewsRepository(db)
        self.sentiment_repository = SentimentRepository(db)

    async def analyze_portfolio_sentiment(self, portfolio_id: int, user_id: int) -> SentimentAnalyzeResponse:
        portfolio = await self.portfolio_repository.get_by_id_for_user(portfolio_id, user_id)
        if portfolio is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Portfolio with id {portfolio_id} not found",
            )

        holdings = await self.holding_repository.list_by_portfolio(portfolio_id)
        if not holdings:
            return SentimentAnalyzeResponse(
                portfolio_id=portfolio.id,
                portfolio_name=portfolio.name,
                analyzed_article_count=0,
                stored_sentiment_count=0,
                created_count=0,
                updated_count=0,
                article_sentiments=[],
                holding_sentiments=[],
                portfolio_sentiment=self._build_portfolio_summary([]),
                notes=["Portfolio has no holdings, so no sentiment analysis was run."],
            )

        articles = await self.news_repository.list_by_portfolio_id(
            portfolio_id=portfolio.id,
            limit=self.ANALYZE_LIMIT,
        )
        if not articles:
            return SentimentAnalyzeResponse(
                portfolio_id=portfolio.id,
                portfolio_name=portfolio.name,
                analyzed_article_count=0,
                stored_sentiment_count=0,
                created_count=0,
                updated_count=0,
                article_sentiments=[],
                holding_sentiments=[],
                portfolio_sentiment=self._build_portfolio_summary([]),
                notes=[
                    "Portfolio has no stored news articles yet. Refresh news before running sentiment analysis."
                ],
            )

        payloads: list[ArticleSentimentWrite] = []
        for article in articles:
            provider_result = self.sentiment_provider.analyze(self._to_provider_input(article))
            payloads.append(
                ArticleSentimentWrite(
                    article_id=article.id,
                    sentiment_label=provider_result.sentiment_label,
                    sentiment_score=provider_result.sentiment_score,
                    confidence=provider_result.confidence,
                    provider_name=provider_result.provider_name,
                    rule_key=provider_result.rule_key,
                )
            )

        sentiment_rows: list[ArticleSentiment]
        created_count = 0
        updated_count = 0
        try:
            sentiment_rows, created_count, updated_count = await self.sentiment_repository.upsert_many(
                payloads
            )
            await self.db.commit()
        except Exception:
            await self.db.rollback()
            raise

        sentiment_by_article_id = {row.article_id: row for row in sentiment_rows}
        article_sentiments = [
            self._to_article_sentiment_read(
                article=article,
                sentiment=sentiment_by_article_id[article.id],
            )
            for article in articles
            if article.id in sentiment_by_article_id
        ]

        holding_sentiments = self._build_holding_summaries(
            articles=articles,
            sentiment_by_article_id=sentiment_by_article_id,
        )
        portfolio_sentiment = self._build_portfolio_summary(article_sentiments)

        notes: list[str] = []
        if updated_count:
            notes.append(
                f"Updated {updated_count} existing sentiment row(s) for repeated analysis."
            )

        return SentimentAnalyzeResponse(
            portfolio_id=portfolio.id,
            portfolio_name=portfolio.name,
            analyzed_article_count=len(articles),
            stored_sentiment_count=len(sentiment_rows),
            created_count=created_count,
            updated_count=updated_count,
            article_sentiments=article_sentiments,
            holding_sentiments=holding_sentiments,
            portfolio_sentiment=portfolio_sentiment,
            notes=notes,
        )

    @staticmethod
    def _to_provider_input(article: NewsArticle) -> SentimentArticleInput:
        return SentimentArticleInput(
            article_id=article.id,
            ticker=article.ticker,
            title=article.title,
            summary=article.summary,
            content=article.content,
        )

    @staticmethod
    def _to_float(value: Decimal | float) -> float:
        return round(float(value), 4)

    def _to_article_sentiment_read(
        self,
        *,
        article: NewsArticle,
        sentiment: ArticleSentiment,
    ) -> ArticleSentimentRead:
        analyzed_at = sentiment.created_at
        if analyzed_at.tzinfo is None:
            analyzed_at = analyzed_at.replace(tzinfo=UTC)
        else:
            analyzed_at = analyzed_at.astimezone(UTC)

        return ArticleSentimentRead(
            article_id=article.id,
            ticker=article.ticker,
            title=article.title,
            sentiment_label=sentiment.sentiment_label,
            sentiment_score=self._to_float(sentiment.sentiment_score),
            confidence=None
            if sentiment.confidence is None
            else self._to_float(sentiment.confidence),
            provider_name=sentiment.provider_name or "unknown",
            rule_key=sentiment.rule_key,
            analyzed_at=analyzed_at,
        )

    def _build_holding_summaries(
        self,
        *,
        articles: list[NewsArticle],
        sentiment_by_article_id: dict[int, ArticleSentiment],
    ) -> list[HoldingSentimentSummaryRead]:
        rows_by_ticker: dict[str, list[ArticleSentimentRead]] = defaultdict(list)
        for article in articles:
            sentiment = sentiment_by_article_id.get(article.id)
            if sentiment is None:
                continue
            rows_by_ticker[article.ticker].append(
                self._to_article_sentiment_read(article=article, sentiment=sentiment)
            )

        summaries: list[HoldingSentimentSummaryRead] = []
        for ticker in sorted(rows_by_ticker):
            rows = rows_by_ticker[ticker]
            counts = self._count_labels(rows)
            average_score = (
                sum(row.sentiment_score for row in rows) / len(rows) if rows else 0.0
            )
            summaries.append(
                HoldingSentimentSummaryRead(
                    ticker=ticker,
                    article_count=len(rows),
                    positive_count=counts["positive"],
                    neutral_count=counts["neutral"],
                    negative_count=counts["negative"],
                    average_score=round(average_score, 4),
                    overall_sentiment=self._derive_overall_label(average_score),
                )
            )
        return summaries

    def _build_portfolio_summary(
        self,
        rows: Iterable[ArticleSentimentRead],
    ) -> PortfolioSentimentSummaryRead:
        row_list = list(rows)
        counts = self._count_labels(row_list)
        average_score = (
            sum(row.sentiment_score for row in row_list) / len(row_list) if row_list else 0.0
        )
        return PortfolioSentimentSummaryRead(
            article_count=len(row_list),
            positive_count=counts["positive"],
            neutral_count=counts["neutral"],
            negative_count=counts["negative"],
            average_score=round(average_score, 4),
            overall_sentiment=self._derive_overall_label(average_score),
        )

    @staticmethod
    def _count_labels(
        rows: Iterable[ArticleSentimentRead],
    ) -> dict[SentimentLabel, int]:
        counts: dict[SentimentLabel, int] = {
            "positive": 0,
            "neutral": 0,
            "negative": 0,
        }
        for row in rows:
            counts[row.sentiment_label] += 1
        return counts

    @staticmethod
    def _derive_overall_label(average_score: float) -> SentimentLabel:
        if average_score > 0.15:
            return "positive"
        if average_score < -0.15:
            return "negative"
        return "neutral"

