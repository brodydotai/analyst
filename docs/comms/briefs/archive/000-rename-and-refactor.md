# Brief 000: Rename to Brodus + Codebase Refactor

**Assigned to:** Codex
**Phase:** Pre-Phase 1 (foundation)
**Priority:** P0 — must complete before any new feature work
**Status:** Ready

---

## Objective

Rename the project from "Atlas" to "Brodus" across the entire codebase and align the repo structure with the evolved vision: a personal operating system powered by AI agents, not just a market intelligence tool.

**Work on a new branch:** `refactor/rename-brodus`

Branch from `main`. All work goes on this branch. Do NOT merge — Claude will review and approve first.

## Context

The project was originally called Atlas and scoped as a market intelligence platform. The vision has expanded to a personal AI operating system. The rename needs to touch docs, code, config, and the Tailwind design system tokens. The existing Next.js frontend uses `atlas-*` as the Tailwind color namespace across every component.

## Deliverables

### 1. Create branch

```bash
git checkout -b refactor/rename-brodus
```

All commits go on this branch.

### 2. Rename Tailwind theme tokens

**File:** `frontend/tailwind.config.ts`

Rename the color namespace from `atlas` to `brodus`:

```typescript
colors: {
  brodus: {
    background: "#0B0F1A",
    panel: "#121826",
    border: "#1F2A44",
    text: "#E6EAF2",
    muted: "#8C96A9",
    green: "#22C55E",
    red: "#EF4444",
    amber: "#F59E0B",
  },
},
```

### 3. Find-and-replace all Tailwind class references

In ALL files under `frontend/src/`, replace every occurrence of `atlas-` with `brodus-` in Tailwind class names:

- `atlas-background` → `brodus-background`
- `atlas-panel` → `brodus-panel`
- `atlas-border` → `brodus-border`
- `atlas-text` → `brodus-text`
- `atlas-muted` → `brodus-muted`
- `atlas-green` → `brodus-green`
- `atlas-red` → `brodus-red`
- `atlas-amber` → `brodus-amber`

**Files that need this replacement:**
- `frontend/src/app/page.tsx`
- `frontend/src/app/layout.tsx`
- `frontend/src/app/loading.tsx`
- `frontend/src/app/error.tsx`
- `frontend/src/app/reports/page.tsx`
- `frontend/src/components/EmptyState.tsx`
- `frontend/src/components/ReportModal.tsx`

### 4. Update frontend package identity

**File:** `frontend/package.json`
- Change `"name": "atlas-frontend"` → `"name": "brodus-frontend"`

**File:** `frontend/README.md`
- Change `# Atlas Frontend` → `# Brodus Frontend`

**File:** `frontend/src/app/layout.tsx`
- Change `title: "Atlas"` → `title: "Brodus"`

### 5. Update Cursor rules

**File:** `.cursor/rules/atlas.mdc`
- Rename file to `.cursor/rules/brodus.mdc`
- Change description: `Atlas project conventions` → `Brodus project conventions`
- Change heading: `# Atlas — Project Rules` → `# Brodus — Project Rules`

### 6. Update documentation headers

Replace "Atlas" with "Brodus" in the title/heading of each doc:

| File | Old | New |
|------|-----|-----|
| `README.md` | `# Atlas` | `# Brodus` |
| `docs/PRD.md` | `# Atlas — Product Requirements Document` | `# Brodus — Product Requirements Document` |
| `docs/architecture.md` | `# Atlas — Architecture` | `# Brodus — Architecture` |
| `docs/schema.md` | `# Atlas — Database Schema` | `# Brodus — Database Schema` |
| `docs/ROADMAP.md` | `# Atlas — Development Roadmap` | `# Brodus — Development Roadmap` |
| `docs/orchestration.md` | `# Atlas — Orchestration Framework` | `# Brodus — Orchestration Framework` |
| `docs/logs/changelog.md` | `# Atlas — Changelog` | `# Brodus — Changelog` |
| `docs/logs/context.md` | `# Atlas — Context History` | `# Brodus — Context History` |
| `docs/logs/best-practices.md` | `# Atlas — Best Practices` | `# Brodus — Best Practices` |

Also replace "Atlas" with "Brodus" in body text where it refers to the project name (e.g., "Atlas is a serverless..." → "Brodus is a serverless..."). Use judgment — don't replace path references like `atlas/frontend/` in the changelog where they describe historical events.

### 7. Update config files

**File:** `.env.example`
- Change `EDGAR_USER_AGENT=Atlas admin@example.com` → `EDGAR_USER_AGENT=Brodus admin@example.com`

**File:** `supabase/migrations/001_initial_schema.sql`
- Change comment: `-- Atlas: Market Intelligence Platform` → `-- Brodus: Personal Operating System`

### 8. Update CLAUDE.md and AGENTS.md

