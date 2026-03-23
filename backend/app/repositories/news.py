"""
News repository.

Contains only data-access logic for news article entities.
"""

from datetime import date, datetime, time, timezone

from sqlalchemy import Select, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.holding import Holding
from app.models.news_article import NewsArticle
from app.schemas.news import NewsNormalizedArticle


class NewsRepository:
    """Database operations for the NewsArticle model."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_existing_urls(self, urls: set[str]) -> set[str]:
        if not urls:
            return set()

        stmt = select(NewsArticle.url).where(NewsArticle.url.in_(urls))
        result = await self.db.execute(stmt)
        return set(result.scalars().all())

    async def get_existing_hashes(self, dedupe_hashes: set[str]) -> set[str]:
        if not dedupe_hashes:
            return set()

        stmt = select(NewsArticle.dedupe_hash).where(NewsArticle.dedupe_hash.in_(dedupe_hashes))
        result = await self.db.execute(stmt)
        return {value for value in result.scalars().all() if value is not None}

    async def get_existing_external_ids(self, external_ids: set[str]) -> set[str]:
        if not external_ids:
            return set()

        stmt = select(NewsArticle.external_id).where(NewsArticle.external_id.in_(external_ids))
        result = await self.db.execute(stmt)
        return {value for value in result.scalars().all() if value is not None}

    async def create_many(self, articles: list[NewsNormalizedArticle]) -> list[NewsArticle]:
        if not articles:
            return []

        created_rows: list[NewsArticle] = []
        for article in articles:
            row = NewsArticle(
                holding_id=article.holding_id,
                ticker=article.ticker,
                external_id=article.external_id,
                title=article.title,
                source=article.source,
                url=article.url,
                published_at=article.published_at,
                author=article.author,
                summary=article.summary,
                content=article.content,
                dedupe_hash=article.dedupe_hash,
            )
            self.db.add(row)
            created_rows.append(row)

        await self.db.flush()
        for row in created_rows:
            await self.db.refresh(row)
        return created_rows

    async def list_by_portfolio_id(self, portfolio_id: int, limit: int = 100) -> list[NewsArticle]:
        stmt: Select[tuple[NewsArticle]] = (
            select(NewsArticle)
            .join(Holding, NewsArticle.holding_id == Holding.id)
            .where(Holding.portfolio_id == portfolio_id)
            .order_by(NewsArticle.published_at.desc(), NewsArticle.id.desc())
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def list_for_holding_on_calendar_date(
        self,
        portfolio_id: int,
        holding_id: int,
        day: date,
    ) -> list[NewsArticle]:
        """Local articles for one holding whose published_at falls on `day` (UTC calendar day)."""
        start = datetime.combine(day, time.min, tzinfo=timezone.utc)
        end = datetime.combine(day, time.max, tzinfo=timezone.utc)

        stmt: Select[tuple[NewsArticle]] = (
            select(NewsArticle)
            .join(Holding, NewsArticle.holding_id == Holding.id)
            .where(
                Holding.portfolio_id == portfolio_id,
                Holding.id == holding_id,
                NewsArticle.published_at >= start,
                NewsArticle.published_at <= end,
            )
            .order_by(NewsArticle.published_at.desc(), NewsArticle.id.desc())
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

