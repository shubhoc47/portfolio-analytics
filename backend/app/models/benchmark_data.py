"""
BenchmarkData model.

Represents benchmark index performance for a given date.
"""

from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, Index, Numeric, String, func, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class BenchmarkData(Base):
    __tablename__ = "benchmark_data"
    __table_args__ = (
        UniqueConstraint("benchmark_symbol", "date", name="uq_benchmark_symbol_date"),
        Index("ix_benchmark_symbol_date", "benchmark_symbol", "date"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    benchmark_symbol: Mapped[str] = mapped_column(String(50), nullable=False)
    benchmark_name: Mapped[str | None] = mapped_column(String(200), nullable=True)

    date: Mapped[date] = mapped_column(Date, nullable=False)

    open_price: Mapped[Decimal | None] = mapped_column(Numeric(18, 4), nullable=True)
    close_price: Mapped[Decimal] = mapped_column(Numeric(18, 4), nullable=False)
    high_price: Mapped[Decimal | None] = mapped_column(Numeric(18, 4), nullable=True)
    low_price: Mapped[Decimal | None] = mapped_column(Numeric(18, 4), nullable=True)
    volume: Mapped[int | None] = mapped_column(nullable=True)
    daily_return_percent: Mapped[Decimal | None] = mapped_column(Numeric(7, 4), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