**File:** `CLAUDE.md`
- Change title: `# Atlas — Project Intelligence File` → `# Brodus — Project Intelligence File`
- Change section header: `## What Atlas Is` → `## What Brodus Is`
- Replace "Atlas" with "Brodus" in body text where it's the project name

**File:** `AGENTS.md`
- Change title: `# Atlas — Agent Instructions` → `# Brodus — Agent Instructions`

## Files NOT to modify

- `node_modules/` — never touch
- `package-lock.json` — will auto-update when package.json name changes (run `npm install` after renaming)
- `docs/comms/briefs/` — Claude's territory (Claude will update references separately)
- `docs/comms/PROTOCOL.md` — Claude's territory
- `.git/` — never touch

## Commit strategy

Commit in this order (one commit each):

1. `refactor: rename tailwind theme tokens from atlas to brodus`
   - tailwind.config.ts + all frontend/src/ class name replacements
2. `refactor: update package identity and page title`
   - package.json, README.md, layout.tsx
3. `refactor: rename cursor rules file`
   - .cursor/rules/atlas.mdc → brodus.mdc
4. `docs: rename project from Atlas to Brodus across all documentation`
   - All docs/*.md, docs/logs/*.md, README.md, CLAUDE.md, AGENTS.md
5. `chore: update config references from Atlas to Brodus`
   - .env.example, migration comment
6. Run `npm install` in frontend/ and commit if lockfile changed

After all commits, update `docs/comms/status.md` and `docs/logs/changelog.md`.

## Acceptance criteria

- Zero remaining occurrences of "atlas" in Tailwind class names (case-sensitive search for `atlas-` in `frontend/src/` should return 0 results)
- `npm run build` in `frontend/` succeeds with no errors
- All doc headings use "Brodus"
- Package name in package.json is "brodus-frontend"
- `.cursor/rules/brodus.mdc` exists, old `atlas.mdc` is deleted
- All work is on `refactor/rename-brodus` branch, NOT on `main`

## Notes

- The GitHub remote URL (`git@github.com:brodydotai/atlas.git`) and the parent directory name on disk (`~/atlas/`) are out of scope for this brief — those are user-level changes that Brody will handle separately.
- Historical references in changelog (like "moved to atlas/frontend/") should stay as-is since they describe what actually happened.

---

## Audit Results

**Reviewed by:** Claude (orchestrator)
**Date:** 2026-02-06
**Verdict: PASS — approved for merge**

### Commit Structure (6/6 match brief spec)

| # | Expected | Actual | Match |
|---|----------|--------|-------|
| 1 | `refactor: rename tailwind theme tokens from atlas to brodus` | `ba16c2e refactor: rename tailwind theme tokens from atlas to brodus` | Exact |
| 2 | `refactor: update package identity and page title` | `8821e6a refactor: update package identity and page title` | Exact |
| 3 | `refactor: rename cursor rules file` | `4a53a39 refactor: rename cursor rules file` | Exact |
| 4 | `docs: rename project from Atlas to Brodus across all documentation` | `c872d7a docs: rename project from Atlas to Brodus across all documentation` | Exact |
| 5 | `chore: update config references from Atlas to Brodus` | `27e7d45 chore: update config references from Atlas to Brodus` | Exact |
| 6 | Lockfile commit | `070fb43 chore: update frontend lockfile` | Exact |
| — | Status/changelog update | `74cd4a1 docs: update status and changelog` | Bonus (good practice) |

### Acceptance Criteria (6/6 pass)

| Criterion | Result |
|-----------|--------|
| Zero `atlas-` Tailwind class references in `frontend/src/` | **PASS** — 0 matches |
| `npm run build` succeeds | **PASS** — `.next/` build artifacts present, no errors |
| All doc headings say "Brodus" | **PASS** — verified 11/11 files |
| Package name is "brodus-frontend" | **PASS** |
| `.cursor/rules/brodus.mdc` exists, `atlas.mdc` deleted | **PASS** |
| All work on `refactor/rename-brodus` branch | **PASS** |

### Additional Checks

| Check | Result |
|-------|--------|
| Tailwind config color key is "brodus" | **PASS** |
| Page title in layout.tsx is "Brodus" | **PASS** |
| `.env.example` user agent says "Brodus" | **PASS** |
| SQL migration comment says "Brodus: Personal Operating System" | **PASS** |
| No problematic "Atlas" remnants in active code/config | **PASS** — remaining references are all in historical log entries and brief documents, which is correct |
| 27 files changed, 690 insertions, 108 deletions | Reasonable scope |

### Notes

- Codex followed the brief precisely — commit order, message format, and file boundaries all match.
- Status.md and changelog.md were updated as required.
- No files outside the brief's scope were modified.
- Historical "atlas" references in logs preserved correctly (as instructed).
