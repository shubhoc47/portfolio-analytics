"""
Analyst ratings enrichment service (Part 11E).
"""

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.analyst_rating import AnalystRating
from app.models.holding import Holding
from app.providers.ratings.base import RatingsProvider
from app.repositories.holding import HoldingRepository
from app.repositories.portfolio import PortfolioRepository
from app.repositories.ratings import RatingsRepository
from app.schemas.ratings import (
    AnalystRatingRead,
    AnalystRatingWrite,
    PortfolioRatingsListResponse,
    RatingsRefreshResponse,
)


class RatingsService:
    """Business logic for portfolio-aware ratings ingestion and normalization."""

    LIST_LIMIT = 200

    _BUY_LABELS = {
        "strong buy",
        "buy",
        "outperform",
        "market outperform",
        "overweight",
    }
    _HOLD_LABELS = {
        "hold",
        "neutral",
        "equal weight",
    }
    _SELL_LABELS = {
        "underperform",
        "sell",
    }

    def __init__(self, db: AsyncSession, ratings_provider: RatingsProvider) -> None:
        self.db = db
        self.ratings_provider = ratings_provider
        self.portfolio_repository = PortfolioRepository(db)
        self.holding_repository = HoldingRepository(db)
        self.ratings_repository = RatingsRepository(db)

    async def refresh_portfolio_ratings(self, portfolio_id: int, user_id: int) -> RatingsRefreshResponse:
        portfolio = await self.portfolio_repository.get_by_id_for_user(portfolio_id, user_id)
        if portfolio is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Portfolio with id {portfolio_id} not found",
            )

        holdings = await self.holding_repository.list_by_portfolio(portfolio_id)
        tickers = self._extract_ordered_tickers(holdings)
        if not tickers:
            return RatingsRefreshResponse(
                portfolio_id=portfolio.id,
                portfolio_name=portfolio.name,
                tickers=[],
                fetched_count=0,
                stored_count=0,
                created_count=0,
                updated_count=0,
                ratings=[],
                notes=["Portfolio has no holdings; no ratings were fetched."],
            )

        holding_id_by_ticker = {holding.ticker.strip().upper(): holding.id for holding in holdings}
        provider_rows = self.ratings_provider.fetch_ratings(
            tickers,
            portfolio_name=portfolio.name,
        )
        fetched_count = len(provider_rows)
        if not provider_rows:
            return RatingsRefreshResponse(
                portfolio_id=portfolio.id,
                portfolio_name=portfolio.name,
                tickers=tickers,
                fetched_count=0,
                stored_count=0,
                created_count=0,
                updated_count=0,
                ratings=[],
                notes=["Provider returned no ratings for the requested tickers."],
            )

        notes: list[str] = []
        payloads: list[AnalystRatingWrite] = []
        unknown_labels: set[str] = set()

        for row in provider_rows:
            ticker = row.ticker.strip().upper()
            holding_id = holding_id_by_ticker.get(ticker)
            if holding_id is None:
                notes.append(f"Skipped rating for {ticker}: ticker not found in selected portfolio.")
                continue

            normalized = self._normalize_rating(row.raw_rating)
            if normalized == "hold" and self._to_lookup_key(row.raw_rating) not in self._HOLD_LABELS:
                unknown_labels.add(row.raw_rating.strip())

            payloads.append(
                AnalystRatingWrite(
                    holding_id=holding_id,
                    ticker=ticker,
                    provider_name=row.provider_name.strip(),
                    firm_name=row.firm_name.strip(),
                    analyst_name=row.analyst_name.strip() if row.analyst_name else None,
                    raw_rating=row.raw_rating.strip(),
                    normalized_rating=normalized,
                    as_of_date=row.as_of_date,
                    price_target=row.price_target,
                    notes=row.notes,
                )
            )

        if not payloads:
            notes.append("No ratings could be mapped to portfolio holdings.")
            return RatingsRefreshResponse(
                portfolio_id=portfolio.id,
                portfolio_name=portfolio.name,
                tickers=tickers,
                fetched_count=fetched_count,
                stored_count=0,
                created_count=0,
                updated_count=0,
                ratings=[],
                notes=notes,
            )

        if unknown_labels:
            labels = ", ".join(sorted(unknown_labels))
            notes.append(
                "Unknown provider labels were mapped to hold by default: "
                f"{labels}."
            )

        try:
            rows, created_count, updated_count = await self.ratings_repository.upsert_many(payloads)
            await self.db.commit()
        except Exception:
            await self.db.rollback()
            raise

        return RatingsRefreshResponse(
            portfolio_id=portfolio.id,
            portfolio_name=portfolio.name,
            tickers=tickers,
            fetched_count=fetched_count,
            stored_count=len(rows),
            created_count=created_count,
            updated_count=updated_count,
            ratings=[self._to_read(item, portfolio_id=portfolio.id) for item in rows],
            notes=notes,
        )

    async def list_portfolio_ratings(
        self,
        portfolio_id: int,
        user_id: int,
        *,
        limit: int,
    ) -> PortfolioRatingsListResponse:
        portfolio = await self.portfolio_repository.get_by_id_for_user(portfolio_id, user_id)
        if portfolio is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Portfolio with id {portfolio_id} not found",
            )

        holdings = await self.holding_repository.list_by_portfolio(portfolio_id)
        tickers = self._extract_ordered_tickers(holdings)
        if not tickers:
            return PortfolioRatingsListResponse(
                portfolio_id=portfolio.id,
                portfolio_name=portfolio.name,
                tickers=[],
                total_ratings=0,
                ratings=[],
                notes=["Portfolio has no holdings; no ratings are available."],
            )

        rows = await self.ratings_repository.list_by_portfolio(portfolio.id, limit=limit)
        notes: list[str] = []
        if not rows:
            notes.append("No ratings are currently stored for this portfolio.")

        return PortfolioRatingsListResponse(
            portfolio_id=portfolio.id,
            portfolio_name=portfolio.name,
            tickers=tickers,
            total_ratings=len(rows),
            ratings=[self._to_read(item, portfolio_id=portfolio.id) for item in rows],
            notes=notes,
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

    @classmethod
    def _normalize_rating(cls, raw_rating: str) -> str:
        key = cls._to_lookup_key(raw_rating)
        if key in cls._BUY_LABELS:
            return "buy"
        if key in cls._SELL_LABELS:
            return "sell"
        return "hold"

    @staticmethod
    def _to_lookup_key(value: str) -> str:
        return value.strip().lower()

    @staticmethod
    def _to_read(row: AnalystRating, *, portfolio_id: int) -> AnalystRatingRead:
        return AnalystRatingRead(
            id=row.id,
            portfolio_id=portfolio_id,
            holding_id=row.holding_id,
            ticker=row.ticker,
            provider_name=row.provider_name,
            firm_name=row.firm_name,
            analyst_name=row.analyst_name,
            raw_rating=row.rating_raw,
            normalized_rating=row.rating_normalized,
            as_of_date=row.rating_date,
            price_target=row.target_price,
            notes=row.notes,
        )
