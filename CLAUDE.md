# Atlas — Project Intelligence File

This file is the shared source of truth for AI coding agents working on this project.
Both Claude Code and OpenAI Codex read this file at session start.

## What Atlas Is

A personal market intelligence platform. I track assets across TradingView, SEC EDGAR, and financial news — Atlas is the single dashboard that ties them together with AI-generated reports and a curated feed.

Single user. No multi-tenancy. No public-facing auth (admin gate only on config pages).

## Current State

**Branch:** `feature/environment-setup`

**What exists:**
- Database schema: `supabase/migrations/001_initial_schema.sql` (7 tables: sources, entities, filings, articles, document_entities, summaries, ingestion_log)
- Core Python modules: `core/python/config.py` (env vars), `db.py` (Supabase client), `queue.py` (QStash client)
- Pydantic models: `core/python/models/` (Filing, Article, Entity)
- API route stubs: `api/python/` (ingest_filings, ingest_feeds, process_filing, process_article — all return `not_implemented`)
- Docs: `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/SCHEMA.md`, `docs/ROADMAP.md`
- Config: `vercel.json`, `requirements.txt`, `.env.example`, `.python-version` (3.12)

**What does NOT exist yet:**
- Watchlist tables (next migration: `002_watchlist.sql`)
- Watchlist API routes
- Market data enrichment
- AI report generation
- Frontend (Next.js not initialized)
- Feed ingestion pipeline (stubs only)
- TradingView sync

## Development Roadmap

See `docs/ROADMAP.md` for the full phased plan. Build order:

1. Watchlist data model + CRUD API
2. Asset data enrichment (metrics, EDGAR links, TradingView URLs)
3. AI report generation (per-asset + 24h briefing)
4. Frontend watchlist dashboard
5. Sources admin page
6. Feed page + ingestion pipeline
7. TradingView sync
8. Semantic search + polish

**The watchlist is the product. Everything else serves it.**

## Project Structure

```
api/python/                  → Vercel serverless functions (Python runtime)
  ingest_filings/index.py    → Cron: fetch SEC filings
  ingest_feeds/index.py      → Cron: fetch RSS articles
  process_filing/index.py    → QStash: process one filing
  process_article/index.py   → QStash: process one article

core/python/                 → Shared business logic (never duplicate in routes)
  config.py                  → All env vars and constants
  db.py                      → Supabase client singleton
  queue.py                   → QStash client and publish helper
  models/                    → Pydantic models (the data contract)
  edgar/                     → EDGAR API client and parsers
  feeds/                     → RSS fetcher and source registry
  processing/                → Embeddings, summarization, entity extraction

supabase/migrations/         → Numbered SQL migrations (append-only)
frontend/                    → Next.js 15 app (not yet initialized)
docs/                        → PRD, architecture, schema, roadmap
```

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| API | Python on Vercel Serverless Functions | `api/python/` directory, BaseHTTPRequestHandler pattern |
| Database | Supabase (PostgreSQL + pgvector + pg_trgm) | Access only through `core/python/db.py` |
| Queue | Upstash QStash | Access only through `core/python/queue.py` |
| AI | OpenAI (text-embedding-3-small, gpt-4o-mini) | Config in `core/python/config.py` |
| Frontend | Next.js 15, TypeScript, Tailwind CSS | App Router, no direct Supabase calls |

## Conventions

### Architecture Rules
- **API routes are thin.** Validate input, call `core/python/` functions, format output. No business logic in routes.
- **Database access through `db.py` only.** Never instantiate a Supabase client elsewhere.
- **QStash through `queue.py` only.** Same principle.
- **Config from environment only.** All env vars flow through `core/python/config.py`. No hardcoded keys or URLs.
- **Pydantic models are the contract.** All data structures defined in `core/python/models/`. Frontend TypeScript types must mirror them.

### Code Standards
- Python: full type hints on all function signatures.
- TypeScript: strict mode, no `any` types.
- No dead code — no commented-out blocks, no unused imports, no placeholder functions.
- Every API route handles: bad input (422), not found (404), server error (500). Never return 200 with an error message in the body.
- One responsibility per file. If a module does two unrelated things, split it.

### Data Patterns
- Entity-centric: everything links back to entities via `document_entities`.
- Filings deduped by `accession_number`, articles deduped by `url`.
- One summary per document (unique constraint).
- Watchlist items keyed by ticker (standalone, linked to entities later).

### Dependencies
- `httpx` for HTTP (not requests)
- `feedparser` for RSS
- `pydantic` for models
- `openai` for embeddings and summarization
- `supabase` for database
- `upstash-qstash` for queue
- No SQLAlchemy, no anthropic SDK, no ORMs

### Process
- Migration files are append-only. Never edit a deployed migration.
- Commit after each logical unit of work, not entire phases.
- Test with real data: real tickers (AAPL, TSLA, BRK-B), real CIKs, real RSS feeds.

### EDGAR
- SEC rate limit: 10 req/sec max. Enforce 100ms minimum delay between requests.
- Always send the configured `EDGAR_USER_AGENT` header.
- Use EFTS API (`efts.sec.gov/LATEST`) for discovery, submissions API (`data.sec.gov/submissions`) for entity-specific lookups.

## Agent Roles

This project uses two AI agents with distinct roles:

**Codex (builder):** Executes roadmap phases, writes code, proposes features. Has optionality to recommend additions from a senior investment analyst perspective at designated "Analyst Recommendation Windows" in the roadmap.

**Claude (reviewer):** Audits code at each phase's audit gate, runs debugging checks, verifies schema consistency, checks error handling, and provides written pass/fail summaries. Does not rubber-stamp — failed audits go back to Codex with specific fix instructions.

See `docs/ROADMAP.md` for the full directive and audit structure.
