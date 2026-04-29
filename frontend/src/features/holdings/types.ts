export interface Holding {
  id: number;
  portfolio_id: number;
  ticker: string;
  company_name: string | null;
  asset_type: string;
  sector: string | null;
  quantity: number;
  average_cost: number;
  current_price: number | null;
  currency: string;
  weight_percent: number | null;
  created_at: string;
  updated_at: string;
}

export interface HoldingCreateInput {
  ticker: string;
  company_name?: string | null;
  quantity: number;
  average_cost: number;
  sector: string;
  asset_type?: string;
}

export interface HoldingUpdateInput {
  ticker?: string;
  company_name?: string | null;
  quantity?: number;
  average_cost?: number;
  sector?: string;
}

export interface HoldingSectorSuggestion {
  ticker: string;
  suggested_sector: string | null;
  source: "existing_holdings" | "none";
}
