# Brodus — Project Intelligence File

This file is the shared source of truth for project context, architecture, and constraints.
Operational role contracts and session steps live in `.agents/initiation.md`.

## What Brodus Is

A personal operating system powered by AI agents. The first workstream is market intelligence — tracking assets across TradingView, SEC EDGAR, and financial news — but the architecture is designed to support any autonomous agent workflow: deal sourcing, portfolio monitoring, business operations, scheduling, and more.

The user spends time editing guidelines (playbooks) and reviewing agent outputs. Agents execute autonomously, self-improve through feedback loops, and coordinate through shared state.

Single user. No multi-tenancy. No public-facing auth (admin gate only on config pages).

## Current State

**What exists:**
- Database schema: `supabase/migrations/001_initial_schema.sql` (7 tables: sources, entities, filings, articles, document_entities, summaries, ingestion_log)
- Backend infrastructure: `frontend/src/lib/` (config.ts, db.ts, queue.ts — Supabase + QStash clients)
- Zod schemas: `frontend/src/schemas/` (Filing, Article, Entity, Journal)
- Service layer: `frontend/src/services/` (journal CRUD)
- API routes: `frontend/src/app/api/` (journal CRUD + pipeline stubs)
- Frontend: Next.js command center with sidebar nav, watchlist, research, and journal pages
- Agent infrastructure: `.agents/` directory with registry, protocol, and scoped instructions
- Docs: `docs/architecture.md`, `docs/roadmap.md`, `docs/prd/`, `docs/STRUCTURE.md`
- Config: `vercel.json`

**What also exists (outside the main codebase):**
- Investment research playbooks: `research/prompts/` (15 industry-specific analytical frameworks)
- Generated reports + scorecards: `research/reports/` (TIC, ADBE, INTC, VNET)
- Prompt compliance verifier: `research/verify_prompt_compliance.py`
- Agent communication: `docs/comms/` (briefs, backlog, status, logs)
- Persistent agent logs: `docs/comms/logs/` (context.md, changelog.md, best-practices.md)

**What does NOT exist yet:**
- Trade journal tables (next migration: `002_trade_journal.sql`)
- Watchlist tables and API routes
- Market data enrichment
- AI report generation pipeline (stubs only, playbooks exist)
- Feed ingestion pipeline (stubs only)
- TradingView sync
- Database-backed artifact store (reports currently in flat files)

## Development Roadmap

See `docs/roadmap.md` for the full phased plan. See `docs/comms/backlog.md` for the active execution queue.

**The command center is the product. Everything else serves it.**

## Project Structure

```
.agents/                     → Agent infrastructure (registry, protocol, scoped instructions)
  initiation.md              → Boot sequence and role contract
  registry.md                → Master agent index
  protocol.md                → Communication protocol and brief lifecycle
  brief-template.md          → Canonical template for writing briefs
  build/                     → Build agent group (orchestrator, backend, frontend)
  research/                  → Research agent group (equity, macro)

frontend/                    → Next.js app (App Router + TS + Tailwind) — frontend AND backend
  src/app/                   → Pages (App Router)
  src/app/api/               → Next.js API routes (backend)
  src/schemas/               → Zod schemas (validation + type inference)
  src/services/              → Business logic (Supabase queries)
  src/types/                 → TypeScript types (re-exports from schemas)
  src/components/            → React components organized by domain
  src/lib/                   → Shared utilities (config, db, queue, api, format)

supabase/migrations/         → Numbered SQL migrations (append-only)

docs/                        → Project documentation
  STRUCTURE.md               → Documentation map (consult before creating docs)
  architecture.md            → System design and data flow
  roadmap.md                 → Long-term phased build plan
  prd/                       → Product requirements by domain
    overview.md              → Product vision and terminology
    database/                → Schema reference
    frontend/                → Page and design requirements
    backend/                 → API conventions and route requirements
    pipelines/               → Ingestion, enrichment, generation requirements
  comms/                     → Agent communication hub
    backlog.md               → Priority-ordered work queue
    status.md                → Current state and session log
    briefs/                  → Active task specs (archive/ for completed)
    logs/                    → Persistent agent logs (context, changelog, best practices)

research/prompts/            → Investment playbooks (analytical frameworks)
research/reports/            → Generated artifacts (reports, scorecards)
```

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| API | Next.js API Routes (TypeScript) | `frontend/src/app/api/` directory, App Router route handlers |
| Database | Supabase (PostgreSQL + pgvector + pg_trgm) | Access only through `frontend/src/lib/db.ts` |
| Queue | Upstash QStash | Access only through `frontend/src/lib/queue.ts` |
| AI | OpenAI (text-embedding-3-small, gpt-4o-mini) | Config in `frontend/src/lib/config.ts` |
| Frontend | Next.js, TypeScript, Tailwind CSS | App Router, unified stack with backend |
| Validation | Zod | Schemas in `frontend/src/schemas/`, replaces Pydantic |

## Conventions

### Architecture Rules
- **API routes are thin.** Validate input with Zod, call service functions, return `NextResponse.json`. No business logic in routes.
- **Database access through `db.ts` only.** Never instantiate a Supabase client elsewhere.
- **QStash through `queue.ts` only.** Same principle.
- **Config from environment only.** All env vars flow through `frontend/src/lib/config.ts`. No hardcoded keys or URLs.
- **Zod schemas are the contract.** All data structures defined in `frontend/src/schemas/`. Types inferred from schemas — no manual type duplication.

### Code Standards
- TypeScript: strict mode, no `any` types. Full type annotations on exported functions.
- No dead code — no commented-out blocks, no unused imports, no placeholder functions.
- Every API route handles: bad input (422), not found (404), server error (500). Never return 200 with an error message in the body.
- One responsibility per file. If a module does two unrelated things, split it.

### Data Patterns
- Entity-centric: everything links back to entities via `document_entities`.
- Filings deduped by `accession_number`, articles deduped by `url`.
- One summary per document (unique constraint).
- Watchlist items keyed by ticker (standalone, linked to entities later).

### Dependencies
- `zod` for validation and type inference
- `@supabase/supabase-js` for database
- `@upstash/qstash` for queue
- `openai` for embeddings and summarization
- `fetch` (built-in) for HTTP — no axios
- No ORMs, no anthropic SDK

### Process
- Migration files are append-only. Never edit a deployed migration.
- Commit after each logical unit of work, not entire phases.
- Test with real data: real tickers (AAPL, TSLA, BRK-B), real CIKs, real RSS feeds.

### EDGAR
- SEC rate limit: 10 req/sec max. Enforce 100ms minimum delay between requests.
- Always send the configured `EDGAR_USER_AGENT` header.
- Use EFTS API (`efts.sec.gov/LATEST`) for discovery, submissions API (`data.sec.gov/submissions`) for entity-specific lookups.

## Agent Roles & Communication

See `.agents/initiation.md` for the role contract and boot sequence.
See `.agents/registry.md` for the full agent directory.
See `.agents/protocol.md` for communication format and brief lifecycle.
Each agent's scoped instructions live in `.agents/[group]/[specialization]/INSTRUCTIONS.md`.
See `docs/STRUCTURE.md` for the full documentation map.
