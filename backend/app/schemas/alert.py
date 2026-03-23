"""
Alert engine schemas (Part 11D).
"""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


AlertSeverity = Literal["low", "medium", "high", "critical"]
AlertSourceKind = Literal["article", "daily_brief", "weekly_summary"]


class AlertRead(BaseModel):
    """Stored alert row returned by alerts endpoints."""

    id: int
    portfolio_id: int
    holding_id: int | None
    ticker: str | None
    source_kind: AlertSourceKind
    source_article_id: int | None
    source_summary_id: int | None
    alert_type: str
    severity: AlertSeverity
    title: str
    message: str
    is_active: bool
    detected_at: datetime
    detector_name: str | None


class AlertRefreshResponse(BaseModel):
    """Response payload for POST .../alerts/portfolios/{portfolio_id}/refresh."""

    portfolio_id: int
    portfolio_name: str
    detected_count: int = Field(ge=0)
    created_count: int = Field(ge=0)
    updated_count: int = Field(ge=0)
    active_alert_count: int = Field(ge=0)
    alerts: list[AlertRead] = Field(default_factory=list)
    notes: list[str] = Field(default_factory=list)


class PortfolioAlertsListResponse(BaseModel):
    """Response payload for GET .../alerts/portfolios/{portfolio_id}."""

    portfolio_id: int
    portfolio_name: str
    active_alert_count: int = Field(ge=0)
    alerts: list[AlertRead] = Field(default_factory=list)
    notes: list[str] = Field(default_factory=list)
