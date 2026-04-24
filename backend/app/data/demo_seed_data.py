"""
Canonical demo portfolios and holdings for local development.

Used by SeedService (POST /dev/seed, POST /dev/reseed) and scripts/reseed_demo_data.py.
"""

from decimal import Decimal
from typing import Any, TypedDict


class _HoldingSeed(TypedDict, total=False):
    ticker: str
    company_name: str
    asset_type: str
    sector: str
    quantity: Decimal
    average_cost: Decimal
    current_price: Decimal
    weight_percent: Decimal


class _PortfolioSeed(TypedDict):
    portfolio: dict[str, str | None]
    holdings: list[_HoldingSeed]


def _finalize_portfolios(raw: list[_PortfolioSeed]) -> list[dict[str, Any]]:
    """Attach weight_percent from cost basis so rows sum to ~100%."""
    out: list[dict[str, Any]] = []
    for item in raw:
        holdings = item["holdings"]
        total_value = sum(h["quantity"] * h["average_cost"] for h in holdings)
        enriched_holdings: list[dict[str, Any]] = []
        accumulated = Decimal("0")
        for i, h in enumerate(holdings):
            row = dict(h)
            value = h["quantity"] * h["average_cost"]
            if total_value == 0:
                row["weight_percent"] = None
            elif i < len(holdings) - 1:
                wp = (value / total_value * Decimal("100")).quantize(Decimal("0.01"))
                accumulated += wp
                row["weight_percent"] = wp
            else:
                row["weight_percent"] = (Decimal("100") - accumulated).quantize(Decimal("0.01"))
            enriched_holdings.append(row)
        out.append({"portfolio": dict(item["portfolio"]), "holdings": enriched_holdings})
    return out


