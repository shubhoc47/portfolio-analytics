"""
Alert repository.

Contains data-access logic for active alert storage and deduplicated upsert behavior.
"""

from datetime import datetime, timezone

from sqlalchemy import Select, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.alert import Alert


class AlertRepository:
    """Database operations for the Alert model."""

    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def list_active_by_portfolio(
        self,
        portfolio_id: int,
        limit: int = 200,
    ) -> list[Alert]:
        stmt: Select[tuple[Alert]] = (
            select(Alert)
            .where(
                Alert.portfolio_id == portfolio_id,
                Alert.is_active.is_(True),
            )
            .order_by(Alert.triggered_at.desc(), Alert.id.desc())
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def find_active_duplicate(
        self,
        *,
        portfolio_id: int,
        holding_id: int | None,
        source_kind: str,
        source_article_id: int | None,
        source_summary_id: int | None,
        alert_type: str,
        title: str,
    ) -> Alert | None:
        stmt = select(Alert).where(
            Alert.portfolio_id == portfolio_id,
            Alert.alert_type == alert_type,
            Alert.source_kind == source_kind,
            Alert.is_active.is_(True),
        )

        if source_article_id is not None:
            stmt = stmt.where(Alert.source_article_id == source_article_id)
        elif source_summary_id is not None:
            stmt = stmt.where(Alert.source_summary_id == source_summary_id)
        else:
            if holding_id is None:
                stmt = stmt.where(Alert.holding_id.is_(None))
            else:
                stmt = stmt.where(Alert.holding_id == holding_id)
            stmt = stmt.where(Alert.title == title)

        result = await self.db.execute(stmt.order_by(Alert.id.desc()))
        return result.scalars().first()

    async def upsert_active_alert(
        self,
        *,
        portfolio_id: int,
        holding_id: int | None,
        ticker: str | None,
        source_kind: str,
        source_article_id: int | None,
        source_summary_id: int | None,
        alert_type: str,
        severity: str,
        title: str,
        message: str,
        detector_name: str | None,
        detected_at: datetime | None = None,
    ) -> tuple[Alert, bool]:
        target_detected_at = detected_at or datetime.now(timezone.utc)
        existing = await self.find_active_duplicate(
            portfolio_id=portfolio_id,
            holding_id=holding_id,
            source_kind=source_kind,
            source_article_id=source_article_id,
            source_summary_id=source_summary_id,
            alert_type=alert_type,
            title=title,
        )
        if existing:
            existing.holding_id = holding_id
            existing.ticker = ticker
            existing.source_article_id = source_article_id
            existing.source_summary_id = source_summary_id
            existing.severity = severity
            existing.title = title
            existing.message = message
            existing.detector_name = detector_name
            existing.triggered_at = target_detected_at
            existing.resolved_at = None
            existing.is_active = True
            await self.db.flush()
            await self.db.refresh(existing)
            return existing, False

        row = Alert(
            portfolio_id=portfolio_id,
            holding_id=holding_id,
            ticker=ticker,
            source_kind=source_kind,
            source_article_id=source_article_id,
            source_summary_id=source_summary_id,
            alert_type=alert_type,
            severity=severity,
            title=title,
            message=message,
            detector_name=detector_name,
            is_active=True,
            triggered_at=target_detected_at,
            resolved_at=None,
        )
        self.db.add(row)
        await self.db.flush()
        await self.db.refresh(row)
        return row, True
