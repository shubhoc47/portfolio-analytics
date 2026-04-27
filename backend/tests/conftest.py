"""
Pytest fixtures - to be extended in Part 6.
"""

from datetime import UTC, datetime

import pytest
from fastapi.testclient import TestClient

from app.api import deps
from app.main import app
from app.models.user import User


@pytest.fixture
def client():
    """Test client for the FastAPI app."""
    async def override_current_user():
        now = datetime(2026, 4, 26, 10, 0, 0, tzinfo=UTC)
        return User(
            id=42,
            email="tester@example.com",
            hashed_password="not-used",
            is_active=True,
            created_at=now,
            updated_at=now,
        )

    app.dependency_overrides[deps.get_current_user] = override_current_user
    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.pop(deps.get_current_user, None)


@pytest.fixture
def unauthenticated_client():
    """Test client without the auth dependency override."""
    with TestClient(app) as test_client:
        yield test_client
