# Brodus — Development Roadmap

> **Active execution queue:** `docs/comms/backlog.md`
> This roadmap is the long-term feature vision. The backlog is what's being built now.

## Authority and Scope

This document is the strategic build plan for Brodus. It describes the phased journey from current state to the full autonomous operating system. It is guidance for sequencing and prioritization — not a task list.

- **Highest authority:** `.agents/initiation.md` (role contract) and `CLAUDE.md` (architecture and constraints)
- **Active work:** `docs/comms/backlog.md` (priority-ordered task queue with briefs)
- **Architecture reference:** `docs/architecture.md` (system design and data flow)
- **If there is any conflict:** `CLAUDE.md` takes precedence

Last updated: 2026-02-10

---

## Strategic Principles

These principles govern all build decisions. They supersede the original Phase 1-8 plan.

**1. UX-first, page by page.** The frontend is the product surface. Each page gets a complete vertical-slice treatment: design overhaul + backend wiring + real data. No "backend-only" phases that leave the frontend as a hollow shell.

**2. Domain module pattern.** Each domain (journal, watchlist, research, feed) is a self-contained slice: migration + models + services + API routes + types + components + page. Domains share the data layer and design system but do not import each other's services.

**3. Design patterns propagate forward.** The first page to be overhauled (Trade Journal) establishes the design system: Panel, PillToggle, dense tables, value coloring, typography, spacing. Every subsequent page inherits these patterns — no re-inventing the wheel.

**4. Agents execute, humans direct.** Build agents (backend, frontend) execute briefs autonomously. The orchestrator writes briefs, audits results, and maintains infrastructure. The product owner sets priorities and reviews outputs. This separation scales to additional agent types (research, ops, data) without changing the operating model.

**5. Backend follows frontend demand.** API routes and services are built when a page needs them — not speculatively. The exception is data infrastructure (migrations, entity linking) which has long lead times.

---

## Current State (as of 2026-02-10)

### What's Built

**Frontend shell:** Next.js 15 command center with collapsible sidebar navigation, three pages (Watchlist, Research, Journal), expanded design system (brodus-* color tokens, JetBrains Mono data font, Panel and PillToggle components, dense table patterns). Pages use local component state — not yet wired to backend APIs.

**Backend stubs:** API route stubs for ingestion and processing (return `not_implemented`). Core modules for config, database client, queue client. Zod schemas for Filing, Article, Entity.

**Database:** Initial schema with 7 tables (sources, entities, filings, articles, document_entities, summaries, ingestion_log). No domain-specific tables yet (watchlist, journal).

**Agent infrastructure:** `.agents/` directory with registry, protocol, and scoped instructions for 4 active agents (orchestrator, backend builder, frontend builder, equity research). Brief lifecycle system with archive.

**Research:** 15 investment playbooks in `research/prompts/`, 4 generated reports in `research/reports/`.

### What's Not Built

- Domain-specific backend (journal tables, watchlist tables, CRUD APIs)
- Market data enrichment pipeline
- AI report generation pipeline (playbooks exist, generation does not)
- Feed ingestion pipeline (stubs exist, implementation does not)
- EDGAR integration beyond URL generation
- Semantic search
- Autonomous agent scheduling
- Portfolio monitoring, deal sourcing, operations workflows

---

## Phase 1: Command Center (IN PROGRESS)

**Goal:** Make the frontend visually compelling and functionally complete, page by page. Each page gets the Messari-inspired terminal treatment plus real backend functionality.

**Design reference:** Messari.io — dark, dense, data-heavy financial terminal. Panel-based layouts, pill toggles, monospace numbers, green/red value coloring.

### 1A. Trade Journal (Brief 002 — Active)

The first page to receive the full treatment. Establishes the design patterns that all other pages will follow.

- Database migration: `trade_entries` + `journal_entries` tables
- Zod schemas: `TradeEntry`, `JournalEntry` with Create variants
- API routes: full CRUD for trades and journal entries
- Frontend overhaul: Panel/PillToggle components, two-tab layout (Trade Log / Daily Journal), stat cards, dense trade table with expandable rows, journal entry cards
- DESIGN.md: codified terminal-wide design directive

**Unlocks:** Reusable Panel and PillToggle components used by all subsequent pages.

### 1B. Watchlist Overhaul (Up Next)

Apply the terminal design to the existing watchlist page. Wire to real Supabase-backed APIs.

- Database migration: `watchlist_categories` + `watchlist_items` tables (scope from deferred Brief 001)
- Zod schemas + API routes: full CRUD, category management, reorder
- Frontend overhaul: decompose the 600+ line monolith into composable components, apply Panel chrome, dense data rows, category panels
- Market data enrichment: basic metric display (price, change) — data source TBD

**Unlocks:** The primary daily-use surface with real data.

### 1C. Research Page Overhaul

Apply the terminal design to the research/reports viewer.

- Frontend overhaul: improved report list with search/filter, better markdown rendering (tables, blockquotes, links), report table of contents
- No new backend required initially — reports are generated flat files
- Later: API routes for report metadata, generation triggers

**Unlocks:** A usable research reading experience.

### 1D. Feed Page (New)

Build a new page for the ingestion pipeline's output.

- Frontend: reverse-chronological feed of articles and filings, filter tabs (All/News/Filings), ticker filter, visual indicator for watchlist-linked items
- Requires Phase 2 (data infrastructure) to show real data — build with empty states and types first

---

## Phase 2: Data Infrastructure

**Goal:** Build the backend services and pipelines that feed the command center with real data.

### 2A. Market Data Enrichment