_RAW: list[_PortfolioSeed] = [
    {
        "portfolio": {
            "name": "US Technology Growth",
            "description": (
                "US-listed technology and software leaders; pure equities for growth "
                "and sector exposure (no ADRs of foreign-only names)."
            ),
            "base_currency": "USD",
            "owner_name": "Demo User",
        },
        "holdings": [
            {
                "ticker": "AAPL",
                "company_name": "Apple Inc.",
                "asset_type": "Equity",
                "sector": "Technology",
                "quantity": Decimal("18"),
                "average_cost": Decimal("178.40"),
                "current_price": Decimal("192.15"),
            },
            {
                "ticker": "MSFT",
                "company_name": "Microsoft Corporation",
                "asset_type": "Equity",
                "sector": "Technology",
                "quantity": Decimal("11"),
                "average_cost": Decimal("385.20"),
                "current_price": Decimal("408.90"),
            },
            {
                "ticker": "NVDA",
                "company_name": "NVIDIA Corporation",
                "asset_type": "Equity",
                "sector": "Technology",
                "quantity": Decimal("14"),
                "average_cost": Decimal("118.60"),
                "current_price": Decimal("134.25"),
            },
            {
                "ticker": "GOOGL",
                "company_name": "Alphabet Inc.",
                "asset_type": "Equity",
                "sector": "Communication Services",
                "quantity": Decimal("15"),
                "average_cost": Decimal("138.75"),
                "current_price": Decimal("151.20"),
            },
            {
                "ticker": "META",
                "company_name": "Meta Platforms Inc.",
                "asset_type": "Equity",
                "sector": "Communication Services",
                "quantity": Decimal("9"),
                "average_cost": Decimal("312.00"),
                "current_price": Decimal("335.80"),
            },
            {
                "ticker": "AMD",
                "company_name": "Advanced Micro Devices Inc.",
                "asset_type": "Equity",
                "sector": "Technology",
                "quantity": Decimal("35"),
                "average_cost": Decimal("142.10"),
                "current_price": Decimal("155.60"),
            },
            {
                "ticker": "AVGO",
                "company_name": "Broadcom Inc.",
                "asset_type": "Equity",
                "sector": "Technology",
                "quantity": Decimal("6"),
                "average_cost": Decimal("1185.00"),
                "current_price": Decimal("1248.40"),
            },
            {
                "ticker": "CSCO",
                "company_name": "Cisco Systems Inc.",
                "asset_type": "Equity",
                "sector": "Technology",
                "quantity": Decimal("32"),
                "average_cost": Decimal("48.20"),
                "current_price": Decimal("50.15"),
            },
            {
                "ticker": "INTC",
                "company_name": "Intel Corporation",
                "asset_type": "Equity",
                "sector": "Technology",
                "quantity": Decimal("40"),
                "average_cost": Decimal("21.40"),
                "current_price": Decimal("22.85"),
            },
            {
                "ticker": "CRM",
                "company_name": "Salesforce Inc.",
                "asset_type": "Equity",
                "sector": "Technology",
                "quantity": Decimal("8"),
                "average_cost": Decimal("248.50"),
                "current_price": Decimal("261.30"),
            },
            {
                "ticker": "NFLX",
                "company_name": "Netflix Inc.",
                "asset_type": "Equity",
                "sector": "Communication Services",
                "quantity": Decimal("5"),
                "average_cost": Decimal("612.00"),
                "current_price": Decimal("645.30"),
            },
            {
                "ticker": "ORCL",
                "company_name": "Oracle Corporation",
                "asset_type": "Equity",
                "sector": "Technology",
                "quantity": Decimal("12"),
                "average_cost": Decimal("128.60"),
                "current_price": Decimal("135.20"),
            },
        ],
    },
    {
        "portfolio": {
            "name": "US Dividend Income",
            "description": (
                "Dividend-oriented US large caps across staples, healthcare, energy, and "
                "other yield-heavy sectors. All US-listed common stocks."
            ),
            "base_currency": "USD",
            "owner_name": "Demo User",
        },
        "holdings": [
            {
                "ticker": "JNJ",
                "company_name": "Johnson & Johnson",
                "asset_type": "Equity",
                "sector": "Healthcare",
                "quantity": Decimal("22"),
                "average_cost": Decimal("152.80"),
                "current_price": Decimal("158.20"),
            },
            {
                "ticker": "PG",
                "company_name": "Procter & Gamble Co.",
                "asset_type": "Equity",
                "sector": "Consumer Staples",
                "quantity": Decimal("18"),
                "average_cost": Decimal("151.40"),
                "current_price": Decimal("159.10"),
            },
            {
                "ticker": "KO",
                "company_name": "The Coca-Cola Company",
                "asset_type": "Equity",
                "sector": "Consumer Staples",
                "quantity": Decimal("45"),
                "average_cost": Decimal("58.20"),
                "current_price": Decimal("61.45"),
            },
            {
                "ticker": "VZ",
                "company_name": "Verizon Communications Inc.",
                "asset_type": "Equity",
                "sector": "Communication Services",
                "quantity": Decimal("60"),
                "average_cost": Decimal("38.90"),
                "current_price": Decimal("40.15"),
            },
            {
                "ticker": "MRK",
                "company_name": "Merck & Co. Inc.",
                "asset_type": "Equity",
                "sector": "Healthcare",
                "quantity": Decimal("25"),
                "average_cost": Decimal("104.20"),
                "current_price": Decimal("108.60"),
            },
            {
                "ticker": "WMT",
                "company_name": "Walmart Inc.",
                "asset_type": "Equity",
                "sector": "Consumer Staples",
                "quantity": Decimal("14"),
                "average_cost": Decimal("62.80"),
                "current_price": Decimal("67.40"),
            },
            {
                "ticker": "XOM",
                "company_name": "Exxon Mobil Corporation",
                "asset_type": "Equity",
                "sector": "Energy",
                "quantity": Decimal("30"),
                "average_cost": Decimal("108.50"),
                "current_price": Decimal("112.20"),
            },
            {
                "ticker": "MCD",
                "company_name": "McDonald's Corporation",
                "asset_type": "Equity",
                "sector": "Consumer Cyclical",
                "quantity": Decimal("8"),
                "average_cost": Decimal("285.00"),
                "current_price": Decimal("292.50"),
            },
            {
                "ticker": "PEP",
                "company_name": "PepsiCo Inc.",
                "asset_type": "Equity",
                "sector": "Consumer Staples",
                "quantity": Decimal("16"),
                "average_cost": Decimal("168.50"),
                "current_price": Decimal("172.80"),
            },
            {
                "ticker": "CVX",
                "company_name": "Chevron Corporation",
                "asset_type": "Equity",
                "sector": "Energy",
                "quantity": Decimal("18"),
                "average_cost": Decimal("152.40"),
                "current_price": Decimal("156.80"),
            },
            {
                "ticker": "T",
                "company_name": "AT&T Inc.",
                "asset_type": "Equity",
                "sector": "Communication Services",
                "quantity": Decimal("85"),
                "average_cost": Decimal("18.40"),
                "current_price": Decimal("19.25"),
            },
            {
                "ticker": "O",
                "company_name": "Realty Income Corporation",
                "asset_type": "Equity",
                "sector": "Real Estate",
                "quantity": Decimal("25"),
                "average_cost": Decimal("54.20"),
                "current_price": Decimal("55.60"),
            },
        ],
    },
    {
        "portfolio": {
            "name": "US Defensive ETF Core",
            "description": (
                "Defensive, lower-volatility US allocation using US-listed ETFs only: "
                "broad US equity, min-volatility, consumer staples, bonds, and US "
                "minimum-volatility factor exposure."
            ),
            "base_currency": "USD",
            "owner_name": "Demo User",
        },
        "holdings": [
            {
                "ticker": "VOO",
                "company_name": "Vanguard S&P 500 ETF",
                "asset_type": "ETF",
                "sector": "ETF",
                "quantity": Decimal("25"),
                "average_cost": Decimal("468.20"),
                "current_price": Decimal("478.90"),
            },
            {
                "ticker": "BND",
                "company_name": "Vanguard Total Bond Market ETF",
                "asset_type": "ETF",
                "sector": "ETF",
                "quantity": Decimal("120"),
                "average_cost": Decimal("72.50"),
                "current_price": Decimal("73.85"),
            },
            {
                "ticker": "SPLV",
                "company_name": "Invesco S&P 500 Low Volatility ETF",
                "asset_type": "ETF",
                "sector": "ETF",
                "quantity": Decimal("40"),
                "average_cost": Decimal("62.10"),
                "current_price": Decimal("63.80"),
            },
            {
                "ticker": "XLP",
                "company_name": "Consumer Staples Select Sector SPDR Fund",
                "asset_type": "ETF",
                "sector": "ETF",
                "quantity": Decimal("35"),
                "average_cost": Decimal("75.20"),
                "current_price": Decimal("77.40"),
            },
            {
                "ticker": "USMV",
                "company_name": "iShares MSCI USA Min Vol Factor ETF",
                "asset_type": "ETF",
                "sector": "ETF",
                "quantity": Decimal("30"),
                "average_cost": Decimal("82.40"),
                "current_price": Decimal("84.20"),
            },
        ],
    },
]

DEMO_PORTFOLIOS: list[dict[str, Any]] = _finalize_portfolios(_RAW)
