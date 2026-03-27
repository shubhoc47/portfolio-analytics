import { useCallback, useEffect, useState } from "react";

import { getBenchmarkComparison } from "../../../api/benchmark";
import { EmptyState } from "../../../components/common/EmptyState";
import { ErrorState } from "../../../components/common/ErrorState";
import { LoadingState } from "../../../components/common/LoadingState";
import { SectionHeader } from "../../../components/common/SectionHeader";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import type { BenchmarkComparison } from "../../analytics/types";
import { BenchmarkComparisonCard } from "./BenchmarkComparisonCard";

interface BenchmarkSectionProps {
  portfolioId: number;
}

export function BenchmarkSection({ portfolioId }: BenchmarkSectionProps) {
  const [comparison, setComparison] = useState<BenchmarkComparison | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBenchmarkComparison = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getBenchmarkComparison(portfolioId);
      setComparison(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load benchmark comparison.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [portfolioId]);

  useEffect(() => {
    void loadBenchmarkComparison();
  }, [loadBenchmarkComparison]);

  const isEmpty =
    !isLoading &&
    !error &&
    comparison &&
    comparison.holdings.length === 0 &&
    comparison.portfolio.invested_value === 0 &&
    comparison.portfolio.current_value === 0;

  return (
    <section className="space-y-4">
      <Card variant="workspace">
        <SectionHeader
          title="Benchmark Comparison"
          description="Compare this portfolio against the S&P 500 benchmark."
          compact
          actions={
            <Button variant="ghost" onClick={() => void loadBenchmarkComparison()}>
              Refresh Benchmark
            </Button>
          }
        />
      </Card>

      {isLoading ? <LoadingState message="Loading benchmark comparison..." /> : null}
      {!isLoading && error ? (
        <ErrorState
          title="Unable to load benchmark comparison"
          message={error}
          onRetry={() => void loadBenchmarkComparison()}
        />
      ) : null}
      {isEmpty ? (
        <EmptyState
          title="Benchmark comparison unavailable"
          description="Add holdings to this portfolio first. Benchmark comparison requires portfolio positions."
          action={
            <Button variant="secondary" onClick={() => void loadBenchmarkComparison()}>
              Refresh
            </Button>
          }
        />
      ) : null}

      {!isLoading && !error && comparison && !isEmpty ? (
        <BenchmarkComparisonCard comparison={comparison} />
      ) : null}
    </section>
  );
}
