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
            "name": "Apex Tech Growth",
            "description": (
                "High-growth US technology and semiconductor exposure with a small "
                "ETF sleeve for diversification."
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
                "ticker": "AMZN",
                "company_name": "Amazon.com Inc.",
                "asset_type": "Equity",
                "sector": "Consumer Cyclical",
                "quantity": Decimal("20"),
                "average_cost": Decimal("168.30"),
                "current_price": Decimal("182.40"),
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
                "ticker": "CRM",
                "company_name": "Salesforce Inc.",
                "asset_type": "Equity",
                "sector": "Technology",
                "quantity": Decimal("8"),
                "average_cost": Decimal("248.50"),
                "current_price": Decimal("261.30"),
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
                "ticker": "ADBE",
                "company_name": "Adobe Inc.",
                "asset_type": "Equity",
                "sector": "Technology",
                "quantity": Decimal("7"),
                "average_cost": Decimal("498.20"),
                "current_price": Decimal("512.90"),
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
                "ticker": "QQQ",
                "company_name": "Invesco QQQ Trust",
                "asset_type": "ETF",
                "sector": "ETF",
                "quantity": Decimal("10"),
                "average_cost": Decimal("428.00"),
                "current_price": Decimal("441.50"),
            },
            {
                "ticker": "SOXX",
                "company_name": "iShares Semiconductor ETF",
                "asset_type": "ETF",
                "sector": "ETF",
                "quantity": Decimal("22"),
                "average_cost": Decimal("198.40"),
                "current_price": Decimal("210.75"),
            },
        ],
    },
    {
        "portfolio": {
            "name": "Sterling Dividend Income",
            "description": (
                "Dividend-focused equities and quality income ETFs for yield-oriented "
                "analytics and defensive sector mix."
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
                "ticker": "PEP",
                "company_name": "PepsiCo Inc.",
                "asset_type": "Equity",
                "sector": "Consumer Staples",
                "quantity": Decimal("16"),
                "average_cost": Decimal("168.50"),
                "current_price": Decimal("172.80"),
            },
            {
                "ticker": "SCHD",
                "company_name": "Schwab US Dividend Equity ETF",
                "asset_type": "ETF",
                "sector": "ETF",
                "quantity": Decimal("55"),
                "average_cost": Decimal("76.30"),
                "current_price": Decimal("79.85"),
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
                "ticker": "T",
                "company_name": "AT&T Inc.",
                "asset_type": "Equity",
                "sector": "Communication Services",
                "quantity": Decimal("85"),
                "average_cost": Decimal("18.40"),
                "current_price": Decimal("19.25"),
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
                "ticker": "CVX",
                "company_name": "Chevron Corporation",
                "asset_type": "Equity",
                "sector": "Energy",
                "quantity": Decimal("18"),
                "average_cost": Decimal("152.40"),
                "current_price": Decimal("156.80"),
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
        ],
    },
    {
        "portfolio": {
            "name": "Global Multi-Asset ETF Core",
            "description": (
                "Broad US equity, international, fixed income, and sector ETFs for "
                "diversification and benchmark-style analytics."
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
                "ticker": "VTI",
                "company_name": "Vanguard Total Stock Market ETF",
                "asset_type": "ETF",
                "sector": "ETF",
                "quantity": Decimal("18"),
                "average_cost": Decimal("265.40"),
                "current_price": Decimal("272.10"),
            },
            {
                "ticker": "QQQ",
                "company_name": "Invesco QQQ Trust",
                "asset_type": "ETF",
                "sector": "ETF",
                "quantity": Decimal("8"),
                "average_cost": Decimal("432.00"),
                "current_price": Decimal("441.50"),
            },
            {
                "ticker": "VXUS",
                "company_name": "Vanguard Total International Stock ETF",
                "asset_type": "ETF",
                "sector": "ETF",
                "quantity": Decimal("40"),
                "average_cost": Decimal("62.80"),
                "current_price": Decimal("64.20"),
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
                "ticker": "SCHD",
                "company_name": "Schwab US Dividend Equity ETF",
                "asset_type": "ETF",
                "sector": "ETF",
                "quantity": Decimal("30"),
                "average_cost": Decimal("77.10"),
                "current_price": Decimal("79.85"),
            },
            {
                "ticker": "XLF",
                "company_name": "Financial Select Sector SPDR Fund",
                "asset_type": "ETF",
                "sector": "ETF",
                "quantity": Decimal("70"),
                "average_cost": Decimal("40.20"),
                "current_price": Decimal("41.55"),
            },
            {
                "ticker": "XLV",
                "company_name": "Health Care Select Sector SPDR Fund",
                "asset_type": "ETF",
                "sector": "ETF",
                "quantity": Decimal("35"),
                "average_cost": Decimal("132.60"),
                "current_price": Decimal("136.40"),
            },
            {
                "ticker": "XLE",
                "company_name": "Energy Select Sector SPDR Fund",
                "asset_type": "ETF",
                "sector": "ETF",
                "quantity": Decimal("45"),
                "average_cost": Decimal("88.40"),
                "current_price": Decimal("91.20"),
            },
            {
                "ticker": "SOXX",
                "company_name": "iShares Semiconductor ETF",
                "asset_type": "ETF",
                "sector": "ETF",
                "quantity": Decimal("15"),
                "average_cost": Decimal("201.00"),
                "current_price": Decimal("210.75"),
            },
            {
                "ticker": "XLI",
                "company_name": "Industrial Select Sector SPDR Fund",
                "asset_type": "ETF",
                "sector": "ETF",
                "quantity": Decimal("40"),
                "average_cost": Decimal("112.30"),
                "current_price": Decimal("115.80"),
            },
            {
                "ticker": "XLK",
                "company_name": "Technology Select Sector SPDR Fund",
                "asset_type": "ETF",
                "sector": "ETF",
                "quantity": Decimal("22"),
                "average_cost": Decimal("198.50"),
                "current_price": Decimal("205.40"),
            },
        ],
    },
    {
        "portfolio": {
            "name": "Defensive Healthcare & Life Sciences",
            "description": (
                "Healthcare leaders, pharma, and tools exposure plus an XLV sleeve for "
                "defensive sector analytics."
            ),
            "base_currency": "USD",
            "owner_name": "Demo User",
        },
        "holdings": [
            {
                "ticker": "UNH",
                "company_name": "UnitedHealth Group Inc.",
                "asset_type": "Equity",
                "sector": "Healthcare",
                "quantity": Decimal("6"),
                "average_cost": Decimal("512.00"),
                "current_price": Decimal("528.40"),
            },
            {
                "ticker": "JNJ",
                "company_name": "Johnson & Johnson",
                "asset_type": "Equity",
                "sector": "Healthcare",
                "quantity": Decimal("14"),
                "average_cost": Decimal("154.20"),
                "current_price": Decimal("158.20"),
            },
            {
                "ticker": "ABBV",
                "company_name": "AbbVie Inc.",
                "asset_type": "Equity",
                "sector": "Healthcare",
                "quantity": Decimal("12"),
                "average_cost": Decimal("168.40"),
                "current_price": Decimal("175.60"),
            },
            {
                "ticker": "MRK",
                "company_name": "Merck & Co. Inc.",
                "asset_type": "Equity",
                "sector": "Healthcare",
                "quantity": Decimal("28"),
                "average_cost": Decimal("102.80"),
                "current_price": Decimal("108.60"),
            },
            {
                "ticker": "PFE",
                "company_name": "Pfizer Inc.",
                "asset_type": "Equity",
                "sector": "Healthcare",
                "quantity": Decimal("55"),
                "average_cost": Decimal("28.60"),
                "current_price": Decimal("27.85"),
            },
            {
                "ticker": "LLY",
                "company_name": "Eli Lilly and Company",
                "asset_type": "Equity",
                "sector": "Healthcare",
                "quantity": Decimal("4"),
                "average_cost": Decimal("612.00"),
                "current_price": Decimal("658.20"),
            },
            {
                "ticker": "TMO",
                "company_name": "Thermo Fisher Scientific Inc.",
                "asset_type": "Equity",
                "sector": "Healthcare",
                "quantity": Decimal("5"),
                "average_cost": Decimal("548.00"),
                "current_price": Decimal("562.30"),
            },
            {
                "ticker": "DHR",
                "company_name": "Danaher Corporation",
                "asset_type": "Equity",
                "sector": "Healthcare",
                "quantity": Decimal("7"),
                "average_cost": Decimal("238.50"),
                "current_price": Decimal("246.80"),
            },
            {
                "ticker": "AMGN",
                "company_name": "Amgen Inc.",
                "asset_type": "Equity",
                "sector": "Healthcare",
                "quantity": Decimal("9"),
                "average_cost": Decimal("278.20"),
                "current_price": Decimal("285.40"),
            },
            {
                "ticker": "GILD",
                "company_name": "Gilead Sciences Inc.",
                "asset_type": "Equity",
                "sector": "Healthcare",
                "quantity": Decimal("24"),
                "average_cost": Decimal("72.40"),
                "current_price": Decimal("76.10"),
            },
            {
                "ticker": "XLV",
                "company_name": "Health Care Select Sector SPDR Fund",
                "asset_type": "ETF",
                "sector": "ETF",
                "quantity": Decimal("30"),
                "average_cost": Decimal("128.50"),
                "current_price": Decimal("136.40"),
            },
        ],
    },
    {
        "portfolio": {
            "name": "Balanced Moderate Core",
            "description": (
                "Blend of mega-cap growth, quality defensives, financials, and a core "
                "ETF/fixed-income sleeve for balanced risk analytics."
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
                "quantity": Decimal("10"),
                "average_cost": Decimal("181.00"),
                "current_price": Decimal("192.15"),
            },
            {
                "ticker": "MSFT",
                "company_name": "Microsoft Corporation",
                "asset_type": "Equity",
                "sector": "Technology",
                "quantity": Decimal("7"),
                "average_cost": Decimal("392.00"),
                "current_price": Decimal("408.90"),
            },
            {
                "ticker": "GOOGL",
                "company_name": "Alphabet Inc.",
                "asset_type": "Equity",
                "sector": "Communication Services",
                "quantity": Decimal("12"),
                "average_cost": Decimal("141.20"),
                "current_price": Decimal("151.20"),
            },
            {
                "ticker": "JNJ",
                "company_name": "Johnson & Johnson",
                "asset_type": "Equity",
                "sector": "Healthcare",
                "quantity": Decimal("10"),
                "average_cost": Decimal("155.60"),
                "current_price": Decimal("158.20"),
            },
            {
                "ticker": "V",
                "company_name": "Visa Inc.",
                "asset_type": "Equity",
                "sector": "Financial Services",
                "quantity": Decimal("8"),
                "average_cost": Decimal("268.40"),
                "current_price": Decimal("278.90"),
            },
            {
                "ticker": "MA",
                "company_name": "Mastercard Inc.",
                "asset_type": "Equity",
                "sector": "Financial Services",
                "quantity": Decimal("6"),
                "average_cost": Decimal("428.00"),
                "current_price": Decimal("442.50"),
            },
            {
                "ticker": "JPM",
                "company_name": "JPMorgan Chase & Co.",
                "asset_type": "Equity",
                "sector": "Financial Services",
                "quantity": Decimal("11"),
                "average_cost": Decimal("188.20"),
                "current_price": Decimal("198.60"),
            },
            {
                "ticker": "HD",
                "company_name": "The Home Depot Inc.",
                "asset_type": "Equity",
                "sector": "Consumer Cyclical",
                "quantity": Decimal("9"),
                "average_cost": Decimal("342.00"),
                "current_price": Decimal("358.40"),
            },
            {
                "ticker": "COST",
                "company_name": "Costco Wholesale Corporation",
                "asset_type": "Equity",
                "sector": "Consumer Defensive",
                "quantity": Decimal("4"),
                "average_cost": Decimal("712.00"),
                "current_price": Decimal("738.20"),
            },
            {
                "ticker": "VOO",
                "company_name": "Vanguard S&P 500 ETF",
                "asset_type": "ETF",
                "sector": "ETF",
                "quantity": Decimal("12"),
                "average_cost": Decimal("471.50"),
                "current_price": Decimal("478.90"),
            },
            {
                "ticker": "BND",
                "company_name": "Vanguard Total Bond Market ETF",
                "asset_type": "ETF",
                "sector": "ETF",
                "quantity": Decimal("45"),
                "average_cost": Decimal("73.20"),
                "current_price": Decimal("73.85"),
            },
            {
                "ticker": "XOM",
                "company_name": "Exxon Mobil Corporation",
                "asset_type": "Equity",
                "sector": "Energy",
                "quantity": Decimal("22"),
                "average_cost": Decimal("110.80"),
                "current_price": Decimal("112.20"),
            },
            {
                "ticker": "KO",
                "company_name": "The Coca-Cola Company",
                "asset_type": "Equity",
                "sector": "Consumer Staples",
                "quantity": Decimal("35"),
                "average_cost": Decimal("59.40"),
                "current_price": Decimal("61.45"),
            },
            {
                "ticker": "UNH",
                "company_name": "UnitedHealth Group Inc.",
                "asset_type": "Equity",
                "sector": "Healthcare",
                "quantity": Decimal("3"),
                "average_cost": Decimal("525.00"),
                "current_price": Decimal("528.40"),
            },
        ],
    },
]

DEMO_PORTFOLIOS: list[dict[str, Any]] = _finalize_portfolios(_RAW)
