# Build Agent Group

Shared conventions for all agents in the build group (orchestrator, backend, frontend). Read this file after your specialization-level INSTRUCTIONS.md.

## Project Context

See `CLAUDE.md` for the full project intelligence file including architecture, conventions, and tech stack.

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| API | Next.js API Routes (TypeScript) | `frontend/src/app/api/` directory, App Router route handlers |
| Database | Supabase (PostgreSQL + pgvector + pg_trgm) | Access only through `frontend/src/lib/db.ts` |
| Queue | Upstash QStash | Access only through `frontend/src/lib/queue.ts` |
| AI | OpenAI (text-embedding-3-small, gpt-4o-mini) | Config in `frontend/src/lib/config.ts` |
| Frontend | Next.js, TypeScript, Tailwind CSS | App Router, unified stack with backend |
| Validation | Zod | Schemas in `frontend/src/schemas/`, replaces Pydantic |

## Code Standards

- **TypeScript:** Strict mode, no `any` types. Full type annotations on exported functions.
- **No dead code.** No commented-out blocks, no unused imports, no placeholder functions.
- **Error handling:** Every API route handles: bad input (422), not found (404), server error (500). Never return 200 with an error message in the body.
- **One responsibility per file.** If a module does two unrelated things, split it.

## Architecture Rules

- **API routes are thin.** Validate input with Zod `safeParse`, call service functions, return `NextResponse.json`. No business logic in routes.
- **Database access through `db.ts` only.** Never instantiate a Supabase client elsewhere.
- **QStash through `queue.ts` only.** Same principle.
- **Config from environment only.** All env vars flow through `frontend/src/lib/config.ts`. No hardcoded keys or URLs.
- **Zod schemas are the contract.** All data structures defined in `frontend/src/schemas/`. Types are inferred from schemas — no manual type duplication.

## Dependencies

- `zod` for validation and type inference
- `@supabase/supabase-js` for database
- `@upstash/qstash` for queue
- `openai` for embeddings and summarization
- `fetch` (built-in) for HTTP — no axios
- No ORMs, no anthropic SDK

## Process Rules

- Migration files are append-only. Never edit a deployed migration.
- Commit after each logical unit of work, not entire phases.
- Test with real data: real tickers (AAPL, TSLA, BRK-B), real CIKs, real RSS feeds.

## Domain Module Convention

Business logic is organized by domain. Each domain gets:

```
frontend/src/
  schemas/[domain].ts         ← Zod schemas (validation + type inference)
  services/[domain].ts        ← Business logic (CRUD, Supabase queries)
  app/api/[domain]/route.ts   ← API routes (thin — validate, call service, respond)
  types/[domain].ts           ← Re-exports from schemas (backward compat)
  components/[domain]/        ← Domain-specific components
  app/[domain]/page.tsx       ← Domain page
```

Domains share the data layer (`lib/db.ts`, `lib/config.ts`) and the design system (`components/ui/`, tailwind tokens) but do NOT import each other's services directly. Cross-domain data flows through shared schemas or API calls.

**Current domains:** journal, watchlist, research
**Planned domains:** portfolio, deals, operations

## PRD Reference

Product requirements live in `docs/prd/` organized by domain. Consult the relevant PRD before starting work on a domain area. Briefs reference specific PRD documents for context.
