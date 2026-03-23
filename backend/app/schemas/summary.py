"""
Summary / brief generation schemas (Part 11C).
"""

from datetime import date, datetime

from pydantic import BaseModel, Field


class DailyBriefsRequest(BaseModel):
    """Request body for daily holding brief generation."""

    summary_date: date | None = Field(
        default=None,
        description="Calendar day for briefs (UTC). Defaults to today.",
    )


class WeeklyHoldingSummariesRequest(BaseModel):
    """Rolling 7-day window ending on window_end_date (inclusive)."""

    window_end_date: date | None = Field(
        default=None,
        description="Last day of the 7-day window (UTC). Defaults to today.",
    )


class PortfolioSummaryRequest(BaseModel):
    """Portfolio summary anchored to a window end date (uses weekly or daily fallbacks)."""

    anchor_date: date | None = Field(
        default=None,
        description="Window end date for portfolio narrative (UTC). Defaults to today.",
    )


class HoldingBriefItemRead(BaseModel):
    """One stored daily holding brief."""

    ticker: str
    summary_type: str
    content: str
    word_count: int | None
    source_article_count: int | None
    source_brief_count: int | None = None
    source_summary_count: int | None = None
    generated_at: datetime


class DailyBriefsResponse(BaseModel):
    """Response for POST .../daily-briefs."""

    portfolio_id: int
    portfolio_name: str
    summary_date: date
    provider_name: str
    briefs: list[HoldingBriefItemRead]
    created_count: int = Field(ge=0)
    updated_count: int = Field(ge=0)
    notes: list[str] = Field(default_factory=list)


class WeeklyHoldingItemRead(BaseModel):
    ticker: str
    summary_type: str
    content: str
    word_count: int | None
    source_brief_count: int | None
    generated_at: datetime


class WeeklyHoldingSummariesResponse(BaseModel):
    portfolio_id: int
    portfolio_name: str
    window_end_date: date
    window_start_date: date
    provider_name: str
    weekly_summaries: list[WeeklyHoldingItemRead]
    created_count: int = Field(ge=0)
    updated_count: int = Field(ge=0)
    notes: list[str] = Field(default_factory=list)


class PortfolioSummaryResponse(BaseModel):
    portfolio_id: int
    portfolio_name: str
    summary_type: str
    anchor_date: date
    provider_name: str
    content: str
    word_count: int | None
    source_summary_count: int | None
    generated_at: datetime
    created: bool
    notes: list[str] = Field(default_factory=list)
