import { apiRequest } from "./client";
import type { AlertRefreshResponse, PortfolioAlertsListResponse } from "../features/intelligence/types";

const ALERTS_BASE_PATH = "/api/v1/alerts/portfolios";

export function refreshPortfolioAlerts(portfolioId: number): Promise<AlertRefreshResponse> {
  return apiRequest<AlertRefreshResponse>(`${ALERTS_BASE_PATH}/${portfolioId}/refresh`, {
    method: "POST",
  });
}

export function listPortfolioAlerts(
  portfolioId: number,
  limit = 100,
): Promise<PortfolioAlertsListResponse> {
  return apiRequest<PortfolioAlertsListResponse>(
    `${ALERTS_BASE_PATH}/${portfolioId}?limit=${limit}`,
    {
      method: "GET",
    },
  );
}
