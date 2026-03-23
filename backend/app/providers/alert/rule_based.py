"""
Rule-based alert detector.
"""

from dataclasses import dataclass

from app.providers.alert.base import AlertDetectionInput, AlertDetectionResult


@dataclass(frozen=True)
class _KeywordRule:
    alert_type: str
    base_severity: str
    polarity: str
    title_template: str
    message_template: str
    keywords: tuple[str, ...]


class RuleBasedAlertDetector:
    """Transparent deterministic detector based on keyword groups."""

    DETECTOR_NAME = "rule_alerts_v1"

    _SEVERITY_ORDER = ("low", "medium", "high", "critical")

    _RULES: tuple[_KeywordRule, ...] = (
        _KeywordRule(
            alert_type="fraud_or_allegation",
            base_severity="critical",
            polarity="negative",
            title_template="Critical legal event detected for {ticker}",
            message_template=(
                "Local article text suggests fraud or serious allegation risk for {ticker}."
            ),
            keywords=("fraud", "allegation", "accounting irregularity", "misconduct"),
        ),
        _KeywordRule(
            alert_type="lawsuit_or_investigation",
            base_severity="high",
            polarity="negative",
            title_template="Legal or investigation risk detected for {ticker}",
            message_template=(
                "Recent local article text indicates lawsuit or investigation developments."
            ),
            keywords=("lawsuit", "investigation", "probe", "subpoena"),
        ),
        _KeywordRule(
            alert_type="regulatory_risk",
            base_severity="high",
            polarity="negative",
            title_template="Regulatory risk detected for {ticker}",
            message_template=(
                "Recent local article text suggests regulatory pressure or enforcement risk."
            ),
            keywords=("antitrust", "regulator", "regulatory", "compliance failure"),
        ),
        _KeywordRule(
            alert_type="guidance_cut",
            base_severity="high",
            polarity="negative",
            title_template="Guidance cut signal for {ticker}",
            message_template=(
                "Article wording indicates reduced guidance or weaker forward outlook."
            ),
            keywords=("cuts guidance", "lowered outlook", "reduced forecast", "profit warning"),
        ),
        _KeywordRule(
            alert_type="earnings_negative",
            base_severity="medium",
            polarity="negative",
            title_template="Negative earnings signal for {ticker}",
            message_template=(
                "Article text suggests an earnings miss or weaker-than-expected results."
            ),
            keywords=("misses expectations", "earnings miss", "revenue miss"),
        ),
        _KeywordRule(
            alert_type="analyst_downgrade",
            base_severity="medium",
            polarity="negative",
            title_template="Analyst downgrade signal for {ticker}",
            message_template="Article text includes analyst downgrade language.",
            keywords=("downgrade", "cut to underperform", "cut to sell"),
        ),
        _KeywordRule(
            alert_type="leadership_change",
            base_severity="medium",
            polarity="neutral",
            title_template="Leadership change detected for {ticker}",
            message_template="Article text suggests a notable leadership transition.",
            keywords=("ceo resigns", "steps down", "executive departure", "new ceo"),
        ),
        _KeywordRule(
            alert_type="dividend_change",
            base_severity="medium",
            polarity="neutral",
            title_template="Dividend change detected for {ticker}",
            message_template="Article text indicates a dividend policy update.",
            keywords=("dividend cut", "dividend increase", "dividend raised", "suspends dividend"),
        ),
        _KeywordRule(
            alert_type="volatility_or_drop",
            base_severity="medium",
            polarity="negative",
            title_template="Volatility or downside move detected for {ticker}",
            message_template=(
                "Article text indicates a sharp decline, drawdown, or elevated volatility."
            ),
            keywords=("shares fell", "slump", "selloff", "plunges", "volatility spikes"),
        ),
        _KeywordRule(
            alert_type="partnership_expansion",
            base_severity="medium",
            polarity="positive",
            title_template="Partnership expansion signal for {ticker}",
            message_template="Article text suggests a partnership or distribution expansion.",
            keywords=("strategic partnership", "expands partnership", "joint venture", "collaboration"),
        ),
        _KeywordRule(
            alert_type="product_launch",
            base_severity="low",
            polarity="positive",
            title_template="Product launch signal for {ticker}",
            message_template="Article text suggests a product launch or release milestone.",
            keywords=("product launch", "launches", "new platform", "rollout"),
        ),
        _KeywordRule(
            alert_type="analyst_upgrade",
            base_severity="medium",
            polarity="positive",
            title_template="Analyst upgrade signal for {ticker}",
            message_template="Article text includes analyst upgrade language.",
            keywords=("upgrade", "raised to buy", "raised to overweight", "outperform rating"),
        ),
        _KeywordRule(
            alert_type="earnings_positive",
            base_severity="medium",
            polarity="positive",
            title_template="Positive earnings signal for {ticker}",
            message_template=(
                "Article text suggests earnings strength or positive demand momentum."
            ),
            keywords=("beats expectations", "raises guidance", "strong demand", "record revenue"),
        ),
        _KeywordRule(
            alert_type="momentum_positive",
            base_severity="medium",
            polarity="positive",
            title_template="Positive momentum signal for {ticker}",
            message_template="Article text indicates strong upside momentum.",
            keywords=("surges", "rallies", "breakout", "strong upside"),
        ),
    )

    def detect(self, payload: AlertDetectionInput) -> list[AlertDetectionResult]:
        text = self._to_blob(payload)
        results: list[AlertDetectionResult] = []
        seen_types: set[str] = set()

        for rule in self._RULES:
            matched_keyword = self._first_match(text, rule.keywords)
            if matched_keyword is None:
                continue
            if rule.alert_type in seen_types:
                continue

            seen_types.add(rule.alert_type)
            results.append(
                AlertDetectionResult(
                    alert_type=rule.alert_type,
                    severity=self._resolve_severity(
                        base_severity=rule.base_severity,
                        polarity=rule.polarity,
                        sentiment_label=payload.sentiment_label,
                        sentiment_score=payload.sentiment_score,
                    ),
                    title=rule.title_template.format(ticker=payload.ticker),
                    message=rule.message_template.format(ticker=payload.ticker),
                    rule_key=f"keyword:{matched_keyword}",
                )
            )

        return results

    @staticmethod
    def _to_blob(payload: AlertDetectionInput) -> str:
        parts = [payload.title, payload.snippet or "", payload.content or ""]
        return " ".join(part.strip().lower() for part in parts if part and part.strip())

    @staticmethod
    def _first_match(text: str, keywords: tuple[str, ...]) -> str | None:
        for keyword in keywords:
            if keyword in text:
                return keyword
        return None

    def _resolve_severity(
        self,
        *,
        base_severity: str,
        polarity: str,
        sentiment_label: str | None,
        sentiment_score: float | None,
    ) -> str:
        if sentiment_label is None or sentiment_score is None:
            return base_severity

        severity = base_severity
        if polarity == "negative" and sentiment_label == "negative" and sentiment_score <= -0.6:
            severity = self._bump_severity(severity)
        elif polarity == "positive" and sentiment_label == "positive" and sentiment_score >= 0.6:
            severity = self._bump_severity(severity)
        elif polarity == "positive" and sentiment_label == "negative" and sentiment_score <= -0.5:
            severity = self._lower_severity(severity)
        return severity

    def _bump_severity(self, severity: str) -> str:
        idx = self._SEVERITY_ORDER.index(severity)
        if idx >= len(self._SEVERITY_ORDER) - 1:
            return severity
        return self._SEVERITY_ORDER[idx + 1]

    def _lower_severity(self, severity: str) -> str:
        idx = self._SEVERITY_ORDER.index(severity)
        if idx <= 0:
            return severity
        return self._SEVERITY_ORDER[idx - 1]
