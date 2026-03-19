"""article_sentiment_upsert

Revision ID: 004
Revises: 003
Create Date: 2026-03-19

Add rule key and uniqueness for sentiment upsert behavior.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "004"
down_revision: Union[str, None] = "003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("article_sentiment", sa.Column("rule_key", sa.String(length=120), nullable=True))
    op.create_unique_constraint(
        "uq_article_sentiment_article_provider",
        "article_sentiment",
        ["article_id", "provider_name"],
    )


def downgrade() -> None:
    op.drop_constraint(
        "uq_article_sentiment_article_provider",
        "article_sentiment",
        type_="unique",
    )
    op.drop_column("article_sentiment", "rule_key")

