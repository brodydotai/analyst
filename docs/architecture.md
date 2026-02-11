# Brodus — Architecture

## Authority and Scope

This document describes the system design, data flow, and deployment model for Brodus. It reflects the current state and near-term direction.

- **Architecture authority:** `CLAUDE.md` (conventions, constraints, tech stack)
- **Agent infrastructure:** `.agents/` (registry, protocol, scoped instructions)
- **Active work queue:** `docs/comms/backlog.md`
- **If there is any conflict:** `CLAUDE.md` takes precedence

Last updated: 2026-02-10

---

## System Overview

Brodus is a personal operating system powered by AI agents. The first workstream is market intelligence — tracking assets, ingesting SEC filings and financial news, and generating AI-powered research. The architecture is designed to support additional autonomous workflows (deal sourcing, portfolio monitoring, operations) as the system matures.

```
┌──────────────────────────────────────────────────────────────────┐
│                         USER (Brody)                             │
│   Reviews outputs, edits playbooks, sets strategic direction     │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                    ORCHESTRATION LAYER                            │
│                    Claude (Cowork)                                │
│                                                                   │
│   Interprets intent → writes briefs → routes to agents →         │
│   audits results → maintains infrastructure                      │
│                                                                   │
│   .agents/registry.md routes tasks by type                       │
└──────┬──────────┬──────────┬──────────┬──────────────────────────┘
       │          │          │          │
       ▼          ▼          ▼          ▼
┌──────────┐┌──────────┐┌──────────┐┌──────────────────────┐
│ Backend  ││ Frontend ││ Research ││ Future Agents         │
│ Builder  ││ Builder  ││ Agents   ││                       │
│          ││          ││          ││ • Portfolio monitoring │
│ Migra-   ││ React    ││ Playbook ││ • Deal sourcing       │
│ tions,   ││ compo-   ││ execu-   ││ • Data pipelines      │
│ models,  ││ nents,   ││ tion,    ││ • Operations          │
│ routes,  ││ pages,   ││ reports, ││ • Scheduling          │
│ services ││ types    ││ scores   ││                       │
└──────┬───┘└──────┬───┘└──────┬───┘└──────────┬────────────┘
       │          │          │               │
       ▼          ▼          ▼               ▼
┌──────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                  │
│                                                                   │
│  Supabase (PostgreSQL + pgvector + pg_trgm):                     │
│  • Watchlist items + categories     • Trade entries + journal     │
│  • Entities + entity links          • Filings + articles         │
│  • Summaries + embeddings           • Ingestion logs             │
│                                                                   │
│  APIs & External Services:                                        │
│  • SEC EDGAR (EFTS + Submissions)   • OpenAI (embeddings, gen)   │
│  • Financial data API (TBD)         • RSS feeds                  │
│  • TradingView (URL generation)     • QStash (async processing)  │
└──────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                    COMMAND CENTER                                  │
│                    Next.js 15 (App Router + TS + Tailwind)        │
│                                                                   │
│  Pages:                              Design:                      │
│  • Watchlist (/)                     • Messari-inspired terminal  │
│  • Research (/reports)               • Panel-based layouts        │
│  • Trade Journal (/journal)          • Dense data tables          │
│  • Feed (/feed) — planned            • Dark theme (brodus-*)     │
│  • Admin (/admin) — planned                                       │
└──────────────────────────────────────────────────────────────────┘
```

---

## Application Architecture

### Domain Module Pattern

The application is organized by domain. Each domain is a self-contained vertical slice:

```
Domain = Migration + Models + Services + API Routes + Types + Components + Page
```

| Domain | Database | Backend | Frontend | Status |
|--------|----------|---------|----------|--------|
| Watchlist | `002_watchlist.sql` (planned) | models, routes, services | components, page | Frontend built, backend pending |
| Journal | `002_trade_journal.sql` (Brief 002) | models, routes, services | components, page | Brief written, awaiting execution |
| Research | — (uses existing tables) | report generation | components, page | Frontend built, generation pending |
| Feed | — (uses existing tables) | ingestion pipeline | components, page | Stubs only |

