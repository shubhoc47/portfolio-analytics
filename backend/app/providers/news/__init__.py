"""News providers package."""

from .base import NewsProvider, ProviderArticle
from .mock import MockNewsProvider

__all__ = ["NewsProvider", "ProviderArticle", "MockNewsProvider"]

