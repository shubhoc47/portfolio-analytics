"""portfolio_name_unique

Revision ID: 002
Revises: 001
Create Date: 2026-03-15

Add case-insensitive unique constraint for portfolio names.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()

    duplicate_rows = bind.execute(
        sa.text(
            """
            SELECT lower(btrim(name)) AS normalized_name, COUNT(*) AS duplicate_count
            FROM portfolio
            GROUP BY lower(btrim(name))
            HAVING COUNT(*) > 1
            """
        )
    ).fetchall()

    if duplicate_rows:
        normalized_names = ", ".join(str(row[0]) for row in duplicate_rows)
        raise RuntimeError(
            "Cannot apply unique portfolio name constraint; "
            f"duplicates exist for normalized names: {normalized_names}"
        )

    op.create_index(
        "uq_portfolio_name_normalized",
        "portfolio",
        [sa.text("lower(btrim(name))")],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index("uq_portfolio_name_normalized", table_name="portfolio")

