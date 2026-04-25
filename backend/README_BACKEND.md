# PortfolioIQ Backend

FastAPI-based backend for portfolio management and analytics.

## Quick Start

### Local (no Docker)

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

## Portfolio CRUD API (Part 6)

Versioned portfolio endpoints are available under `/api/v1/portfolios`:

- `POST /api/v1/portfolios` - create a portfolio
- `GET /api/v1/portfolios` - list portfolios
- `GET /api/v1/portfolios/{portfolio_id}` - get one portfolio
- `PUT /api/v1/portfolios/{portfolio_id}` - update a portfolio
- `DELETE /api/v1/portfolios/{portfolio_id}` - delete a portfolio

Example create request:

```json
{
  "name": "Long-Term Portfolio",
  "description": "Core portfolio for long-term investing",
  "base_currency": "USD",
  "owner_name": "Shubham"
}
```

## Core Analytics API (Part 9)

Portfolio analytics endpoints are available under `/api/v1/analytics`:

- `GET /api/v1/analytics/portfolios/{portfolio_id}/sector-exposure`
- `GET /api/v1/analytics/portfolios/{portfolio_id}/diversification-score`
- `GET /api/v1/analytics/portfolios/{portfolio_id}/risk-score`
- `GET /api/v1/analytics/portfolios/{portfolio_id}/health-score`
- `GET /api/v1/analytics/portfolios/{portfolio_id}/summary`

Notes:

- Current analytics are deterministic demo heuristics for development/testing.
- Sector classification uses holding `sector` when available, with a ticker fallback map for seeded/demo holdings.
- Higher `risk_score` means higher risk. Higher `health_score` means healthier portfolio composition.

## Benchmark Comparison API (Part 10)

Benchmark comparison endpoint is available under `/api/v1/benchmark`:

- `GET /api/v1/benchmark/portfolios/{portfolio_id}/compare`

What it returns:

- Portfolio return block (`invested_value`, `current_value`, `absolute_return`, `return_percent`)
- Benchmark block (`S&P 500`, symbol `SPY`, demo return percent)
- Comparison block (`outperformed`, `underperformed`, or `matched`) with summary text
- Optional holding-level return breakdown and notes

Notes:

- This part uses deterministic mock benchmark data and mock current prices for development/testing.
- Holding return formula is: `((quantity * current_price) - (quantity * average_cost)) / (quantity * average_cost) * 100`.
- If a holding has no stored/current mock price, service falls back to `average_cost` (neutral return) and reports this in notes.

## Market data (Finnhub quotes)

Endpoints under `/api/v1/market-data`:

- `POST /api/v1/market-data/portfolios/{portfolio_id}/refresh-prices` — for that portfolio’s distinct tickers, resolves quotes (Finnhub **or** short-lived **in-memory cache**), updates `Holding.current_price` on success.
- `POST /api/v1/market-data/refresh-all-prices` — one **global** distinct ticker list across **all** holdings; each ticker is resolved at most once per request (cache hits do not call Finnhub); updates every matching holding row.
- `GET /api/v1/market-data/quote/{ticker}` — one live quote (no DB write). Uses the same cache when enabled. Returns `503` if `FINNHUB_API_KEY` is unset.

Configuration (see `.env.example`):

- `FINNHUB_API_KEY` — optional in local dev; server-only.
- `MARKET_DATA_CACHE_TTL_SECONDS` — default `300`; set to `0` to disable in-memory caching (every resolution calls Finnhub).

Response fields (single-portfolio refresh):

- `quote_source` on each successful quote: `finnhub` | `cache` | `mock` (mock only if a mock provider is wired in tests).
- `cache_hit_count` / `provider_call_count` — how many tickers were served from cache vs how many times the underlying provider was invoked.

In-memory cache (important):

- Lives **in the API process**; cleared on **restart**; **not** shared across multiple Uvicorn/Gunicorn workers or hosts.
- Failed quotes are **not** cached.
- Suitable for **development / single-instance demos**. Production should move to Redis or a DB-backed cache if you scale out.

