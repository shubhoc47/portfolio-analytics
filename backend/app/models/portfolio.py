"""
Portfolio model.

Represents a single investment portfolio.
"""

from datetime import datetime

from sqlalchemy import DateTime, Index, String, func, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Portfolio(Base):
    __tablename__ = "portfolio"
    __table_args__ = (
        # Enforce case-insensitive uniqueness for portfolio names.
        Index("uq_portfolio_name_normalized", text("lower(btrim(name))"), unique=True),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    base_currency: Mapped[str] = mapped_column(String(10), nullable=False, default="USD")
    owner_name: Mapped[str | None] = mapped_column(String(200), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

    holdings: Mapped[list["Holding"]] = relationship(
        back_populates="portfolio",
        cascade="all, delete-orphan",
    )
    alerts: Mapped[list["Alert"]] = relationship(
        back_populates="portfolio",
        cascade="all, delete-orphan",
    )
    ai_summaries: Mapped[list["AISummary"]] = relationship(
        back_populates="portfolio",
        cascade="all, delete-orphan",
    )
    job_runs: Mapped[list["JobRun"]] = relationship(
        back_populates="portfolio",
        cascade="all, delete-orphan",
    )

