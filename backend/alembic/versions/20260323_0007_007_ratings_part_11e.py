"""ratings_part_11e

Revision ID: 007
Revises: 006
Create Date: 2026-03-23

Extend analyst_rating for Part 11E provider-aware normalized ratings storage.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text


revision: str = "007"
down_revision: Union[str, None] = "006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "analyst_rating",
        sa.Column("provider_name", sa.String(length=100), nullable=True),
    )
    op.create_index("ix_analyst_rating_provider_name", "analyst_rating", ["provider_name"])

    bind = op.get_bind()
    bind.execute(
        text(
            "UPDATE analyst_rating SET provider_name = 'legacy' "
            "WHERE provider_name IS NULL"
        )
    )

    op.alter_column(
        "analyst_rating",
        "provider_name",
        existing_type=sa.String(length=100),
        nullable=False,
    )

    op.add_column(
        "analyst_rating",
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )
    op.add_column(
        "analyst_rating",
        sa.Column("analyst_name", sa.String(length=200), nullable=True),
    )
    op.add_column("analyst_rating", sa.Column("notes", sa.Text(), nullable=True))

    op.create_unique_constraint(
        "uq_analyst_rating_holding_provider_firm_date",
        "analyst_rating",
        ["holding_id", "provider_name", "firm_name", "rating_date"],
    )


def downgrade() -> None:
    op.drop_constraint(
        "uq_analyst_rating_holding_provider_firm_date",
        "analyst_rating",
        type_="unique",
    )
    op.drop_column("analyst_rating", "notes")
    op.drop_column("analyst_rating", "analyst_name")
    op.drop_column("analyst_rating", "updated_at")
    op.drop_index("ix_analyst_rating_provider_name", table_name="analyst_rating")
    op.drop_column("analyst_rating", "provider_name")
