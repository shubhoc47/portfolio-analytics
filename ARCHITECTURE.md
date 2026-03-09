# PortfolioIQ Backend – Architecture

## High-Level Layout

```
backend/
├── app/
│   ├── api/v1/endpoints/   # HTTP handlers (controllers)
│   ├── core/               # Config, security, dependencies
│   ├── db/                 # Database connection, session factory
│   ├── models/             # SQLAlchemy ORM models
│   ├── schemas/            # Pydantic request/response models
│   ├── services/           # Business logic
│   ├── repositories/       # Data access layer
│   ├── providers/          # External services (market data, etc.)
│   ├── jobs/               # Background tasks / workers
│   ├── utils/              # Helpers
│   └── main.py             # Application entry point
├── tests/
├── alembic/                # Migrations
├── requirements.txt
├── Dockerfile
└── .env.example
```

---

## Request Flow

```
Client Request
      │
      ▼
┌─────────────────┐
│   main.py       │  FastAPI app, routers mounted
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ api/v1/router   │  Versioned API prefix
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  endpoint       │  Parse params, validate, call service
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  service        │  Business logic (when implemented)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  repository     │  Database access (when implemented)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  database       │  PostgreSQL / SQLite
└─────────────────┘
```

---

## Layers

| Layer         | Purpose |
|---------------|---------|
| **endpoints** | HTTP routing, request parsing, response shaping |
| **services**  | Business rules, orchestration |
| **repositories** | CRUD, queries, transaction boundaries |
| **models**    | ORM entities |
| **schemas**   | Validation and serialization (Pydantic) |

---

## Design Principles

1. **Separation of concerns** – Endpoints only handle HTTP; logic lives in services.
2. **Dependency injection** – Use FastAPI `Depends()` for services and DB sessions.
3. **Explicit over implicit** – Clear module boundaries, minimal magic.
4. **Testability** – Services and repositories are injectable and mockable.
