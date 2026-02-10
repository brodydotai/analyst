# Brodus — Changelog

All code, structural, and configuration changes made by agents. Append-only.

---

## 2026-02-06

### Created: Investment Research Playbooks
- **Location:** `research/prompts/`
- **Files:** 15 industry-specific `.prompt.md` files
- **Key additions this session:**
  - `industrial-testing-inspection-certification.prompt.md` (codename: Integrity Thesis) — for Accuren/TIC
  - `data-centers-and-cloud-infrastructure.prompt.md` (codename: Rack Thesis) — for VNET Group
- **Purpose:** Analytical frameworks that guide report generation for specific industries

### Created: Company Reports
- **Location:** `research/reports/`
- **Files:**
  - `tic.feb.md` — TIC Solutions (Integrity Thesis prompt)
  - `adbe.feb.md` — Adobe (SaaS prompt)
  - `intc.feb.md` — Intel (Silicon Thesis prompt)
  - `vnet.feb.md` — VNET Group (Rack Thesis + Chinese AI prompts)
  - `*.scorecard.md` — Corresponding verification scorecards for each report

### Created: Verification Engine
- **Location:** `research/verify_prompt_compliance.py`
- **What it does:** Parses prompt sections, checks report coverage via keyword matching, generates scorecards with letter grades
- **Scoring:** 40% section coverage + 40% element coverage + 20% structural requirements
- **Known limitation:** Keyword-based matching is intentionally strict; semantic evaluation planned

### Created: Vite Terminal Prototype (later removed)
- **Built at:** `research/terminal/` → moved to `atlas/frontend/` → cleaned up
- **Stack:** React 18, Vite 5, react-markdown, zustand, fuse.js, Tailwind v4
- **Status:** Removed from `atlas/frontend/` to avoid conflict with existing Next.js app. Some empty directories may persist on host filesystem.
- **Decision:** Research viewer functionality to be integrated into Next.js command center instead

### Created: Persistent Logs System
- **Location:** `docs/logs/`
- **Files:**
  - `context.md` — Conversation history, decisions, strategic direction
  - `changelog.md` — This file
  - `best-practices.md` — Capabilities, patterns, lessons learned

### Completed: CLAUDE.md + AGENTS.md Overhaul
- Updated `CLAUDE.md` to reflect Claude as orchestrator (not just reviewer)
- Updated `AGENTS.md` with full session protocol, brief-based workflow, and explicit operating instructions for Codex
- Added comms directory references to project structure

### Completed: Orchestration Framework
- `docs/orchestration.md` — Full ASCII diagram + communication protocol + task delegation matrix + daily operating loop
- `research/orchestration-diagram.mermaid` — Visual Mermaid version

### Created: Agent Communication System
- **Location:** `docs/comms/`
- **Files:**
  - `PROTOCOL.md` — Rules of engagement for async agent communication
  - `backlog.md` — Prioritized task queue maintained by Claude
  - `status.md` — Codex writes status here after each session
  - `briefs/001-watchlist-schema-and-crud.md` — First task brief: Phase 1 watchlist schema + CRUD API
- **How it works:** Claude writes numbered task briefs with objectives, deliverables, acceptance criteria, and file boundaries. Codex reads the brief, executes, commits, updates status. Claude reviews and writes the next brief. Async loop via shared files — no real-time messaging needed.

### Created: Brief 000 — Rename to Brodus
- **Location:** `docs/comms/briefs/000-rename-and-refactor.md`
- **Scope:** Full project rename from Atlas → Brodus. Covers Tailwind theme tokens (atlas-* → brodus-*), all 7 frontend component files, package.json, layout title, .cursor rules, all docs headings, .env.example, SQL migration comment, CLAUDE.md, AGENTS.md.
- **Branch:** `refactor/rename-brodus` (from main)
- **Commit strategy:** 6 atomic commits (theme tokens, package identity, cursor rules, docs, config, lockfile)
- **Decision:** CLAUDE.md and AGENTS.md rename is part of this brief (Codex handles it on the branch). GitHub remote URL and disk directory name are out of scope — user handles those separately.

### Completed: Brodus Rename Pass
- Updated Tailwind theme tokens to `brodus-*` and replaced all frontend class references.
- Renamed frontend package identity, updated page title, and refreshed cursor rule file.
- Updated documentation headers/body references to Brodus and adjusted config references.
- Ran `npm install` and verified `npm run build` succeeds.

---

## 2026-02-10

### Completed: Frontend UX Overhaul — Bloomberg Terminal Aesthetic

