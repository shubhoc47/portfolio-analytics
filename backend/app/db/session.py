"""
Database session management (async SQLAlchemy).

This file defines:
- async_engine: shared AsyncEngine
- AsyncSessionLocal: session factory
- get_db(): FastAPI dependency that yields an AsyncSession

Important: creating an engine does not immediately connect to the database.
Connections are opened only when you actually run queries / start a transaction.
"""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import get_settings


settings = get_settings()

# Engine is a long-lived, shared object. It manages the connection pool.
async_engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,  # logs SQL when DEBUG=true (helpful in development)
    pool_pre_ping=True,
)

# Session factory. A session is a short-lived unit of work for a single request.
AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that provides an AsyncSession.

    Usage (later):
        async def endpoint(db: AsyncSession = Depends(get_db)):
            ...
    """

    async with AsyncSessionLocal() as session:
        yield session

