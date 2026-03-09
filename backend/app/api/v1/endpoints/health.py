"""
Health endpoint - versioned under /api/v1.
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("")
def health_v1():
    """Health check for API v1."""
    return {"status": "ok", "api": "v1"}
