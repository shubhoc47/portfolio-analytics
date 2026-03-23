"""
Deterministic template-based summary provider (no external AI).
"""

from __future__ import annotations

import re

from app.providers.summary.base import (
    ArticleSummaryInput,
    DailyBriefSummaryInput,
    PortfolioSummaryInput,
    SummaryResult,
    WeeklyHoldingSummaryInput,
)


class TemplateSummaryProvider:
    """Rule-based summaries grounded only in passed-in local strings."""

    PROVIDER_NAME = "template_v1"
    DEFAULT_WORD_TARGET = 120
    MAX_WORD_HARD = 150

    def summarize_daily_brief(self, payload: DailyBriefSummaryInput) -> SummaryResult:
        parts: list[str] = []
        b = payload.batch
        if not b.articles:
            content = f"No local articles were stored for {b.ticker} on this date."
            return SummaryResult(
                content=content,
                word_count=_word_count(content),
                provider_name=self.PROVIDER_NAME,
            )

        company = b.company_name or b.ticker
        parts.append(f"{company} ({b.ticker}): key developments from stored local headlines.")
        for art in b.articles[:8]:
            line = f"- {art.title.strip()}"
            if art.sentiment_label:
                line += f" [{art.sentiment_label}]"
            if art.snippet:
                snippet = _truncate_words(art.snippet.strip(), 24)
                line += f" — {snippet}"
            parts.append(line)

        raw = " ".join(parts)
        content = _fit_word_limit(raw, payload.target_word_limit or self.DEFAULT_WORD_TARGET)
        return SummaryResult(
            content=content,
            word_count=_word_count(content),
            provider_name=self.PROVIDER_NAME,
        )

    def summarize_weekly_holding(self, payload: WeeklyHoldingSummaryInput) -> SummaryResult:
        if not payload.daily_briefs:
            content = f"No stored daily briefs for {payload.ticker} in the selected window."
            return SummaryResult(
                content=content,
                word_count=_word_count(content),
                provider_name=self.PROVIDER_NAME,
            )

        company = payload.company_name or payload.ticker
        lines = [" ".join([f"{company} ({payload.ticker}) week in review:", ""])]
        for b in payload.daily_briefs:
            excerpt = _truncate_words(b.content.strip(), 28)
            lines.append(f"• {b.summary_date}: {excerpt}")

        raw = "\n".join(lines)
        content = _fit_word_limit(raw, payload.target_word_limit or self.DEFAULT_WORD_TARGET)
        return SummaryResult(
            content=content,
            word_count=_word_count(content),
            provider_name=self.PROVIDER_NAME,
        )

    def summarize_portfolio(self, payload: PortfolioSummaryInput) -> SummaryResult:
        if not payload.lines:
            content = "No holding-level summaries were available to build a portfolio summary."
            return SummaryResult(
                content=content,
                word_count=_word_count(content),
                provider_name=self.PROVIDER_NAME,
            )

        intro = f"Portfolio “{payload.portfolio_name}”: themes from stored holding summaries."
        body_parts: list[str] = [intro]
        for ticker, text in payload.lines[:15]:
            excerpt = _truncate_words(text.strip(), 32)
            body_parts.append(f"{ticker}: {excerpt}")

        raw = "\n".join(body_parts)
        content = _fit_word_limit(raw, payload.target_word_limit or self.DEFAULT_WORD_TARGET)
        return SummaryResult(
            content=content,
            word_count=_word_count(content),
            provider_name=self.PROVIDER_NAME,
        )


def _word_count(text: str) -> int:
    if not text.strip():
        return 0
    return len(re.findall(r"\S+", text))


def _truncate_words(text: str, max_words: int) -> str:
    words = text.split()
    if len(words) <= max_words:
        return text
    return " ".join(words[:max_words]) + "…"


def _fit_word_limit(text: str, target: int) -> str:
    words = text.split()
    if len(words) <= min(target, TemplateSummaryProvider.MAX_WORD_HARD):
        return text.strip()

    # Prefer trimming to target words; hard cap for safety.
    limit = min(target, TemplateSummaryProvider.MAX_WORD_HARD)
    trimmed = " ".join(words[:limit])
    if not trimmed.endswith("…") and len(words) > limit:
        trimmed += "…"
    return trimmed.strip()