Behavior:

- If the API key is missing, portfolio refresh returns `200` with `skipped_count` and a note; refresh-all returns zeros and a note; no Finnhub calls.
- After a **real** Finnhub (or provider) call, a short delay runs before the next provider call (cache hits skip that delay).
- HTTP `429` / network errors are per-ticker; one failure does not abort the whole refresh.
- Invalid or zero Finnhub field `c` is treated as a failed quote for that ticker only.

Analytics vs benchmark:

- **Benchmark** comparison uses `Holding.current_price` when set, otherwise mock prices, then `average_cost`.
- **Analytics** sector weights today use **cost basis** (`quantity * average_cost`); refreshing live prices improves benchmark returns and stored holdings, not those analytics formulas.

Limitations: Finnhub free tier enforces low request rates; quote data can be delayed; outside market hours `c` is often `0`, so those tickers are skipped until a valid price is returned. This path is suitable for learning and demos, not a production market-data stack.

### Swagger manual test

1. Set `FINNHUB_API_KEY` in `backend/.env`, restart `uvicorn`.
2. `POST /api/v1/dev/seed` (development only) or ensure portfolios have holdings (including the same ticker in two portfolios if you want to test deduplication).
3. `POST /api/v1/market-data/portfolios/{portfolio_id}/refresh-prices` — check `updated_quotes`, `quote_source`, `cache_hit_count`, `provider_call_count`, `failures`.
4. Repeat step 3 for a **second** portfolio that shares a ticker — second call should show **cache hits** for that ticker if within `MARKET_DATA_CACHE_TTL_SECONDS`.
5. `POST /api/v1/market-data/refresh-all-prices` — all portfolios updated; each unique ticker should incur at most one provider call (rest cache hits) until TTL expires.
6. Call refresh-all again **immediately** — expect `provider_call_count: 0` and `cache_hit_count` equal to the number of distinct tickers (if all succeeded on the first run).
7. Optional: `GET /api/v1/market-data/quote/AAPL` — `current_price`, `quote_source`.
8. `GET /api/v1/benchmark/portfolios/{portfolio_id}/compare` — `price_source` = `holding_current_price` where applicable.

## News Ingestion API (Part 11A)

Portfolio-aware news ingestion endpoints are available under `/api/v1/news`:

- `POST /api/v1/news/portfolios/{portfolio_id}/refresh`
- `GET /api/v1/news/portfolios/{portfolio_id}`

What refresh does:

- loads portfolio holdings and extracts distinct tickers
- fetches raw mock-provider news for those tickers
- normalizes provider output into a consistent internal article shape
- deduplicates by `external_id` (when present), canonical URL, and fallback hash
- persists only new normalized rows in `news_article`

Notes:

- Part 11A uses only deterministic mock/demo provider data.
- Repeated refresh calls are idempotent with respect to duplicate inserts.
- Stored local article metadata is intended as the source-of-truth input for future enrichment (sentiment, summaries, alerts, ratings context).

## Sentiment Analysis API (Part 11B)

Portfolio sentiment analysis endpoint is available under `/api/v1/sentiment`:

- `POST /api/v1/sentiment/portfolios/{portfolio_id}/analyze`

What it does:

- loads local stored portfolio news articles from Part 11A
- applies a rule-based sentiment provider to each article (`positive`, `neutral`, `negative`)
- upserts one sentiment row per (`article_id`, `provider_name`)
- returns article-level results and holding/portfolio aggregate summaries

Notes:

- Part 11B sentiment is derived from local article data only; it does not fetch external news.
- Current classifier is a deterministic keyword/rule fallback for development.
- Repeated analyze calls update existing rows for the same provider instead of creating duplicates.

## Summaries API (Part 11C)

Hierarchical summary endpoints are under `/api/v1/summaries`:

