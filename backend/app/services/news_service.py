"""
News ingestion service.
"""

from datetime import UTC, datetime
import hashlib
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.holding import Holding
from app.models.news_article import NewsArticle
from app.providers.news.base import NewsProvider, ProviderArticle
from app.repositories.holding import HoldingRepository
from app.repositories.news import NewsRepository
from app.repositories.portfolio import PortfolioRepository
from app.schemas.news import (
    NewsNormalizedArticle,
    NewsRefreshResponse,
    PortfolioNewsListResponse,
)


class NewsService:
    """Business logic for portfolio-aware news ingestion."""

    _TRACKING_QUERY_PARAMS = {"gclid", "fbclid", "mc_cid", "mc_eid"}

    def __init__(self, db: AsyncSession, news_provider: NewsProvider) -> None:
        self.db = db
        self.news_provider = news_provider
        self.portfolio_repository = PortfolioRepository(db)
        self.holding_repository = HoldingRepository(db)
        self.news_repository = NewsRepository(db)

    async def refresh_portfolio_news(self, portfolio_id: int, user_id: int) -> NewsRefreshResponse:
        portfolio = await self.portfolio_repository.get_by_id_for_user(portfolio_id, user_id)
        if portfolio is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Portfolio with id {portfolio_id} not found",
            )

        holdings = await self.holding_repository.list_by_portfolio(portfolio_id)
        ordered_tickers = self._extract_ordered_tickers(holdings)
        if not ordered_tickers:
            return NewsRefreshResponse(
                portfolio_id=portfolio.id,
                portfolio_name=portfolio.name,
                tickers=[],
                fetched_count=0,
                inserted_count=0,
                deduplicated_count=0,
                articles=[],
                notes=["Portfolio has no holdings, so no news could be fetched."],
            )

        holding_id_by_ticker = {holding.ticker.strip().upper(): holding.id for holding in holdings}
        fallback_ticker = ordered_tickers[0]
        raw_articles = self.news_provider.fetch_articles(
            ordered_tickers,
            portfolio_name=portfolio.name,
        )
        fetched_count = len(raw_articles)
        if fetched_count == 0:
            return NewsRefreshResponse(
                portfolio_id=portfolio.id,
                portfolio_name=portfolio.name,
                tickers=ordered_tickers,
                fetched_count=0,
                inserted_count=0,
                deduplicated_count=0,
                articles=[],
                notes=["Provider returned no articles for the requested tickers."],
            )

        normalized_articles: list[NewsNormalizedArticle] = []
        invalid_count = 0
        for raw_article in raw_articles:
            normalized = self._normalize_article(
                raw_article,
                holding_id_by_ticker=holding_id_by_ticker,
                fallback_ticker=fallback_ticker,
            )
            if normalized is None:
                invalid_count += 1
                continue
            normalized_articles.append(normalized)

        unique_batch_articles, batch_duplicates = self._dedupe_batch(normalized_articles)

        existing_urls = await self.news_repository.get_existing_urls(
            {article.url for article in unique_batch_articles}
        )
        existing_hashes = await self.news_repository.get_existing_hashes(
            {article.dedupe_hash for article in unique_batch_articles}
        )
        existing_external_ids = await self.news_repository.get_existing_external_ids(
            {
                article.external_id
                for article in unique_batch_articles
                if article.external_id is not None
            }
        )

        to_insert = [
            article
            for article in unique_batch_articles
            if article.url not in existing_urls
            and article.dedupe_hash not in existing_hashes
            and (article.external_id is None or article.external_id not in existing_external_ids)
        ]
        db_duplicates = len(unique_batch_articles) - len(to_insert)

        inserted_rows: list[NewsArticle] = []
        if to_insert:
            try:
                inserted_rows = await self.news_repository.create_many(to_insert)
                await self.db.commit()
            except Exception:
                await self.db.rollback()
                raise

        notes: list[str] = []
        if invalid_count:
            notes.append(f"Skipped {invalid_count} invalid provider article(s) during normalization.")
        if batch_duplicates:
            notes.append(
                f"Skipped {batch_duplicates} duplicate article(s) from provider batch."
            )
        if db_duplicates:
            notes.append(f"Skipped {db_duplicates} article(s) already present in database.")
        if not inserted_rows and not notes:
            notes.append("No new articles were inserted.")

        return NewsRefreshResponse(
            portfolio_id=portfolio.id,
            portfolio_name=portfolio.name,
            tickers=ordered_tickers,
            fetched_count=fetched_count,
            inserted_count=len(inserted_rows),
            deduplicated_count=batch_duplicates + db_duplicates,
            articles=inserted_rows,
            notes=notes,
        )

    async def list_portfolio_news(
        self,
        portfolio_id: int,
        user_id: int,
        *,
        limit: int = 100,
    ) -> PortfolioNewsListResponse:
        portfolio = await self.portfolio_repository.get_by_id_for_user(portfolio_id, user_id)
        if portfolio is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Portfolio with id {portfolio_id} not found",
            )

        holdings = await self.holding_repository.list_by_portfolio(portfolio_id)
        ordered_tickers = self._extract_ordered_tickers(holdings)
        if not ordered_tickers:
            return PortfolioNewsListResponse(
                portfolio_id=portfolio.id,
                portfolio_name=portfolio.name,
                tickers=[],
                total_articles=0,
                articles=[],
            )

        articles = await self.news_repository.list_by_portfolio_id(
            portfolio_id=portfolio.id,
            limit=limit,
        )
        return PortfolioNewsListResponse(
            portfolio_id=portfolio.id,
            portfolio_name=portfolio.name,
            tickers=ordered_tickers,
            total_articles=len(articles),
            articles=articles,
        )

    @staticmethod
    def _extract_ordered_tickers(holdings: list[Holding]) -> list[str]:
        tickers: list[str] = []
        seen: set[str] = set()

        for holding in holdings:
            ticker = holding.ticker.strip().upper()
            if ticker in seen:
                continue
            seen.add(ticker)
            tickers.append(ticker)
        return tickers

    def _normalize_article(
        self,
        article: ProviderArticle,
        *,
        holding_id_by_ticker: dict[str, int],
        fallback_ticker: str,
    ) -> NewsNormalizedArticle | None:
        title = article.title.strip()
        source = article.source.strip()
        if not title or not source or not article.url.strip():
            return None

        ticker = article.ticker.strip().upper() if article.ticker else fallback_ticker
        if ticker not in holding_id_by_ticker:
            ticker = fallback_ticker

        published_at = self._normalize_published_at(article.published_at)
        canonical_url = self._canonicalize_url(article.url)
        dedupe_hash = self._build_dedupe_hash(
            source=source,
            title=title,
            published_at=published_at,
            ticker=ticker,
        )

        return NewsNormalizedArticle(
            external_id=article.external_id,
            ticker=ticker,
            title=title,
            source=source,
            url=canonical_url,
            published_at=published_at,
            author=article.author,
            summary=article.summary,
            content=article.content,
            dedupe_hash=dedupe_hash,
            holding_id=holding_id_by_ticker.get(ticker),
        )

    @staticmethod
    def _normalize_published_at(published_at: datetime) -> datetime:
        if published_at.tzinfo is None:
            return published_at.replace(tzinfo=UTC)
        return published_at.astimezone(UTC)

    @classmethod
    def _canonicalize_url(cls, raw_url: str) -> str:
        """
        Canonicalize URL to make deduplication resilient to tracking params.
        """

        candidate = raw_url.strip()
        parsed = urlparse(candidate)
        if not parsed.scheme or not parsed.netloc:
            return candidate

        filtered_query_pairs = []
        for key, value in parse_qsl(parsed.query, keep_blank_values=True):
            lowered = key.lower()
            if lowered.startswith("utm_") or lowered in cls._TRACKING_QUERY_PARAMS:
                continue
            filtered_query_pairs.append((key, value))

        normalized_path = parsed.path.rstrip("/") or "/"
        normalized_query = urlencode(filtered_query_pairs, doseq=True)
        return urlunparse(
            (
                parsed.scheme.lower(),
                parsed.netloc.lower(),
                normalized_path,
                "",
                normalized_query,
                "",
            )
        )

    @staticmethod
    def _build_dedupe_hash(
        *,
        source: str,
        title: str,
        published_at: datetime,
        ticker: str,
    ) -> str:
        dedupe_input = (
            f"{source.strip().lower()}|"
            f"{title.strip().lower()}|"
            f"{published_at.isoformat()}|"
            f"{ticker.strip().upper()}"
        )
        return hashlib.sha256(dedupe_input.encode("utf-8")).hexdigest()

    @staticmethod
    def _dedupe_batch(
        articles: list[NewsNormalizedArticle],
    ) -> tuple[list[NewsNormalizedArticle], int]:
        unique_articles: list[NewsNormalizedArticle] = []
        seen_external_ids: set[str] = set()
        seen_urls: set[str] = set()
        seen_hashes: set[str] = set()
        duplicate_count = 0

        for article in articles:
            has_external_id_duplicate = (
                article.external_id is not None and article.external_id in seen_external_ids
            )
            if (
                has_external_id_duplicate
                or article.url in seen_urls
                or article.dedupe_hash in seen_hashes
            ):
                duplicate_count += 1
                continue

            if article.external_id is not None:
                seen_external_ids.add(article.external_id)
            seen_urls.add(article.url)
            seen_hashes.add(article.dedupe_hash)
            unique_articles.append(article)

        return unique_articles, duplicate_count

