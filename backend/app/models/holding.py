"""
Holding model.

Represents a single position inside a portfolio.
"""

from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Numeric, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Holding(Base):
    __tablename__ = "holding"
    __table_args__ = (
        UniqueConstraint("portfolio_id", "ticker", name="uq_holding_portfolio_ticker"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    portfolio_id: Mapped[int] = mapped_column(
        ForeignKey("portfolio.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    ticker: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    company_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    asset_type: Mapped[str] = mapped_column(String(50), nullable=False)
    sector: Mapped[str | None] = mapped_column(String(100), nullable=True)

    quantity: Mapped[Decimal] = mapped_column(Numeric(18, 4), nullable=False)
    average_cost: Mapped[Decimal] = mapped_column(Numeric(18, 4), nullable=False)
    current_price: Mapped[Decimal | None] = mapped_column(Numeric(18, 4), nullable=True)
    currency: Mapped[str] = mapped_column(String(10), nullable=False, default="USD")
    weight_percent: Mapped[Decimal | None] = mapped_column(Numeric(5, 2), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

    portfolio: Mapped["Portfolio"] = relationship(back_populates="holdings")
    market_snapshots: Mapped[list["MarketSnapshot"]] = relationship(
        back_populates="holding",
        cascade="all, delete-orphan",
    )
    news_articles: Mapped[list["NewsArticle"]] = relationship(
        back_populates="holding",
        cascade="all, delete-orphan",
    )
    analyst_ratings: Mapped[list["AnalystRating"]] = relationship(
        back_populates="holding",
        cascade="all, delete-orphan",
    )

