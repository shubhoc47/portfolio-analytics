import { apiRequest } from "./client";
import type {
  Portfolio,
  PortfolioCreateInput,
  PortfolioUpdateInput,
} from "../types/portfolio";

const BASE_PATH = "/api/v1/portfolios";

export function listPortfolios(): Promise<Portfolio[]> {
  return apiRequest<Portfolio[]>(BASE_PATH, { method: "GET" });
}

export function getPortfolio(portfolioId: number): Promise<Portfolio> {
  return apiRequest<Portfolio>(`${BASE_PATH}/${portfolioId}`, { method: "GET" });
}

export function createPortfolio(payload: PortfolioCreateInput): Promise<Portfolio> {
  return apiRequest<Portfolio>(BASE_PATH, { method: "POST", jsonBody: payload });
}

export function updatePortfolio(
  portfolioId: number,
  payload: PortfolioUpdateInput,
): Promise<Portfolio> {
  return apiRequest<Portfolio>(`${BASE_PATH}/${portfolioId}`, {
    method: "PUT",
    jsonBody: payload,
  });
}

export function deletePortfolio(portfolioId: number): Promise<void> {
  return apiRequest<void>(`${BASE_PATH}/${portfolioId}`, { method: "DELETE" });
}
