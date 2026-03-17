import { Card } from "../../../components/ui/Card";
import type {
  DiversificationScore,
  HealthScore,
  RiskScore,
} from "../types";

interface AnalyticsSummaryCardsProps {
  diversification: DiversificationScore;
  risk: RiskScore;
  health: HealthScore;
}

function formatScore(value: number): string {
  return `${value.toFixed(2)} / 100`;
}

function scoreTone(value: number): string {
  if (value >= 75) {
    return "text-emerald-700";
  }
  if (value >= 50) {
    return "text-brand-700";
  }
  if (value >= 30) {
    return "text-amber-700";
  }
  return "text-rose-700";
}

function scoreBandColor(value: number): string {
  if (value >= 75) {
    return "bg-emerald-500";
  }
  if (value >= 50) {
    return "bg-brand-500";
  }
  if (value >= 30) {
    return "bg-amber-500";
  }
  return "bg-rose-500";
}

interface ScoreCardProps {
  title: string;
  score: number;
  badgeText: string;
  subtitle: string;
  badgeClassName: string;
  scoreVisualValue?: number;
}

function ScoreCard({
  title,
  score,
  badgeText,
  subtitle,
  badgeClassName,
  scoreVisualValue,
}: ScoreCardProps) {
  const normalizedVisual = Math.max(0, Math.min(100, scoreVisualValue ?? score));
  return (
    <Card className="relative overflow-hidden border-slate-200 p-0">
      <div className="h-1.5 w-full bg-slate-100">
        <div className={`h-1.5 ${scoreBandColor(normalizedVisual)}`} style={{ width: `${normalizedVisual}%` }} />
      </div>
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
        <p className={`mt-3 text-3xl font-semibold tracking-tight ${scoreTone(normalizedVisual)}`}>
          {formatScore(score)}
        </p>
        <p className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${badgeClassName}`}>
          {badgeText}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{subtitle}</p>
      </div>
    </Card>
  );
}

export function AnalyticsSummaryCards({
  diversification,
  risk,
  health,
}: AnalyticsSummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <ScoreCard
        title="Diversification Score"
        score={diversification.score}
        badgeText={diversification.label}
        badgeClassName="bg-emerald-50 text-emerald-700"
        subtitle="Higher is better. Reflects sector breadth and concentration balance."
      />

      <ScoreCard
        title="Risk Score"
        score={risk.score}
        scoreVisualValue={100 - risk.score}
        badgeText={`${risk.risk_level} risk`}
        badgeClassName="bg-amber-50 text-amber-700"
        subtitle={
          risk.higher_score_means_higher_risk
            ? "Higher is riskier. Lower values generally indicate lower concentration risk."
            : "Interpretation depends on backend risk semantics."
        }
      />

      <ScoreCard
        title="Health Score"
        score={health.score}
        badgeText={health.label}
        badgeClassName="bg-brand-50 text-brand-700"
        subtitle="Higher is healthier. Combines diversification strength and inverse risk."
      />
    </div>
  );
}
