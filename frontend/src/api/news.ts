import { apiRequest } from "./client";
import type { NewsRefreshResponse, PortfolioNewsListResponse } from "../features/intelligence/types";

const NEWS_BASE_PATH = "/api/v1/news/portfolios";

export function refreshPortfolioNews(portfolioId: number): Promise<NewsRefreshResponse> {
  return apiRequest<NewsRefreshResponse>(`${NEWS_BASE_PATH}/${portfolioId}/refresh`, {
    method: "POST",
  });
}

export function listPortfolioNews(
  portfolioId: number,
  limit = 100,
): Promise<PortfolioNewsListResponse> {
  return apiRequest<PortfolioNewsListResponse>(`${NEWS_BASE_PATH}/${portfolioId}?limit=${limit}`, {
    method: "GET",
  });
}
