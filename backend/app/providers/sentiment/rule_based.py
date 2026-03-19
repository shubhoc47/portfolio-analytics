"""
Rule-based fallback sentiment provider.
"""

from app.providers.sentiment.base import SentimentArticleInput, SentimentResult


class RuleBasedSentimentProvider:
    """Simple keyword-based sentiment classifier for local development."""

    PROVIDER_NAME = "rule_based_v1"

    _POSITIVE_KEYWORDS: dict[str, float] = {
        "beats expectations": 0.8,
        "growth": 0.45,
        "surges": 0.7,
        "upgrade": 0.65,
        "expands": 0.5,
        "strong demand": 0.7,
        "outperform": 0.6,
        "record revenue": 0.8,
    }
    _NEGATIVE_KEYWORDS: dict[str, float] = {
        "misses expectations": -0.8,
        "lawsuit": -0.75,
        "investigation": -0.7,
        "downgrade": -0.65,
        "decline": -0.5,
        "cuts guidance": -0.75,
        "underperform": -0.6,
        "profit warning": -0.8,
    }

    def analyze(self, article: SentimentArticleInput) -> SentimentResult:
        text = self._build_text_blob(article)

        best_positive_match = self._find_best_match(text, self._POSITIVE_KEYWORDS)
        best_negative_match = self._find_best_match(text, self._NEGATIVE_KEYWORDS)
        score = self._resolve_score(best_positive_match, best_negative_match)

        if score > 0.15:
            label = "positive"
        elif score < -0.15:
            label = "negative"
        else:
            label = "neutral"

        confidence = min(1.0, max(0.4, abs(score) + 0.25))
        matched_rule = None
        if best_positive_match is not None and score > 0:
            matched_rule = f"positive:{best_positive_match[0]}"
        elif best_negative_match is not None and score < 0:
            matched_rule = f"negative:{best_negative_match[0]}"

        return SentimentResult(
            sentiment_label=label,
            sentiment_score=round(score, 4),
            confidence=round(confidence, 4),
            provider_name=self.PROVIDER_NAME,
            rule_key=matched_rule,
        )

    @staticmethod
    def _build_text_blob(article: SentimentArticleInput) -> str:
        parts = [article.title, article.summary or "", article.content or ""]
        return " ".join(part.strip().lower() for part in parts if part and part.strip())

    @staticmethod
    def _find_best_match(text: str, weighted_keywords: dict[str, float]) -> tuple[str, float] | None:
        matches = [
            (keyword, weight) for keyword, weight in weighted_keywords.items() if keyword in text
        ]
        if not matches:
            return None
        return max(matches, key=lambda item: abs(item[1]))

    @staticmethod
    def _resolve_score(
        positive_match: tuple[str, float] | None,
        negative_match: tuple[str, float] | None,
    ) -> float:
        positive_score = positive_match[1] if positive_match is not None else 0.0
        negative_score = negative_match[1] if negative_match is not None else 0.0

        if positive_score and negative_score:
            # Mixed cues collapse toward neutral but preserve signal direction.
            return (positive_score + negative_score) / 2
        return positive_score + negative_score

