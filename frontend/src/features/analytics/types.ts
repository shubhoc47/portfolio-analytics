export interface SectorExposureItem {
  sector: string;
  weight_percent: number;
  holding_count: number;
}

export interface SectorExposure {
  portfolio_id: number;
  portfolio_name: string;
  total_holdings: number;
  total_value_basis: number;
  sector_exposure: SectorExposureItem[];
  notes: string[];
}

export interface DiversificationBreakdown {
  sector_count: number;
  max_sector_concentration_percent: number;
  holding_count: number;
  sector_breadth_points: number;
  concentration_points: number;
  holding_count_points: number;
  notes: string[];
}

export interface DiversificationScore {
  portfolio_id: number;
  portfolio_name: string;
  score: number;
  label: string;
  breakdown: DiversificationBreakdown;
}

export interface RiskBreakdown {
  max_sector_concentration_percent: number;
  sector_count: number;
  holding_count: number;
  etf_holding_percent: number;
  concentration_points: number;
  single_sector_penalty: number;
  holding_count_penalty: number;
  etf_mix_adjustment: number;
  notes: string[];
}

export interface RiskScore {
  portfolio_id: number;
  portfolio_name: string;
  score: number;
  risk_level: string;
  higher_score_means_higher_risk: boolean;
  breakdown: RiskBreakdown;
}

export interface HealthBreakdown {
  diversification_score: number;
  risk_score: number;
  diversification_contribution: number;
  inverse_risk_contribution: number;
  notes: string[];
}

export interface HealthScore {
  portfolio_id: number;
  portfolio_name: string;
  score: number;
  label: string;
  breakdown: HealthBreakdown;
}

export interface AnalyticsSummary {
  portfolio_id: number;
  portfolio_name: string;
  sector_exposure: SectorExposure;
  diversification: DiversificationScore;
  risk: RiskScore;
  health: HealthScore;
}
