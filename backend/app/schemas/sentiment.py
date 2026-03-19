"""
Sentiment analysis and aggregation schemas.
"""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator


SentimentLabel = Literal["positive", "neutral", "negative"]


class ArticleSentimentWrite(BaseModel):
    """Internal payload used to upsert article sentiment records."""

    article_id: int = Field(ge=1)
    sentiment_label: SentimentLabel
    sentiment_score: float = Field(ge=-1.0, le=1.0)
    confidence: float | None = Field(default=None, ge=0.0, le=1.0)
    provider_name: str = Field(min_length=1, max_length=100)
    rule_key: str | None = Field(default=None, max_length=120)

    @field_validator("provider_name")
    @classmethod
    def normalize_provider_name(cls, value: str) -> str:
        return value.strip()

    @field_validator("rule_key")
    @classmethod
    def normalize_rule_key(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        return cleaned or None


class ArticleSentimentRead(BaseModel):
    """Article-level sentiment result returned by analysis endpoint."""

    article_id: int
    ticker: str
    title: str
    sentiment_label: SentimentLabel
    sentiment_score: float
    confidence: float | None
    provider_name: str
    rule_key: str | None
    analyzed_at: datetime


class HoldingSentimentSummaryRead(BaseModel):
    """Holding-level sentiment aggregation."""

    ticker: str
    article_count: int = Field(ge=0)
    positive_count: int = Field(ge=0)
    neutral_count: int = Field(ge=0)
    negative_count: int = Field(ge=0)
    average_score: float
    overall_sentiment: SentimentLabel


class PortfolioSentimentSummaryRead(BaseModel):
    """Portfolio-level sentiment aggregation."""

    article_count: int = Field(ge=0)
    positive_count: int = Field(ge=0)
    neutral_count: int = Field(ge=0)
    negative_count: int = Field(ge=0)
    average_score: float
    overall_sentiment: SentimentLabel


class SentimentAnalyzeResponse(BaseModel):
    """Response payload for portfolio sentiment analysis."""

    portfolio_id: int
    portfolio_name: str
    analyzed_article_count: int = Field(ge=0)
    stored_sentiment_count: int = Field(ge=0)
    created_count: int = Field(ge=0)
    updated_count: int = Field(ge=0)
    article_sentiments: list[ArticleSentimentRead] = Field(default_factory=list)
    holding_sentiments: list[HoldingSentimentSummaryRead] = Field(default_factory=list)
    portfolio_sentiment: PortfolioSentimentSummaryRead
    notes: list[str] = Field(default_factory=list)

