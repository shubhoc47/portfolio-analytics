"""
Core analytics service.

Calculates deterministic and explainable analytics using portfolio + holdings data.
"""

from collections import defaultdict
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.holding import Holding
from app.models.portfolio import Portfolio
from app.repositories.holding import HoldingRepository
from app.repositories.portfolio import PortfolioRepository
from app.schemas.analytics import (
    AnalyticsSummaryRead,
    DiversificationBreakdownRead,
    DiversificationScoreRead,
    HealthBreakdownRead,
    HealthScoreRead,
    RiskBreakdownRead,
    RiskScoreRead,
    SectorExposureItemRead,
    SectorExposureRead,
)


class AnalyticsService:
    """Business logic for portfolio analytics endpoints."""

    # Fallback mapping for demo/seeded analytics when sector is missing.
    TICKER_TO_SECTOR = {
        "AAPL": "Technology",
        "NVDA": "Technology",
        "MSFT": "Technology",
        "KO": "Consumer Defensive",
        "JNJ": "Healthcare",
        "PG": "Consumer Defensive",
        "VOO": "ETF",
        "QQQ": "ETF",
        "VTI": "ETF",
    }

    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.portfolio_repository = PortfolioRepository(db)
        self.holding_repository = HoldingRepository(db)

    async def get_sector_exposure(self, portfolio_id: int, user_id: int) -> SectorExposureRead:
        portfolio, holdings = await self._load_portfolio_and_holdings(portfolio_id, user_id)
        return self._compute_sector_exposure(portfolio, holdings)

    async def get_diversification_score(self, portfolio_id: int, user_id: int) -> DiversificationScoreRead:
        portfolio, holdings = await self._load_portfolio_and_holdings(portfolio_id, user_id)
        return self._compute_diversification_score(portfolio, holdings)

    async def get_risk_score(self, portfolio_id: int, user_id: int) -> RiskScoreRead:
        portfolio, holdings = await self._load_portfolio_and_holdings(portfolio_id, user_id)
        return self._compute_risk_score(portfolio, holdings)

    async def get_health_score(self, portfolio_id: int, user_id: int) -> HealthScoreRead:
        portfolio, holdings = await self._load_portfolio_and_holdings(portfolio_id, user_id)
        diversification = self._compute_diversification_score(portfolio, holdings)
        risk = self._compute_risk_score(portfolio, holdings)
        return self._compute_health_score(portfolio, holdings, diversification, risk)

    async def get_summary(self, portfolio_id: int, user_id: int) -> AnalyticsSummaryRead:
        portfolio, holdings = await self._load_portfolio_and_holdings(portfolio_id, user_id)
        sector_exposure = self._compute_sector_exposure(portfolio, holdings)
        diversification = self._compute_diversification_score(portfolio, holdings)
        risk = self._compute_risk_score(portfolio, holdings)
        health = self._compute_health_score(portfolio, holdings, diversification, risk)

        return AnalyticsSummaryRead(
            portfolio_id=portfolio.id,
            portfolio_name=portfolio.name,
            sector_exposure=sector_exposure,
            diversification=diversification,
            risk=risk,
            health=health,
        )

    async def _load_portfolio_and_holdings(
        self,
        portfolio_id: int,
        user_id: int,
    ) -> tuple[Portfolio, list[Holding]]:
        portfolio = await self.portfolio_repository.get_by_id_for_user(portfolio_id, user_id)
        if portfolio is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Portfolio with id {portfolio_id} not found",
            )

        holdings = await self.holding_repository.list_by_portfolio(portfolio_id)
        return portfolio, holdings

    def _compute_sector_exposure(
        self,
        portfolio: Portfolio,
        holdings: list[Holding],
    ) -> SectorExposureRead:
        notes: list[str] = []
        if not holdings:
            notes.append("Portfolio has no holdings; sector exposure is empty.")
            return SectorExposureRead(
                portfolio_id=portfolio.id,
                portfolio_name=portfolio.name,
                total_holdings=0,
                total_value_basis=0.0,
                sector_exposure=[],
                notes=notes,
            )

        sector_values: dict[str, Decimal] = defaultdict(lambda: Decimal("0"))
        sector_counts: dict[str, int] = defaultdict(int)

        for holding in holdings:
            sector_name, used_fallback = self._resolve_sector_name(holding)
            if used_fallback:
                if sector_name == "Unknown":
                    notes.append(
                        f"Sector metadata unavailable for ticker {holding.ticker}; "
                        "set a sector on the holding."
                    )
                else:
                    notes.append(
                        f"Used fallback sector mapping for ticker {holding.ticker}."
                    )

            holding_value = self._holding_value_basis(holding)
            sector_values[sector_name] += holding_value
            sector_counts[sector_name] += 1

        total_value = sum(sector_values.values(), Decimal("0"))
        total_value_float = float(total_value)

        exposure_items: list[SectorExposureItemRead] = []
        for sector_name, sector_value in sorted(
            sector_values.items(),
            key=lambda item: item[1],
            reverse=True,
        ):
            weight = 0.0 if total_value == 0 else float((sector_value / total_value) * 100)
            exposure_items.append(
                SectorExposureItemRead(
                    sector=sector_name,
                    weight_percent=round(weight, 2),
                    holding_count=sector_counts[sector_name],
                )
            )

        if not notes:
            notes.append("Sector exposure computed from holding sectors and cost-basis weights.")

        return SectorExposureRead(
            portfolio_id=portfolio.id,
            portfolio_name=portfolio.name,
            total_holdings=len(holdings),
            total_value_basis=round(total_value_float, 2),
            sector_exposure=exposure_items,
            notes=sorted(set(notes)),
        )

    def _compute_diversification_score(
        self,
        portfolio: Portfolio,
        holdings: list[Holding],
    ) -> DiversificationScoreRead:
        exposure = self._compute_sector_exposure(portfolio, holdings)
        notes = list(exposure.notes)

        if not holdings:
            notes.append("Diversification score is 0 because portfolio has no holdings.")
            return DiversificationScoreRead(
                portfolio_id=portfolio.id,
                portfolio_name=portfolio.name,
                score=0,
                label="Poor",
                breakdown=DiversificationBreakdownRead(
                    sector_count=0,
                    max_sector_concentration_percent=0,
                    holding_count=0,
                    sector_breadth_points=0,
                    concentration_points=0,
                    holding_count_points=0,
                    notes=sorted(set(notes)),
                ),
            )

        sector_count = len(exposure.sector_exposure)
        holding_count = len(holdings)
        max_sector_concentration = (
            max(item.weight_percent for item in exposure.sector_exposure)
            if exposure.sector_exposure
            else 0.0
        )

        # Scoring logic (0-100 total):
        # - sector breadth up to 40 points (8 points per sector, capped at 5 sectors)
        # - concentration up to 40 points (lower concentration => higher score)
        # - holding count up to 20 points (4 points per holding, capped at 5 holdings)
        sector_breadth_points = min(sector_count, 5) * 8.0
        concentration_points = max(0.0, 40.0 - (max_sector_concentration * 0.4))
        holding_count_points = min(holding_count, 5) * 4.0

        score = round(
            min(100.0, sector_breadth_points + concentration_points + holding_count_points),
            2,
        )
        label = self._score_label(score)

        if sector_count <= 1:
            notes.append("Portfolio is concentrated in one sector.")
        if holding_count < 5:
            notes.append("Portfolio contains a small number of holdings.")

        return DiversificationScoreRead(
            portfolio_id=portfolio.id,
            portfolio_name=portfolio.name,
            score=score,
            label=label,
            breakdown=DiversificationBreakdownRead(
                sector_count=sector_count,
                max_sector_concentration_percent=round(max_sector_concentration, 2),
                holding_count=holding_count,
                sector_breadth_points=round(sector_breadth_points, 2),
                concentration_points=round(concentration_points, 2),
                holding_count_points=round(holding_count_points, 2),
                notes=sorted(set(notes)),
            ),
        )

    def _compute_risk_score(
        self,
        portfolio: Portfolio,
        holdings: list[Holding],
    ) -> RiskScoreRead:
        exposure = self._compute_sector_exposure(portfolio, holdings)
        notes = list(exposure.notes)

        if not holdings:
            notes.append("Risk score is 0 because portfolio has no holdings.")
            return RiskScoreRead(
                portfolio_id=portfolio.id,
                portfolio_name=portfolio.name,
                score=0,
                risk_level="Low",
                breakdown=RiskBreakdownRead(
                    max_sector_concentration_percent=0,
                    sector_count=0,
                    holding_count=0,
                    etf_holding_percent=0,
                    concentration_points=0,
                    single_sector_penalty=0,
                    holding_count_penalty=0,
                    etf_mix_adjustment=0,
                    notes=sorted(set(notes)),
                ),
            )

        holding_count = len(holdings)
        sector_count = len(exposure.sector_exposure)
        max_sector_concentration = (
            max(item.weight_percent for item in exposure.sector_exposure)
            if exposure.sector_exposure
            else 0.0
        )

        etf_holding_count = sum(
            1 for holding in holdings if (holding.asset_type or "").strip().lower() == "etf"
        )
        etf_holding_percent = (etf_holding_count / holding_count) * 100

        # Risk scoring logic (0-100, higher is riskier):
        # - concentration risk up to 60 points from max sector concentration
        # - single-sector penalty up to 20 points
        # - small portfolio penalty up to 20 points
        # - ETF-heavy mix can reduce risk by up to 10 points
        concentration_points = min(60.0, max_sector_concentration * 0.6)
        single_sector_penalty = 20.0 if sector_count <= 1 else 0.0
        holding_count_penalty = max(0.0, 20.0 - min(holding_count, 5) * 4.0)
        etf_mix_adjustment = min(10.0, etf_holding_percent * 0.1)

        score = round(
            max(
                0.0,
                min(
                    100.0,
                    concentration_points
                    + single_sector_penalty
                    + holding_count_penalty
                    - etf_mix_adjustment,
                ),
            ),
            2,
        )

        if score >= 70:
            risk_level = "High"
        elif score >= 40:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        if max_sector_concentration >= 60:
            notes.append("Large concentration in one sector increases risk.")
        if sector_count <= 1:
            notes.append("Single-sector exposure increases risk.")
        if holding_count < 5:
            notes.append("Low holding count increases concentration risk.")
        if etf_holding_percent >= 50:
            notes.append("ETF allocation provides some diversification risk offset.")

        return RiskScoreRead(
            portfolio_id=portfolio.id,
            portfolio_name=portfolio.name,
            score=score,
            risk_level=risk_level,
            breakdown=RiskBreakdownRead(
                max_sector_concentration_percent=round(max_sector_concentration, 2),
                sector_count=sector_count,
                holding_count=holding_count,
                etf_holding_percent=round(etf_holding_percent, 2),
                concentration_points=round(concentration_points, 2),
                single_sector_penalty=round(single_sector_penalty, 2),
                holding_count_penalty=round(holding_count_penalty, 2),
                etf_mix_adjustment=round(etf_mix_adjustment, 2),
                notes=sorted(set(notes)),
            ),
        )

    def _compute_health_score(
        self,
        portfolio: Portfolio,
        holdings: list[Holding],
        diversification: DiversificationScoreRead,
        risk: RiskScoreRead,
    ) -> HealthScoreRead:
        notes: list[str] = []

        if not holdings:
            notes.append("Health score is 0 because portfolio has no holdings.")
            return HealthScoreRead(
                portfolio_id=portfolio.id,
                portfolio_name=portfolio.name,
                score=0,
                label="Poor",
                breakdown=HealthBreakdownRead(
                    diversification_score=diversification.score,
                    risk_score=risk.score,
                    diversification_contribution=0,
                    inverse_risk_contribution=0,
                    notes=notes,
                ),
            )

        # Health scoring logic (0-100, higher is healthier):
        # - 60% contribution from diversification score
        # - 40% contribution from inverse risk score
        diversification_contribution = diversification.score * 0.6
        inverse_risk_contribution = (100 - risk.score) * 0.4
        score = round(
            min(100.0, max(0.0, diversification_contribution + inverse_risk_contribution)),
            2,
        )
        label = self._score_label(score)

        notes.append("Health score blends diversification (60%) and inverse risk (40%).")

        return HealthScoreRead(
            portfolio_id=portfolio.id,
            portfolio_name=portfolio.name,
            score=score,
            label=label,
            breakdown=HealthBreakdownRead(
                diversification_score=diversification.score,
                risk_score=risk.score,
                diversification_contribution=round(diversification_contribution, 2),
                inverse_risk_contribution=round(inverse_risk_contribution, 2),
                notes=notes,
            ),
        )

    def _resolve_sector_name(self, holding: Holding) -> tuple[str, bool]:
        if holding.sector and holding.sector.strip():
            return holding.sector.strip(), False

        mapped_sector = self.TICKER_TO_SECTOR.get(holding.ticker.upper())
        if mapped_sector:
            return mapped_sector, True

        return "Unknown", True

    @staticmethod
    def _holding_value_basis(holding: Holding) -> Decimal:
        return holding.quantity * holding.average_cost

    @staticmethod
    def _score_label(score: float) -> str:
        if score >= 75:
            return "Strong"
        if score >= 50:
            return "Good"
        if score >= 30:
            return "Moderate"
        return "Poor"

