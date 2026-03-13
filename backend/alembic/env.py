"""
Alembic migration environment configuration.

This file is executed whenever you run an Alembic command (e.g. `alembic upgrade head`).
It configures how Alembic connects to the database and discovers models.
"""

from logging.config import fileConfig

from alembic import context
from sqlalchemy import create_engine, pool

# Import settings to get DATABASE_URL
from app.core.config import get_settings

# Import Base (which also imports all models via app.models)
# This ensures Alembic can see all tables when running autogenerate.
from app.db.base import Base

# Alembic Config object (provides access to alembic.ini values)
config = context.config

# Set up Python logging from alembic.ini
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Load app settings
settings = get_settings()


def get_sync_database_url() -> str:
    """
    Convert async DATABASE_URL to sync for Alembic.

    Alembic runs synchronously, so we need a sync driver:
    - postgresql+asyncpg://... -> postgresql+psycopg2://...
    """
    url = settings.DATABASE_URL

    # Replace async driver with sync driver
    if "+asyncpg" in url:
        url = url.replace("+asyncpg", "+psycopg2")

    return url


# This is the MetaData object that Alembic uses to detect changes.
# It knows about all tables because we imported Base above.
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """
    Run migrations in 'offline' mode.

    This generates SQL scripts without connecting to the database.
    Useful for reviewing changes or applying them manually.

    Usage: alembic upgrade head --sql
    """
    url = get_sync_database_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """
    Run migrations in 'online' mode.

    This connects to the database and applies changes directly.
    This is the default mode when you run `alembic upgrade head`.
    """
    url = get_sync_database_url()

    # Create a synchronous engine for Alembic
    connectable = create_engine(
        url,
        poolclass=pool.NullPool,  # Don't pool connections for migrations
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()


# Determine which mode to run based on context
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
