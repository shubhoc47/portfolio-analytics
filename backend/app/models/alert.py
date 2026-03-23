"""
Alert model.

Represents an alert generated for a portfolio and optionally a specific holding.
"""

from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Alert(Base):
    __tablename__ = "alert"

    id: Mapped[int] = mapped_column(primary_key=True)

    portfolio_id: Mapped[int] = mapped_column(
        ForeignKey("portfolio.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    holding_id: Mapped[int | None] = mapped_column(
        ForeignKey("holding.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    ticker: Mapped[str | None] = mapped_column(String(32), nullable=True, index=True)
    source_kind: Mapped[str | None] = mapped_column(String(50), nullable=True, index=True)
    source_article_id: Mapped[int | None] = mapped_column(
        ForeignKey("news_article.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    source_summary_id: Mapped[int | None] = mapped_column(
        ForeignKey("ai_summary.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    detector_name: Mapped[str | None] = mapped_column(String(100), nullable=True)

    alert_type: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    severity: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    triggered_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    portfolio: Mapped["Portfolio"] = relationship(back_populates="alerts")
    holding: Mapped["Holding | None"] = relationship()
    source_article: Mapped["NewsArticle | None"] = relationship()
    source_summary: Mapped["AISummary | None"] = relationship()