- `POST /api/v1/summaries/portfolios/{portfolio_id}/daily-briefs` — optional body `{ "summary_date": "YYYY-MM-DD" }` (defaults to today UTC)
- `POST /api/v1/summaries/portfolios/{portfolio_id}/weekly-holding-summaries` — optional body `{ "window_end_date": "YYYY-MM-DD" }` (7-day window ending on that date)
- `POST /api/v1/summaries/portfolios/{portfolio_id}/portfolio-summary` — optional body `{ "anchor_date": "YYYY-MM-DD" }`

Behavior:

- **Daily briefs** use only **local `news_article` rows** for each holding on the chosen calendar day (UTC), optionally enriched with Part 11B sentiment labels when present.
- **Weekly holding summaries** summarize **stored daily briefs** for the rolling 7-day window (not raw articles).
- **Portfolio summary** prefers **stored weekly holding summaries** for that anchor; if none exist, it rolls up **stored daily briefs** in the window.
- Summaries are persisted in `ai_summary` with upsert semantics per `(portfolio_id, summary_type, provider_name, summary_date, holding_id)`.
- The template provider does **not** fetch news; it only formats text passed in from the service layer.

## Alerts API (Part 11D)

Portfolio alerts endpoints are available under `/api/v1/alerts`:

- `POST /api/v1/alerts/portfolios/{portfolio_id}/refresh`
- `GET /api/v1/alerts/portfolios/{portfolio_id}`

What refresh does:

- validates that the portfolio exists and has holdings
- reads **local stored articles** (Part 11A) and optional local sentiment context (Part 11B)
- runs a deterministic keyword/rule detector to classify events into alert categories
- assigns deterministic severity (`low`, `medium`, `high`, `critical`)
- upserts active alerts to avoid duplicate rows on repeated refresh

Notes:

- Part 11D is fully deterministic and local-data driven (no fresh retrieval during alert refresh).
- Current dedupe behavior keeps one active alert per source + alert type (for article-backed alerts).
- Stored alert rows include source metadata (`source_kind`, `source_article_id`, `source_summary_id`) for explainability and future workflows.

## Analyst Ratings API (Part 11E)

Portfolio analyst ratings endpoints are available under `/api/v1/ratings`:

- `POST /api/v1/ratings/portfolios/{portfolio_id}/refresh`
- `GET /api/v1/ratings/portfolios/{portfolio_id}`

What refresh does:

- validates that the portfolio exists and has holdings
- extracts distinct holding tickers for the selected portfolio
- fetches raw mock analyst recommendations (intentionally messy external labels)
- normalizes provider labels into internal `buy` / `hold` / `sell`
- upserts ratings so repeated refresh calls update existing rows instead of duplicating them

Notes:

- Part 11E currently uses only deterministic mock/demo ratings.
- Raw external labels are preserved in storage (`rating_raw`) while APIs can depend on normalized categories (`rating_normalized`).
- Ratings persistence includes provider metadata (`provider_name`) and refresh timestamp updates (`updated_at`) for traceability.

### Docker

```bash
cd backend
docker build -t portfolioiq-backend .
docker run -p 8000:8000 portfolioiq-backend
```

### Tests

```bash
cd backend
venv\Scripts\activate
pip install -r requirements.txt
pytest
```

## Project Layout

See [ARCHITECTURE.md](../ARCHITECTURE.md) and [BACKEND_PLAN.md](../BACKEND_PLAN.md).

ORM models live under `app/models/` and use SQLAlchemy 2.0 style classes inheriting from `app.db.base.Base`.

## Configuration

Configuration is managed using a Pydantic `Settings` class in `app/core/config.py`.

- Defaults are suitable for local development.
- Values can be overridden using environment variables or a `.env` file.
- See `.env.example` for all available options.

Key settings:

