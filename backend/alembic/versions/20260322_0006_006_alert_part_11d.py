"""alert_part_11d

Revision ID: 006
Revises: 005
Create Date: 2026-03-22

Extend alert storage for Part 11D deterministic detection provenance.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "006"
down_revision: Union[str, None] = "005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("alert", sa.Column("ticker", sa.String(length=32), nullable=True))
    op.create_index("ix_alert_ticker", "alert", ["ticker"])

    op.add_column("alert", sa.Column("source_kind", sa.String(length=50), nullable=True))
    op.create_index("ix_alert_source_kind", "alert", ["source_kind"])

    op.add_column(
        "alert",
        sa.Column(
            "source_article_id",
            sa.Integer(),
            sa.ForeignKey("news_article.id", ondelete="CASCADE"),
            nullable=True,
        ),
    )
    op.create_index("ix_alert_source_article_id", "alert", ["source_article_id"])

    op.add_column(
        "alert",
        sa.Column(
            "source_summary_id",
            sa.Integer(),
            sa.ForeignKey("ai_summary.id", ondelete="CASCADE"),
            nullable=True,
        ),
    )
    op.create_index("ix_alert_source_summary_id", "alert", ["source_summary_id"])

    op.add_column("alert", sa.Column("detector_name", sa.String(length=100), nullable=True))

    op.create_index(
        "ix_alert_active_source_type",
        "alert",
        [
            "portfolio_id",
            "is_active",
            "source_kind",
            "source_article_id",
            "source_summary_id",
            "alert_type",
        ],
    )


def downgrade() -> None:
    op.drop_index("ix_alert_active_source_type", table_name="alert")

    op.drop_column("alert", "detector_name")

    op.drop_index("ix_alert_source_summary_id", table_name="alert")
    op.drop_column("alert", "source_summary_id")

    op.drop_index("ix_alert_source_article_id", table_name="alert")
    op.drop_column("alert", "source_article_id")

    op.drop_index("ix_alert_source_kind", table_name="alert")
    op.drop_column("alert", "source_kind")

    op.drop_index("ix_alert_ticker", table_name="alert")
    op.drop_column("alert", "ticker")
