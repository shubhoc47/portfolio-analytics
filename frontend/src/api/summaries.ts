import { apiRequest } from "./client";
import type {
  DailyBriefsRequest,
  DailyBriefsResponse,
  PortfolioSummaryRequest,
  PortfolioSummaryResponse,
  WeeklyHoldingSummariesRequest,
  WeeklyHoldingSummariesResponse,
} from "../features/intelligence/types";

const SUMMARIES_BASE_PATH = "/api/v1/summaries/portfolios";

export function generateDailyHoldingBriefs(
  portfolioId: number,
  payload?: DailyBriefsRequest,
): Promise<DailyBriefsResponse> {
  return apiRequest<DailyBriefsResponse>(`${SUMMARIES_BASE_PATH}/${portfolioId}/daily-briefs`, {
    method: "POST",
    jsonBody: payload,
  });
}

export function generateWeeklyHoldingSummaries(
  portfolioId: number,
  payload?: WeeklyHoldingSummariesRequest,
): Promise<WeeklyHoldingSummariesResponse> {
  return apiRequest<WeeklyHoldingSummariesResponse>(
    `${SUMMARIES_BASE_PATH}/${portfolioId}/weekly-holding-summaries`,
    {
      method: "POST",
      jsonBody: payload,
    },
  );
}

export function generatePortfolioSummary(
  portfolioId: number,
  payload?: PortfolioSummaryRequest,
): Promise<PortfolioSummaryResponse> {
  return apiRequest<PortfolioSummaryResponse>(
    `${SUMMARIES_BASE_PATH}/${portfolioId}/portfolio-summary`,
    {
      method: "POST",
      jsonBody: payload,
    },
  );
}
