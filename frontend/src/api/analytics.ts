import { ApiError, apiRequest } from "./client";
import type {
  AnalyticsSummary,
  DiversificationScore,
  HealthScore,
  RiskScore,
  SectorExposure,
} from "../features/analytics/types";

const ANALYTICS_BASE_PATH = "/api/v1/analytics/portfolios";

export function getSectorExposure(portfolioId: number): Promise<SectorExposure> {
  return apiRequest<SectorExposure>(`${ANALYTICS_BASE_PATH}/${portfolioId}/sector-exposure`, {
    method: "GET",
  });
}

export function getDiversificationScore(portfolioId: number): Promise<DiversificationScore> {
  return apiRequest<DiversificationScore>(
    `${ANALYTICS_BASE_PATH}/${portfolioId}/diversification-score`,
    {
      method: "GET",
    },
  );
}

export function getRiskScore(portfolioId: number): Promise<RiskScore> {
  return apiRequest<RiskScore>(`${ANALYTICS_BASE_PATH}/${portfolioId}/risk-score`, {
    method: "GET",
  });
}

export function getHealthScore(portfolioId: number): Promise<HealthScore> {
  return apiRequest<HealthScore>(`${ANALYTICS_BASE_PATH}/${portfolioId}/health-score`, {
    method: "GET",
  });
}

export function getPortfolioAnalyticsSummary(portfolioId: number): Promise<AnalyticsSummary> {
  return apiRequest<AnalyticsSummary>(`${ANALYTICS_BASE_PATH}/${portfolioId}/summary`, {
    method: "GET",
  });
}

export async function getPortfolioAnalytics(portfolioId: number): Promise<AnalyticsSummary> {
  try {
    return await getPortfolioAnalyticsSummary(portfolioId);
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.status === 404 &&
      error.detail.trim().toLowerCase() === "not found"
    ) {
      const [sector_exposure, diversification, risk, health] = await Promise.all([
        getSectorExposure(portfolioId),
        getDiversificationScore(portfolioId),
        getRiskScore(portfolioId),
        getHealthScore(portfolioId),
      ]);

      return {
        portfolio_id: portfolioId,
        portfolio_name: diversification.portfolio_name,
        sector_exposure,
        diversification,
        risk,
        health,
      };
    }

    throw error;
  }
}
