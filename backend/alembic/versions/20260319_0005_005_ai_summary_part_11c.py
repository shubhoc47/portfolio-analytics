"""ai_summary_part_11c

Revision ID: 005
Revises: 004
Create Date: 2026-03-19

Extend ai_summary for Part 11C hierarchical summaries and upsert keys.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text


revision: str = "005"
down_revision: Union[str, None] = "004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "ai_summary",
        sa.Column("holding_id", sa.Integer(), sa.ForeignKey("holding.id", ondelete="CASCADE"), nullable=True),
    )
    op.create_index("ix_ai_summary_holding_id", "ai_summary", ["holding_id"])

    op.add_column("ai_summary", sa.Column("ticker", sa.String(length=32), nullable=True))
    op.create_index("ix_ai_summary_ticker", "ai_summary", ["ticker"])

    op.add_column("ai_summary", sa.Column("summary_date", sa.Date(), nullable=True))
    op.create_index("ix_ai_summary_summary_date", "ai_summary", ["summary_date"])

    op.add_column("ai_summary", sa.Column("provider_name", sa.String(length=100), nullable=True))
    op.add_column("ai_summary", sa.Column("word_count", sa.Integer(), nullable=True))
    op.add_column("ai_summary", sa.Column("source_article_count", sa.Integer(), nullable=True))
    op.add_column("ai_summary", sa.Column("source_brief_count", sa.Integer(), nullable=True))
    op.add_column("ai_summary", sa.Column("source_summary_count", sa.Integer(), nullable=True))

    bind = op.get_bind()
    bind.execute(text("UPDATE ai_summary SET provider_name = 'legacy' WHERE provider_name IS NULL"))

    op.alter_column(
        "ai_summary",
        "provider_name",
        existing_type=sa.String(length=100),
        nullable=False,
        server_default="legacy",
    )

    op.execute(
        text(
            """
            CREATE UNIQUE INDEX uq_ai_summary_natural_key ON ai_summary (
                portfolio_id,
                summary_type,
                provider_name,
                summary_date,
                COALESCE(holding_id, -1)
            )
            """
        )
    )


def downgrade() -> None:
    op.drop_index("uq_ai_summary_natural_key", table_name="ai_summary")
    op.drop_index("ix_ai_summary_summary_date", table_name="ai_summary")
    op.drop_index("ix_ai_summary_ticker", table_name="ai_summary")
    op.drop_index("ix_ai_summary_holding_id", table_name="ai_summary")

    op.drop_column("ai_summary", "source_summary_count")
    op.drop_column("ai_summary", "source_brief_count")
    op.drop_column("ai_summary", "source_article_count")
    op.drop_column("ai_summary", "word_count")
    op.drop_column("ai_summary", "provider_name")
    op.drop_column("ai_summary", "summary_date")
    op.drop_column("ai_summary", "ticker")
    op.drop_column("ai_summary", "holding_id")
