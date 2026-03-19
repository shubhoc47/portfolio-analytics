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
- `ALLOWED_ORIGINS` – CORS origins (comma-separated or JSON list).
- `LOG_LEVEL` – logging level (e.g. `DEBUG`, `INFO`).
- `DATABASE_URL` – PostgreSQL connection string (async SQLAlchemy).

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

To insert starter portfolios for UI testing:

```bash
cd backend
python scripts/seed_portfolios.py
```

This seeder is idempotent by portfolio name, so running it multiple times will not duplicate the same sample records.

To insert starter holdings for the sample portfolios:

```bash
cd backend
python scripts/seed_holdings.py
```

This seeder is idempotent by (`portfolio_id`, `ticker`) and will skip existing sample holdings.
