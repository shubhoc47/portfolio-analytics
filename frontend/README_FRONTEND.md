# PortfolioIQ Frontend

React + TypeScript + Vite frontend for PortfolioIQ.

## Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router

## Run Locally

```bash
cd frontend
npm install
npm run dev
```

Open: `http://localhost:5173`

## Environment

Copy `.env.example` to `.env` and adjust if needed:

```env
VITE_API_BASE_URL=http://localhost:8000
```

The app calls portfolio API endpoints under:

- `GET /api/v1/portfolios`
- `POST /api/v1/portfolios`
- `GET /api/v1/portfolios/{id}`
- `PUT /api/v1/portfolios/{id}`
- `DELETE /api/v1/portfolios/{id}`

If the browser blocks requests, update backend CORS origins to include:

- `http://localhost:5173`

## Current Scope

- Portfolio list/create/details/edit/delete
- Loading, empty, and error states
- Clean SaaS-style UI foundation

Future modules (holdings, analytics, etc.) are intentionally placeholders for upcoming milestones.
