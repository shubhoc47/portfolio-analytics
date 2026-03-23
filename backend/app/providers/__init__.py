"""External providers package."""

from .benchmark import BenchmarkProvider, BenchmarkSnapshot, MockBenchmarkProvider
from .sentiment import (
    RuleBasedSentimentProvider,
    SentimentArticleInput,
    SentimentProvider,
    SentimentResult,
)
from .summary import (
    TemplateSummaryProvider,
    SummaryProvider,
    SummaryResult,
)
from .alert import (
    AlertDetector,
    AlertDetectionInput,
    AlertDetectionResult,
    RuleBasedAlertDetector,
)
from .ratings import (
    MockRatingsProvider,
    ProviderRating,
    RatingsProvider,
)

__all__ = [
    "BenchmarkProvider",
    "BenchmarkSnapshot",
    "MockBenchmarkProvider",
    "SentimentProvider",
    "SentimentArticleInput",
    "SentimentResult",
    "RuleBasedSentimentProvider",
    "SummaryProvider",
    "SummaryResult",
    "TemplateSummaryProvider",
    "AlertDetector",
    "AlertDetectionInput",
    "AlertDetectionResult",
    "RuleBasedAlertDetector",
    "RatingsProvider",
    "ProviderRating",
    "MockRatingsProvider",
]
