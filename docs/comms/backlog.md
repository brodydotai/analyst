# Brodus — Backlog

Priority-ordered task queue. Claude maintains this file. Codex works the top item.

---

## Active

| # | Brief | Title | Status |
|---|-------|-------|--------|
| 002 | [002-trade-journal.md](briefs/002-trade-journal.md) | Trade Journal — Backend + Frontend | **Ready** — awaiting Codex pickup |

---

## Up Next

These are scoped but not yet briefed. Claude will write briefs as each becomes active.

1. **Watchlist Page — Messari-Style Overhaul + Backend**
   Restyle the watchlist page using the terminal-wide design directive established in Brief 002. Wire CRUD to real Supabase-backed API routes (migration, models, routes). Panel-based layout, dense data tables, value coloring.

2. **Research Page — Messari-Style Overhaul**
   Apply the terminal-wide design directive to the research/reports page. Improve report viewer, search/filter, and navigation. May include backend routes for report metadata if needed.

3. **Asset Enrichment Pipeline**
   Market data enrichment for watchlist assets — metrics, EDGAR links, TradingView URLs. Backend-only (API routes + core modules).

4. **AI Report Generation Pipeline**
   Wire the report generation stubs (`/api/python/reports/asset`, `/api/python/reports/daily`) to real OpenAI-powered generation using the existing playbooks.

5. **Feed Ingestion Pipeline**
   Activate the RSS/SEC filing ingestion stubs. QStash-driven async processing.

---

## Completed

| # | Brief | Title | Completed |
|---|-------|-------|-----------|
| 000 | 000-rename-and-refactor.md | Rename Atlas to Brodus | 2026-02-06 |
| 001 | *(no brief — direct session)* | Frontend UX Overhaul (sidebar, layout, design system) | 2026-02-10 |

---

## Priority Rationale

**Product owner directive (2026-02-10):** The original ROADMAP.md build order (Watchlist CRUD -> Enrichment -> AI Reports -> Frontend) is superseded. New priority is UX-first: make the frontend visually compelling with real backend functionality, page by page. Trade Journal is first because it's a net-new page with no legacy constraints — the design patterns established here (Panel, PillToggle, dense tables, value coloring) become the template for overhauling Watchlist and Research pages next.
