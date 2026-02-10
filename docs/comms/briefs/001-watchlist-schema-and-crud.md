# Brief 001: Watchlist Schema + CRUD API

**Assigned to:** Codex
**Phase:** 1
**Priority:** P0 — blocks all frontend functionality
**Status:** Ready

---

## Objective

Build the watchlist data layer and API. The frontend (`frontend/src/app/page.tsx`) already calls these endpoints — they need to exist and return real data.

## Context

The frontend watchlist page is fully built. It makes these API calls:

```
GET  /api/python/watchlist              → list all items grouped by category
POST /api/python/watchlist              → add item { ticker, name, category_id }
PUT  /api/python/watchlist/{id}         → edit item { category_id, ... }
DEL  /api/python/watchlist/{id}         → remove item
GET  /api/python/watchlist/categories   → list categories
POST /api/python/watchlist/categories   → create category { name }
PUT  /api/python/watchlist/reorder      → batch update sort_order { items: [{ id, sort_order }] }
```

The TypeScript types the frontend expects are in `frontend/src/types/watchlist.ts`:
- `WatchlistItem` has: id, ticker, name, category_id, sort_order, metrics (optional), links (optional)
- `WatchlistCategory` has: id, name, sort_order, created_at, updated_at
- `WatchlistCategoryWithItems` has: category fields + items array
- `WatchlistResponse` has: categories (array of WatchlistCategoryWithItems), items (flat array fallback)

## Deliverables

### 1. Migration: `supabase/migrations/002_watchlist.sql`

Create two tables:

**watchlist_categories:**
- `id` uuid primary key (default gen_random_uuid())
- `name` text not null unique
- `sort_order` integer not null default 0
- `created_at` timestamptz default now()
- `updated_at` timestamptz default now()

**watchlist_items:**
- `id` uuid primary key (default gen_random_uuid())
- `ticker` text not null unique
- `name` text not null
- `category_id` uuid references watchlist_categories(id) on delete set null
- `sort_order` integer not null default 0
- `asset_class` text default 'equity' (enum: equity, etf, crypto, commodity, forex)
- `notes` text
- `created_at` timestamptz default now()
- `updated_at` timestamptz default now()

Add `updated_at` trigger (same pattern as 001). Add indexes on `category_id` and `ticker`. Enable RLS with permissive policies (single-user, no auth needed yet).

### 2. Pydantic models: `core/python/models/watchlist.py`

Mirror the SQL schema exactly. Include:
- `WatchlistCategory`, `WatchlistCategoryCreate`
- `WatchlistItem`, `WatchlistItemCreate`, `WatchlistItemUpdate`
- `WatchlistCategoryWithItems` (category + nested items list)
- `WatchlistResponse` (categories list + flat items fallback)

### 3. API routes

All routes follow the thin-route pattern: validate with Pydantic, call `core/python/db.py`, return typed JSON.

| Route | Method | Input | Output | Status codes |
|-------|--------|-------|--------|--------------|
| `api/python/watchlist/index.py` | GET | — | WatchlistResponse | 200, 500 |
| `api/python/watchlist/index.py` | POST | WatchlistItemCreate | WatchlistItem | 201, 409 (dup ticker), 422, 500 |
| `api/python/watchlist/[id]/index.py` | PUT | WatchlistItemUpdate | WatchlistItem | 200, 404, 422, 500 |
| `api/python/watchlist/[id]/index.py` | DELETE | — | 204 | 204, 404, 500 |
| `api/python/watchlist/categories/index.py` | GET | — | list[WatchlistCategory] | 200, 500 |
| `api/python/watchlist/categories/index.py` | POST | WatchlistCategoryCreate | WatchlistCategory | 201, 409 (dup name), 422, 500 |
| `api/python/watchlist/reorder/index.py` | PUT | { items: [{ id, sort_order }] } | 200 | 200, 422, 500 |

### 4. Wire up GET /api/python/watchlist to return categories with nested items

The main GET endpoint should:
1. Fetch all categories ordered by sort_order
2. Fetch all items ordered by sort_order
3. Nest items under their category
4. Return uncategorized items in a virtual "Uncategorized" group (or in the flat `items` array)

## Files to create
- `supabase/migrations/002_watchlist.sql`
- `core/python/models/watchlist.py`
- `api/python/watchlist/index.py`
- `api/python/watchlist/[id]/index.py`
- `api/python/watchlist/categories/index.py`
- `api/python/watchlist/categories/[id]/index.py` (bonus: PUT + DELETE for categories)
- `api/python/watchlist/reorder/index.py`

## Files NOT to modify
- `frontend/` — do not touch the frontend, it's already correct
- `supabase/migrations/001_initial_schema.sql` — append-only, never edit
- `CLAUDE.md` — Claude's territory

## When done
1. Update `docs/comms/status.md` with what you built and any decisions you made
2. Append to `docs/logs/changelog.md` with a dated entry
3. Commit incrementally — one logical unit per commit (e.g., migration, then models, then routes)

## Acceptance criteria
- All 7 API routes return proper JSON with correct status codes
- Duplicate ticker returns 409, not 500
- Missing item returns 404, not 500
- Pydantic model field names match SQL column names exactly
- Frontend TypeScript types in `frontend/src/types/watchlist.ts` are compatible (field names, types, nullability)

---

## Audit Results (Claude fills in after review)

<!-- Claude: append audit results here after reviewing Codex's commits -->
