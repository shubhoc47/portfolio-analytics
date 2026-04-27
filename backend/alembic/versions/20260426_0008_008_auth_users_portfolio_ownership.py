"""auth_users_portfolio_ownership

Revision ID: 008
Revises: 007
Create Date: 2026-04-26

Add local users and scope portfolios to their owning user.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from passlib.hash import bcrypt


revision: str = "008"
down_revision: Union[str, None] = "007"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

LEGACY_EMAIL = "legacy@portfolioiq.local"
LEGACY_PASSWORD = "PortfolioIQ123!"


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=200), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("email", name="uq_users_email"),
    )
    op.create_index("ix_users_email", "users", ["email"])

    op.add_column("portfolio", sa.Column("user_id", sa.Integer(), nullable=True))

    bind = op.get_bind()
    portfolio_count = bind.execute(sa.text("SELECT COUNT(*) FROM portfolio")).scalar_one()
    if portfolio_count:
        hashed_password = bcrypt.hash(LEGACY_PASSWORD)
        bind.execute(
            sa.text(
                """
                INSERT INTO users (email, hashed_password, full_name, is_active)
                VALUES (:email, :hashed_password, :full_name, true)
                ON CONFLICT (email) DO NOTHING
                """
            ),
            {
                "email": LEGACY_EMAIL,
                "hashed_password": hashed_password,
                "full_name": "Legacy PortfolioIQ User",
            },
        )
        bind.execute(
            sa.text(
                """
                UPDATE portfolio
                SET user_id = (SELECT id FROM users WHERE email = :email)
                WHERE user_id IS NULL
                """
            ),
            {"email": LEGACY_EMAIL},
        )

    op.alter_column("portfolio", "user_id", existing_type=sa.Integer(), nullable=False)
    op.create_foreign_key(
        "fk_portfolio_user_id_users",
        "portfolio",
        "users",
        ["user_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.create_index("ix_portfolio_user_id", "portfolio", ["user_id"])

    op.drop_index("uq_portfolio_name_normalized", table_name="portfolio")
    op.create_index(
        "uq_portfolio_user_name_normalized",
        "portfolio",
        ["user_id", sa.text("lower(btrim(name))")],
        unique=True,
    )


def downgrade() -> None:
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
            "Cannot downgrade to global portfolio name uniqueness; "
            f"duplicates exist for normalized names: {normalized_names}"
        )

    op.drop_index("uq_portfolio_user_name_normalized", table_name="portfolio")
    op.create_index(
        "uq_portfolio_name_normalized",
        "portfolio",
        [sa.text("lower(btrim(name))")],
        unique=True,
    )
    op.drop_index("ix_portfolio_user_id", table_name="portfolio")
    op.drop_constraint("fk_portfolio_user_id_users", "portfolio", type_="foreignkey")
    op.drop_column("portfolio", "user_id")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
