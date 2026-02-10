# Brodus — Context History

This file preserves decisions, strategic direction, and conversation context across sessions so that work and intent survive context window resets.

---

## Session: 2026-02-06 — Foundation & Vision Alignment

### Strategic Direction Established

**Core insight from user:** Brodus is not an investment research tool. It is a **personal operating system** where AI agents are the workforce. Investment research is one workstream among many.

**End-state vision:**
- User spends time editing guidelines/playbooks and reviewing agent outputs
- Agents autonomously execute tasks across investment research, deal sourcing, portfolio monitoring, business operations
- Agents self-improve through feedback loops and outcome tracking
- Modular architecture that scales as new models, APIs, MCPs, and orchestration techniques emerge
- Cowork (Claude) serves as the primary coordinator, delegating to specialized sub-agents

**Architectural reframing — five layers:**
1. **Orchestration Layer** — User ↔ Claude (Cowork). Task intake, delegation, status reporting
2. **Agent Layer** — Claude ↔ specialized sub-agents (Codex for code, research agents, analysis agents)
3. **Data Layer** — APIs, MCPs, connectors, web scraping, SEC EDGAR, financial data feeds
4. **Artifact Store** — Supabase database, file system. All agent outputs persist here
5. **Feedback Loop** — Outcome tracking, score-based evaluation, playbook refinement

**Terminology decisions:**
- Prompts → **Playbooks** (analytical frameworks that guide agent work)
- Reports → **Artifacts** (any agent-generated output: reports, scorecards, code, analysis)
- Frontend → **Command Center** (the dashboard/interface, currently Next.js)

### Key Decisions

1. **Research directory is temporary storage.** Prompts and reports live in `research/` as flat markdown files for now. They will migrate to the Supabase database as the artifact store matures.

2. **Vite terminal app was a prototype.** A React+Vite terminal-style viewer was built for reading markdown reports. It was moved to `atlas/frontend/` but conflicted with the existing Next.js 15 app. The Vite artifacts were cleaned up. Research viewer functionality should eventually be integrated into the Next.js command center.

3. **Claude's role is evolving.** CLAUDE.md currently defines Claude as "reviewer" and Codex as "builder." The actual operating model is Claude as orchestration coordinator — delegating to Codex for code, spawning research sub-agents, maintaining logs, and managing the feedback loop. CLAUDE.md needs updating.

4. **Persistent logs are mandatory.** Three log files maintain continuity across sessions:
   - `context.md` (this file) — decisions, strategy, conversation history
   - `changelog.md` — code and structural changes
   - `best-practices.md` — capabilities, patterns, lessons learned

5. **Codex communication mechanism needed.** Claude and Codex need a shared state mechanism beyond just CLAUDE.md. Design pending.

### Investment Research Work Completed

- Created 15 industry-specific playbooks (prompt files) covering semiconductors, SaaS, industrials, data centers, fintech, pharma, REITs, defense, media, China tech, consumer, energy, and more
- Generated 4 company reports: TIC (72.1% C), ADBE (46.7% F), INTC (45.4% F), VNET (55.0% F)
- Built `verify_prompt_compliance.py` — keyword-based verification engine that scores reports against playbook requirements
- Verification scores are intentionally harsh (keyword matching, not semantic). LLM-as-judge approach recommended for future iterations
- NVDA report was generated in an earlier session but lost during context compaction

### Bottlenecks Identified

Nine constraints limiting report depth:
1. **Financial data** — No API access to real-time fundamentals (P/E, EV/EBITDA, margins)
2. **SEC filings** — Working from summaries, not full EDGAR documents
3. **Earnings transcripts** — No access to call transcripts
4. **Real-time market data** — No price feeds or technical indicators
5. **Alternative data** — No satellite imagery, web traffic, patent data
6. **Verification engine** — Keyword-based, not semantic
7. **Persistent storage** — Flat files, not database-backed
8. **Web search quality** — Paywalls limit deep research
9. **No backtesting** — Cannot validate thesis quality against outcomes

### Brodus Codebase State (as discovered)

