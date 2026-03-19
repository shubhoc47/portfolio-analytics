"""
Mock news provider for local development.
"""

from datetime import UTC, datetime

from app.providers.news.base import ProviderArticle


class MockNewsProvider:
    """Deterministic mock news source for seeded/demo holdings."""

    _ARTICLES: list[ProviderArticle] = [
        ProviderArticle(
            external_id="mk-aapl-001",
            title="Apple Expands On-Device AI Features for Enterprise iPhones",
            source="MarketWire Daily",
            url="https://news.demo/tech/apple-ai-enterprise",
            published_at=datetime(2026, 3, 15, 13, 20, tzinfo=UTC),
            ticker="AAPL",
            summary="Apple unveiled additional on-device AI workflows focused on security-sensitive enterprise teams.",
            content="The update focuses on AI-assisted workflows that keep inference on-device for privacy-first corporate rollouts.",
            author="Riya Sharma",
        ),
        ProviderArticle(
            external_id="mk-aapl-dup-url",
            title="Apple Expands On-Device AI Features for Enterprise iPhones",
            source="MarketWire Daily",
            url="https://news.demo/tech/apple-ai-enterprise?utm_source=feed",
            published_at=datetime(2026, 3, 15, 13, 20, tzinfo=UTC),
            ticker="AAPL",
            summary="Duplicate-like variant with tracking query params in URL.",
            content="Canonical URL normalization should collapse this with mk-aapl-001.",
            author="Riya Sharma",
        ),
        ProviderArticle(
            external_id="mk-msft-001",
            title="Microsoft Reports Strong Azure Demand from Regulated Industries",
            source="Global Finance Beat",
            url="https://news.demo/cloud/microsoft-azure-regulated-industries",
            published_at=datetime(2026, 3, 15, 10, 5, tzinfo=UTC),
            ticker="MSFT",
            summary="Azure demand remained resilient among healthcare and financial services customers.",
            content="Analysts highlight margin expansion tied to enterprise cloud optimization contracts.",
            author="Noah Patel",
        ),
        ProviderArticle(
            external_id="mk-nvda-001",
            title="NVIDIA Introduces New Data Center GPU Roadmap Milestones",
            source="Semiconductor Report",
            url="https://news.demo/chips/nvidia-datacenter-roadmap-2026",
            published_at=datetime(2026, 3, 14, 16, 45, tzinfo=UTC),
            ticker="NVDA",
            summary="The chipmaker shared roadmap checkpoints for high-throughput AI workloads.",
            content="Roadmap details include energy-efficiency gains and expanded partner deployments.",
            author="Liam Wong",
        ),
        ProviderArticle(
            external_id="mk-jnj-001",
            title="Johnson & Johnson Updates Long-Term MedTech Investment Outlook",
            source="Healthcare Markets",
            url="https://news.demo/healthcare/jnj-medtech-outlook",
            published_at=datetime(2026, 3, 14, 9, 40, tzinfo=UTC),
            ticker="JNJ",
            summary="Management reiterated multi-year MedTech expansion guidance.",
            content="The company emphasized steady cash generation and innovation in surgical platforms.",
            author="Ava Rodriguez",
        ),
        ProviderArticle(
            external_id="mk-ko-001",
            title="Coca-Cola Highlights International Pricing Discipline in Quarterly Brief",
            source="Consumer Staples Journal",
            url="https://news.demo/staples/coca-cola-pricing-discipline",
            published_at=datetime(2026, 3, 13, 18, 0, tzinfo=UTC),
            ticker="KO",
            summary="Executives discussed balanced pricing and volume trends across regions.",
            content="Staples investors watch margin durability amid commodity cost volatility.",
            author="Maya Kapoor",
        ),
        ProviderArticle(
            external_id="mk-voo-001",
            title="Large-Cap U.S. Equity ETFs See Broad Inflows",
            source="ETF Observer",
            url="https://news.demo/etf/large-cap-us-etf-inflows",
            published_at=datetime(2026, 3, 13, 12, 30, tzinfo=UTC),
            ticker="VOO",
            summary="Broad market ETFs attracted steady inflows after macro volatility cooled.",
            content="VOO and peer products benefited from renewed passive allocation demand.",
            author="Ethan Lee",
        ),
        ProviderArticle(
            external_id="mk-qqq-001",
            title="Nasdaq-100 Focused Funds Gain as Mega-Cap Tech Leads",
            source="ETF Observer",
            url="https://news.demo/etf/nasdaq-100-funds-gain-megacap-tech",
            published_at=datetime(2026, 3, 13, 14, 10, tzinfo=UTC),
            ticker="QQQ",
            summary="Growth-heavy index products advanced on continued strength in software names.",
            content="Market participants cited improving earnings revisions for large-cap tech leaders.",
            author="Ethan Lee",
        ),
        ProviderArticle(
            external_id="mk-vti-001",
            title="Total U.S. Market ETFs Benefit from Diversified Rotation",
            source="ETF Weekly",
            url="https://news.demo/etf/total-market-diversified-rotation",
            published_at=datetime(2026, 3, 12, 11, 55, tzinfo=UTC),
            ticker="VTI",
            summary="Breadth improved as investors rotated into a wider set of U.S. sectors.",
            content="Diversified index trackers captured participation beyond mega-cap concentration.",
            author="Sofia Kim",
        ),
        ProviderArticle(
            external_id="mk-generic-us-001",
            title="U.S. Equities Close Higher as Yields Stabilize",
            source="Global Finance Beat",
            url="https://news.demo/markets/us-equities-yields-stabilize",
            published_at=datetime(2026, 3, 15, 20, 10, tzinfo=UTC),
            ticker=None,
            summary="Major U.S. indices ended higher as treasury market volatility eased.",
            content="Portfolio managers noted improving risk appetite into the close.",
            author="Noah Patel",
        ),
    ]

    def fetch_articles(
        self,
        tickers: list[str],
        *,
        portfolio_name: str | None = None,
    ) -> list[ProviderArticle]:
        """
        Return mock articles filtered by ticker plus one generic market item.

        This is deterministic and intentionally includes duplicate-like URL variants
        so deduplication behavior can be tested.
        """

        normalized_tickers = {ticker.strip().upper() for ticker in tickers if ticker.strip()}
        if not normalized_tickers:
            return []

        articles = [
            article
            for article in self._ARTICLES
            if article.ticker is None or article.ticker in normalized_tickers
        ]

        # Keep output order stable across calls for easier testing.
        return sorted(articles, key=lambda item: (item.published_at, item.url), reverse=True)