- `APP_NAME` – application title shown in docs.
- `APP_ENV` – environment name (e.g. `development`, `production`).
- `DEBUG` – enables/disables debug mode in FastAPI.
- `API_V1_PREFIX` – prefix for versioned API routes (default `/api/v1`).
- `ALLOWED_ORIGINS` – CORS origins (comma-separated or JSON list). Defaults include `http://localhost:5173` (Vite) so the React app can call the API; if you override this in `.env`, keep your frontend origin in the list or the browser will show a generic “cannot reach backend” error on `fetch`.
- `LOG_LEVEL` – logging level (e.g. `DEBUG`, `INFO`).
- `DATABASE_URL` – PostgreSQL connection string (async SQLAlchemy).
- `FINNHUB_API_KEY` – optional; enables live `/quote` fetches for market-data refresh endpoints.
- `MARKET_DATA_CACHE_TTL_SECONDS` – in-memory quote cache TTL (`0` disables); not shared across workers.

## Database Migrations

Migrations are managed using **Alembic**. Migration files live in `alembic/versions/`.

### Prerequisites

Make sure PostgreSQL is running and `DATABASE_URL` is set correctly in your `.env` file:

```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/portfolioiq
```

### Common Commands

```bash
cd backend

# Apply all pending migrations (create tables, etc.)
alembic upgrade head

# Check current revision
alembic current

# Show migration history
alembic history

# Create a new migration (after changing models)
alembic revision --autogenerate -m "describe_your_changes"

# Rollback one migration
alembic downgrade -1

# Rollback all migrations
alembic downgrade base

# Generate SQL without applying (review mode)
alembic upgrade head --sql
```

### Typical Workflow

1. Make changes to models in `app/models/`.
2. Run `alembic revision --autogenerate -m "your_message"` to generate a migration.
3. Review the generated migration file in `alembic/versions/`.
4. Run `alembic upgrade head` to apply it to your database.

### Notes

- Alembic uses a **sync** driver (`psycopg2`) even though the app uses async (`asyncpg`). The `alembic/env.py` handles this conversion automatically.
- Always review autogenerated migrations before applying them to production.

## Seed Sample Data (Local Development)

### Canonical demo data (recommended)

The API and scripts use **`app/data/demo_seed_data.py`**: three US-focused demo portfolios (US tech growth stocks, US dividend stocks, and five defensive US-listed ETFs) with 5–12 equity positions on the first two and five ETF positions on the third (sectors, ETFs vs equities, cost basis and mock prices).

**Full reset and reseed** (deletes **all** portfolios and related rows, then inserts fresh demo data):

- **CLI** (no server required):

```bash
cd backend
python scripts/reseed_demo_data.py
```

- **HTTP** (with the API running):

`POST /api/v1/dev/reseed`

**Insert only when the DB has no portfolios** (first-time empty DB):

`POST /api/v1/dev/seed`

If any portfolio already exists, `/dev/seed` returns a skip message; use `/dev/reseed` or `reseed_demo_data.py` for a full reset. On a totally empty database, `reseed_demo_data.py` is also safe (counts are zero, then inserts the three portfolios).

**Safety**

- `seed` and `reseed` are **disabled** when `APP_ENV=production`.
- Reseed removes portfolio rows and CASCADE-dependent data (`holding`, `alert`, `ai_summary`, `market_snapshot`, etc.). It also deletes `news_article` rows still linked to a holding and `analyst_rating` / `job_run` rows tied to holdings or portfolios so nothing stale remains.
- **`benchmark_data` is not deleted** (not scoped to a portfolio; keeps benchmark charts useful).

### Legacy idempotent scripts

Older standalone scripts use a **different** portfolio name set than the canonical demo data:

```bash
cd backend
python scripts/seed_portfolios.py
python scripts/seed_holdings.py
```

`seed_portfolios.py` is idempotent by portfolio name; `seed_holdings.py` by (`portfolio_id`, `ticker`). Prefer `reseed_demo_data.py` for a clean, repeatable demo dataset aligned with the API.
