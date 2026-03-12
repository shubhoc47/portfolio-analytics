"""
ArticleSentiment model.

Represents a sentiment analysis result for a news article.
"""

from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ArticleSentiment(Base):
    __tablename__ = "article_sentiment"

    id: Mapped[int] = mapped_column(primary_key=True)

    article_id: Mapped[int] = mapped_column(
        ForeignKey("news_article.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    sentiment_label: Mapped[str] = mapped_column(String(50), nullable=False)
    sentiment_score: Mapped[Decimal] = mapped_column(Numeric(5, 4), nullable=False)
    confidence: Mapped[Decimal | None] = mapped_column(Numeric(5, 4), nullable=True)
    provider_name: Mapped[str | None] = mapped_column(String(100), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    article: Mapped["NewsArticle"] = relationship(back_populates="sentiments")

