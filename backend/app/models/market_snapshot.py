"""
MarketSnapshot model.

Represents a daily (or intraday) snapshot of market data for a holding.
"""

from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, ForeignKey, Index, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class MarketSnapshot(Base):
    __tablename__ = "market_snapshot"
    __table_args__ = (
        Index("ix_market_snapshot_ticker_date", "ticker", "snapshot_date"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    holding_id: Mapped[int] = mapped_column(
        ForeignKey("holding.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    ticker: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    snapshot_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)

    open_price: Mapped[Decimal | None] = mapped_column(Numeric(18, 4), nullable=True)
    close_price: Mapped[Decimal | None] = mapped_column(Numeric(18, 4), nullable=True)
    high_price: Mapped[Decimal | None] = mapped_column(Numeric(18, 4), nullable=True)
    low_price: Mapped[Decimal | None] = mapped_column(Numeric(18, 4), nullable=True)
    volume: Mapped[int | None] = mapped_column(nullable=True)
    daily_return_percent: Mapped[Decimal | None] = mapped_column(Numeric(7, 4), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    holding: Mapped["Holding"] = relationship(back_populates="market_snapshots")

