"""
Alerts engine service (Part 11D).
"""

from datetime import UTC, datetime
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.alert import Alert
from app.models.article_sentiment import ArticleSentiment
from app.providers.alert.base import AlertDetectionInput, AlertDetectionResult, AlertDetector
from app.providers.sentiment.rule_based import RuleBasedSentimentProvider
from app.repositories.alert import AlertRepository
from app.repositories.holding import HoldingRepository
from app.repositories.news import NewsRepository
from app.repositories.portfolio import PortfolioRepository
from app.repositories.sentiment import SentimentRepository
from app.schemas.alert import AlertRead, AlertRefreshResponse, PortfolioAlertsListResponse


class AlertService:
    """Business logic for portfolio-aware deterministic alert generation."""

    REFRESH_ARTICLE_LIMIT = 500
    ALERT_LIST_LIMIT = 200
    SOURCE_KIND_ARTICLE = "article"
    SENTIMENT_PROVIDER = RuleBasedSentimentProvider.PROVIDER_NAME

    def __init__(self, db: AsyncSession, alert_detector: AlertDetector) -> None:
        self.db = db
        self.alert_detector = alert_detector
        self.portfolio_repository = PortfolioRepository(db)
        self.holding_repository = HoldingRepository(db)
        self.news_repository = NewsRepository(db)
        self.sentiment_repository = SentimentRepository(db)
        self.alert_repository = AlertRepository(db)

    async def refresh_portfolio_alerts(self, portfolio_id: int) -> AlertRefreshResponse:
        portfolio = await self.portfolio_repository.get_by_id(portfolio_id)
        if portfolio is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Portfolio with id {portfolio_id} not found",
            )

        holdings = await self.holding_repository.list_by_portfolio(portfolio_id)
        if not holdings:
            return AlertRefreshResponse(
                portfolio_id=portfolio.id,
                portfolio_name=portfolio.name,
                detected_count=0,
                created_count=0,
                updated_count=0,
                active_alert_count=0,
                alerts=[],
                notes=["Portfolio has no holdings; no alerts were generated."],
            )

        articles = await self.news_repository.list_by_portfolio_id(
            portfolio_id=portfolio.id,
            limit=self.REFRESH_ARTICLE_LIMIT,
        )
        if not articles:
            return AlertRefreshResponse(
                portfolio_id=portfolio.id,
                portfolio_name=portfolio.name,
                detected_count=0,
                created_count=0,
                updated_count=0,
                active_alert_count=0,
                alerts=[],
                notes=[
                    "Portfolio has no stored news articles yet. Refresh news before generating alerts."
                ],
            )

        sentiments_by_article_id = await self.sentiment_repository.get_existing_by_articles_and_provider(
            article_ids={article.id for article in articles},
            provider_name=self.SENTIMENT_PROVIDER,
        )

        created_count = 0
        updated_count = 0
        detected_count = 0
        notes: list[str] = []

        try:
            for article in articles:
                detections = self.alert_detector.detect(
                    AlertDetectionInput(
                        ticker=article.ticker,
                        title=article.title,
                        snippet=article.summary,
                        content=article.content,
                        sentiment_label=self._sentiment_label_for_article(
                            article.id,
                            sentiments_by_article_id,
                        ),
                        sentiment_score=self._sentiment_score_for_article(
                            article.id,
                            sentiments_by_article_id,
                        ),
                    )
                )
                detected_count += len(detections)
                for detection in detections:
                    _, created = await self.alert_repository.upsert_active_alert(
                        portfolio_id=portfolio.id,
                        holding_id=article.holding_id,
                        ticker=article.ticker,
                        source_kind=self.SOURCE_KIND_ARTICLE,
                        source_article_id=article.id,
                        source_summary_id=None,
                        alert_type=detection.alert_type,
                        severity=detection.severity,
                        title=detection.title,
                        message=detection.message,
                        detector_name=self._detector_name(detection),
                    )
                    if created:
                        created_count += 1
                    else:
                        updated_count += 1

            await self.db.commit()
        except Exception:
            await self.db.rollback()
            raise

        if detected_count == 0:
            notes.append("No alert rules matched against the current local article set.")
        if updated_count:
            notes.append(
                f"Updated {updated_count} active alert row(s) on repeated refresh."
            )

        active_alerts = await self.alert_repository.list_active_by_portfolio(
            portfolio.id,
            limit=self.ALERT_LIST_LIMIT,
        )
        return AlertRefreshResponse(
            portfolio_id=portfolio.id,
            portfolio_name=portfolio.name,
            detected_count=detected_count,
            created_count=created_count,
            updated_count=updated_count,
            active_alert_count=len(active_alerts),
            alerts=[self._to_alert_read(row) for row in active_alerts],
            notes=notes,
        )

    async def list_portfolio_active_alerts(
        self,
        portfolio_id: int,
        limit: int,
    ) -> PortfolioAlertsListResponse:
        portfolio = await self.portfolio_repository.get_by_id(portfolio_id)
        if portfolio is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Portfolio with id {portfolio_id} not found",
            )

        active_alerts = await self.alert_repository.list_active_by_portfolio(
            portfolio.id,
            limit=limit,
        )
        notes: list[str] = []
        if not active_alerts:
            notes.append("No active alerts are currently stored for this portfolio.")

        return PortfolioAlertsListResponse(
            portfolio_id=portfolio.id,
            portfolio_name=portfolio.name,
            active_alert_count=len(active_alerts),
            alerts=[self._to_alert_read(row) for row in active_alerts],
            notes=notes,
        )

    @staticmethod
    def _sentiment_label_for_article(
        article_id: int,
        sentiments_by_article_id: dict[int, ArticleSentiment],
    ) -> str | None:
        row = sentiments_by_article_id.get(article_id)
        if row is None:
            return None
        return getattr(row, "sentiment_label", None)

    @staticmethod
    def _sentiment_score_for_article(
        article_id: int,
        sentiments_by_article_id: dict[int, ArticleSentiment],
    ) -> float | None:
        row = sentiments_by_article_id.get(article_id)
        if row is None:
            return None
        value = getattr(row, "sentiment_score", None)
        if value is None:
            return None
        if isinstance(value, Decimal):
            return float(value)
        return float(value)

    def _detector_name(self, detection: AlertDetectionResult) -> str:
        if detection.rule_key:
            return f"{getattr(self.alert_detector, 'DETECTOR_NAME', 'custom_detector')}:{detection.rule_key}"
        return getattr(self.alert_detector, "DETECTOR_NAME", "custom_detector")

    @staticmethod
    def _to_alert_read(row: Alert) -> AlertRead:
        detected_at = row.triggered_at
        if detected_at.tzinfo is None:
            detected_at = detected_at.replace(tzinfo=UTC)
        else:
            detected_at = detected_at.astimezone(UTC)

        return AlertRead(
            id=row.id,
            portfolio_id=row.portfolio_id,
            holding_id=row.holding_id,
            ticker=row.ticker,
            source_kind=row.source_kind or "article",
            source_article_id=row.source_article_id,
            source_summary_id=row.source_summary_id,
            alert_type=row.alert_type,
            severity=row.severity,
            title=row.title,
            message=row.message,
            is_active=row.is_active,
            detected_at=detected_at,
            detector_name=row.detector_name,
        )
