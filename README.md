# PortfolioIQ

PortfolioIQ is a portfolio management and analytics app with a FastAPI backend and a React + TypeScript + Vite frontend.

## Project Structure

```text
PortfolioIQ/
  backend/   FastAPI API, database models, services, tests
  frontend/  React/Vite web app
```

## Run Locally

Run the backend and frontend in two separate terminals.

### 1. Backend

From the project root:

```powershell
cd backend
```

Create and activate a Python virtual environment if you do not already have one:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

If PowerShell blocks activation, run this once in the same terminal, then activate again:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

Install dependencies and start the API:

```powershell
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend URLs:

- API: `http://localhost:8000`
- Swagger docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

### 2. Frontend

Open a second terminal from the project root:

```powershell
cd frontend
npm install
npm run dev
```

Frontend URL:

- App: `http://localhost:5173`

## Environment Files

### Backend

Copy the backend environment example if you need local overrides:

```powershell
cd backend
copy .env.example .env
```

Important backend values:

- `DATABASE_URL`: PostgreSQL connection string.
- `SECRET_KEY`: JWT signing secret for local auth.
- `FINNHUB_API_KEY`: Optional, backend-only. Used for live quote refresh and ticker/company autocomplete.
- `ALLOWED_ORIGINS`: Should include `http://localhost:5173`.

### Frontend

The frontend should point to the backend API:

```powershell
cd frontend
copy .env.example .env
```

Expected value:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Common Commands

Backend tests:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python -m pytest
```

Frontend production build:

```powershell
cd frontend
npm run build
```

## Login Flow

1. Start backend and frontend.
2. Open `http://localhost:5173`.
3. Create an account or sign in.
4. The frontend stores a JWT access token and sends it to protected backend endpoints.

For direct API testing, open `http://localhost:8000/docs`, use `/api/v1/auth/login`, and authorize with the returned bearer token.

## Market Data

Authenticated market-data endpoints live under `/api/v1/market-data`. The backend keeps `FINNHUB_API_KEY` private and calls Finnhub for live quote refresh plus symbol search autocomplete.

- `GET /api/v1/market-data/search?query=apple`: returns normalized ticker/company suggestions for the holding form.
- `POST /api/v1/market-data/portfolios/{portfolio_id}/refresh-prices`: refreshes stored holding prices from live quotes.

Finnhub free-tier limits can affect autocomplete and quote refresh frequency, and search results may include delayed or imperfect market-data classifications.
