"""
PortfolioIQ - FastAPI application entry point.
"""

from fastapi import FastAPI

from app.api.v1.router import api_router

app = FastAPI(
    title="PortfolioIQ API",
    description="Portfolio management and analytics backend",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
def health():
    """Health check endpoint - no auth required."""
    return {"status": "ok"}
