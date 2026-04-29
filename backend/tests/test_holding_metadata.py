"""Tests for holding sector input, suggestions, and analytics sector resolution."""

import asyncio
from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock

from app.models.holding import Holding
from app.models.portfolio import Portfolio
from app.schemas.holding import HoldingCreate, HoldingUpdate
from app.services.analytics_service import AnalyticsService
from app.services.holding_service import HoldingService


def _holding(*, ticker: str = "TSLA", sector: str | None = None) -> Holding:
    return Holding(
        id=1,
        portfolio_id=10,
        ticker=ticker,
        company_name=None,
        asset_type="Equity",
        sector=sector,
        quantity=Decimal("2"),
        average_cost=Decimal("400"),
        currency="USD",
    )


def test_holding_create_accepts_user_selected_sector():
    payload = HoldingCreate(
        ticker="tsla",
        asset_type=" Equity ",
        sector=" Consumer Cyclical ",
        quantity=Decimal("2"),
        average_cost=Decimal("360"),
    )

    assert payload.ticker == "TSLA"
    assert payload.asset_type == "Equity"
    assert payload.sector == "Consumer Cyclical"


def test_holding_update_accepts_user_selected_sector():
    payload = HoldingUpdate(
        sector=" Technology ",
    )

    assert payload.sector == "Technology"


def test_holding_service_suggests_sector_from_existing_holdings():
    service = HoldingService(MagicMock())
    service.holding_repository.suggest_sector_for_ticker = AsyncMock(
        return_value="Consumer Cyclical"
    )

    suggestion = asyncio.run(service.suggest_sector_for_ticker("tsla"))

    assert suggestion.ticker == "TSLA"
    assert suggestion.suggested_sector == "Consumer Cyclical"
    assert suggestion.source == "existing_holdings"
    service.holding_repository.suggest_sector_for_ticker.assert_awaited_once_with("TSLA")


def test_holding_service_returns_empty_sector_suggestion_when_no_match():
    service = HoldingService(MagicMock())
    service.holding_repository.suggest_sector_for_ticker = AsyncMock(return_value=None)

    suggestion = asyncio.run(service.suggest_sector_for_ticker("newco"))

    assert suggestion.ticker == "NEWCO"
    assert suggestion.suggested_sector is None
    assert suggestion.source == "none"


def test_analytics_uses_persisted_sector_for_sector_exposure():
    service = AnalyticsService(MagicMock())
    portfolio = Portfolio(id=10, user_id=42, name="EV", base_currency="USD")
    holding = _holding(sector="Consumer Cyclical")

    exposure = service._compute_sector_exposure(portfolio, [holding])

    assert exposure.sector_exposure[0].sector == "Consumer Cyclical"
    assert exposure.sector_exposure[0].weight_percent == 100
    assert exposure.notes == ["Sector exposure computed from holding sectors and cost-basis weights."]


def test_analytics_marks_unresolved_sector_as_unknown_with_actionable_note():
    service = AnalyticsService(MagicMock())
    portfolio = Portfolio(id=10, user_id=42, name="Unknowns", base_currency="USD")
    holding = _holding(ticker="UNMAPPED")

    exposure = service._compute_sector_exposure(portfolio, [holding])

    assert exposure.sector_exposure[0].sector == "Unknown"
    assert exposure.notes == [
        "Sector metadata unavailable for ticker UNMAPPED; set a sector on the holding."
    ]
