"""
Shared SQLAlchemy declarative base.

Future ORM models will inherit from `Base`.
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass

