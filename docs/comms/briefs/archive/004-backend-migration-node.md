# Brief 004: Backend Migration — Python to Node/TypeScript

**Assigned to:** Codex (build/backend)
**Phase:** Phase 1: Command Center (infrastructure prerequisite)
**Priority:** P0 — execute before all other briefs
**Status:** Ready

---

## Objective

Migrate the entire backend from Python serverless functions to Next.js API routes in TypeScript. This unifies the stack to a single language, eliminates the Pydantic-to-TypeScript type duplication tax, and simplifies deployment on Vercel. After this brief, there is no Python in the project.

**Work on a new branch:** `feature/backend-migration-node`

Branch from `main`. All work goes on this branch. Do NOT merge — Claude will review and approve first.

---

## Context

The backend currently runs as Python serverless functions on Vercel (`api/python/`) alongside a Next.js frontend (`frontend/`). This creates friction at every seam: two runtimes, two dependency systems, two type definitions for every model (Pydantic + TypeScript), and agents that context-switch between languages. The Python code is still small — a journal CRUD service, four journal API routes, four pipeline stubs, and three infrastructure modules (config, db, queue). Porting now is cheap. Porting later is expensive.

The frontend already has one Next.js API route (`app/api/reports/route.ts`), proving the pattern works. This brief extends that to the entire API surface.

**References:**
- `docs/architecture.md` — system design (will be updated post-migration)
- `.agents/build/AGENT.md` — domain module convention (will be updated post-migration)

---

## Reusable Patterns

This brief establishes three backend conventions that all future briefs will follow. After audit, these will be promoted to PRDs.

### 1. Zod Schema Pattern

Zod replaces Pydantic as the validation and type system. Each domain gets a schema file in `frontend/src/schemas/`:

```typescript
// frontend/src/schemas/journal.ts
import { z } from "zod";

// "Create" schemas — used for API input validation
export const tradeEntryCreateSchema = z.object({
  ticker: z.string().min(1),
  side: z.enum(["buy", "sell", "short", "cover"]),
  trade_date: z.string(), // ISO date string
  price: z.number(),
  quantity: z.number(),
  thesis: z.string().default(""),
  status: z.enum(["open", "closed", "partial"]).default("open"),
  exit_price: z.number().nullable().default(null),
  exit_date: z.string().nullable().default(null),
  pnl: z.number().nullable().default(null),
  pnl_percent: z.number().nullable().default(null),
  notes: z.string().nullable().default(null),
  tags: z.array(z.string()).default([]),
});

// "Full" schemas — includes database-generated fields
export const tradeEntrySchema = tradeEntryCreateSchema.extend({
  id: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string(),
});

// Inferred types — replaces manually written TypeScript types
export type TradeEntryCreate = z.infer<typeof tradeEntryCreateSchema>;
export type TradeEntry = z.infer<typeof tradeEntrySchema>;
```

**Convention:** Every schema file exports: `[name]CreateSchema`, `[name]Schema`, `[Name]Create` type, `[Name]` type.

### 2. Next.js API Route Pattern

API routes use the Next.js App Router convention (`route.ts` with named exports):

```typescript
// frontend/src/app/api/journal/trades/route.ts
import { NextRequest, NextResponse } from "next/server";
import { tradeEntryCreateSchema } from "@/schemas/journal";
import { listTradeEntries, createTradeEntry } from "@/services/journal";

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get("status");
    const trades = await listTradeEntries(status);
    return NextResponse.json(trades);
  } catch {
    return NextResponse.json(
      { error: "Failed to load trade entries." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = tradeEntryCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues },
        { status: 422 }
      );
    }
    const trade = await createTradeEntry(parsed.data);
    return NextResponse.json(trade, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create trade entry." },
      { status: 500 }
    );
  }
}
```

**Convention:** Routes are thin. Validate with Zod (`safeParse`), call service, return `NextResponse.json`. Every route handles 422 (bad input), 404 (not found), 500 (server error).

### 3. Service Layer Pattern

Services contain all business logic and Supabase queries. One file per domain in `frontend/src/services/`:

```typescript
// frontend/src/services/journal.ts
import { getClient } from "@/lib/db";
import type { TradeEntry, TradeEntryCreate } from "@/schemas/journal";

export async function listTradeEntries(status?: string | null): Promise<TradeEntry[]> {
  const client = getClient();
  let query = client.from("trade_entries").select("*").order("trade_date", { ascending: false });
  if (status) {
    query = query.eq("status", status);
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data as TradeEntry[];
}
```

**Convention:** Services return typed data. Errors thrown as `Error` objects — routes catch and format responses. No direct Supabase access outside of services.

**Promoted to standing PRDs:**
- `docs/prd/backend/api-conventions.md` — route and service patterns ✅
- `docs/prd/backend/schema-conventions.md` — Zod schema pattern ✅

---

## Deliverables

### 1. Backend Infrastructure

**File:** `frontend/src/lib/config.ts`

Port of `core/python/config.py`. Use Next.js environment variable conventions:

```typescript
// Server-side env vars (no NEXT_PUBLIC_ prefix — these are secret)
export const SUPABASE_URL = process.env.SUPABASE_URL!;
export const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
export const QSTASH_TOKEN = process.env.QSTASH_TOKEN!;
export const QSTASH_CURRENT_SIGNING_KEY = process.env.QSTASH_CURRENT_SIGNING_KEY ?? "";
export const QSTASH_NEXT_SIGNING_KEY = process.env.QSTASH_NEXT_SIGNING_KEY ?? "";
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
export const OPENAI_EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small";
export const OPENAI_SUMMARY_MODEL = process.env.OPENAI_SUMMARY_MODEL ?? "gpt-4o-mini";
export const EDGAR_USER_AGENT = process.env.EDGAR_USER_AGENT!;
export const EDGAR_BASE_URL = "https://efts.sec.gov/LATEST";
export const EDGAR_SUBMISSIONS_URL = "https://data.sec.gov/submissions";
export const EDGAR_RATE_LIMIT = 0.11;
export const VERCEL_URL = process.env.VERCEL_URL ?? "http://localhost:3000";
```

**File:** `frontend/src/lib/db.ts`

Port of `core/python/db.py`. Use `@supabase/supabase-js`:

```typescript
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_SERVICE_KEY } from "./config";

let client: SupabaseClient | null = null;

export function getClient(): SupabaseClient {
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  }
  return client;
}
```

**File:** `frontend/src/lib/queue.ts`

Port of `core/python/queue.py`. Use `@upstash/qstash`:

```typescript
import { Client } from "@upstash/qstash";
import { QSTASH_TOKEN, VERCEL_URL } from "./config";

let client: Client | null = null;

function getQStashClient(): Client {
  if (!client) {
    client = new Client({ token: QSTASH_TOKEN });
  }
  return client;
}

export async function publish(endpoint: string, body: Record<string, unknown>): Promise<string> {
  const qstash = getQStashClient();
  const base = VERCEL_URL.replace(/\/$/, "");
  const result = await qstash.publishJSON({
    url: `${base}${endpoint}`,
    body,
  });
  return result.messageId;
}
```

### 2. Zod Schemas

Port all Pydantic models to Zod schemas. One file per domain in `frontend/src/schemas/`.

**File:** `frontend/src/schemas/filing.ts` — port of `core/python/models/filing.py`
**File:** `frontend/src/schemas/article.ts` — port of `core/python/models/article.py`
**File:** `frontend/src/schemas/entity.ts` — port of `core/python/models/entity.py`
**File:** `frontend/src/schemas/journal.ts` — port of `core/python/models/journal.py`
**File:** `frontend/src/schemas/index.ts` — barrel export (mirrors `core/python/models/__init__.py`)

Each file follows the Zod schema pattern from the Reusable Patterns section above. Every schema exports: `createSchema`, `schema`, `Create` type, and full type.

### 3. Journal Service

**File:** `frontend/src/services/journal.ts`

Direct port of `core/python/services/journal.py`. All 10 functions:
- `listTradeEntries(status?)` → `TradeEntry[]`
- `getTradeEntry(id)` → `TradeEntry | null`
- `createTradeEntry(entry)` → `TradeEntry`
- `updateTradeEntry(id, entry)` → `TradeEntry | null`
- `deleteTradeEntry(id)` → `boolean`
- `listJournalEntries(tag?)` → `JournalEntry[]`
- `getJournalEntry(id)` → `JournalEntry | null`
- `createJournalEntry(entry)` → `JournalEntry`
- `updateJournalEntry(id, entry)` → `JournalEntry | null`
- `deleteJournalEntry(id)` → `boolean`

Use `@/lib/db` for Supabase access. Import types from `@/schemas/journal`. Follow the service layer pattern from the Reusable Patterns section.

### 4. Journal API Routes

Port all four Python route files to Next.js route handlers:

**File:** `frontend/src/app/api/journal/trades/route.ts` — GET (list, optional `?status=` filter), POST (create)
**File:** `frontend/src/app/api/journal/trades/[id]/route.ts` — GET, PUT, DELETE
**File:** `frontend/src/app/api/journal/entries/route.ts` — GET (list, optional `?tag=` filter), POST (create)
**File:** `frontend/src/app/api/journal/entries/[id]/route.ts` — GET, PUT, DELETE

Follow the Next.js API route pattern from the Reusable Patterns section. Validate input with Zod `safeParse`. Call service functions. Return `NextResponse.json` with proper status codes (200, 201, 204, 404, 422, 500).

For dynamic routes, extract the `id` parameter from the route context:
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // ...
}
```

### 5. Pipeline Route Stubs

Port the four not-implemented pipeline stubs to Next.js:

**File:** `frontend/src/app/api/ingest/filings/route.ts` — GET stub (cron target)
**File:** `frontend/src/app/api/ingest/feeds/route.ts` — GET stub (cron target)
**File:** `frontend/src/app/api/process/filing/route.ts` — POST stub (QStash target)
**File:** `frontend/src/app/api/process/article/route.ts` — POST stub (QStash target)

Each returns `{ status: "not_implemented" }` with a 200 status, matching the current behavior. Include a TODO comment with the planned implementation phase.

### 6. Update Frontend Types

**File:** `frontend/src/types/journal.ts`

Replace the manually written types with re-exports from the Zod schemas:

```typescript
export type {
  TradeEntry,
  TradeEntryCreate,
  JournalEntry,
  JournalEntryCreate,
} from "@/schemas/journal";

// Re-export string union types for backward compatibility
export type TradeSide = "buy" | "sell" | "short" | "cover";
export type TradeStatus = "open" | "closed" | "partial";
```

This preserves all existing component imports while eliminating the type duplication.

### 7. Update Frontend API Paths

Update all `fetchJson` calls in frontend components to use the new route paths. The paths change from `/api/python/journal/...` to `/api/journal/...`.

**Files to update:** Check all files in `frontend/src/components/journal/` and `frontend/src/app/journal/page.tsx` for `fetchJson` calls. If they currently reference `/api/python/...`, update to `/api/...`.

Also remove `NEXT_PUBLIC_API_BASE_URL` from `.env.example` if it exists — API routes are now same-origin.

### 8. Install Dependencies

Add to `frontend/package.json`:

```
zod
@supabase/supabase-js
@upstash/qstash
```

Run `npm install` from the `frontend/` directory.

### 9. Update vercel.json

Update cron paths from Python to Next.js routes:

```json
{
  "crons": [
    {
      "path": "/api/ingest/filings",
      "schedule": "*/15 * * * *"
    },
    {
      "path": "/api/ingest/feeds",
      "schedule": "*/10 * * * *"
    }
  ]
}
```

### 10. Delete Python Infrastructure

Remove all Python files and configuration:

- `core/` — entire directory (config.py, db.py, queue.py, models/, services/, edgar/, feeds/, processing/)
- `api/` — entire directory (all Python serverless functions)
- `requirements.txt`
- `.python-version`

**Verify after deletion:** `npm run build` in `frontend/` must succeed with zero errors. No imports should reference deleted paths.

---

## File Manifest

### Files to Create

| File | Description |
|------|-------------|
| `frontend/src/lib/config.ts` | Environment variable configuration |
| `frontend/src/lib/db.ts` | Supabase client singleton |
| `frontend/src/lib/queue.ts` | QStash client and publish helper |
| `frontend/src/schemas/filing.ts` | Filing Zod schemas + types |
| `frontend/src/schemas/article.ts` | Article Zod schemas + types |
| `frontend/src/schemas/entity.ts` | Entity Zod schemas + types |
| `frontend/src/schemas/journal.ts` | Journal/Trade Zod schemas + types |
| `frontend/src/schemas/index.ts` | Barrel export for all schemas |
| `frontend/src/services/journal.ts` | Journal CRUD service layer |
| `frontend/src/app/api/journal/trades/route.ts` | Trade list + create API |
| `frontend/src/app/api/journal/trades/[id]/route.ts` | Trade get/update/delete API |
| `frontend/src/app/api/journal/entries/route.ts` | Journal entry list + create API |
| `frontend/src/app/api/journal/entries/[id]/route.ts` | Journal entry get/update/delete API |
| `frontend/src/app/api/ingest/filings/route.ts` | Filing ingestion cron stub |
| `frontend/src/app/api/ingest/feeds/route.ts` | Feed ingestion cron stub |
| `frontend/src/app/api/process/filing/route.ts` | Filing processing QStash stub |
| `frontend/src/app/api/process/article/route.ts` | Article processing QStash stub |

### Files to Modify

| File | Change |
|------|--------|
| `frontend/package.json` | Add zod, @supabase/supabase-js, @upstash/qstash |
| `frontend/src/types/journal.ts` | Replace manual types with re-exports from schemas |
| `vercel.json` | Update cron paths to Next.js routes |
| Frontend components with `fetchJson` calls | Update API paths from `/api/python/...` to `/api/...` |

### Files to Delete

| File/Directory | Reason |
|----------------|--------|
| `core/` (entire directory) | Python backend replaced by TypeScript in frontend/src/ |
| `api/` (entire directory) | Python routes replaced by Next.js API routes |
| `requirements.txt` | No more Python dependencies |
| `.python-version` | No more Python runtime |

### Files NOT to Modify

- `supabase/migrations/` — SQL is language-agnostic, no changes needed
- `frontend/src/components/` — component logic unchanged (only API path strings may update)
- `frontend/src/app/journal/page.tsx` — only update if it contains direct API path references
- `CLAUDE.md` — Claude's territory
- `.agents/` — Claude's territory
- `docs/` — Claude's territory
- `research/` — no backend dependency

---

## Commit Strategy

1. `feat: add TypeScript backend infrastructure (db, config, queue)`
   - `frontend/src/lib/config.ts`, `frontend/src/lib/db.ts`, `frontend/src/lib/queue.ts`
   - `frontend/package.json` (add dependencies)
   - Run `npm install`

2. `feat: add Zod schemas for all data models`
   - `frontend/src/schemas/filing.ts`, `article.ts`, `entity.ts`, `journal.ts`, `index.ts`
   - `frontend/src/types/journal.ts` (update to re-export from schemas)

3. `feat: add journal service layer in TypeScript`
   - `frontend/src/services/journal.ts`

4. `feat: add Next.js API routes for journal CRUD`
   - `frontend/src/app/api/journal/trades/route.ts`, `[id]/route.ts`
   - `frontend/src/app/api/journal/entries/route.ts`, `[id]/route.ts`

5. `feat: add Next.js API route stubs for pipeline endpoints`
   - `frontend/src/app/api/ingest/filings/route.ts`, `feeds/route.ts`
   - `frontend/src/app/api/process/filing/route.ts`, `article/route.ts`

6. `chore: update vercel.json and frontend API paths`
   - `vercel.json`
   - Any component files with updated `fetchJson` paths

7. `refactor: remove Python backend`
   - Delete `core/`, `api/`, `requirements.txt`, `.python-version`
   - Verify `npm run build` succeeds

After all commits, update `docs/comms/status.md` and append to `docs/comms/logs/changelog.md`.

---

## Acceptance Criteria

### Infrastructure
- [x] `frontend/src/lib/config.ts` exports all env vars that `core/python/config.py` defined
- [x] `frontend/src/lib/db.ts` creates a Supabase client singleton using the service role key
- [x] `frontend/src/lib/queue.ts` publishes QStash messages with the same URL construction logic as the Python version
- [x] All three new npm dependencies install successfully (`zod`, `@supabase/supabase-js`, `@upstash/qstash`)

### Schemas
- [x] Every Pydantic model has a corresponding Zod schema with matching field names, types, and nullability
- [x] Each schema file exports: create schema, full schema, Create type, and full type
- [x] `frontend/src/types/journal.ts` re-exports types from `@/schemas/journal` — existing component imports don't break

### Service Layer
- [x] `frontend/src/services/journal.ts` implements all 10 CRUD functions from the Python version
- [x] Service functions use `@/lib/db` for Supabase access — no direct client instantiation
- [x] Service functions are typed: parameters and return types match the Zod-inferred types

### API Routes
- [x] All four journal route files implement the correct HTTP methods (GET/POST for list, GET/PUT/DELETE for [id])
- [x] Input validation uses Zod `safeParse` — invalid input returns 422 with error details
- [x] Missing resources return 404
- [x] Server errors return 500
- [x] POST returns 201 with the created object. DELETE returns 204.
- [x] GET list routes support filtering: `?status=` for trades, `?tag=` for entries
- [x] Pipeline stubs return `{ status: "not_implemented" }` matching current behavior

### Cleanup
- [ ] `core/` directory is deleted — no Python files remain ⚠️ **PARTIAL** — see audit notes
- [ ] `api/` directory is deleted — no Python routes remain ⚠️ **PARTIAL** — see audit notes
- [x] `requirements.txt` is deleted
- [x] `.python-version` is deleted
- [x] `vercel.json` cron paths updated to `/api/ingest/filings` and `/api/ingest/feeds`
- [x] `npm run build` succeeds with zero errors after all deletions
- [x] No TypeScript `any` types. Strict mode passes.

### Behavioral Parity
- [x] The journal API behaves identically to the Python version — same request/response shapes, same status codes, same filtering behavior
- [x] Frontend `fetchJson` calls reach the new routes (paths updated if needed)
- [x] The existing `frontend/src/app/api/reports/route.ts` is unmodified and still functions

---

## Audit Results

**Date:** 2026-02-11
**Auditor:** Claude (orchestrator)
**Verdict:** CONDITIONAL PASS — 23/25 criteria pass, 2 partial (cleanup only)

### Summary

The migration is functionally complete. All TypeScript infrastructure, Zod schemas, service layer, API routes, and pipeline stubs are implemented correctly. Schema fields match SQL columns. The build compiles with zero errors and zero `any` types. The existing reports route is untouched.

### Findings

| Category | Criteria | Result |
|----------|----------|--------|
| Infrastructure | config.ts exports all env vars | ✅ PASS |
| Infrastructure | db.ts singleton with service role key | ✅ PASS |
| Infrastructure | queue.ts QStash publish logic | ✅ PASS |
| Infrastructure | npm dependencies install | ✅ PASS |
| Schemas | Zod schemas match Pydantic fields/types/nullability | ✅ PASS |
| Schemas | Export convention (create + full schema + types) | ✅ PASS |
| Schemas | types/journal.ts re-exports from schemas | ✅ PASS |
| Service | All 10 CRUD functions implemented | ✅ PASS |
| Service | Uses @/lib/db — no direct client | ✅ PASS |
| Service | Typed parameters and returns | ✅ PASS |
| Routes | Correct HTTP methods per route | ✅ PASS |
| Routes | Zod safeParse → 422 on invalid input | ✅ PASS |
| Routes | 404 on missing resources | ✅ PASS |
| Routes | 500 on server errors | ✅ PASS |
| Routes | POST → 201, DELETE → 204 | ✅ PASS |
| Routes | GET list filtering (?status, ?tag) | ✅ PASS |
| Routes | Pipeline stubs return not_implemented | ✅ PASS |
| Cleanup | core/ directory deleted | ⚠️ PARTIAL |
| Cleanup | api/ directory deleted | ⚠️ PARTIAL |
| Cleanup | requirements.txt deleted | ✅ PASS |
| Cleanup | .python-version deleted | ✅ PASS |
| Cleanup | vercel.json cron paths updated | ✅ PASS |
| Cleanup | npm run build succeeds | ✅ PASS |
| Cleanup | No any types, strict mode | ✅ PASS |
| Parity | Same request/response shapes and status codes | ✅ PASS |
| Parity | Frontend fetchJson reaches new routes | ✅ PASS |
| Parity | reports/route.ts unmodified | ✅ PASS |

### Cleanup Finding Detail

**Issue:** `core/` and `api/` directory shells remain on disk. All substantive Python code files (config.py, db.py, queue.py, models/*.py, services/journal.py, all route index.py files) were deleted. What remains:

- `core/python/__init__.py` (0 bytes), plus `__init__.py` stubs in `core/python/edgar/`, `core/python/feeds/`, `core/python/processing/`
- Empty directories: `core/python/models/`, `core/python/services/`
- Empty directory trees under `api/python/` (journal/trades/[id]/, journal/entries/[id]/, ingest_feeds/, ingest_filings/, process_article/, process_filing/)

**Impact:** Low. Git does not track empty directories, so these won't appear in the repo after commit. The `__init__.py` files (0 bytes) are tracked but have no functional impact. The `.gitignore` is clean — no Python-specific entries (no `__pycache__/`, `*.pyc`, `.venv/`).

**Recommendation:** Delete the remaining `core/` and `api/` directories entirely (`rm -rf core/ api/`) and commit. This is a trivial fix, not a redesign.

---

## Notes

- The existing `frontend/src/lib/api.ts` utility (`fetchJson`) uses `NEXT_PUBLIC_API_BASE_URL` which defaults to empty string. With same-origin Next.js routes, this works as-is — just update the path strings (drop the `/python` segment).
- The Python journal service uses `model_dump(mode="json")` for serialization. The TypeScript version doesn't need this — Supabase JS client returns plain objects that are already JSON-compatible.
- The Python version uses `Decimal` for price/pnl fields. In TypeScript, use `number` — JavaScript doesn't have a native Decimal type, and the precision loss is acceptable for display purposes. If precision matters later, add a decimal library.
- Check whether any Python-specific entries exist in `.gitignore` (like `__pycache__/`, `*.pyc`, `.venv/`). Clean these up if found.
- The `frontend/` directory now contains both frontend and backend code. This is standard for Next.js projects. The directory name is not changing in this brief.
