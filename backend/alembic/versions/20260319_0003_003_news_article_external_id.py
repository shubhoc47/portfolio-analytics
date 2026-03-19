"""news_article_external_id

Revision ID: 003
Revises: 002
Create Date: 2026-03-19

Add external provider article id storage to news_article.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("news_article", sa.Column("external_id", sa.String(length=255), nullable=True))
    op.create_index("ix_news_article_external_id", "news_article", ["external_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_news_article_external_id", table_name="news_article")
    op.drop_column("news_article", "external_id")
