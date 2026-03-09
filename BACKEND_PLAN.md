# PortfolioIQ Backend – Development Plan

## Overview

This document outlines the phased development plan for the PortfolioIQ backend, a FastAPI-based service for portfolio management and analytics.

---

## Part 1: Project Foundation ✅

- Project structure and configuration
- Minimal FastAPI bootstrap
- Health check endpoint
- Versioned API router (`/api/v1`)
- Placeholder modules for future endpoints
- Development tooling (Dockerfile, requirements.txt, .env.example)

---

## Part 2: Database & Core Setup

- Alembic migrations
- Database models (SQLAlchemy)
- Connection pooling and session management
- Configuration loading (Pydantic Settings)
- Logging setup

---

## Part 3: Authentication & Users

- User model and repository
- Registration and login
- JWT-based auth
- Password hashing
- Protected route middleware

---

## Part 4: Core Domain – Portfolios & Holdings

- Portfolio and holding models
- CRUD operations
- Portfolio analytics (aggregations, performance)
- Service layer for business logic

---

## Part 5: External Integrations

- Market data provider (e.g., Yahoo Finance, Alpha Vantage)
- Asset metadata and price fetching
- Background jobs for price sync

---

## Part 6: Testing & Quality

- Unit tests
- Integration tests
- CI/CD basics

---

## Conventions

- **API versioning**: URL prefix `/api/v1`
- **Layered design**: `endpoints` → `services` → `repositories`
- **Async**: Use async SQLAlchemy and async HTTP where applicable
