import { useState } from "react";

import { analyzePortfolioSentiment } from "../../../api/sentiment";
import { EmptyState } from "../../../components/common/EmptyState";
import { ErrorState } from "../../../components/common/ErrorState";
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
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Sentiment</h3>
            <p className="mt-1 text-sm text-slate-600">
              Analyze local news and review portfolio and holding-level sentiment signals.
            </p>
          </div>
          <Button loading={isRunning} onClick={() => void handleAnalyze()}>
            Analyze Sentiment
          </Button>
        </div>
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
          <Card className="bg-slate-50">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
              Portfolio Sentiment
            </h4>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <SentimentBadge sentiment={portfolioSummary.overall_sentiment} />
              <span className="text-sm text-slate-700">
                Average score: <strong>{portfolioSummary.average_score.toFixed(4)}</strong>
              </span>
              <span className="text-sm text-slate-700">
                Articles: <strong>{portfolioSummary.article_count}</strong>
              </span>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-xs text-emerald-700">Positive</p>
                <p className="text-xl font-semibold text-emerald-900">
                  {portfolioSummary.positive_count}
                </p>
              </div>
              <div className="rounded-lg border border-slate-300 bg-slate-100 p-3">
                <p className="text-xs text-slate-700">Neutral</p>
                <p className="text-xl font-semibold text-slate-900">
                  {portfolioSummary.neutral_count}
                </p>
              </div>
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
                <p className="text-xs text-rose-700">Negative</p>
                <p className="text-xl font-semibold text-rose-900">
                  {portfolioSummary.negative_count}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-0">
            <div className="border-b border-slate-200 px-4 py-3">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                Holding Sentiment
              </h4>
            </div>
            {result.holding_sentiments.length === 0 ? (
              <div className="px-4 py-6 text-sm text-slate-600">
                No holding-level sentiment rows were returned.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
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
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {result.holding_sentiments.map((row) => (
                      <tr key={row.ticker}>
                        <td className="px-4 py-3 font-medium text-slate-900">{row.ticker}</td>
                        <td className="px-4 py-3 text-slate-700">{row.article_count}</td>
                        <td className="px-4 py-3 text-slate-700">{row.positive_count}</td>
                        <td className="px-4 py-3 text-slate-700">{row.neutral_count}</td>
                        <td className="px-4 py-3 text-slate-700">{row.negative_count}</td>
                        <td className="px-4 py-3 text-slate-700">{row.average_score.toFixed(4)}</td>
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
            <details>
              <summary className="cursor-pointer text-sm font-semibold text-slate-800">
                Show Article-Level Sentiment ({result.article_sentiments.length})
              </summary>
              <div className="mt-3 space-y-2">
                {result.article_sentiments.length === 0 ? (
                  <p className="text-sm text-slate-600">No article-level rows were returned.</p>
                ) : (
                  result.article_sentiments.map((row) => (
                    <div
                      key={row.article_id}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-slate-700">{row.ticker}</span>
                        <SentimentBadge sentiment={row.sentiment_label} />
                        <span className="text-xs text-slate-500">
                          score {row.sentiment_score.toFixed(4)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-800">{row.title}</p>
                    </div>
                  ))
                )}
              </div>
            </details>
          </Card>

          {result.notes.length > 0 ? (
            <Card className="bg-slate-50">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                Notes
              </h4>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-600">
                {result.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
