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
