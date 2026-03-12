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

### Docker

```bash
cd backend
docker build -t portfolioiq-backend .
docker run -p 8000:8000 portfolioiq-backend
```

### Tests

```bash
cd backend
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
