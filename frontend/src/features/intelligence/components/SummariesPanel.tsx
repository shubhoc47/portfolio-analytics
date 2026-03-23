import { useState } from "react";

import {
  generateDailyHoldingBriefs,
  generatePortfolioSummary,
  generateWeeklyHoldingSummaries,
} from "../../../api/summaries";
import { ErrorState } from "../../../components/common/ErrorState";
import { NotesBlock } from "../../../components/common/NotesBlock";
import { SectionHeader } from "../../../components/common/SectionHeader";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import type {
  DailyBriefsResponse,
  PortfolioSummaryResponse,
  WeeklyHoldingSummariesResponse,
} from "../types";
import { formatDate } from "../../../utils/format";

interface SummariesPanelProps {
  portfolioId: number;
}

export function SummariesPanel({ portfolioId }: SummariesPanelProps) {
  const [summaryDate, setSummaryDate] = useState("");
  const [windowEndDate, setWindowEndDate] = useState("");
  const [anchorDate, setAnchorDate] = useState("");

  const [dailyResult, setDailyResult] = useState<DailyBriefsResponse | null>(null);
  const [weeklyResult, setWeeklyResult] = useState<WeeklyHoldingSummariesResponse | null>(null);
  const [portfolioResult, setPortfolioResult] = useState<PortfolioSummaryResponse | null>(null);

  const [isGeneratingDaily, setIsGeneratingDaily] = useState(false);
  const [isGeneratingWeekly, setIsGeneratingWeekly] = useState(false);
  const [isGeneratingPortfolio, setIsGeneratingPortfolio] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateDaily = async () => {
    setIsGeneratingDaily(true);
    setError(null);
    try {
      const data = await generateDailyHoldingBriefs(
        portfolioId,
        summaryDate ? { summary_date: summaryDate } : undefined,
      );
      setDailyResult(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate daily briefs.";
      setError(message);
    } finally {
      setIsGeneratingDaily(false);
    }
  };

  const handleGenerateWeekly = async () => {
    setIsGeneratingWeekly(true);
    setError(null);
    try {
      const data = await generateWeeklyHoldingSummaries(
        portfolioId,
        windowEndDate ? { window_end_date: windowEndDate } : undefined,
      );
      setWeeklyResult(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to generate weekly holding summaries.";
      setError(message);
    } finally {
      setIsGeneratingWeekly(false);
    }
  };

  const handleGeneratePortfolio = async () => {
    setIsGeneratingPortfolio(true);
    setError(null);
    try {
      const data = await generatePortfolioSummary(
        portfolioId,
        anchorDate ? { anchor_date: anchorDate } : undefined,
      );
      setPortfolioResult(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate portfolio summary.";
      setError(message);
    } finally {
      setIsGeneratingPortfolio(false);
    }
  };

  return (
    <section className="space-y-4">
      <Card>
        <SectionHeader
          title="Summaries"
          description="Generate daily briefs, weekly rollups, and portfolio-wide summary narratives."
          compact
        />
      </Card>

      {error ? (
        <ErrorState
          title="Unable to generate summaries"
          message={error}
          onRetry={() => {
            setError(null);
          }}
        />
      ) : null}

      <Card>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700" htmlFor="daily-date">
              Daily Brief Date (optional)
            </label>
            <input
              id="daily-date"
              type="date"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
              value={summaryDate}
              onChange={(event) => setSummaryDate(event.target.value)}
            />
            <Button loading={isGeneratingDaily} onClick={() => void handleGenerateDaily()}>
              Generate Daily Briefs
            </Button>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700" htmlFor="weekly-date">
              Weekly Window End Date (optional)
            </label>
            <input
              id="weekly-date"
              type="date"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
              value={windowEndDate}
              onChange={(event) => setWindowEndDate(event.target.value)}
            />
            <Button loading={isGeneratingWeekly} onClick={() => void handleGenerateWeekly()}>
              Generate Weekly Summaries
            </Button>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700" htmlFor="portfolio-date">
              Portfolio Anchor Date (optional)
            </label>
            <input
              id="portfolio-date"
              type="date"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
              value={anchorDate}
              onChange={(event) => setAnchorDate(event.target.value)}
            />
            <Button loading={isGeneratingPortfolio} onClick={() => void handleGeneratePortfolio()}>
              Generate Portfolio Summary
            </Button>
          </div>
        </div>
      </Card>

      {dailyResult ? (
        <Card className="p-0">
          <div className="border-b border-gray-200 px-4 py-3">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
              Daily Holding Briefs
            </h4>
            <p className="mt-1 text-xs text-gray-500">
              Date: {dailyResult.summary_date} | created {dailyResult.created_count} | updated{" "}
              {dailyResult.updated_count}
            </p>
          </div>
          {dailyResult.briefs.length === 0 ? (
            <div className="px-4 py-5 text-sm text-gray-600">No daily briefs were returned.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {dailyResult.briefs.map((brief, index) => (
                <div key={`${brief.ticker}-${index}`} className="px-4 py-4">
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                    <span className="font-semibold text-gray-900">{brief.ticker}</span>
                    <span>words: {brief.word_count ?? "n/a"}</span>
                    <span>source articles: {brief.source_article_count ?? "n/a"}</span>
                    <span>generated: {formatDate(brief.generated_at)}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-800">{brief.content}</p>
                </div>
              ))}
            </div>
          )}
          <div className="p-4 pt-0">
            <NotesBlock notes={dailyResult.notes} className="mt-3" />
          </div>
        </Card>
      ) : null}

      {weeklyResult ? (
        <Card className="p-0">
          <div className="border-b border-gray-200 px-4 py-3">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
              Weekly Holding Summaries
            </h4>
            <p className="mt-1 text-xs text-gray-500">
              Window: {weeklyResult.window_start_date} to {weeklyResult.window_end_date} | created{" "}
              {weeklyResult.created_count} | updated {weeklyResult.updated_count}
            </p>
          </div>
          {weeklyResult.weekly_summaries.length === 0 ? (
            <div className="px-4 py-5 text-sm text-gray-600">
              No weekly holding summaries were returned.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {weeklyResult.weekly_summaries.map((summary, index) => (
                <div key={`${summary.ticker}-${index}`} className="px-4 py-4">
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                    <span className="font-semibold text-gray-900">{summary.ticker}</span>
                    <span>words: {summary.word_count ?? "n/a"}</span>
                    <span>source briefs: {summary.source_brief_count ?? "n/a"}</span>
                    <span>generated: {formatDate(summary.generated_at)}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-800">{summary.content}</p>
                </div>
              ))}
            </div>
          )}
          <div className="p-4 pt-0">
            <NotesBlock notes={weeklyResult.notes} className="mt-3" />
          </div>
        </Card>
      ) : null}

      {portfolioResult ? (
        <Card>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
            Portfolio Summary
          </h4>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-600">
            <span>Anchor: {portfolioResult.anchor_date}</span>
            <span>words: {portfolioResult.word_count ?? "n/a"}</span>
            <span>source summaries: {portfolioResult.source_summary_count ?? "n/a"}</span>
            <span>generated: {formatDate(portfolioResult.generated_at)}</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-gray-800">{portfolioResult.content}</p>
          <NotesBlock notes={portfolioResult.notes} className="mt-3" />
        </Card>
      ) : null}
    </section>
  );
}
