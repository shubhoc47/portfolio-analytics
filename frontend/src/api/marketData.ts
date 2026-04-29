import { apiRequest } from "./client";

const MARKET_DATA_BASE = "/api/v1/market-data";

export interface PriceRefreshQuote {
  ticker: string;
  current_price: number;
  provider: string;
  quote_source: "finnhub" | "cache" | "mock";
  fetched_at: string;
}

export interface PriceRefreshFailure {
  ticker: string;
  reason: string;
}

export interface PortfolioPriceRefreshResponse {
  portfolio_id: number;
  tickers_requested: string[];
  updated_count: number;
  failed_count: number;
  skipped_count: number;
  updated_quotes: PriceRefreshQuote[];
  failures: PriceRefreshFailure[];
  notes: string[];
  cache_hit_count: number;
  provider_call_count: number;
}

export interface RefreshAllPricesResponse {
  portfolios_processed: number;
  unique_tickers_requested: string[];
  updated_holdings_count: number;
  provider_call_count: number;
  cache_hit_count: number;
  failed_count: number;
  failures: PriceRefreshFailure[];
  notes: string[];
}

export interface SymbolSearchResult {
  symbol: string;
  description: string;
  display_symbol: string;
  type: string;
  provider: string;
}

/** Ask backend to fetch Finnhub quotes and persist Holding.current_price. */
export function refreshPortfolioPrices(
  portfolioId: number,
): Promise<PortfolioPriceRefreshResponse> {
  return apiRequest<PortfolioPriceRefreshResponse>(
    `${MARKET_DATA_BASE}/portfolios/${portfolioId}/refresh-prices`,
    { method: "POST" },
  );
}

export function refreshAllPortfolioPrices(): Promise<RefreshAllPricesResponse> {
  return apiRequest<RefreshAllPricesResponse>(`${MARKET_DATA_BASE}/refresh-all-prices`, {
    method: "POST",
  });
}

export function searchSymbols(query: string): Promise<SymbolSearchResult[]> {
  const params = new URLSearchParams({ query });
  return apiRequest<SymbolSearchResult[]>(
    `${MARKET_DATA_BASE}/search?${params.toString()}`,
    { method: "GET" },
  );
}