Domains share the data layer (`frontend/src/lib/db.ts`) and the design system (`frontend/src/components/ui/`) but do NOT import each other's services directly.

### Layered Architecture

```
┌─────────────────────────────────────────────┐
│ Frontend (Next.js)                          │
│ src/app/[domain]/page.tsx                   │
│ src/components/[domain]/*.tsx               │
│ src/types/[domain].ts                       │
│                                             │
│ Calls API routes via fetchJson()            │
│ Never accesses Supabase directly            │
├─────────────────────────────────────────────┤
│ API Routes (Next.js App Router)             │
│ frontend/src/app/api/[domain]/route.ts      │
│                                             │
│ Thin: validate input → call service →       │
│ format output. No business logic here.      │
├─────────────────────────────────────────────┤
│ Services (frontend/src/services/)           │
│ services/[domain].ts                        │
│                                             │
│ All business logic lives here.              │
│ CRUD, validation, aggregation, enrichment.  │
├─────────────────────────────────────────────┤
│ Schemas (frontend/src/schemas/)             │
│ schemas/[domain].ts                         │
│                                             │
│ Zod schemas = the data contract.            │
│ Frontend and backend validation.            │
├─────────────────────────────────────────────┤
│ Database (Supabase)                         │
│ supabase/migrations/NNN_*.sql               │
│                                             │
│ Accessed only through db.ts.               │
│ Migrations are append-only.                 │
└─────────────────────────────────────────────┘
```

---

## Data Flow

### User-Facing CRUD (e.g., Trade Journal)

```
User action in Command Center
    │
    ▼
Frontend calls fetchJson('/api/journal/trades', { method: 'POST', body })
    │
    ▼
API route validates with Zod → calls service function → returns JSON
    │
    ▼
Service function calls db.ts → Supabase INSERT/UPDATE/DELETE
    │
    ▼
Response flows back through the chain → UI updates
```

### Feed Ingestion Pipeline (planned)

```
Vercel Cron triggers ingest_filings / ingest_feeds
    │
    ▼
Route queries EDGAR EFTS or fetches RSS feeds
    │
    ├── New filings: INSERT into filings table, dispatch QStash message
    └── New articles: INSERT into articles table, dispatch QStash message
         │
         ▼
    QStash delivers message to process_filing / process_article
         │
         ▼
    Processing: fetch full content → generate embedding → extract entities → store
         │
         ▼
    Supabase: full text, embedding, entity links stored
         │
         ▼
    Available in Command Center feed page and semantic search
```

### AI Report Generation (planned)

```
User clicks "Generate Report" for a ticker
    │
    ▼
API route fetches: current metrics + recent filings + recent articles
    │
    ▼
Assembles context → sends to OpenAI (gpt-4o-mini) with structured prompt
    │
    ▼
Returns markdown report → rendered in Command Center
    │
    ▼
Optionally persisted to summaries table
```

---

## EDGAR API Strategy

Brodus uses two SEC EDGAR APIs:

- **EFTS Full-Text Search** (`efts.sec.gov/LATEST`) — Discover filings by keywords, form type, date range.
- **Submissions** (`data.sec.gov/submissions`) — Look up all filings by a specific CIK.

Rate limiting: SEC requires max 10 requests/second and a User-Agent header. Brodus enforces a 100ms minimum delay between requests. The user agent is configured via `EDGAR_USER_AGENT` environment variable.

## Entity Linking

Entities (companies, people, funds) are identified by CIK (exact match for SEC filers), pg_trgm trigram similarity (fuzzy name matching), and ticker symbol extraction from text. The `document_entities` junction table links documents to entities with a role and confidence score.

## Deduplication

Filings are deduped by `accession_number`, articles by `url` (unique constraints). Semantic deduplication via pgvector cosine similarity is planned for flagging near-duplicate content.

## Deployment

API routes are Next.js API Routes deployed on Vercel. Cron schedules are defined in `vercel.json`. The frontend deploys as a standard Next.js app on Vercel. Supabase provides the managed PostgreSQL database with pgvector and pg_trgm extensions.
