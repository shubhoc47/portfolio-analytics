"""
JobRun model.

Represents the execution of a background or scheduled job.
"""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class JobRun(Base):
    __tablename__ = "job_run"

    id: Mapped[int] = mapped_column(primary_key=True)

    portfolio_id: Mapped[int | None] = mapped_column(
        ForeignKey("portfolio.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    job_type: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, index=True)

    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    metadata_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    portfolio: Mapped["Portfolio | None"] = relationship(back_populates="job_runs")