- Evaluate and integrate a financial data API (FMP, Alpha Vantage, or similar)
- `frontend/src/services/market-data.ts`: current price, multiples (P/E, EV/EBITDA, P/S, P/B), performance (1D through 1Y), market cap, 52w range
- Enrichment API route: real-time lookup per ticker, returns to frontend
- TradingView URL generation for chart links

### 2B. EDGAR Integration

- `frontend/src/services/edgar.ts`: query EFTS for filing discovery, submissions API for entity-specific lookups
- Direct links to most recent 10-K, 10-Q, 8-K per entity
- Entity linking: map tickers to CIKs, link filings to entities via `document_entities`
- Rate limiting: 100ms minimum delay, proper User-Agent header

### 2C. Feed Ingestion Pipeline

- Activate the existing route stubs: `ingest_filings`, `ingest_feeds`, `process_filing`, `process_article`
- RSS fetcher: parse active sources, insert new articles, dispatch QStash jobs
- EDGAR fetcher: query recent filings, insert, dispatch QStash jobs
- Processing: fetch full content, generate embeddings (OpenAI text-embedding-3-small), extract entities
- Deduplication: accession_number for filings, URL for articles

### 2D. Sources Management

- Sources admin page (`/admin/sources`): CRUD for RSS feeds and EDGAR search configs
- Simple admin gate (env-based password)
- Test button per source to validate URL/feed

---

## Phase 3: Intelligence Layer

**Goal:** Turn raw data into actionable research using AI.

### 3A. AI Report Generation

- `frontend/src/services/reports.ts`: structured report generation using existing playbooks
- Per-asset reports: company overview, price action, key metrics, filings summary, bull/bear thesis
- 24-hour watchlist briefing: cross-asset daily summary
- OpenAI gpt-4o-mini with structured prompts, optional persistence to summaries table
- Wire to Research page: "Generate Report" button per ticker

### 3B. Semantic Search

- Vector search API: generate query embedding, search filings and articles by cosine similarity
- Search bar accessible from all pages
- Results page: ranked filings/articles with relevance score, snippet, entity tags
- pgvector-powered, using embeddings generated during ingestion

### 3C. Playbook Evolution

- Feedback loop: orchestrator captures report quality signals, refines playbooks
- Scorecard auto-generation alongside reports
- Playbook versioning and A/B comparison

---

## Phase 4: Autonomous Workflows

**Goal:** Evolve from a manual research tool to an autonomous operating system.

### 4A. Portfolio Monitoring

- Ops agent: track positions, price alerts, filing alerts
- Scheduled briefings: daily and weekly automated summaries
- Alert system: unusual price moves, new filings for watchlist entities, earnings within N days

### 4B. Deal Sourcing

- Research agent expansion: identify opportunities from filings, news patterns, sector rotations
- Macro/thematic research agent: market-level analysis
- Opportunity scoring and pipeline tracking

### 4C. Scheduling and Orchestration

- Cron-driven agent tasks via Vercel cron + QStash
- Agent task queue: prioritized, observable, auditable
- Cross-agent coordination: research agents feed data to monitoring agents

### 4D. TradingView Sync

- Import/export watchlists between Brodus and TradingView
- Merge logic: existing items stay, new ones added, no category disruption
- Bidirectional sync (eventual)

---

## Phase 5: Scale and Polish

**Goal:** Harden the system for daily autonomous operation.

- Performance: all pages load in under 2 seconds with full data
- Keyboard shortcuts: `/` to search, `Esc` to close modals, vim-style navigation
- Error boundaries on all pages, loading skeletons for async operations
- Database-backed artifact store (reports, scorecards) replacing flat files
- Semantic deduplication via pgvector cosine similarity
- Observability: agent execution logs, pipeline health dashboard
- Multi-agent scaling: add agents for new domains without architectural changes

---

## Agent Operating Model

The roadmap is executed through the agent system. Agents don't work phases — they work briefs.

```
Product owner sets priorities
    │
    ▼
Orchestrator writes briefs from the roadmap
    │
    ▼
Briefs are queued in docs/comms/backlog.md
    │
    ▼
Build agents execute the top brief in their group
    │
    ▼
Orchestrator audits results against acceptance criteria
    │
    ▼
Brief archived → next brief promoted
```

The roadmap informs WHAT to build. The backlog determines WHEN. Briefs specify HOW. This separation means the roadmap can be revised without disrupting active work, and agents can be added or reassigned without changing the plan.

### Current Agent Roster

| Agent | Group | Role | Status |
|-------|-------|------|--------|
| Claude (Orchestrator) | build | Writes briefs, audits results, maintains infrastructure | Active |
| Backend Builder | build | Migrations, models, services, API routes | Active |
| Frontend Builder | build | React components, pages, types, styling | Active |
| Equity Research | research | Executes playbooks, generates reports | Active |

See `.agents/registry.md` for the full directory including planned agents.

---

## Standing Directives

These rules apply to all phases and all agents. They restate core constraints from `CLAUDE.md` for convenience — if anything here conflicts, `CLAUDE.md` takes precedence.

**Code quality:** No dead code. Full type hints (Python) and strict mode (TypeScript). Every API route handles 422, 404, 500. Config from environment only. One responsibility per file.

**Architecture:** API routes are thin wrappers. Business logic lives in `frontend/src/services/`. Database access through `db.ts` only. QStash through `queue.ts` only. Zod schemas are the data contract — frontend TypeScript types must mirror them.

**Process:** Commit after each logical unit. Migrations are append-only. Test with real data (real tickers, real CIKs, real RSS feeds). No secrets in code or git.

**Dependencies:** `zod` for validation, `@supabase/supabase-js` for database, `@upstash/qstash` for queue, `openai` for AI, `fetch` (built-in) for HTTP. No ORMs, no anthropic SDK.
