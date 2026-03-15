"""
Seed response schemas.
"""

from pydantic import BaseModel


class SeedResultRead(BaseModel):
    """Response payload for development seed operation."""

    message: str
    portfolios_created: int
    holdings_created: int

