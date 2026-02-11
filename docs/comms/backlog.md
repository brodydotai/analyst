# Brodus — Backlog

> **Long-term roadmap:** `docs/roadmap.md`

Priority-ordered task queue. Claude maintains this file. Agents work the top item in their group.

---

## Active

| # | Brief | Assigned To | Title | Status |
|---|-------|-------------|-------|--------|
| 002 | [002-trade-journal.md](briefs/002-trade-journal.md) | Codex (backend + frontend) | Trade Journal — Database + Frontend Overhaul | **Ready** — unblocked (004 complete) |

---

## Up Next

These are scoped but not yet briefed. Claude will write briefs as each becomes active.

1. **Watchlist Page — Messari-Style Overhaul + Backend**
   Restyle the watchlist page using the terminal-wide design directive established in Brief 002. Wire CRUD to real Supabase-backed API routes. Brief 001 (Watchlist Schema + CRUD) covers the backend — may be folded into the overhaul brief or executed as a prerequisite.

2. **Research Page — Messari-Style Overhaul**
   Apply the terminal-wide design directive to the research/reports page. Improve report viewer, search/filter, and navigation. May include backend routes for report metadata if needed.

3. **Asset Enrichment Pipeline**
   Market data enrichment for watchlist assets — metrics, EDGAR links, TradingView URLs. Backend-only (API routes + services).

4. **AI Report Generation Pipeline**
   Wire the report generation stubs to real OpenAI-powered generation using the existing playbooks.

5. **Feed Ingestion Pipeline**
   Activate the RSS/SEC filing ingestion stubs. QStash-driven async processing.

---

## Completed

| # | Brief | Title | Completed | Archive |
|---|-------|-------|-----------|---------|
| 004 | 004-backend-migration-node.md | Backend Migration — Python to Node/TypeScript | 2026-02-11 | [archived](briefs/archive/004-backend-migration-node.md) |
| 003 | 003-agent-infrastructure.md | Agent Infrastructure + Documentation Restructuring | 2026-02-10 | [archived](briefs/archive/003-agent-infrastructure.md) |
| 000 | 000-rename-and-refactor.md | Rename Atlas to Brodus | 2026-02-06 | [archived](briefs/archive/000-rename-and-refactor.md) |

---

## Deferred

| # | Brief | Title | Reason |
|---|-------|-------|--------|
| 001 | [001-watchlist-schema-and-crud.md](briefs/001-watchlist-schema-and-crud.md) | Watchlist Schema + CRUD API | Written pre-pivot. Backend scope is still valid but will be folded into the Watchlist overhaul brief when that page is prioritized. Needs rewrite for TypeScript stack. |

---

## Brief Lifecycle

```
Draft → Ready → In Progress → Review → Promote → Archived
```

- **Active briefs** live in `docs/comms/briefs/`
- **Completed briefs** move to `docs/comms/briefs/archive/` with audit results appended
- **Promote step** extracts reusable patterns into `docs/prd/` before archiving
- Brief numbers are never reused
- See `.agents/protocol.md` for the full lifecycle specification

---

## Priority Rationale

**Product owner directive (2026-02-10):** UX-first strategy — make the frontend visually compelling with real backend functionality, page by page. Trade Journal is first because it establishes the design patterns (Panel, PillToggle, dense tables, value coloring) that all other pages inherit.

**Tech stack migration (2026-02-10):** Backend rewritten from Python to Node/TypeScript (Brief 004). Unifies the stack to a single language, eliminates type duplication, and simplifies Vercel deployment. Must complete before Brief 002 since 002 depends on the new TypeScript infrastructure.
