"""
Portfolio endpoints - placeholder for Part 4 (Core Domain).
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("")
def portfolios_placeholder():
    """Placeholder - portfolio CRUD to be implemented in Part 4."""
    return {"message": "Portfolio endpoints coming in Part 4"}
