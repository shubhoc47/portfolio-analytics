import { useState } from "react";

import { analyzePortfolioSentiment } from "../../../api/sentiment";
import { EmptyState } from "../../../components/common/EmptyState";
import { ErrorState } from "../../../components/common/ErrorState";
import { MetricStatGrid } from "../../../components/common/MetricStatGrid";
import { NotesBlock } from "../../../components/common/NotesBlock";
import { SectionHeader } from "../../../components/common/SectionHeader";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import type { SentimentAnalyzeResponse } from "../types";
import { SentimentBadge } from "./badges";

interface SentimentPanelProps {
  portfolioId: number;
}

export function SentimentPanel({ portfolioId }: SentimentPanelProps) {
  const [result, setResult] = useState<SentimentAnalyzeResponse | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsRunning(true);
    setError(null);
    try {
      const data = await analyzePortfolioSentiment(portfolioId);
      setResult(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to run sentiment analysis.";
      setError(message);
    } finally {
      setIsRunning(false);
    }
  };

  const portfolioSummary = result?.portfolio_sentiment;

  return (
    <section className="space-y-4">
      <Card>
        <SectionHeader
          title="Sentiment"
          description="Analyze local news and review portfolio and holding-level sentiment signals."
          compact
          actions={
            <Button loading={isRunning} onClick={() => void handleAnalyze()}>
              Analyze Sentiment
            </Button>
          }
        />
      </Card>

      {error ? (
        <ErrorState
          title="Unable to analyze sentiment"
          message={error}
          onRetry={() => void handleAnalyze()}
        />
      ) : null}

      {!error && !result ? (
        <EmptyState
          title="No sentiment run yet"
          description="Run sentiment analysis to generate portfolio and holding-level insights."
          action={
            <Button loading={isRunning} onClick={() => void handleAnalyze()}>
              Analyze Sentiment
            </Button>
          }
        />
      ) : null}

      {!error && result && portfolioSummary ? (
        <div className="space-y-4">
          <Card className="bg-slate-900/70">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
              Portfolio Sentiment
            </h4>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <SentimentBadge sentiment={portfolioSummary.overall_sentiment} />
              <span className="text-sm text-slate-300">
                Average score: <strong>{portfolioSummary.average_score.toFixed(4)}</strong>
              </span>
              <span className="text-sm text-slate-300">
                Articles: <strong>{portfolioSummary.article_count}</strong>
              </span>
            </div>
            <div className="mt-3">
              <MetricStatGrid
                columns={3}
                items={[
                  {
                    label: "Positive",
                    value: String(portfolioSummary.positive_count),
                    tone: "positive",
                  },
                  { label: "Neutral", value: String(portfolioSummary.neutral_count) },
                  {
                    label: "Negative",
                    value: String(portfolioSummary.negative_count),
                    tone: "negative",
                  },
                ]}
              />
            </div>
          </Card>

          <Card className="p-0">
            <div className="border-b border-slate-700 px-4 py-3">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
                Holding Sentiment
              </h4>
            </div>
            {result.holding_sentiments.length === 0 ? (
              <div className="px-4 py-6 text-sm text-slate-300">
                No holding-level sentiment rows were returned.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700 text-sm">
                  <thead className="bg-slate-950 text-left text-xs uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Ticker</th>
                      <th className="px-4 py-3">Articles</th>
                      <th className="px-4 py-3">Positive</th>
                      <th className="px-4 py-3">Neutral</th>
                      <th className="px-4 py-3">Negative</th>
                      <th className="px-4 py-3">Average</th>
                      <th className="px-4 py-3">Overall</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900">
                    {result.holding_sentiments.map((row) => (
                      <tr key={row.ticker} className="hover:bg-slate-800/50">
                        <td className="px-4 py-3 font-medium text-slate-100">{row.ticker}</td>
                        <td className="px-4 py-3 text-slate-300">{row.article_count}</td>
                        <td className="px-4 py-3 text-slate-300">{row.positive_count}</td>
                        <td className="px-4 py-3 text-slate-300">{row.neutral_count}</td>
                        <td className="px-4 py-3 text-slate-300">{row.negative_count}</td>
                        <td className="px-4 py-3 text-slate-300">{row.average_score.toFixed(4)}</td>
                        <td className="px-4 py-3">
                          <SentimentBadge sentiment={row.overall_sentiment} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card>
            <details className="group">
              <summary className="cursor-pointer text-sm font-semibold text-slate-100">
                Show Article-Level Sentiment ({result.article_sentiments.length})
              </summary>
              <div className="mt-3 space-y-2">
                {result.article_sentiments.length === 0 ? (
                  <p className="text-sm text-slate-300">No article-level rows were returned.</p>
                ) : (
                  result.article_sentiments.map((row) => (
                    <div
                      key={row.article_id}
                      className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-slate-300">{row.ticker}</span>
                        <SentimentBadge sentiment={row.sentiment_label} />
                        <span className="text-xs text-slate-400">
                          score {row.sentiment_score.toFixed(4)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-200">{row.title}</p>
                    </div>
                  ))
                )}
              </div>
            </details>
          </Card>

          <NotesBlock notes={result.notes} />
        </div>
      ) : null}
    </section>
  );
}
