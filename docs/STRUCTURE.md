# Brodus — Documentation Structure

This is the source-of-truth map for where all documentation lives. Consult this file before creating new documents to ensure they land in the correct location. Update this file whenever the structure changes.

Last updated: 2026-02-10

---

## Root Files

```
CLAUDE.md           → Project intelligence file. Architecture, conventions, tech stack,
                      data patterns. Shared source of truth for all agents and humans.
                      Authority: highest (alongside initiation.md).

AGENTS.md           → Pointer file directing agents to their scoped instructions
                      in .agents/. Legacy — will be absorbed into .agents/ over time.

README.md           → Public-facing project overview. Stack, setup, structure.
                      Audience: new developers, GitHub visitors.
```

---

## .agents/ — Agent Infrastructure

Agent instructions, registry, and communication protocol. This directory is operational infrastructure — it tells agents who they are, what they own, and how they communicate. Claude (orchestrator) maintains this directory.

```
.agents/
├── initiation.md               → Boot sequence. Role contract and read order.
│                                  First file any agent reads. Every session.
│
├── registry.md                 → Master index of all agents. Maps agent IDs to
│                                  capabilities, entry points, file ownership, status.
│                                  Consulted to route work to the correct agent.
│
├── protocol.md                 → Communication protocol. Brief lifecycle
│                                  (Draft → Ready → In Progress → Review → Promote → Archived),
│                                  handoff rules, message format, channel definitions.
│                                  Includes the Promote step for extracting reusable
│                                  patterns into standing PRDs.
│
├── brief-template.md           → Canonical template for writing task briefs.
│                                  Required and optional sections, writing guidelines,
│                                  numbering convention. Orchestrator references this
│                                  when creating new briefs.
│
├── build/                      → Build agent group
│   ├── AGENT.md                → Shared conventions for all build agents (code standards,
│   │                              dependency rules, commit protocol, domain module convention).
│   ├── orchestrator/
│   │   └── INSTRUCTIONS.md     → Claude. Advisor/orchestrator. Writes briefs, audits,
│   │                              maintains backlog and agent infrastructure.
│   ├── backend/
│   │   └── INSTRUCTIONS.md     → Backend builder. Migrations, models, API routes, services.
│   └── frontend/
│       └── INSTRUCTIONS.md     → Frontend builder. Components, pages, types, styling.
│
└── research/                   → Research agent group
    ├── AGENT.md                → Shared conventions for all research agents (playbook
    │                              compliance, report standards, feedback protocol).
    └── equity/
        └── INSTRUCTIONS.md     → Equity research agent. Executes playbooks, generates
                                   reports and scorecards.
```

**Adding a new agent:** Create a new directory under the appropriate group, add an INSTRUCTIONS.md following the template in Brief 003, and register it in registry.md.

**Adding a new group:** Create a new top-level directory under .agents/ with an AGENT.md for shared group conventions, then add specializations as subdirectories.

---

## docs/ — Project Documentation

Project-level documentation that describes *what Brodus is* and *what it should do*. Not agent-specific — this is the shared knowledge base.

```
docs/
├── STRUCTURE.md                → You are here. Documentation map and conventions.
│
├── architecture.md             → System design, data flow diagrams, deployment model,
│                                  EDGAR API strategy, entity linking, deduplication.
│                                  Audience: any agent or human needing to understand
│                                  how the system works.
│
├── roadmap.md                  → Long-term feature vision. Phased build plan with
│                                  audit gates and analyst recommendation windows.
│                                  NOT the active work queue (that's comms/backlog.md).
│                                  Feeds the backlog — Claude consults this when
│                                  deciding what to brief next.
│
├── prd/                        → Product requirements by domain
│   ├── overview.md             → Product vision, user personas, success metrics.
│   │                              The "why" behind Brodus.
│   ├── database/
│   │   └── schema.md           → Human-readable schema reference. Mirrors migrations.
│   │                              Migrations remain the source of truth.
│   ├── frontend/
│   │   ├── design-system.md    → Terminal-wide design directive. Color tokens,
│   │   │                          typography, component patterns (Panel, PillToggle).
│   │   ├── journal.md          → Journal page requirements and behavior spec.
│   │   ├── watchlist.md        → Watchlist page requirements.
│   │   └── research.md         → Research page requirements.
│   ├── backend/
│   │   ├── api-conventions.md  → Next.js API route and service layer patterns.
│   │   │                          Route templates, status codes, CRUD signatures.
│   │   │                          Promoted from Brief 004.
│   │   ├── schema-conventions.md → Zod schema patterns. Export convention,
│   │   │                          SQL-to-Zod type mapping, inferred types.
│   │   │                          Promoted from Brief 004.
│   │   ├── journal-api.md      → Journal API requirements (CRUD, filtering, responses).
│   │   └── watchlist-api.md    → Watchlist API requirements.
│   └── pipelines/
│       ├── ingestion.md        → Feed and filing ingestion pipeline spec.
│       ├── enrichment.md       → Market data enrichment requirements.
│       └── reports.md          → AI report generation requirements.
│
└── comms/                      → Agent communication hub
    ├── backlog.md              → Priority-ordered work queue. Active execution plan.
    │                              Claude maintains. Cross-references roadmap.md
    │                              for long-term context.
    ├── status.md               → Current state + session log. Codex's scratchpad.
    │                              What's working, what's blocked, decisions needed.
    ├── briefs/                 → Active task specifications
    │   ├── 002-*.md            → Numbered briefs. Each references relevant PRD docs.
    │   ├── 003-*.md
    │   └── archive/            → Completed briefs with audit results appended.
    │                              Permanent record. Never delete, never modify.
    └── logs/                   → Persistent agent memory
        ├── context.md          → Strategic decisions and session history (Claude only).
        ├── changelog.md        → Code and structural changes (Codex appends).
        └── best-practices.md   → Patterns, capabilities, lessons learned (any agent).
```

