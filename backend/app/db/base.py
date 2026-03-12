"""
Shared SQLAlchemy declarative base and model registry.

All ORM models inherit from `Base`. Importing this module also
imports all model classes so tools like Alembic can discover them.
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


# Import model classes so that metadata is aware of them.
# This pattern is commonly used with Alembic.
from app import models as _models  # noqa: F401,E402


