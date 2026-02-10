# Task Backlog

Maintained by Claude. Prioritized queue of work for Codex. Execute from top to bottom unless a brief explicitly says otherwise.

**Last updated:** 2026-02-06

---

## Active

| # | Brief | Phase | Priority | Status |
|---|-------|-------|----------|--------|
| 000 | Rename to Brodus + codebase refactor | Pre-Phase 1 | P0 | **Ready** — brief written, execute first |
| 001 | Watchlist schema + CRUD API | Phase 1 | P0 | Ready — execute after 000 merges |
| 002 | Asset enrichment API | Phase 2 | P0 | Queued |
| 003 | AI report generation API | Phase 3 | P0 | Queued |

## Upcoming

| # | Description | Phase | Notes |
|---|-------------|-------|-------|
| 004 | Frontend watchlist polish (sparklines, heat indicators) | Phase 4 | After backend parity |
| 005 | Sources admin page + CRUD | Phase 5 | — |
| 006 | Feed ingestion pipeline + UI | Phase 6 | — |
| 007 | TradingView sync | Phase 7 | — |
| 008 | Semantic search + polish | Phase 8 | — |

## Notes

- **Brief 000 must be completed and merged before any other work.** It renames the project from Atlas to Brodus and establishes the new identity.
- Brief 000 goes on branch `refactor/rename-brodus`. Do NOT merge — Claude reviews first.
- Phases 1-3 are **backend-critical** — the frontend already assumes these API routes exist
- Phase 4 is UX polish that can happen in parallel once APIs are live
- Phases 5-8 are additive features on top of the core product
- Each brief gets an audit gate review from Claude before the next brief is assigned
