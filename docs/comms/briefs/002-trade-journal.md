# Brief 002: Trade Journal — Backend + Frontend

**Assigned to:** Codex
**Phase:** UX Overhaul (new priority — product owner directive)
**Priority:** P0 — active brief, execute immediately
**Status:** Ready

---

## Objective

Build a fully functional Trade Journal page backed by Supabase, with a Messari-inspired visual overhaul. The journal has two modes: a **Trade Log** (structured trade entries with P&L tracking) and a **Daily Journal** (free-form markdown observations). This is the first page to receive the new terminal-wide design treatment — the patterns established here will be applied to all other pages in subsequent briefs.

**Work on a new branch:** `feature/trade-journal`

Branch from `main`. All work goes on this branch. Do NOT merge — Claude will review and approve first.

---

## Terminal-Wide Design Directive

These rules apply to this brief and all future frontend work. The visual reference is [Messari.io](https://messari.io/) — a dark, data-dense financial terminal.

### Core Principles

1. **Panel-based layouts.** Every content block is a discrete "panel" — a rounded container with a border, panel background, and a header row. Pages are assembled from panels arranged in CSS grid layouts.
2. **Panel chrome.** Each panel has a header row: left-aligned title (text-xs, font-semibold, uppercase tracking-wide) + right-aligned action icons or controls. The header is separated from content by a bottom border.
3. **Pill toggles.** Use small rounded pill buttons for tab switching, filtering, and time ranges. Active pill: `bg-brodus-accent text-white rounded-full px-3 py-1 text-xs`. Inactive pill: `text-brodus-muted hover:text-brodus-text`.
4. **Dense data tables.** Rows use `py-1.5 px-3`. Numbers use the `.font-data` class (JetBrains Mono, tabular-nums). Column headers are `text-2xs uppercase tracking-wider text-brodus-muted`. Row dividers use `border-b border-brodus-border`.
5. **Value coloring.** Positive numbers: `text-brodus-green`. Negative: `text-brodus-red`. Use the `.value-positive` / `.value-negative` CSS classes for tinted backgrounds on key metrics.
6. **Sidebar.** Always expanded by default showing icon + label. Width: 220px. Active nav item uses left accent border or `bg-brodus-surface` fill. The sidebar the coding agent built in the UX overhaul session is close — keep the structure but ensure it defaults to expanded.
7. **Typography.** Inter for UI text, JetBrains Mono for data/numbers. Base size: `text-sm` (14px). Dense data: `.font-data` (13px). Labels: `text-2xs` or `text-xs` uppercase. No large headings inside panels — the panel header IS the heading.
8. **Icons.** lucide-react, already installed. Nav: 18px. Panel actions: 14-16px. Inline: 12-14px. Color: `text-brodus-muted`, hover to `text-brodus-text`.
9. **Spacing.** Dense. Panel padding: `p-4`. Grid gaps: `gap-4` between panels, `gap-2` within tables. Prefer tight over spacious.
10. **Transitions.** Subtle: `transition-colors` on hover states. No flashy animations.

### Panel Component Pattern

The coding agent should create a reusable `Panel` component:

```
<Panel title="Trade Log" actions={<button>...</button>}>
  {children}
</Panel>
```

Structure:
- Outer: `rounded-lg border border-brodus-border bg-brodus-panel`
- Header: `flex items-center justify-between border-b border-brodus-border px-4 py-2.5`
- Title: `text-xs font-semibold uppercase tracking-wide text-brodus-muted`
- Content: `px-4 py-3`

### Color Palette Reference

The existing `brodus-*` tokens in `tailwind.config.ts` are correct. No changes needed to the palette. New tokens added in the UX overhaul session (`surface`, `hover`, `accent`, `success`, `danger`, `warning`) should be used:

| Token | Hex | Usage |
|-------|-----|-------|
| `background` | `#0B0F1A` | Page bg |
| `panel` | `#121826` | Panel bg |
| `surface` | `#1A2035` | Elevated states, active sidebar |
| `border` | `#1F2A44` | All borders |
| `hover` | `#253052` | Hover states |
| `text` | `#E6EAF2` | Primary text |
| `muted` | `#8C96A9` | Secondary text |
| `accent` | `#3B82F6` | Active states, links, focus |
| `green` | `#22C55E` | Positive values |
| `red` | `#EF4444` | Negative values |
| `amber` | `#F59E0B` | Warnings |

---

## Deliverables

### 1. Database Migration

**File:** `supabase/migrations/002_trade_journal.sql`

Two new tables following the same patterns as `001_initial_schema.sql`:

**`trade_entries`**
```sql
create table trade_entries (
    id          uuid default gen_random_uuid() primary key,
    ticker      text not null,
    side        text not null check (side in ('buy', 'sell', 'short', 'cover')),
    trade_date  date not null,
    price       numeric(12,4) not null,
    quantity    numeric(12,4) not null,
    thesis      text not null default '',
    status      text not null default 'open' check (status in ('open', 'closed', 'partial')),
    exit_price  numeric(12,4),
    exit_date   date,
    pnl         numeric(14,2),
    pnl_percent numeric(8,4),
    notes       text,
    tags        text[] not null default '{}',
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

create index idx_trade_entries_ticker on trade_entries (ticker);
create index idx_trade_entries_status on trade_entries (status);
create index idx_trade_entries_trade_date on trade_entries (trade_date desc);
```

**`journal_entries`**
```sql
create table journal_entries (
    id          uuid default gen_random_uuid() primary key,
    entry_date  date not null default current_date,
    title       text not null,
    content     text not null,
    tags        text[] not null default '{}',
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

create index idx_journal_entries_date on journal_entries (entry_date desc);
create index idx_journal_entries_tags on journal_entries using gin (tags);
```

Include:
- `updated_at` triggers (same pattern as 001)
- RLS enabled + service role bypass policies (same pattern as 001)
- UUIDs for primary keys (these are frontend-facing, unlike the bigint IDs in 001)

### 2. Pydantic Models

**File:** `core/python/models/journal.py`

Follow the same pattern as `filing.py` — a `Create` model and a full model:

```python
class TradeEntryCreate(BaseModel):
    ticker: str
    side: Literal["buy", "sell", "short", "cover"]
    trade_date: date
    price: Decimal
    quantity: Decimal
    thesis: str = ""
    status: Literal["open", "closed", "partial"] = "open"
    exit_price: Decimal | None = None
    exit_date: date | None = None
    pnl: Decimal | None = None
    pnl_percent: Decimal | None = None
    notes: str | None = None
    tags: list[str] = []

class TradeEntry(TradeEntryCreate):
    id: UUID
    created_at: datetime
    updated_at: datetime

class JournalEntryCreate(BaseModel):
    entry_date: date = Field(default_factory=date.today)
    title: str
    content: str
    tags: list[str] = []

class JournalEntry(JournalEntryCreate):
    id: UUID
    created_at: datetime
    updated_at: datetime
```

Update `core/python/models/__init__.py` to export these.

### 3. API Routes

Follow the Vercel serverless pattern: `BaseHTTPRequestHandler` in `api/python/`. Each route directory contains `index.py`.

**Routes to create:**

| Route | Methods | Purpose |
|-------|---------|---------|
| `api/python/journal/trades/index.py` | GET, POST | List all trades (sorted by trade_date desc), add a trade |
| `api/python/journal/trades/[id]/index.py` | GET, PUT, DELETE | Get/edit/delete a single trade |
| `api/python/journal/entries/index.py` | GET, POST | List all journal entries (sorted by entry_date desc), add an entry |
| `api/python/journal/entries/[id]/index.py` | GET, PUT, DELETE | Get/edit/delete a single journal entry |

**Route behavior:**
- All routes use `core/python/db.py` for Supabase access — no direct client instantiation.
- Validate input with Pydantic models. Return 422 for bad input.
- Return 404 for missing resources. Return 409 for duplicate conflicts if applicable.
- GET list routes support optional query params: `?status=open` for trades, `?tag=macro` for entries.
- All responses return JSON with proper `Content-Type` headers.
- POST returns 201. PUT returns 200. DELETE returns 204.

### 4. Frontend Overhaul — Trade Journal Page

**Update `frontend/src/types/journal.ts`** to mirror the Pydantic models exactly (field names, types, nullability).

**Create a reusable Panel component:**
**File:** `frontend/src/components/ui/Panel.tsx`
- Props: `title: string`, `actions?: ReactNode`, `children: ReactNode`, `className?: string`
- Uses the panel chrome pattern from the design directive above

**Create a reusable PillToggle component:**
**File:** `frontend/src/components/ui/PillToggle.tsx`
- Props: `options: {key, label}[]`, `active: string`, `onChange: (key) => void`
- Renders a row of pill buttons with active/inactive styling per the design directive

**Refactor `frontend/src/app/journal/page.tsx`:**

The page layout should be:

```
┌─────────────────────────────────────────────────┐
│ Page Header: "Journal" + subtitle               │
├────────────────────┬────────────────────────────┤
│ [Trade Log] [Journal]  ← pill toggles           │
├────────────────────┴────────────────────────────┤
│                                                  │
│ TRADE LOG TAB:                                   │
│ ┌──────────┬──────────┬──────────┬──────────┐   │
│ │ Total P&L│ Win Rate │  Open    │  Closed  │   │
│ └──────────┴──────────┴──────────┴──────────┘   │
│ ┌──────────────────────────────────────────────┐ │
│ │ Panel: Trade Log          [+ Add] [Filters] │ │
│ │ ─────────────────────────────────────────── │ │
│ │ Date  Ticker  Side  Price  Qty  P&L  Status │ │
│ │ ...rows...                                   │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ JOURNAL TAB:                                     │
│ ┌──────────────────────────────────────────────┐ │
│ │ Panel: Journal Entries    [+ New Entry]      │ │
│ │ ─────────────────────────────────────────── │ │
│ │ ...entry cards (date, title, tags, preview)  │ │
│ └──────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

- The 4 stat cards at the top are each a `Panel` (small, single metric).
- The trade table is inside a `Panel` with header actions (Add button, filter pills for All/Open/Closed).
- Trade rows are expandable — clicking shows thesis/notes inline.
- Journal entries render as cards inside a `Panel`, each showing date, title, tags, and a content preview (first 2-3 lines, truncated).
- The Add Trade and New Entry modals/forms already exist — update their styling to match the design directive.
- **Wire all CRUD operations to the real API routes** — replace the local `useState` with `fetchJson` calls to `/api/python/journal/trades` and `/api/python/journal/entries`.

**Refactor existing journal components** in `frontend/src/components/journal/`:
- Update `TradeLogTable.tsx` — use Panel, use the dense table pattern, add filter pills (All/Open/Closed)
- Update `TradeLogForm.tsx` — match input/button styling to design directive
- Update `JournalEntryCard.tsx` — match card styling
- Update `JournalEditor.tsx` — match styling
- Update `JournalTabs.tsx` — replace with PillToggle component

### 5. Update DESIGN.md

**File:** `frontend/DESIGN.md`

Replace the current contents with the full terminal-wide design directive from this brief (the "Terminal-Wide Design Directive" section above), adding the Panel and PillToggle component patterns.

---

## Files NOT to modify

- `CLAUDE.md` — Claude's territory
- `AGENTS.md` — Claude's territory
- `docs/comms/` — Claude's territory (except `status.md` for session updates)
- `node_modules/` — never touch
- `.git/` — never touch
- `supabase/migrations/001_initial_schema.sql` — append-only, never edit deployed migrations
- Pages other than `/journal` — do not touch `page.tsx` for `/` or `/reports` (those get their own briefs later)

---

## Commit Strategy

Commit in this order (one commit each):

1. `feat: add trade journal database migration`
   - `supabase/migrations/002_trade_journal.sql`
2. `feat: add trade journal pydantic models`
   - `core/python/models/journal.py`, update `__init__.py`
3. `feat: add trade journal API routes`
   - All files in `api/python/journal/`
4. `refactor: create reusable Panel and PillToggle components`
   - `frontend/src/components/ui/Panel.tsx`, `PillToggle.tsx`
5. `feat: overhaul trade journal frontend with Messari-style design`
   - All files in `frontend/src/components/journal/`, `frontend/src/app/journal/page.tsx`, `frontend/src/types/journal.ts`
6. `docs: update DESIGN.md with terminal-wide design directive`
   - `frontend/DESIGN.md`

After all commits, update `docs/comms/status.md` and append to `docs/logs/changelog.md`.

---

## Acceptance Criteria

### Backend
- [ ] Migration SQL is valid: no syntax errors, constraints are correct, RLS enabled
- [ ] Pydantic models match the SQL schema exactly (field names, types, nullability)
- [ ] Every API route handles: missing resource (404), invalid input (422), server error (500)
- [ ] GET list routes support filtering by status (trades) and tag (entries)
- [ ] POST returns 201 with the created object. DELETE returns 204.
- [ ] All DB access through `db.py` — no direct Supabase client instantiation
- [ ] No API keys or secrets hardcoded

### Frontend
- [ ] Trade Journal page loads with zero data gracefully (empty states for both tabs)
- [ ] All CRUD operations wired to real API routes via `fetchJson`
- [ ] Panel component is reusable and used consistently
- [ ] PillToggle component replaces the old tab implementation
- [ ] Stat cards display computed metrics (Total P&L, Win Rate, Open, Closed)
- [ ] Trade table uses dense data styling (.font-data, value coloring, status badges)
- [ ] Filter pills work (All / Open / Closed) for the trade log
- [ ] Expandable trade rows show thesis and notes
- [ ] Journal entries render markdown content in preview cards
- [ ] No TypeScript `any` types. Strict mode passes.
- [ ] `npm run build` succeeds with zero errors
- [ ] DESIGN.md is updated with the full terminal-wide directive

### Design Compliance
- [ ] All panels follow the Panel chrome pattern (header with title + actions, border separator, content area)
- [ ] All data uses `.font-data` / monospace for numbers
- [ ] Green/red value coloring is consistent
- [ ] Pill toggles match the Messari pill style
- [ ] Dense spacing throughout (py-1.5 rows, p-4 panels, gap-4 grid)
- [ ] Icons are lucide-react at correct sizes (14-16px for actions)

---

## Notes

- The `vercel.json` may need route entries for the new `api/python/journal/*` endpoints. Check the existing routing pattern and add entries if needed.
- The frontend currently has `lucide-react`, `react-markdown`, and `remark-gfm` installed. No new frontend dependencies should be needed.
- The existing `frontend/src/lib/format.ts` already has `formatPnl`, `formatDate`, `formatCurrency`, and `formatPercent` — use these.
- The existing `frontend/src/lib/api.ts` has the `fetchJson` utility — use this for all API calls.
