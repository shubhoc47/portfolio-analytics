"""
AISummary model.

Represents persisted generated summaries (daily briefs, weekly holding, portfolio-level).
"""

from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class AISummary(Base):
    __tablename__ = "ai_summary"

    id: Mapped[int] = mapped_column(primary_key=True)

    portfolio_id: Mapped[int] = mapped_column(
        ForeignKey("portfolio.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    holding_id: Mapped[int | None] = mapped_column(
        ForeignKey("holding.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )

    ticker: Mapped[str | None] = mapped_column(String(32), nullable=True, index=True)

    summary_type: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    """One of: daily_holding_brief, weekly_holding_summary, portfolio_summary."""

    summary_date: Mapped[date | None] = mapped_column(Date(), nullable=True, index=True)
    """Anchor calendar date: day for daily brief; window end for weekly/portfolio."""

    title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    model_name: Mapped[str | None] = mapped_column(String(200), nullable=True)

    provider_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    """Summary strategy/provider id (e.g. template_v1)."""

    word_count: Mapped[int | None] = mapped_column(Integer(), nullable=True)
    source_article_count: Mapped[int | None] = mapped_column(Integer(), nullable=True)
    source_brief_count: Mapped[int | None] = mapped_column(Integer(), nullable=True)
    source_summary_count: Mapped[int | None] = mapped_column(Integer(), nullable=True)

    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    portfolio: Mapped["Portfolio"] = relationship(back_populates="ai_summaries")
    holding: Mapped["Holding | None"] = relationship()

