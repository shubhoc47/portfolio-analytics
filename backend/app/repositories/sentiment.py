"""
Sentiment repository.

Contains data-access logic for article sentiment entities.
"""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.article_sentiment import ArticleSentiment
from app.schemas.sentiment import ArticleSentimentWrite


class SentimentRepository:
    """Database operations for the ArticleSentiment model."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_existing_by_articles_and_provider(
        self,
        *,
        article_ids: set[int],
        provider_name: str,
    ) -> dict[int, ArticleSentiment]:
        if not article_ids:
            return {}

        stmt = select(ArticleSentiment).where(
            ArticleSentiment.article_id.in_(article_ids),
            ArticleSentiment.provider_name == provider_name,
        )
        result = await self.db.execute(stmt)
        rows = list(result.scalars().all())
        return {row.article_id: row for row in rows}

    async def upsert_many(
        self,
        payloads: list[ArticleSentimentWrite],
    ) -> tuple[list[ArticleSentiment], int, int]:
        if not payloads:
            return [], 0, 0

        provider_name = payloads[0].provider_name
        article_ids = {payload.article_id for payload in payloads}
        existing_by_article_id = await self.get_existing_by_articles_and_provider(
            article_ids=article_ids,
            provider_name=provider_name,
        )

        rows: list[ArticleSentiment] = []
        created_count = 0
        updated_count = 0

        for payload in payloads:
            existing = existing_by_article_id.get(payload.article_id)
            if existing is not None:
                existing.sentiment_label = payload.sentiment_label
                existing.sentiment_score = payload.sentiment_score
                existing.confidence = payload.confidence
                existing.rule_key = payload.rule_key
                rows.append(existing)
                updated_count += 1
                continue

            row = ArticleSentiment(
                article_id=payload.article_id,
                sentiment_label=payload.sentiment_label,
                sentiment_score=payload.sentiment_score,
                confidence=payload.confidence,
                provider_name=payload.provider_name,
                rule_key=payload.rule_key,
            )
            self.db.add(row)
            rows.append(row)
            created_count += 1

        await self.db.flush()
        for row in rows:
            await self.db.refresh(row)
        return rows, created_count, updated_count

