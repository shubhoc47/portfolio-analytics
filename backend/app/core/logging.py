"""
Logging configuration for the application.

We keep this very small and focused:
- choose a log level based on settings
- configure a simple, readable log format
"""

import logging

from .config import Settings


def configure_logging(settings: Settings) -> None:
    """
    Configure the root logger based on application settings.

    This function is idempotent: calling it multiple times
    will not keep adding handlers.
    """

    level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)

    # Basic configuration for the root logger
    logging.basicConfig(
        level=level,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    )

    # Optionally, log that logging has been configured
    logger = logging.getLogger("portfolioiq")
    logger.info("Logging configured with level %s in %s environment", settings.LOG_LEVEL, settings.APP_ENV)

