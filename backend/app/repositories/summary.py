"""
AI summary / brief persistence repository.
"""

from datetime import date, datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ai_summary import AISummary


class SummaryRepository:
    """Database operations for AISummary (Part 11C briefs and rollups)."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def get_by_natural_key(
        self,
        *,
        portfolio_id: int,
        summary_type: str,
        provider_name: str,
        summary_date: date,
        holding_id: int | None,
    ) -> AISummary | None:
        stmt = select(AISummary).where(
            AISummary.portfolio_id == portfolio_id,
            AISummary.summary_type == summary_type,
            AISummary.provider_name == provider_name,
            AISummary.summary_date == summary_date,
        )
        if holding_id is None:
            stmt = stmt.where(AISummary.holding_id.is_(None))
        else:
            stmt = stmt.where(AISummary.holding_id == holding_id)

        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def upsert_summary(
        self,
        *,
        portfolio_id: int,
        holding_id: int | None,
        ticker: str | None,
        summary_type: str,
        summary_date: date,
        title: str | None,
        content: str,
        provider_name: str,
        model_name: str | None,
        word_count: int | None,
        source_article_count: int | None = None,
        source_brief_count: int | None = None,
        source_summary_count: int | None = None,
    ) -> tuple[AISummary, bool]:
        """Insert or update one summary row. Returns (row, created)."""
        existing = await self.get_by_natural_key(
            portfolio_id=portfolio_id,
            summary_type=summary_type,
            provider_name=provider_name,
            summary_date=summary_date,
            holding_id=holding_id,
        )
        generated_at = datetime.now(timezone.utc)

        if existing:
            existing.ticker = ticker
            existing.title = title
            existing.content = content
            existing.model_name = model_name
            existing.word_count = word_count
            existing.source_article_count = source_article_count
            existing.source_brief_count = source_brief_count
            existing.source_summary_count = source_summary_count
            existing.generated_at = generated_at
            await self.db.flush()
            await self.db.refresh(existing)
            return existing, False

        row = AISummary(
            portfolio_id=portfolio_id,
            holding_id=holding_id,
            ticker=ticker,
            summary_type=summary_type,
            summary_date=summary_date,
            title=title,
            content=content,
            model_name=model_name,
            provider_name=provider_name,
            word_count=word_count,
            source_article_count=source_article_count,
            source_brief_count=source_brief_count,
            source_summary_count=source_summary_count,
            generated_at=generated_at,
        )
        self.db.add(row)
        await self.db.flush()
        await self.db.refresh(row)
        return row, True

    async def list_daily_briefs_for_holding_range(
        self,
        *,
        portfolio_id: int,
        holding_id: int,
        start_date: date,
        end_date: date,
        provider_name: str,
    ) -> list[AISummary]:
        stmt = (
            select(AISummary)
            .where(
                AISummary.portfolio_id == portfolio_id,
                AISummary.holding_id == holding_id,
                AISummary.summary_type == "daily_holding_brief",
                AISummary.provider_name == provider_name,
                AISummary.summary_date.is_not(None),
                AISummary.summary_date >= start_date,
                AISummary.summary_date <= end_date,
            )
            .order_by(AISummary.summary_date.asc())
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def list_weekly_holding_summaries_for_window_end(
        self,
        *,
        portfolio_id: int,
        window_end: date,
        provider_name: str,
    ) -> list[AISummary]:
        stmt = (
            select(AISummary)
            .where(
                AISummary.portfolio_id == portfolio_id,
                AISummary.summary_type == "weekly_holding_summary",
                AISummary.provider_name == provider_name,
                AISummary.summary_date == window_end,
                AISummary.holding_id.is_not(None),
            )
            .order_by(AISummary.ticker.asc())
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