The atlas repo already has significant infrastructure:
- **Next.js 15 frontend** with watchlist dashboard, report viewer, error handling
- **Supabase schema** (7 tables with pgvector + pg_trgm)
- **Python serverless backend** (4 route stubs, all returning "not_implemented")
- **Core modules** (config, db client, queue client, Pydantic models)
- **Comprehensive docs** (PRD, architecture, schema, 8-phase roadmap)
- **8-phase roadmap**: Watchlist CRUD → Enrichment → AI Reports → Frontend → Sources → Feed Pipeline → TradingView → Search

---

## Session: 2026-02-10 — UX Overhaul + Role Contract + Messari Design Direction

### Role Contract Adopted

The user created `docs/comms/initiation.md`, establishing a formal agent communication protocol:
- **Claude** = advisor/orchestrator — writes briefs, audits results, maintains backlog and context. Does NOT implement code unless explicitly asked.
- **Codex** = builder/engineer — implements code from briefs, updates status.md and changelog.md.
- Shared files in `docs/comms/` serve as the async communication channel between agents.
- `docs/comms/briefs/` contains numbered task specs from Claude to Codex.
- `docs/comms/backlog.md` is the priority-ordered task queue (Claude-maintained).

### Strategic Direction Change: UX-First Priority

**Previous priority order** (from ROADMAP.md): Watchlist CRUD -> Enrichment -> AI Reports -> Frontend -> Sources -> Feed Pipeline -> TradingView -> Search.

**New priority order** (product owner directive): UX overhaul page-by-page, each page getting both frontend design treatment AND real backend functionality simultaneously. Trade Journal first, then Watchlist, then Research.

**Rationale:** The frontend needs to be visually compelling and functionally complete. Building backend-only phases in isolation delays the user-facing product. By overhauling one page at a time (design + backend together), each page ships as a complete unit.

### Design Direction: Messari-Inspired Terminal

The user shared Messari.io as the visual reference. Key design principles established:

1. **Panel-based layouts** — every content block is a discrete rounded container with border, background, and header chrome
2. **Dense data tables** — tight padding (py-1.5), monospace numbers (JetBrains Mono, tabular-nums), uppercase column headers
3. **Pill toggles** — small rounded buttons for tab switching, filtering, time ranges
4. **Value coloring** — green for positive, red for negative, with tinted background variants
5. **Typography** — Inter for UI, JetBrains Mono for data/numbers, small base sizes (14px), dense labels
6. **Dark terminal aesthetic** — deep navy backgrounds, subtle borders, minimal chrome

These principles are codified as the "Terminal-Wide Design Directive" in Brief 002 and will apply to all future frontend work.

### Work Completed

1. **Frontend UX overhaul (direct implementation)** — Before the role contract was adopted, Claude directly implemented:
   - Design system expansion (tailwind.config.ts, globals.css, DESIGN.md)
   - Sidebar navigation with collapse/expand
   - Watchlist page refactored from 627-line monolith to 5 components
   - Research page refactored with search/filter
   - Trade journal page (new) with trade log + daily journal tabs
   - Shared component cleanup (EmptyState, ErrorBanner, ReportModal)
   - Build passes clean, zero TypeScript errors

2. **Brief 002: Trade Journal — Backend + Frontend** — Comprehensive brief for Codex covering:
   - Database migration (trade_entries + journal_entries tables)
   - Pydantic models
   - 6 API routes (CRUD for trades and journal entries)
   - Frontend overhaul with Panel/PillToggle components and real API integration
   - Terminal-Wide Design Directive (applies to all future pages)
   - 6-commit strategy with acceptance criteria

3. **Backlog created** — `docs/comms/backlog.md` now tracks the priority-ordered task queue.

### What Remains

- Brief 002 is ready for Codex pickup
- Future briefs needed: Watchlist overhaul, Research overhaul, Enrichment pipeline, AI report generation, Feed ingestion
- CLAUDE.md may need updating to reflect the new role contract (initiation.md is the source of truth for now)

---

## How to Use This File

Each session should append a new dated section summarizing:
- What was discussed and decided
- What strategic direction changed (if any)
- What work was completed
- What remains pending
- Any new constraints or insights discovered
