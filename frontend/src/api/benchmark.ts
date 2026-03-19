import { apiRequest } from "./client";
import type { BenchmarkComparison } from "../features/analytics/types";

const BENCHMARK_BASE_PATH = "/api/v1/benchmark/portfolios";

export function getBenchmarkComparison(portfolioId: number): Promise<BenchmarkComparison> {
  return apiRequest<BenchmarkComparison>(`${BENCHMARK_BASE_PATH}/${portfolioId}/compare`, {
    method: "GET",
  });
}
