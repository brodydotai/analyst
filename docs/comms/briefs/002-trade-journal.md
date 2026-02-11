# Brief 002: Trade Journal — Database + Frontend Overhaul

**Assigned to:** Codex (build/backend + build/frontend)
**Phase:** Phase 1: Command Center
**Priority:** P0 — first feature brief
**Status:** Ready
**Depends on:** Brief 004 (backend migration to Node/TypeScript) must be completed first

---

## Objective

Build a fully functional Trade Journal page with the Messari-inspired terminal design treatment. The journal has two modes: a **Trade Log** (structured trade entries with P&L tracking) and a **Daily Journal** (free-form markdown observations). This is the first page to receive the full design overhaul — the visual patterns established here propagate to all subsequent pages.

Brief 004 provides the backend infrastructure (Zod schemas, service layer, API routes). This brief adds the database migration and builds the frontend.

**Work on a new branch:** `feature/trade-journal`

Branch from the branch that Brief 004 was merged into. All work goes on this branch. Do NOT merge — Claude will review and approve first.

---

## Reusable Patterns

This brief establishes the terminal-wide design system. After audit, the design directive below will be promoted to `docs/prd/frontend/design-system.md`.

### Terminal-Wide Design Directive

These rules apply to this brief and all future frontend work. The visual reference is [Messari.io](https://messari.io/) — a dark, data-dense financial terminal.

#### Core Principles

1. **Panel-based layouts.** Every content block is a discrete "panel" — a rounded container with a border, panel background, and a header row. Pages are assembled from panels arranged in CSS grid layouts.
2. **Panel chrome.** Each panel has a header row: left-aligned title (text-xs, font-semibold, uppercase tracking-wide) + right-aligned action icons or controls. The header is separated from content by a bottom border.
3. **Pill toggles.** Use small rounded pill buttons for tab switching, filtering, and time ranges. Active pill: `bg-brodus-accent text-white rounded-full px-3 py-1 text-xs`. Inactive pill: `text-brodus-muted hover:text-brodus-text`.
4. **Dense data tables.** Rows use `py-1.5 px-3`. Numbers use the `.font-data` class (JetBrains Mono, tabular-nums). Column headers are `text-2xs uppercase tracking-wider text-brodus-muted`. Row dividers use `border-b border-brodus-border`.
5. **Value coloring.** Positive numbers: `text-brodus-green`. Negative: `text-brodus-red`. Use the `.value-positive` / `.value-negative` CSS classes for tinted backgrounds on key metrics.
6. **Sidebar.** Always expanded by default showing icon + label. Width: 220px. Active nav item uses left accent border or `bg-brodus-surface` fill.
7. **Typography.** Inter for UI text, JetBrains Mono for data/numbers. Base size: `text-sm` (14px). Dense data: `.font-data` (13px). Labels: `text-2xs` or `text-xs` uppercase. No large headings inside panels — the panel header IS the heading.
8. **Icons.** lucide-react, already installed. Nav: 18px. Panel actions: 14-16px. Inline: 12-14px. Color: `text-brodus-muted`, hover to `text-brodus-text`.
9. **Spacing.** Dense. Panel padding: `p-4`. Grid gaps: `gap-4` between panels, `gap-2` within tables. Prefer tight over spacious.
10. **Transitions.** Subtle: `transition-colors` on hover states. No flashy animations.

#### Panel Component Pattern

`Panel.tsx` already exists in `frontend/src/components/ui/`. Verify it matches this spec and update if needed:

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

#### Color Palette Reference

The existing `brodus-*` tokens in the Tailwind config are correct. No changes needed to the palette:

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

**Promotion target:** `docs/prd/frontend/design-system.md`

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

### 2. Frontend Overhaul — Trade Journal Page

**Refactor `frontend/src/app/journal/page.tsx`:**

The page layout:

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
- **Wire all CRUD operations to the real API routes** — replace the local `useState` with `fetchJson` calls to `/api/journal/trades` and `/api/journal/entries`.

**Refactor existing journal components** in `frontend/src/components/journal/`:
- Update `TradeLogTable.tsx` — use Panel, use the dense table pattern, add filter pills (All/Open/Closed)
- Update `TradeLogForm.tsx` — match input/button styling to design directive
- Update `JournalEntryCard.tsx` — match card styling
- Update `JournalEditor.tsx` — match styling
- Update `JournalTabs.tsx` — replace with PillToggle component

**Verify `Panel.tsx` and `PillToggle.tsx`** in `frontend/src/components/ui/` match the design directive spec. Update if needed.

### 3. Update DESIGN.md

**File:** `frontend/DESIGN.md`

Replace the current contents with the full terminal-wide design directive from this brief (the "Terminal-Wide Design Directive" section above), including the Panel and PillToggle component patterns and the color palette table.

---

## File Manifest

### Files to Create

| File | Description |
|------|-------------|
| `supabase/migrations/002_trade_journal.sql` | Trade journal database tables |

### Files to Modify

| File | Change |
|------|--------|
| `frontend/src/app/journal/page.tsx` | Full overhaul with terminal design, wire to API routes |
| `frontend/src/components/journal/TradeLogTable.tsx` | Dense table pattern, Panel chrome, filter pills |
| `frontend/src/components/journal/TradeLogForm.tsx` | Input/button styling to match directive |
| `frontend/src/components/journal/JournalEntryCard.tsx` | Card styling to match directive |
| `frontend/src/components/journal/JournalEditor.tsx` | Styling to match directive |
| `frontend/src/components/journal/JournalTabs.tsx` | Replace with PillToggle |
| `frontend/src/components/ui/Panel.tsx` | Verify/update to match design spec |
| `frontend/src/components/ui/PillToggle.tsx` | Verify/update to match design spec |
| `frontend/DESIGN.md` | Replace with full terminal-wide directive |

### Files NOT to Modify

- `CLAUDE.md` — Claude's territory
- `AGENTS.md` — Claude's territory
- `.agents/` — Claude's territory
- `docs/comms/` — Claude's territory (except `status.md` for session updates)
- `node_modules/` — never touch
- `.git/` — never touch
- `supabase/migrations/001_initial_schema.sql` — append-only, never edit deployed migrations
- Pages other than `/journal` — do not touch `page.tsx` for `/` or `/reports`
- `frontend/src/schemas/` — created by Brief 004, do not modify
- `frontend/src/services/` — created by Brief 004, do not modify
- `frontend/src/app/api/` — created by Brief 004, do not modify
- `frontend/src/lib/db.ts`, `config.ts`, `queue.ts` — created by Brief 004, do not modify

---

## Commit Strategy

1. `feat: add trade journal database migration`
   - `supabase/migrations/002_trade_journal.sql`
2. `refactor: update Panel and PillToggle components to match design spec`
   - `frontend/src/components/ui/Panel.tsx`, `PillToggle.tsx`
3. `feat: overhaul trade journal frontend with Messari-style design`
   - All files in `frontend/src/components/journal/`, `frontend/src/app/journal/page.tsx`
4. `docs: update DESIGN.md with terminal-wide design directive`
   - `frontend/DESIGN.md`

After all commits, update `docs/comms/status.md` and append to `docs/comms/logs/changelog.md`.

---

## Acceptance Criteria

### Database
- [ ] Migration SQL is valid: no syntax errors, constraints are correct, RLS enabled
- [ ] `updated_at` triggers follow the same pattern as 001
- [ ] UUIDs used for primary keys
- [ ] Indexes created on ticker, status, trade_date, entry_date, and tags

### Frontend
- [ ] Trade Journal page loads with zero data gracefully (empty states for both tabs)
- [ ] All CRUD operations wired to real API routes via `fetchJson` at `/api/journal/trades` and `/api/journal/entries`
- [ ] Panel component is verified against design spec and used consistently
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

- The frontend currently has `lucide-react`, `react-markdown`, and `remark-gfm` installed. No new frontend dependencies should be needed.
- The existing `frontend/src/lib/format.ts` already has `formatPnl`, `formatDate`, `formatCurrency`, and `formatPercent` — use these.
- The existing `frontend/src/lib/api.ts` has the `fetchJson` utility — use this for all API calls. API paths are now `/api/journal/trades` (not `/api/python/journal/trades`).
- Brief 004 creates the journal Zod schemas at `frontend/src/schemas/journal.ts` and the service at `frontend/src/services/journal.ts`. Import types from `@/schemas/journal` or `@/types/journal` (which re-exports from schemas).
