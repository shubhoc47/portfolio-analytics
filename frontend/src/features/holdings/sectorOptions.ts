export const HOLDING_SECTOR_OPTIONS = [
  "Technology",
  "Communication Services",
  "Consumer Cyclical",
  "Consumer Defensive",
  "Healthcare",
  "Financial Services",
  "Industrials",
  "Energy",
  "Utilities",
  "Real Estate",
  "Basic Materials",
  "ETF",
  "Other",
] as const;

export type HoldingSector = (typeof HOLDING_SECTOR_OPTIONS)[number];
