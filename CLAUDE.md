# Brodus — Project Intelligence File

This file is the shared source of truth for AI coding agents working on this project.
All agents (Claude, Codex, and future specialists) read this file at session start.

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

See `docs/orchestration.md` for the full framework diagram and protocol.

### Roles

**Claude (orchestrator):** The primary coordinator. Responsibilities:
- Intake and interpret user requests, break into sub-tasks, delegate
- Maintain persistent logs (`docs/logs/`) so context survives across sessions
- Update this file (`CLAUDE.md`) and `AGENTS.md` when architecture or strategy changes
- Quality-check all agent outputs before surfacing to user
- Generate investment research artifacts (reports, scorecards, playbooks)
- Audit Codex work at each phase's audit gate per `docs/ROADMAP.md`
- Does not rubber-stamp — failed audits go back to Codex with specific fix instructions

**Codex (builder):** Executes roadmap phases, writes code, proposes features. Responsibilities:
- Read this file at session start, then `docs/comms/backlog.md`, then the current brief in `docs/comms/briefs/`
- Execute the active brief — each brief has a clear objective, deliverables, acceptance criteria, and file boundaries
- Read `docs/logs/changelog.md` for recent changes by other agents
- Recommend feature additions at "Analyst Recommendation Windows" (senior investment analyst perspective)
- Commit incrementally — one logical unit per commit
- After each session, update `docs/comms/status.md` and append to `docs/logs/changelog.md`

**Future agents:** As the system grows, specialized agents will handle deal sourcing, portfolio monitoring, scheduling, email, and other workstreams. All agents follow the same communication protocol below.

### Agent Communication Protocol

All agents coordinate through shared files in this repo. There is no real-time messaging — agents communicate asynchronously by reading and writing to shared state.

**Session start checklist (all agents):**
1. Read `CLAUDE.md` (this file) — architecture, conventions, current state
2. Read `docs/comms/backlog.md` — what's the current priority?
3. Read the active brief in `docs/comms/briefs/` — what exactly should I build?
4. Read `docs/comms/status.md` — what did the other agent last report?
5. Read `docs/logs/changelog.md` — what changed since last session
6. Read `docs/logs/best-practices.md` — patterns to follow, mistakes to avoid
7. (Claude only) Read `docs/logs/context.md` — strategic decisions and conversation history

**Session end checklist (all agents):**
1. (Codex) Update `docs/comms/status.md` with current state, blockers, decisions
2. Append changes to `docs/logs/changelog.md` with date and description
3. If new patterns or lessons learned: append to `docs/logs/best-practices.md`
4. (Claude only) Append strategic context to `docs/logs/context.md`
5. (Claude only) Write next brief or update backlog if priorities changed

**Shared state files:**

| File | Purpose | Writers | Readers |
|------|---------|---------|---------|
| `CLAUDE.md` | Project intelligence, conventions | Claude | All agents |
| `AGENTS.md` | Agent-specific operating instructions | Claude | Codex |
| `docs/ROADMAP.md` | Build phases, directives, audit gates | Claude + User | Codex |
| `docs/comms/backlog.md` | Prioritized task queue | Claude | Codex |
| `docs/comms/briefs/*.md` | Task specifications with acceptance criteria | Claude | Codex |
| `docs/comms/status.md` | Current state, blockers, session reports | Codex | Claude |
| `docs/comms/PROTOCOL.md` | Communication rules of engagement | Claude | All agents |
| `docs/logs/context.md` | Strategic decisions, conversation history | Claude | Claude |
| `docs/logs/changelog.md` | Code and structural changes | All agents | All agents |
| `docs/logs/best-practices.md` | Patterns, capabilities, lessons | All agents | All agents |
| `docs/orchestration.md` | Framework diagram and delegation matrix | Claude | All agents |

### Conflict Resolution

If agents encounter conflicting information:
1. `CLAUDE.md` takes precedence over all other docs
2. `AGENTS.md` takes precedence over `docs/ROADMAP.md` for agent behavior
3. `docs/logs/changelog.md` is the source of truth for what actually changed (not commit messages)
4. When in doubt, do not proceed — flag the conflict in changelog and wait for Claude to resolve