---

## research/ — Research Artifacts

Investment research playbooks and generated outputs. Separate from docs/ because these are agent-generated artifacts, not project documentation.

```
research/
├── prompts/                    → Playbooks (analytical frameworks). 15 industry-specific
│                                  files. Will migrate to Supabase when artifact store matures.
└── reports/                    → Generated reports and scorecards. Flat files for now.
                                   Will migrate to database-backed storage.
```

---

## Application Code (reference — not documentation)

These directories contain application code, not documentation, but are referenced here for completeness since agents need to know the layout.

```
frontend/
├── src/app/                    → Next.js pages and API routes (App Router)
│   └── api/                    → Next.js API routes (thin wrappers for business logic)
├── src/components/             → React components organized by domain
│   ├── layout/                 → Shared shell (Sidebar, MainContent, PageHeader)
│   ├── ui/                     → Shared design system components (Panel, PillToggle)
│   ├── journal/                → Journal-specific components
│   ├── watchlist/              → Watchlist-specific components
│   └── research/               → Research-specific components
├── src/types/                  → TypeScript types (mirrors Zod schemas)
├── src/lib/                    → Shared utilities (api.ts, format.ts, db.ts, queue.ts)
├── src/services/               → Business logic organized by domain (CRUD, validation, enrichment)
├── src/schemas/                → Zod schemas organized by domain (data contract)
├── DESIGN.md                   → Frontend design reference (may move to docs/prd/frontend/)
└── tailwind.config.ts          → Theme tokens and configuration

supabase/migrations/            → Append-only SQL migrations (source of truth for schema)
```

---

## Conventions

**Where does a new document go?**

| Document type | Location | Example |
|---------------|----------|---------|
| Agent instructions | `.agents/[group]/[specialization]/` | `.agents/build/backend/INSTRUCTIONS.md` |
| Product requirements | `docs/prd/[domain]/` | `docs/prd/frontend/journal.md` |
| Task specification | `docs/comms/briefs/` | `docs/comms/briefs/004-watchlist-overhaul.md` |
| Completed task record | `docs/comms/briefs/archive/` | `docs/comms/briefs/archive/002-trade-journal.md` |
| Architecture / system design | `docs/` (root) | `docs/architecture.md` |
| Strategic decision log | `docs/comms/logs/context.md` | (append to existing file) |
| Code change record | `docs/comms/logs/changelog.md` | (append to existing file) |
| Lesson learned | `docs/comms/logs/best-practices.md` | (append to existing file) |
| Research playbook | `research/prompts/` | `research/prompts/semiconductors.md` |
| Generated report | `research/reports/` | `research/reports/AAPL.feb.md` |

**Naming conventions:**
- Briefs: `NNN-short-description.md` (e.g., `003-agent-infrastructure.md`)
- PRDs: descriptive kebab-case (e.g., `journal-api.md`)
- Agent instructions: always `INSTRUCTIONS.md` (uppercase, discoverable)
- Group context: always `AGENT.md` (uppercase)

**Cross-referencing:**
- Briefs should reference relevant PRDs ("See `docs/prd/frontend/journal.md` for requirements")
- PRDs should not reference briefs (PRDs are persistent; briefs are ephemeral)
- Backlog should cross-reference roadmap for long-term context
- Agent INSTRUCTIONS.md files should reference CLAUDE.md for project-wide conventions

**Ownership:**
- Claude owns: `.agents/`, `docs/comms/backlog.md`, `docs/comms/briefs/`, `docs/comms/logs/context.md`, `CLAUDE.md`
- Codex owns: `docs/comms/status.md`, `docs/comms/logs/changelog.md`
- Shared: `docs/comms/logs/best-practices.md`, `docs/prd/` (Claude drafts, Codex may update after implementation)
- User owns: `docs/roadmap.md` (Claude may propose updates, user approves)
