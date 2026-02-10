# Brodus — Project Intelligence File

This file is the shared source of truth for project context, architecture, and constraints.
Operational role contracts and session steps live in `docs/comms/initiation.md`.

## What Brodus Is

A personal operating system powered by AI agents. The first workstream is market intelligence — tracking assets across TradingView, SEC EDGAR, and financial news — but the architecture is designed to support any autonomous agent workflow: deal sourcing, portfolio monitoring, business operations, scheduling, and more.

The user spends time editing guidelines (playbooks) and reviewing agent outputs. Agents execute autonomously, self-improve through feedback loops, and coordinate through shared state.

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

**What also exists (outside the main codebase):**
- Investment research playbooks: `research/prompts/` (15 industry-specific analytical frameworks)
- Generated reports + scorecards: `research/reports/` (TIC, ADBE, INTC, VNET)
- Prompt compliance verifier: `research/verify_prompt_compliance.py`
- Orchestration framework: `docs/orchestration.md`
- Persistent agent logs: `docs/logs/` (context.md, changelog.md, best-practices.md)

**What does NOT exist yet:**
- Watchlist tables (next migration: `002_watchlist.sql`)
- Watchlist API routes
- Market data enrichment
- AI report generation pipeline (stubs only, playbooks exist)
- Feed ingestion pipeline (stubs only)
- TradingView sync
- Database-backed artifact store (reports currently in flat files)

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
frontend/                    → Next.js 15 app (App Router + TS + Tailwind)
docs/                        → PRD, architecture, schema, roadmap
docs/comms/                  → Agent communication (briefs, backlog, status)
docs/comms/briefs/           → Numbered task specs from Claude to Codex
docs/logs/                   → Persistent agent logs (context, changelog, best practices)
docs/orchestration.md        → Orchestration framework diagram and protocol
research/prompts/            → Investment playbooks (analytical frameworks)
research/reports/            → Generated artifacts (reports, scorecards)
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

## Agent Roles & Communication

See `docs/comms/initiation.md` for role contracts, session steps, and conflict resolution.
See `docs/orchestration.md` for the full framework diagram and protocol.
