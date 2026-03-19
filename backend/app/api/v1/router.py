"""
API v1 router - mounts all v1 endpoints.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import health as health_ep
from app.api.v1.endpoints import auth as auth_ep
from app.api.v1.endpoints import portfolios as portfolios_ep
from app.api.v1.endpoints import holdings as holdings_ep
from app.api.v1.endpoints import dev as dev_ep
from app.api.v1.endpoints import analytics as analytics_ep
from app.api.v1.endpoints import benchmark as benchmark_ep
from app.api.v1.endpoints import news as news_ep
from app.api.v1.endpoints import sentiment as sentiment_ep

api_router = APIRouter()

# Endpoint modules mounted under /api/v1
api_router.include_router(health_ep.router, prefix="/health", tags=["health"])
api_router.include_router(auth_ep.router, prefix="/auth", tags=["auth"])
api_router.include_router(portfolios_ep.router, prefix="/portfolios", tags=["portfolios"])
api_router.include_router(holdings_ep.router, tags=["holdings"])
api_router.include_router(dev_ep.router, prefix="/dev", tags=["dev"])
api_router.include_router(analytics_ep.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(benchmark_ep.router, prefix="/benchmark", tags=["benchmark"])
api_router.include_router(news_ep.router, prefix="/news", tags=["news"])
api_router.include_router(sentiment_ep.router, prefix="/sentiment", tags=["sentiment"])
