import { apiRequest } from "./client";
import type {
  Holding,
  HoldingCreateInput,
  HoldingUpdateInput,
} from "../features/holdings/types";

const PORTFOLIOS_BASE_PATH = "/api/v1/portfolios";
const HOLDINGS_BASE_PATH = "/api/v1/holdings";

export function listHoldingsByPortfolio(portfolioId: number): Promise<Holding[]> {
  return apiRequest<Holding[]>(`${PORTFOLIOS_BASE_PATH}/${portfolioId}/holdings`, {
    method: "GET",
  });
}

export function createHolding(
  portfolioId: number,
  payload: HoldingCreateInput,
): Promise<Holding> {
  return apiRequest<Holding>(`${PORTFOLIOS_BASE_PATH}/${portfolioId}/holdings`, {
    method: "POST",
    jsonBody: {
      asset_type: "Equity",
      ...payload,
    },
  });
}

export function getHolding(holdingId: number): Promise<Holding> {
  return apiRequest<Holding>(`${HOLDINGS_BASE_PATH}/${holdingId}`, {
    method: "GET",
  });
}

export function updateHolding(
  holdingId: number,
  payload: HoldingUpdateInput,
): Promise<Holding> {
  return apiRequest<Holding>(`${HOLDINGS_BASE_PATH}/${holdingId}`, {
    method: "PATCH",
    jsonBody: payload,
  });
}

export function deleteHolding(holdingId: number): Promise<void> {
  return apiRequest<void>(`${HOLDINGS_BASE_PATH}/${holdingId}`, {
    method: "DELETE",
  });
}
