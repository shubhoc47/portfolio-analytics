"""
Alert detector abstractions.

Detectors classify local stored text into actionable alert signals.
"""

from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class AlertDetectionInput:
    """Normalized local input for one detection pass."""

    ticker: str
    title: str
    snippet: str | None = None
    content: str | None = None
    sentiment_label: str | None = None
    sentiment_score: float | None = None


@dataclass(frozen=True)
class AlertDetectionResult:
    """Structured deterministic alert signal."""

    alert_type: str
    severity: str
    title: str
    message: str
    rule_key: str | None = None


class AlertDetector(Protocol):
    """Detector interface for deriving alerts from local text inputs."""

    def detect(self, payload: AlertDetectionInput) -> list[AlertDetectionResult]:
        """Return deterministic alert signals for one normalized input."""
