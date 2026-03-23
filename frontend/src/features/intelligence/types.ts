export interface NewsArticle {
  id: number;
  holding_id: number | null;
  ticker: string;
  external_id: string | null;
  title: string;
  source: string;
  url: string;
  published_at: string;
  author: string | null;
  summary: string | null;
  content: string | null;
  dedupe_hash: string | null;
  created_at: string;
}

export interface NewsRefreshResponse {
  portfolio_id: number;
  portfolio_name: string;
  tickers: string[];
  fetched_count: number;
  inserted_count: number;
  deduplicated_count: number;
  articles: NewsArticle[];
  notes: string[];
}

export interface PortfolioNewsListResponse {
  portfolio_id: number;
  portfolio_name: string;
  tickers: string[];
  total_articles: number;
  articles: NewsArticle[];
}

export type SentimentLabel = "positive" | "neutral" | "negative";

export interface ArticleSentimentRead {
  article_id: number;
  ticker: string;
  title: string;
  sentiment_label: SentimentLabel;
  sentiment_score: number;
  confidence: number | null;
  provider_name: string;
  rule_key: string | null;
  analyzed_at: string;
}

export interface HoldingSentimentSummaryRead {
  ticker: string;
  article_count: number;
  positive_count: number;
  neutral_count: number;
  negative_count: number;
  average_score: number;
  overall_sentiment: SentimentLabel;
}

export interface PortfolioSentimentSummaryRead {
  article_count: number;
  positive_count: number;
  neutral_count: number;
  negative_count: number;
  average_score: number;
  overall_sentiment: SentimentLabel;
}

export interface SentimentAnalyzeResponse {
  portfolio_id: number;
  portfolio_name: string;
  analyzed_article_count: number;
  stored_sentiment_count: number;
  created_count: number;
  updated_count: number;
  article_sentiments: ArticleSentimentRead[];
  holding_sentiments: HoldingSentimentSummaryRead[];
  portfolio_sentiment: PortfolioSentimentSummaryRead;
  notes: string[];
}

export interface DailyBriefsRequest {
  summary_date?: string;
}

export interface WeeklyHoldingSummariesRequest {
  window_end_date?: string;
}

export interface PortfolioSummaryRequest {
  anchor_date?: string;
}

export interface HoldingBriefItemRead {
  ticker: string;
  summary_type: string;
  content: string;
  word_count: number | null;
  source_article_count: number | null;
  source_brief_count: number | null;
  source_summary_count: number | null;
  generated_at: string;
}

export interface DailyBriefsResponse {
  portfolio_id: number;
  portfolio_name: string;
  summary_date: string;
  provider_name: string;
  briefs: HoldingBriefItemRead[];
  created_count: number;
  updated_count: number;
  notes: string[];
}

export interface WeeklyHoldingItemRead {
  ticker: string;
  summary_type: string;
  content: string;
  word_count: number | null;
  source_brief_count: number | null;
  generated_at: string;
}

export interface WeeklyHoldingSummariesResponse {
  portfolio_id: number;
  portfolio_name: string;
  window_end_date: string;
  window_start_date: string;
  provider_name: string;
  weekly_summaries: WeeklyHoldingItemRead[];
  created_count: number;
  updated_count: number;
  notes: string[];
}

export interface PortfolioSummaryResponse {
  portfolio_id: number;
  portfolio_name: string;
  summary_type: string;
  anchor_date: string;
  provider_name: string;
  content: string;
  word_count: number | null;
  source_summary_count: number | null;
  generated_at: string;
  created: boolean;
  notes: string[];
}

export type AlertSeverity = "low" | "medium" | "high" | "critical";
export type AlertSourceKind = "article" | "daily_brief" | "weekly_summary";

export interface AlertRead {
  id: number;
  portfolio_id: number;
  holding_id: number | null;
  ticker: string | null;
  source_kind: AlertSourceKind;
  source_article_id: number | null;
  source_summary_id: number | null;
  alert_type: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  is_active: boolean;
  detected_at: string;
  detector_name: string | null;
}

export interface AlertRefreshResponse {
  portfolio_id: number;
  portfolio_name: string;
  detected_count: number;
  created_count: number;
  updated_count: number;
  active_alert_count: number;
  alerts: AlertRead[];
  notes: string[];
}

export interface PortfolioAlertsListResponse {
  portfolio_id: number;
  portfolio_name: string;
  active_alert_count: number;
  alerts: AlertRead[];
  notes: string[];
}

export type NormalizedRating = "buy" | "hold" | "sell";

export interface AnalystRatingRead {
  id: number;
  portfolio_id: number;
  holding_id: number | null;
  ticker: string;
  provider_name: string;
  firm_name: string;
  analyst_name: string | null;
  raw_rating: string;
  normalized_rating: NormalizedRating;
  as_of_date: string;
  price_target: number | string | null;
  notes: string | null;
}

export interface RatingsRefreshResponse {
  portfolio_id: number;
  portfolio_name: string;
  tickers: string[];
  fetched_count: number;
  stored_count: number;
  created_count: number;
  updated_count: number;
  ratings: AnalystRatingRead[];
  notes: string[];
}

export interface PortfolioRatingsListResponse {
  portfolio_id: number;
  portfolio_name: string;
  tickers: string[];
  total_ratings: number;
  ratings: AnalystRatingRead[];
  notes: string[];
}
