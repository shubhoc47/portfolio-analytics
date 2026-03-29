"""
Seed response schemas.
"""

from pydantic import BaseModel


class SeedResultRead(BaseModel):
    """Response payload for development seed operation."""

    message: str
    portfolios_created: int
    holdings_created: int


class ReseedResultRead(BaseModel):
    """Response after clearing portfolio-domain rows and inserting fresh demo data."""

    message: str
    portfolios_removed: int
    holdings_removed: int
    news_articles_removed: int
    analyst_ratings_removed: int
    job_runs_removed: int
    portfolios_created: int
    holdings_created: int
