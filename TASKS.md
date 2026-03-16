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

## Frontend Part 1: Portfolio UI (React + TS + Vite + Tailwind)

- [x] Create frontend app scaffold with Vite + TypeScript
- [x] Configure Tailwind CSS and global app styles
- [x] Add app layout and navigation with React Router
- [x] Add portfolio API client with environment-based backend URL
- [x] Implement portfolio list/create/detail/edit/delete pages
- [x] Add loading, empty, and error state UI components
- [x] Add professional placeholders for future holdings/analytics sections
