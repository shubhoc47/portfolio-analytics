"""
NewsArticle model.

Represents a news article related to a ticker and optionally a specific holding.
"""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class NewsArticle(Base):
    __tablename__ = "news_article"

    id: Mapped[int] = mapped_column(primary_key=True)

    holding_id: Mapped[int | None] = mapped_column(
        ForeignKey("holding.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    ticker: Mapped[str] = mapped_column(String(32), nullable=False, index=True)

    external_id: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    source: Mapped[str] = mapped_column(String(200), nullable=False)
    url: Mapped[str] = mapped_column(String(1000), nullable=False, unique=True)
    published_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)

    author: Mapped[str | None] = mapped_column(String(200), nullable=True)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    content: Mapped[str | None] = mapped_column(Text, nullable=True)
    dedupe_hash: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    holding: Mapped["Holding | None"] = relationship(back_populates="news_articles")
    sentiments: Mapped[list["ArticleSentiment"]] = relationship(
        back_populates="article",
        cascade="all, delete-orphan",
    )

