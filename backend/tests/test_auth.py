"""
Authentication behavior tests.
"""

from datetime import UTC, datetime
from unittest.mock import AsyncMock, MagicMock

from app.api import deps
from app.main import app
from app.models.user import User
from app.schemas.auth import UserRead


def test_protected_endpoint_requires_bearer_token(unauthenticated_client):
    response = unauthenticated_client.get("/api/v1/portfolios")

    assert response.status_code == 401
    assert response.json()["detail"] == "Could not validate credentials"


def test_login_returns_bearer_token(client):
    now = datetime(2026, 4, 26, 10, 0, 0, tzinfo=UTC)
    user = User(
        id=7,
        email="user@example.com",
        hashed_password="not-used",
        full_name="Test User",
        is_active=True,
        created_at=now,
        updated_at=now,
    )
    mock_service = MagicMock()
    mock_service.authenticate_user = AsyncMock(return_value=user)
    mock_service.create_user_access_token.return_value = "test-token"

    async def override_auth_service():
        return mock_service

    app.dependency_overrides[deps.get_auth_service] = override_auth_service
    try:
        response = client.post(
            "/api/v1/auth/login",
            json={"email": "USER@example.com", "password": "correct-password"},
        )
        assert response.status_code == 200
        assert response.json() == {"access_token": "test-token", "token_type": "bearer"}
        mock_service.authenticate_user.assert_awaited_once_with(
            "user@example.com",
            "correct-password",
        )
    finally:
        app.dependency_overrides.pop(deps.get_auth_service, None)


def test_me_returns_current_user(client):
    response = client.get("/api/v1/auth/me")

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 42
    assert data["email"] == "tester@example.com"


def test_signup_returns_user_with_service_override(client):
    mock_service = MagicMock()
    mock_service.register_user = AsyncMock(
        return_value=UserRead(
            id=10,
            email="new@example.com",
            full_name="New User",
            is_active=True,
            created_at=datetime(2026, 4, 26, 10, 0, 0, tzinfo=UTC),
            updated_at=datetime(2026, 4, 26, 10, 0, 0, tzinfo=UTC),
        )
    )

    async def override_auth_service():
        return mock_service

    app.dependency_overrides[deps.get_auth_service] = override_auth_service
    try:
        response = client.post(
            "/api/v1/auth/signup",
            json={
                "email": "new@example.com",
                "password": "valid-password",
                "full_name": "New User",
            },
        )
        assert response.status_code == 201
        assert response.json()["email"] == "new@example.com"
    finally:
        app.dependency_overrides.pop(deps.get_auth_service, None)
