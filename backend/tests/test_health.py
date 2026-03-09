"""
Basic health endpoint tests.
"""

import pytest


def test_root_health(client):
    """GET /health returns ok."""
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_api_v1_health(client):
    """GET /api/v1/health returns ok with api version."""
    r = client.get("/api/v1/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok", "api": "v1"}
