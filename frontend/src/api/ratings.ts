import { apiRequest } from "./client";
import type {
  PortfolioRatingsListResponse,
  RatingsRefreshResponse,
} from "../features/intelligence/types";

const RATINGS_BASE_PATH = "/api/v1/ratings/portfolios";

export function refreshPortfolioRatings(portfolioId: number): Promise<RatingsRefreshResponse> {
  return apiRequest<RatingsRefreshResponse>(`${RATINGS_BASE_PATH}/${portfolioId}/refresh`, {
    method: "POST",
  });
}

export function listPortfolioRatings(
  portfolioId: number,
  limit = 100,
): Promise<PortfolioRatingsListResponse> {
  return apiRequest<PortfolioRatingsListResponse>(
    `${RATINGS_BASE_PATH}/${portfolioId}?limit=${limit}`,
    {
      method: "GET",
    },
  );
}