**Scope:** Complete UX overhaul of the Next.js frontend with Bloomberg terminal-style design, collapsible sidebar navigation, componentized architecture, and new Trade Journal feature.

#### Design System Expansion
- **File:** `frontend/tailwind.config.ts` — Added 5 new color tokens: `surface`, `hover`, `accent`, `success`, `danger`, `warning`. Added `font-sans` (Inter) and `font-mono` (JetBrains Mono) families. Added `text-2xs` size.
- **File:** `frontend/src/app/globals.css` — Added Google Fonts import, thin dark scrollbar styling, focus ring utility, `.font-data` class for monospace numerals, `.value-positive`/`.value-negative` tinted classes, selection styling.
- **File:** `frontend/DESIGN.md` — Created design reference document covering color palette, typography, spacing conventions, component patterns, value coloring, icon sizes, and layout specs.
- **Dependency:** Installed `lucide-react` for icons.

#### Layout + Sidebar Navigation
- **Files created:**
  - `frontend/src/components/layout/SidebarContext.tsx` — React context for sidebar collapsed/expanded state
  - `frontend/src/components/layout/Sidebar.tsx` — Collapsible left sidebar (220px/56px) with nav items: Watchlist, Research, Journal. Active route highlighting via `usePathname()`.
  - `frontend/src/components/layout/MainContent.tsx` — Responsive main content wrapper with sidebar margin transitions
  - `frontend/src/components/layout/PageHeader.tsx` — Reusable page header with title, subtitle, and action slot
- **File modified:** `frontend/src/app/layout.tsx` — Integrated SidebarProvider, Sidebar, and MainContent wrapper

#### Watchlist Page Refactor
- **Monolith broken into 5 components:**
  - `frontend/src/components/watchlist/WatchlistHeader.tsx` — Page actions (Edit, Refresh, 24h Summary) using PageHeader
  - `frontend/src/components/watchlist/AddAssetForm.tsx` — Ticker/name/category input form
  - `frontend/src/components/watchlist/CategorySection.tsx` — Collapsible category with column headers and item rows
  - `frontend/src/components/watchlist/WatchlistRow.tsx` — Dense data row with mono numerals, value tinting, action buttons
  - `frontend/src/components/watchlist/EditControls.tsx` — Reorder/move/delete controls
- **File modified:** `frontend/src/app/page.tsx` — Reduced from ~627 lines to ~335 lines (state management + composition)

#### Research Page Evolution
- **Files created:**
  - `frontend/src/components/research/ReportList.tsx` — Sidebar report list with search/filter input
  - `frontend/src/components/research/ReportToc.tsx` — Table of contents extracted from markdown headings
  - `frontend/src/components/research/ReportViewer.tsx` — Enhanced markdown renderer with styled tables, blockquotes, code blocks, links, and dense typography
- **File modified:** `frontend/src/app/reports/page.tsx` — Refactored to use extracted components, removed old Link import

#### Trade Journal (New Feature)
- **File created:** `frontend/src/types/journal.ts` — Types: `TradeEntry`, `JournalEntry`, `TradeSide`, `TradeStatus`
- **Files created:**
  - `frontend/src/components/journal/JournalTabs.tsx` — Tab switcher between Trade Log and Daily Journal
  - `frontend/src/components/journal/TradeLogTable.tsx` — Sortable trade table with expandable rows for thesis/notes
  - `frontend/src/components/journal/TradeLogForm.tsx` — Modal form for adding trades (ticker, side, price, quantity, thesis, status)
  - `frontend/src/components/journal/JournalEntryCard.tsx` — Rendered journal entry card with markdown and tags
  - `frontend/src/components/journal/JournalEditor.tsx` — Modal editor for writing journal entries with tag support
- **File created:** `frontend/src/app/journal/page.tsx` — Full journal page with summary stats (Total P&L, Win Rate, Open/Closed counts), tabbed interface, local state management
- **File modified:** `frontend/src/lib/format.ts` — Added `formatPnl()` and `formatDate()` utilities

#### Shared Component Cleanup
- `EmptyState.tsx` — Added icon prop support (lucide), centered layout with icon circle
- `ErrorBanner.tsx` — Added AlertTriangle icon, semantic danger colors
- `ReportModal.tsx` — Updated to use X icon for close, refined spacing and color tokens

#### Verification
- `npm run build` — Passes with zero errors, zero warnings
- Zero `any` types in codebase (grep verified)
- All 3 pages compile as static: `/`, `/journal`, `/reports`
- Total: 18 new files created, 7 files modified, 0 files deleted
