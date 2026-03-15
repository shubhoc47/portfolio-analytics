"""
API v1 router - mounts all v1 endpoints.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import health as health_ep
from app.api.v1.endpoints import auth as auth_ep
from app.api.v1.endpoints import portfolios as portfolios_ep
from app.api.v1.endpoints import holdings as holdings_ep

api_router = APIRouter()

# Endpoint modules mounted under /api/v1
api_router.include_router(health_ep.router, prefix="/health", tags=["health"])
api_router.include_router(auth_ep.router, prefix="/auth", tags=["auth"])
api_router.include_router(portfolios_ep.router, prefix="/portfolios", tags=["portfolios"])
api_router.include_router(holdings_ep.router, tags=["holdings"])
