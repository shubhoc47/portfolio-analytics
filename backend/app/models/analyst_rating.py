"""
AnalystRating model.

Represents an analyst rating for a ticker and optionally a specific holding.
"""

from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    Date,
    DateTime,
    ForeignKey,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class AnalystRating(Base):
    __tablename__ = "analyst_rating"
    __table_args__ = (
        UniqueConstraint(
            "holding_id",
            "provider_name",
            "firm_name",
            "rating_date",
            name="uq_analyst_rating_holding_provider_firm_date",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    holding_id: Mapped[int | None] = mapped_column(
        ForeignKey("holding.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    ticker: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    provider_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)

    firm_name: Mapped[str] = mapped_column(String(200), nullable=False)
    analyst_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    rating_raw: Mapped[str] = mapped_column(String(100), nullable=False)
    rating_normalized: Mapped[str] = mapped_column(String(50), nullable=False)
    target_price: Mapped[Decimal | None] = mapped_column(Numeric(18, 4), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    rating_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

    holding: Mapped["Holding | None"] = relationship(back_populates="analyst_ratings")

