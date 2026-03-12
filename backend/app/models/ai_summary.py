"""
AISummary model.

Represents an AI-generated summary for a portfolio.
"""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
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

    summary_type: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    model_name: Mapped[str | None] = mapped_column(String(200), nullable=True)

    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    portfolio: Mapped["Portfolio"] = relationship(back_populates="ai_summaries")

