"""
Hierarchical summary generation (Part 11C).

Builds on local news (11A) and optional sentiment (11B). Summary providers never fetch news.
"""

from datetime import date, datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.providers.sentiment.rule_based import RuleBasedSentimentProvider
from app.providers.summary.base import (
    ArticleBatchSummaryInput,
    ArticleSummaryInput,
    DailyBriefSummaryInput,
    PortfolioSummaryInput,
    SummaryProvider,
    WeeklyBriefLineInput,
    WeeklyHoldingSummaryInput,
)
from app.providers.summary.template import TemplateSummaryProvider
from app.repositories.holding import HoldingRepository
from app.repositories.news import NewsRepository
from app.repositories.portfolio import PortfolioRepository
from app.repositories.sentiment import SentimentRepository
from app.repositories.summary import SummaryRepository
from app.schemas.summary import (
    DailyBriefsResponse,
    HoldingBriefItemRead,
    PortfolioSummaryResponse,
    WeeklyHoldingItemRead,
    WeeklyHoldingSummariesResponse,
)


class SummaryService:
    """Orchestrates grounded summaries from stored articles and prior briefs."""

    SENTIMENT_PROVIDER = RuleBasedSentimentProvider.PROVIDER_NAME
    WORD_TARGET = 120

    def __init__(self, db: AsyncSession, summary_provider: SummaryProvider) -> None:
        self.db = db
        self.summary_provider = summary_provider
        self.portfolio_repository = PortfolioRepository(db)
        self.holding_repository = HoldingRepository(db)
        self.news_repository = NewsRepository(db)
        self.sentiment_repository = SentimentRepository(db)
        self.summary_repository = SummaryRepository(db)

    def _today_utc(self) -> date:
        return datetime.now(timezone.utc).date()

    async def generate_daily_briefs(
        self,
        portfolio_id: int,
        summary_date: date | None,
    ) -> DailyBriefsResponse:
        day = summary_date or self._today_utc()
        portfolio = await self.portfolio_repository.get_by_id(portfolio_id)
        if portfolio is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Portfolio with id {portfolio_id} not found",
            )

        holdings = await self.holding_repository.list_by_portfolio(portfolio_id)
        if not holdings:
            return DailyBriefsResponse(
                portfolio_id=portfolio.id,
                portfolio_name=portfolio.name,
                summary_date=day,
                provider_name=TemplateSummaryProvider.PROVIDER_NAME,
                briefs=[],
                created_count=0,
                updated_count=0,
                notes=["Portfolio has no holdings; no daily briefs generated."],
            )

        created = 0
        updated = 0
        brief_reads: list[HoldingBriefItemRead] = []
        notes: list[str] = []

        try:
            for holding in holdings:
                articles = await self.news_repository.list_for_holding_on_calendar_date(
                    portfolio.id,
                    holding.id,
                    day,
                )
                article_ids = {a.id for a in articles}
                sentiments = await self.sentiment_repository.get_existing_by_articles_and_provider(
                    article_ids=article_ids,
                    provider_name=self.SENTIMENT_PROVIDER,
                )

                inputs: list[ArticleSummaryInput] = []
                for art in articles:
                    snippet = art.summary or art.content or art.title
                    sent = sentiments.get(art.id)
                    inputs.append(
                        ArticleSummaryInput(
                            title=art.title,
                            snippet=snippet,
                            sentiment_label=sent.sentiment_label if sent else None,
                        )
                    )

                batch = ArticleBatchSummaryInput(
                    ticker=holding.ticker.strip().upper(),
                    company_name=holding.company_name,
                    articles=inputs,
                )
                payload = DailyBriefSummaryInput(
                    provider_key=TemplateSummaryProvider.PROVIDER_NAME,
                    target_word_limit=self.WORD_TARGET,
                    batch=batch,
                )
                result = self.summary_provider.summarize_daily_brief(payload)

                row, was_created = await self.summary_repository.upsert_summary(
                    portfolio_id=portfolio.id,
                    holding_id=holding.id,
                    ticker=batch.ticker,
                    summary_type="daily_holding_brief",
                    summary_date=day,
                    title=f"{batch.ticker} — {day.isoformat()}",
                    content=result.content,
                    provider_name=result.provider_name,
                    model_name=None,
                    word_count=result.word_count,
                    source_article_count=len(articles),
                    source_brief_count=None,
                    source_summary_count=None,
                )
                if was_created:
                    created += 1
                else:
                    updated += 1

                brief_reads.append(
                    HoldingBriefItemRead(
                        ticker=batch.ticker,
                        summary_type="daily_holding_brief",
                        content=row.content,
                        word_count=row.word_count,
                        source_article_count=row.source_article_count,
                        source_brief_count=row.source_brief_count,
                        source_summary_count=row.source_summary_count,
                        generated_at=row.generated_at,
                    )
                )

            await self.db.commit()
        except Exception:
            await self.db.rollback()
            raise

        return DailyBriefsResponse(
            portfolio_id=portfolio.id,
            portfolio_name=portfolio.name,
            summary_date=day,
            provider_name=TemplateSummaryProvider.PROVIDER_NAME,
            briefs=brief_reads,
            created_count=created,
            updated_count=updated,
            notes=notes,
        )

    async def generate_weekly_holding_summaries(
        self,
        portfolio_id: int,
        window_end_date: date | None,
    ) -> WeeklyHoldingSummariesResponse:
        window_end = window_end_date or self._today_utc()
        window_start = window_end - timedelta(days=6)

        portfolio = await self.portfolio_repository.get_by_id(portfolio_id)
        if portfolio is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Portfolio with id {portfolio_id} not found",
            )

        holdings = await self.holding_repository.list_by_portfolio(portfolio_id)
        if not holdings:
            return WeeklyHoldingSummariesResponse(
                portfolio_id=portfolio.id,
                portfolio_name=portfolio.name,
                window_end_date=window_end,
                window_start_date=window_start,
                provider_name=TemplateSummaryProvider.PROVIDER_NAME,
                weekly_summaries=[],
                created_count=0,
                updated_count=0,
                notes=["Portfolio has no holdings; no weekly summaries generated."],
            )

        provider_name = TemplateSummaryProvider.PROVIDER_NAME
        created = 0
        updated = 0
        items: list[WeeklyHoldingItemRead] = []
        notes: list[str] = []

        try:
            for holding in holdings:
                daily_rows = await self.summary_repository.list_daily_briefs_for_holding_range(
                    portfolio_id=portfolio.id,
                    holding_id=holding.id,
                    start_date=window_start,
                    end_date=window_end,
                    provider_name=provider_name,
                )
                line_inputs = [
                    WeeklyBriefLineInput(
                        summary_date=row.summary_date.isoformat() if row.summary_date else "",
                        content=row.content,
                    )
                    for row in daily_rows
                    if row.summary_date is not None
                ]

                payload = WeeklyHoldingSummaryInput(
                    ticker=holding.ticker.strip().upper(),
                    company_name=holding.company_name,
                    daily_briefs=line_inputs,
                    provider_key=provider_name,
                    target_word_limit=self.WORD_TARGET,
                )
                result = self.summary_provider.summarize_weekly_holding(payload)

                if not line_inputs:
                    notes.append(
                        f"No daily briefs stored for {payload.ticker} in the 7-day window; "
                        "weekly summary will be minimal."
                    )

                row, was_created = await self.summary_repository.upsert_summary(
                    portfolio_id=portfolio.id,
                    holding_id=holding.id,
                    ticker=payload.ticker,
                    summary_type="weekly_holding_summary",
                    summary_date=window_end,
                    title=f"{payload.ticker} — week ending {window_end.isoformat()}",
                    content=result.content,
                    provider_name=result.provider_name,
                    model_name=None,
                    word_count=result.word_count,
                    source_article_count=None,
                    source_brief_count=len(line_inputs),
                    source_summary_count=None,
                )
                if was_created:
                    created += 1
                else:
                    updated += 1

                items.append(
                    WeeklyHoldingItemRead(
                        ticker=payload.ticker,
                        summary_type="weekly_holding_summary",
                        content=row.content,
                        word_count=row.word_count,
                        source_brief_count=row.source_brief_count,
                        generated_at=row.generated_at,
                    )
                )

            await self.db.commit()
        except Exception:
            await self.db.rollback()
            raise

        return WeeklyHoldingSummariesResponse(
            portfolio_id=portfolio.id,
            portfolio_name=portfolio.name,
            window_end_date=window_end,
            window_start_date=window_start,
            provider_name=provider_name,
            weekly_summaries=items,
            created_count=created,
            updated_count=updated,
            notes=notes,
        )

    async def generate_portfolio_summary(
        self,
        portfolio_id: int,
        anchor_date: date | None,
    ) -> PortfolioSummaryResponse:
        anchor = anchor_date or self._today_utc()
        window_start = anchor - timedelta(days=6)

        portfolio = await self.portfolio_repository.get_by_id(portfolio_id)
        if portfolio is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Portfolio with id {portfolio_id} not found",
            )

        holdings = await self.holding_repository.list_by_portfolio(portfolio_id)
        if not holdings:
            return PortfolioSummaryResponse(
                portfolio_id=portfolio.id,
                portfolio_name=portfolio.name,
                summary_type="portfolio_summary",
                anchor_date=anchor,
                provider_name=TemplateSummaryProvider.PROVIDER_NAME,
                content="This portfolio has no holdings yet.",
                word_count=5,
                source_summary_count=0,
                generated_at=datetime.now(timezone.utc),
                created=False,
                notes=["Portfolio has no holdings; summary not persisted."],
            )

        provider_name = TemplateSummaryProvider.PROVIDER_NAME
        weekly_rows = await self.summary_repository.list_weekly_holding_summaries_for_window_end(
            portfolio_id=portfolio.id,
            window_end=anchor,
            provider_name=provider_name,
        )

        lines: list[tuple[str, str]] = []
        notes: list[str] = []

        if weekly_rows:
            for row in weekly_rows:
                if row.ticker:
                    lines.append((row.ticker, row.content))
            notes.append("Portfolio summary used stored weekly holding summaries as inputs.")
        else:
            notes.append(
                "No weekly holding summaries for this window; rolled up stored daily briefs instead."
            )
            for holding in holdings:
                daily_rows = await self.summary_repository.list_daily_briefs_for_holding_range(
                    portfolio_id=portfolio.id,
                    holding_id=holding.id,
                    start_date=window_start,
                    end_date=anchor,
                    provider_name=provider_name,
                )
                if not daily_rows:
                    continue
                combined = " ".join(r.content for r in daily_rows)
                lines.append((holding.ticker.strip().upper(), combined))

        payload = PortfolioSummaryInput(
            portfolio_name=portfolio.name,
            lines=lines,
            provider_key=provider_name,
            target_word_limit=self.WORD_TARGET,
        )
        result = self.summary_provider.summarize_portfolio(payload)

        source_summary_count = len(lines)

        try:
            row, was_created = await self.summary_repository.upsert_summary(
                portfolio_id=portfolio.id,
                holding_id=None,
                ticker=None,
                summary_type="portfolio_summary",
                summary_date=anchor,
                title=f"{portfolio.name} — portfolio summary ({anchor.isoformat()})",
                content=result.content,
                provider_name=result.provider_name,
                model_name=None,
                word_count=result.word_count,
                source_article_count=None,
                source_brief_count=None,
                source_summary_count=source_summary_count,
            )
            await self.db.commit()
        except Exception:
            await self.db.rollback()
            raise

        return PortfolioSummaryResponse(
            portfolio_id=portfolio.id,
            portfolio_name=portfolio.name,
            summary_type="portfolio_summary",
            anchor_date=anchor,
            provider_name=result.provider_name,
            content=row.content,
            word_count=row.word_count,
            source_summary_count=row.source_summary_count,
            generated_at=row.generated_at,
            created=was_created,
            notes=notes,
        )
