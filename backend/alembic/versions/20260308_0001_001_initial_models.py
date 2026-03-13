"""initial_models

Revision ID: 001
Revises:
Create Date: 2026-03-08

Creates all initial tables based on Part 4 models:
- portfolio
- holding
- market_snapshot
- news_article
- article_sentiment
- alert
- analyst_rating
- benchmark_data
- ai_summary
- job_run
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- Portfolio ---
    op.create_table(
        "portfolio",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("description", sa.String(1000), nullable=True),
        sa.Column("base_currency", sa.String(10), nullable=False, server_default="USD"),
        sa.Column("owner_name", sa.String(200), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # --- Holding ---
    op.create_table(
        "holding",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("portfolio_id", sa.Integer(), sa.ForeignKey("portfolio.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("ticker", sa.String(32), nullable=False, index=True),
        sa.Column("company_name", sa.String(255), nullable=True),
        sa.Column("asset_type", sa.String(50), nullable=False),
        sa.Column("sector", sa.String(100), nullable=True),
        sa.Column("quantity", sa.Numeric(18, 4), nullable=False),
        sa.Column("average_cost", sa.Numeric(18, 4), nullable=False),
        sa.Column("current_price", sa.Numeric(18, 4), nullable=True),
        sa.Column("currency", sa.String(10), nullable=False, server_default="USD"),
        sa.Column("weight_percent", sa.Numeric(5, 2), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.UniqueConstraint("portfolio_id", "ticker", name="uq_holding_portfolio_ticker"),
    )

    # --- MarketSnapshot ---
    op.create_table(
        "market_snapshot",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("holding_id", sa.Integer(), sa.ForeignKey("holding.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("ticker", sa.String(32), nullable=False, index=True),
        sa.Column("snapshot_date", sa.Date(), nullable=False, index=True),
        sa.Column("open_price", sa.Numeric(18, 4), nullable=True),
        sa.Column("close_price", sa.Numeric(18, 4), nullable=True),
        sa.Column("high_price", sa.Numeric(18, 4), nullable=True),
        sa.Column("low_price", sa.Numeric(18, 4), nullable=True),
        sa.Column("volume", sa.Integer(), nullable=True),
        sa.Column("daily_return_percent", sa.Numeric(7, 4), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_market_snapshot_ticker_date", "market_snapshot", ["ticker", "snapshot_date"])

    # --- NewsArticle ---
    op.create_table(
        "news_article",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("holding_id", sa.Integer(), sa.ForeignKey("holding.id", ondelete="SET NULL"), nullable=True, index=True),
        sa.Column("ticker", sa.String(32), nullable=False, index=True),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("source", sa.String(200), nullable=False),
        sa.Column("url", sa.String(1000), nullable=False, unique=True),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=False, index=True),
        sa.Column("author", sa.String(200), nullable=True),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("content", sa.Text(), nullable=True),
        sa.Column("dedupe_hash", sa.String(64), nullable=True, index=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    # --- ArticleSentiment ---
    op.create_table(
        "article_sentiment",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("article_id", sa.Integer(), sa.ForeignKey("news_article.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("sentiment_label", sa.String(50), nullable=False),
        sa.Column("sentiment_score", sa.Numeric(5, 4), nullable=False),
        sa.Column("confidence", sa.Numeric(5, 4), nullable=True),
        sa.Column("provider_name", sa.String(100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    # --- Alert ---
    op.create_table(
        "alert",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("portfolio_id", sa.Integer(), sa.ForeignKey("portfolio.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("holding_id", sa.Integer(), sa.ForeignKey("holding.id", ondelete="SET NULL"), nullable=True, index=True),
        sa.Column("alert_type", sa.String(100), nullable=False, index=True),
        sa.Column("severity", sa.String(50), nullable=False, index=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("triggered_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    # --- AnalystRating ---
    op.create_table(
        "analyst_rating",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("holding_id", sa.Integer(), sa.ForeignKey("holding.id", ondelete="SET NULL"), nullable=True, index=True),
        sa.Column("ticker", sa.String(32), nullable=False, index=True),
        sa.Column("firm_name", sa.String(200), nullable=False),
        sa.Column("rating_raw", sa.String(100), nullable=False),
        sa.Column("rating_normalized", sa.String(50), nullable=False),
        sa.Column("target_price", sa.Numeric(18, 4), nullable=True),
        sa.Column("rating_date", sa.Date(), nullable=False, index=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    # --- BenchmarkData ---
    op.create_table(
        "benchmark_data",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("benchmark_symbol", sa.String(50), nullable=False),
        sa.Column("benchmark_name", sa.String(200), nullable=True),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("open_price", sa.Numeric(18, 4), nullable=True),
        sa.Column("close_price", sa.Numeric(18, 4), nullable=False),
        sa.Column("high_price", sa.Numeric(18, 4), nullable=True),
        sa.Column("low_price", sa.Numeric(18, 4), nullable=True),
        sa.Column("volume", sa.Integer(), nullable=True),
        sa.Column("daily_return_percent", sa.Numeric(7, 4), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("benchmark_symbol", "date", name="uq_benchmark_symbol_date"),
    )
    op.create_index("ix_benchmark_symbol_date", "benchmark_data", ["benchmark_symbol", "date"])

    # --- AISummary ---
    op.create_table(
        "ai_summary",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("portfolio_id", sa.Integer(), sa.ForeignKey("portfolio.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("summary_type", sa.String(100), nullable=False, index=True),
        sa.Column("title", sa.String(255), nullable=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("model_name", sa.String(200), nullable=True),
        sa.Column("generated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )

    # --- JobRun ---
    op.create_table(
        "job_run",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("portfolio_id", sa.Integer(), sa.ForeignKey("portfolio.id", ondelete="SET NULL"), nullable=True, index=True),
        sa.Column("job_type", sa.String(100), nullable=False, index=True),
        sa.Column("status", sa.String(50), nullable=False, index=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("finished_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("metadata_json", postgresql.JSONB(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )


def downgrade() -> None:
    # Drop tables in reverse order of creation (to respect FK dependencies)
    op.drop_table("job_run")
    op.drop_table("ai_summary")
    op.drop_index("ix_benchmark_symbol_date", table_name="benchmark_data")
    op.drop_table("benchmark_data")
    op.drop_table("analyst_rating")
    op.drop_table("alert")
    op.drop_table("article_sentiment")
    op.drop_table("news_article")
    op.drop_index("ix_market_snapshot_ticker_date", table_name="market_snapshot")
    op.drop_table("market_snapshot")
    op.drop_table("holding")
    op.drop_table("portfolio")
