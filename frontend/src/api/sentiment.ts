import { apiRequest } from "./client";
import type { SentimentAnalyzeResponse } from "../features/intelligence/types";

const SENTIMENT_BASE_PATH = "/api/v1/sentiment/portfolios";

export function analyzePortfolioSentiment(portfolioId: number): Promise<SentimentAnalyzeResponse> {
  return apiRequest<SentimentAnalyzeResponse>(`${SENTIMENT_BASE_PATH}/${portfolioId}/analyze`, {
    method: "POST",
  });
}
