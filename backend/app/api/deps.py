"""
Shared FastAPI dependencies.

Endpoints should import dependencies from here to keep imports consistent and simple.
"""

from app.db.session import get_db

