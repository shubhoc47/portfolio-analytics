"""
AnalystRating model.

Represents an analyst rating for a ticker and optionally a specific holding.
"""

from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class AnalystRating(Base):
    __tablename__ = "analyst_rating"

    id: Mapped[int] = mapped_column(primary_key=True)

    holding_id: Mapped[int | None] = mapped_column(
        ForeignKey("holding.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    ticker: Mapped[str] = mapped_column(String(32), nullable=False, index=True)

    firm_name: Mapped[str] = mapped_column(String(200), nullable=False)
    rating_raw: Mapped[str] = mapped_column(String(100), nullable=False)
    rating_normalized: Mapped[str] = mapped_column(String(50), nullable=False)
    target_price: Mapped[Decimal | None] = mapped_column(Numeric(18, 4), nullable=True)

    rating_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    holding: Mapped["Holding | None"] = relationship(back_populates="analyst_ratings")

