"""
Analytics response schemas.
"""

from pydantic import BaseModel, Field


class SectorExposureItemRead(BaseModel):
    """Sector allocation row for a portfolio."""

    sector: str
    weight_percent: float = Field(ge=0, le=100)
    holding_count: int = Field(ge=0)


class SectorExposureRead(BaseModel):
    """Sector exposure response payload."""

    portfolio_id: int
    portfolio_name: str
    total_holdings: int = Field(ge=0)
    total_value_basis: float = Field(ge=0)
    sector_exposure: list[SectorExposureItemRead]
    notes: list[str]


class DiversificationBreakdownRead(BaseModel):
    """Factor breakdown for diversification score."""

    sector_count: int = Field(ge=0)
    max_sector_concentration_percent: float = Field(ge=0, le=100)
    holding_count: int = Field(ge=0)
    sector_breadth_points: float
    concentration_points: float
    holding_count_points: float
    notes: list[str]


class DiversificationScoreRead(BaseModel):
    """Diversification score response payload."""

    portfolio_id: int
    portfolio_name: str
    score: float = Field(ge=0, le=100)
    label: str
    breakdown: DiversificationBreakdownRead


class RiskBreakdownRead(BaseModel):
    """Factor breakdown for risk score."""

    max_sector_concentration_percent: float = Field(ge=0, le=100)
    sector_count: int = Field(ge=0)
    holding_count: int = Field(ge=0)
    etf_holding_percent: float = Field(ge=0, le=100)
    concentration_points: float
    single_sector_penalty: float
    holding_count_penalty: float
    etf_mix_adjustment: float
    notes: list[str]


class RiskScoreRead(BaseModel):
    """Risk score response payload."""

    portfolio_id: int
    portfolio_name: str
    score: float = Field(ge=0, le=100)
    risk_level: str
    higher_score_means_higher_risk: bool = True
    breakdown: RiskBreakdownRead


class HealthBreakdownRead(BaseModel):
    """Factor breakdown for health score."""

    diversification_score: float = Field(ge=0, le=100)
    risk_score: float = Field(ge=0, le=100)
    diversification_contribution: float
    inverse_risk_contribution: float
    notes: list[str]


class HealthScoreRead(BaseModel):
    """Health score response payload."""

    portfolio_id: int
    portfolio_name: str
    score: float = Field(ge=0, le=100)
    label: str
    breakdown: HealthBreakdownRead


class AnalyticsSummaryRead(BaseModel):
    """Aggregated analytics response payload."""

    portfolio_id: int
    portfolio_name: str
    sector_exposure: SectorExposureRead
    diversification: DiversificationScoreRead
    risk: RiskScoreRead
    health: HealthScoreRead

