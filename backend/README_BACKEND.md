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
