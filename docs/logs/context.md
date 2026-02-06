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

## How to Use This File

Each session should append a new dated section summarizing:
- What was discussed and decided
- What strategic direction changed (if any)
- What work was completed
- What remains pending
- Any new constraints or insights discovered
