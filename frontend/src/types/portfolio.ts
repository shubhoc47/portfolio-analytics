export interface Portfolio {
  id: number;
  name: string;
  description: string | null;
  base_currency: string;
  owner_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface PortfolioCreateInput {
  name: string;
  description?: string | null;
  base_currency: string;
  owner_name?: string | null;
}

export interface PortfolioUpdateInput {
  name?: string;
  description?: string | null;
  base_currency?: string;
  owner_name?: string | null;
}
