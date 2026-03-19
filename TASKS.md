# PortfolioIQ – Task Tracker

## Part 1: Project Foundation

- [x] Create `BACKEND_PLAN.md`
- [x] Create `ARCHITECTURE.md`
- [x] Create `TASKS.md`
- [x] Create backend folder structure
- [x] Implement minimal FastAPI app in `main.py`
- [x] Add `GET /health` endpoint
- [x] Add versioned API router `/api/v1`
- [x] Add placeholder endpoint modules for future sections
- [x] Add `requirements.txt`
- [x] Add `Dockerfile`
- [x] Add `.env.example`
- [x] Add `README_BACKEND.md`

## Part 2: Database & Core Setup

- [x] Configure Alembic
- [x] Add database models (initial)
- [x] Add session factory and connection pooling
- [x] Add Pydantic Settings for configuration
- [x] Add structured logging

## Part 3: Database Connection

- [x] Add SQLAlchemy engine and session factory (PostgreSQL)
- [x] Add `get_db` dependency for FastAPI endpoints
- [x] Add Alembic migrations

## Part 4: Database Models

- [x] Add portfolio/holding/market/news/alert/AI/job models

## Part 5: Alembic Migrations

- [x] Add alembic.ini configuration
- [x] Configure alembic/env.py with app settings and model metadata
- [x] Create initial migration for all tables
- [x] Document migration workflow in README_BACKEND.md

## Part 6: Portfolio CRUD API

- [x] Add `PortfolioCreate`, `PortfolioUpdate`, and `PortfolioRead` schemas
- [x] Add portfolio repository (`create`, `list`, `get`, `update`, `delete`)
- [x] Add portfolio service with not-found handling
- [x] Replace portfolio endpoint placeholder with REST CRUD routes
- [x] Wire portfolio service dependency injection via `app/api/deps.py`
- [x] Update backend docs with portfolio API usage
- [x] Prevent duplicate portfolio names (service checks + DB unique index)

## Part 7: Holdings CRUD API

- [x] Implement holdings schemas
- [x] Implement holdings repository/service
- [x] Add holdings CRUD endpoints under `/api/v1/portfolios/{portfolio_id}/holdings` and `/api/v1/holdings/{holding_id}`

## Part 8: Seed Demo Data

- [x] Add seed service for demo portfolios and holdings
- [x] Add development-only seed endpoint `POST /api/v1/dev/seed`
- [x] Add production safety check to disable seed endpoint

## Part 9: Core Analytics Engine

- [x] Add analytics schemas for sector exposure, diversification, risk, health, and summary
- [x] Add analytics service with deterministic scoring formulas and factor breakdowns
- [x] Add analytics endpoints under `/api/v1/analytics/portfolios/{portfolio_id}/...`

## Part 10: Benchmark Comparison

- [x] Add benchmark schemas for portfolio/benchmark/comparison response blocks
- [x] Add benchmark provider abstraction with mock S&P 500 and mock ticker prices
- [x] Add benchmark comparison service with transparent return formulas
- [x] Add benchmark comparison endpoint under `/api/v1/benchmark/portfolios/{portfolio_id}/compare`
- [x] Handle benchmark edge cases (portfolio not found, no holdings, missing mock prices)
- [x] Document benchmark API behavior and demo-data limitations

## Part 11A: News Ingestion Foundation

- [x] Add lightweight news provider abstraction with ticker-based fetch contract
- [x] Add deterministic mock news provider for seeded/demo holdings
- [x] Add portfolio-aware news refresh service flow (portfolio -> holdings -> tickers -> provider)
- [x] Normalize raw provider articles into a consistent internal shape before persistence
- [x] Add idempotent deduplication across provider batch and existing database rows
- [x] Persist normalized local news metadata as source-of-truth for future enrichment
- [x] Add news refresh endpoint `POST /api/v1/news/portfolios/{portfolio_id}/refresh`
- [x] Add portfolio news listing endpoint `GET /api/v1/news/portfolios/{portfolio_id}`
- [x] Handle key edge cases (portfolio not found, empty holdings, empty provider results, duplicate refreshes)

## Part 11B: Sentiment Analysis and Aggregation

- [x] Add sentiment provider abstraction for local article analysis
- [x] Add rule-based sentiment provider fallback with transparent keyword rules
- [x] Add idempotent sentiment upsert behavior (unique by article + provider)
- [x] Persist article sentiment metadata for later dashboard/briefing features
- [x] Aggregate article sentiment into holding-level sentiment summaries
- [x] Aggregate article sentiment into portfolio-level sentiment summary
- [x] Add sentiment analyze endpoint `POST /api/v1/sentiment/portfolios/{portfolio_id}/analyze`
- [x] Handle sentiment edge cases (portfolio not found, no holdings, no stored news, repeated analysis)

## Frontend Part 1: Portfolio UI (React + TS + Vite + Tailwind)

- [x] Create frontend app scaffold with Vite + TypeScript
- [x] Configure Tailwind CSS and global app styles
- [x] Add app layout and navigation with React Router
- [x] Add portfolio API client with environment-based backend URL
- [x] Implement portfolio list/create/detail/edit/delete pages
- [x] Add loading, empty, and error state UI components
- [x] Add professional placeholders for future holdings/analytics sections
