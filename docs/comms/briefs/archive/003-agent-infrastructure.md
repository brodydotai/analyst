# Brief 003: Agent Infrastructure + Documentation Restructuring

**Assigned to:** Claude (orchestrator) — documentation and organizational structure
**Phase:** Foundation (unblocks all future multi-agent work)
**Priority:** P0 — establishes conventions that all subsequent briefs depend on
**Status:** Archived

---

## Objective

Build the agent registry, scoped instruction system, and modular application conventions that let Brodus scale from a two-agent system (Claude + Codex) to an arbitrary number of specialized agents — each with focused context, clear boundaries, and discoverable capabilities.

This brief also restructures the entire documentation tree — dissolving the vague `docs/app/` directory, establishing a domain-scoped PRD system, migrating agent-related docs into `.agents/`, and creating a documentation structure diagram as the map for all future documentation.

**Why now:** The current single-file instruction model (CLAUDE.md + AGENTS.md) is already causing context pollution — agents receive the entire project context regardless of their task, degrading performance. The documentation structure is chaotic — architectural docs, agent docs, and product specs are intermixed without clear ownership. As more workflows come online (research, deal sourcing, portfolio monitoring), both problems compound. Fixing the foundation before more code ships prevents tech debt.

---

## Problem Statement

Four interrelated problems this brief solves:

**1. Context pollution.** Every agent reads the same monolithic CLAUDE.md. A frontend builder doesn't need EDGAR rate-limiting rules. A research agent doesn't need Tailwind color tokens. Irrelevant context dilutes model attention and degrades output quality.

**2. No agent discoverability.** There's no registry of what agents exist, what they're capable of, or where their instructions live. Routing work to the right agent requires tribal knowledge.

**3. Flat application structure.** As workflows multiply (trading, watchlist, research, deal sourcing...), a flat `core/python/` directory becomes a junk drawer. Domain-scoped business logic needs clear boundaries so agents can work on one domain without understanding others.

**4. Chaotic documentation.** `docs/app/` is vague — it mixes architecture, orchestration, schema, and roadmap with no clear ownership. `orchestration.md` is agent infrastructure masquerading as app documentation. `docs/comms/protocol.md` duplicates what should live in `.agents/`. There is no PRD system — product requirements are scattered across briefs, CLAUDE.md, and the roadmap. `docs/README.md` conflicts with the root README. The documentation needs a clear structure diagram and consistent ownership model.

---

## Deliverables

### 1. Agent Directory Structure

Create the `.agents/` directory at the project root:

```
.agents/
├── README.md                          ← How agents work in Brodus
├── registry.md                        ← Master index: all agents, capabilities, entry points
├── protocol.md                        ← Communication format, brief lifecycle, handoff rules
│
├── build/                             ← Build agent group
│   ├── AGENT.md                       ← Group-level context (shared build conventions)
│   ├── orchestrator/
│   │   └── INSTRUCTIONS.md            ← Claude's scoped instructions
│   ├── backend/
│   │   └── INSTRUCTIONS.md            ← Backend builder (Codex, or future agents)
│   └── frontend/
│       └── INSTRUCTIONS.md            ← Frontend builder
│
└── research/                          ← Research agent group
    ├── AGENT.md                       ← Group-level context (shared research conventions)
    └── equity/
        └── INSTRUCTIONS.md            ← Equity research agent
```

### 2. Registry (`registry.md`)

The registry is the master index. When the user (or orchestrator) needs to route work, they consult this file to find the right agent. It should contain:

**For each agent:**

| Field | Description |
|-------|-------------|
| **ID** | Unique identifier (e.g., `build/backend`, `research/equity`) |
| **Name** | Human-readable name |
| **Group** | Which agent group it belongs to |
| **Role** | One-line description of what this agent does |
| **Entry point** | Path to its `INSTRUCTIONS.md` |
| **Owns** | Files and directories this agent can create/modify |
| **Reads** | Files this agent should read for context (its "read order") |
| **Never touches** | Files and directories this agent must not modify |
| **Status** | Active, planned, or retired |

**Initial agents to register:**

1. `build/orchestrator` — Claude. Interprets user intent, writes briefs, audits results, maintains backlog and agent infrastructure.
2. `build/backend` — Backend builder. Creates database migrations, Pydantic models, API routes, and core services.
3. `build/frontend` — Frontend builder. Creates React components, pages, and TypeScript types following the design system.
4. `research/equity` — Equity research agent. Executes playbooks, generates reports and scorecards, uses data layer for persistence.

### 3. Protocol (`protocol.md`)

The shared communication protocol that all agents follow. Must cover:

**Brief lifecycle:**
- **Draft:** Claude writes the brief in `docs/comms/briefs/`. Status: `Draft`.
- **Ready:** Claude marks it `Ready` and adds it to the backlog. Codex (or assigned agent) can pick it up.
- **In Progress:** Assigned agent begins work. Updates `docs/comms/status.md`.
- **Review:** Agent completes work. Claude audits against acceptance criteria.
- **Archived:** Claude appends audit results to the brief, moves it to `docs/comms/briefs/archive/`, and updates the backlog.

**Brief archive convention:**
- Completed briefs live in `docs/comms/briefs/archive/`
- Archived briefs retain their full content including audit results — they serve as the project's ticket history
- The archive is append-only. Never delete or modify archived briefs.
- Brief numbers are never reused.

**Communication channels:**
- `docs/comms/backlog.md` — Priority queue (Claude maintains)
- `docs/comms/briefs/*.md` — Active task specs (Claude creates, Codex executes)
- `docs/comms/briefs/archive/*.md` — Completed task history
- `docs/comms/status.md` — Current state + session log (Codex maintains)
- `docs/comms/logs/changelog.md` — Code change history (Codex appends)
- `docs/comms/logs/context.md` — Strategic decisions and session context (Claude appends)
- `docs/comms/logs/best-practices.md` — Patterns and lessons learned (either agent)

**Handoff format:**
When one agent needs another to act, it writes a brief or a status update — never modifies the other agent's files directly.

### 4. Agent Instruction Template

Every `INSTRUCTIONS.md` follows this structure:

```markdown
# [Agent Name]

> One-line role description.

## Identity

Who this agent is, what it's responsible for, and what success looks like.

## Read Order

Files this agent must read at the start of every session, in order:

1. This file (`.agents/[group]/[specialization]/INSTRUCTIONS.md`)
2. Group context (`.agents/[group]/AGENT.md`)
3. [Specific files relevant to this agent's domain]

## Scope

### Owns (can create and modify)
- [list of files/directories]

### Reads (for context only)
- [list of files/directories]

### Never Touches
- [list of files/directories]

## Conventions

Domain-specific rules, patterns, and standards this agent follows.

## Output Format

What this agent produces and where it goes.
```

### 5. Scoped Instructions for Initial Agents

**`.agents/build/AGENT.md`** — Build group context:
- Link to CLAUDE.md for project-wide architecture and conventions
- Link to the tech stack table
- Shared code standards (type hints, no dead code, error handling patterns)
- Dependency list
- Process rules (incremental commits, real data testing)

**`.agents/build/orchestrator/INSTRUCTIONS.md`** — Claude:
- Identity: advisor/orchestrator. Interprets user intent, writes briefs, audits, maintains infrastructure.
- Read order: This file → `.agents/build/AGENT.md` → `CLAUDE.md` → `docs/comms/backlog.md` → latest brief → `docs/comms/status.md` → `docs/comms/logs/context.md`
- Owns: `CLAUDE.md`, `AGENTS.md`, `docs/comms/backlog.md`, `docs/comms/briefs/*.md`, `docs/comms/logs/context.md`, `.agents/`
- Never touches: `frontend/src/`, `core/python/`, `api/python/`, `supabase/migrations/`
- Conventions: role contract from `initiation.md`, brief format, audit protocol

**`.agents/build/backend/INSTRUCTIONS.md`** — Backend builder:
- Identity: implements database migrations, Pydantic models, API routes, core services
- Read order: This file → `.agents/build/AGENT.md` → active brief → `core/python/config.py` → `core/python/db.py` → `core/python/models/` → `supabase/migrations/`
- Owns: `supabase/migrations/`, `core/python/models/`, `core/python/services/`, `api/python/`
- Reads: `frontend/src/types/` (to verify TypeScript type compatibility)
- Never touches: `frontend/src/components/`, `frontend/src/app/`, `CLAUDE.md`, `AGENTS.md`, `.agents/`, `docs/comms/briefs/`, `docs/comms/backlog.md`
- Conventions: Pydantic model patterns, thin route pattern, db.py access only, httpx for HTTP, error handling (422/404/500)

**`.agents/build/frontend/INSTRUCTIONS.md`** — Frontend builder:
- Identity: implements React components, pages, TypeScript types, and styling
- Read order: This file → `.agents/build/AGENT.md` → active brief → `frontend/DESIGN.md` → `frontend/tailwind.config.ts` → `frontend/src/types/` → `frontend/src/components/ui/`
- Owns: `frontend/src/`, `frontend/DESIGN.md`
- Reads: `core/python/models/` (to mirror Pydantic types in TypeScript)
- Never touches: `core/python/`, `api/python/`, `supabase/`, `CLAUDE.md`, `AGENTS.md`, `.agents/`, `docs/comms/briefs/`, `docs/comms/backlog.md`
- Conventions: Terminal-wide design directive, strict TypeScript, no `any`, Tailwind `brodus-*` tokens, Panel/PillToggle patterns, lucide-react icons

**`.agents/research/AGENT.md`** — Research group context:
- Link to research playbooks in `research/prompts/`
- Data access patterns (how to read from and write to the artifact store)
- Report quality standards
- Feedback loop protocol (how research outputs feed back into playbook refinement)

**`.agents/research/equity/INSTRUCTIONS.md`** — Equity research agent:
- Identity: executes investment playbooks, generates company reports and scorecards
- Read order: This file → `.agents/research/AGENT.md` → assigned playbook → entity data from Supabase
- Owns: `research/reports/` (generated artifacts)
- Reads: `research/prompts/` (playbooks), data layer (via API or direct Supabase read)
- Never touches: `frontend/`, `core/python/`, `api/python/`, `supabase/migrations/`, any docs in `docs/comms/`
- Conventions: playbook compliance, verification scoring, structured output format

### 6. Modular Application Convention

Establish the domain-scoped service pattern for the application codebase. This is a convention document, not a code change — it gets applied as new features are built.

**Add to `.agents/build/AGENT.md`:**

```
## Domain Module Convention

Business logic is organized by domain. Each domain gets:

core/python/
  models/[domain].py        ← Pydantic models (data contract)
  services/[domain].py      ← Business logic (CRUD, validation, aggregation)

api/python/
  [domain]/                  ← API routes (thin — validate, call service, format response)

frontend/src/
  types/[domain].ts          ← TypeScript types (mirrors Pydantic models)
  components/[domain]/       ← Domain-specific components
  app/[domain]/page.tsx      ← Domain page

Domains share the data layer (db.py, config.py) and the design system
(components/ui/, tailwind tokens) but do NOT import each other's services
directly. Cross-domain data flows through shared models or API calls.

Current domains: journal, watchlist, research
Planned domains: portfolio, deals, operations
```

### 7. Documentation Restructuring

This section addresses the documentation reorganization discussed with the product owner on 2026-02-10.

**7a. Move `initiation.md` to `.agents/`**

Move `docs/initiation.md` → `.agents/initiation.md`. This is the boot sequence for all agents — it belongs at the root of the agent infrastructure directory, not buried inside docs. All references in other files must be updated.

**7b. Dissolve `docs/app/`**

The `docs/app/` directory is vague and mixes concerns. Redistribute its contents:

| Current location | Destination | Rationale |
|------------------|-------------|-----------|
| `docs/app/orchestration.md` | Absorbed into `.agents/protocol.md` + `.agents/registry.md` | Agent infrastructure, not app documentation. The task delegation matrix, communication flow, and daily operating loop belong in the agent system. |
| `docs/app/schema.md` | `docs/prd/database/schema.md` | Database schema is a product requirement reference. |
| `docs/app/architecture.md` | `docs/architecture.md` (flat in docs root) | System-level doc stays in docs but doesn't need a subdirectory. |
| `docs/app/roadmap.md` | `docs/roadmap.md` (flat in docs root) | Same — promote to docs root. Add cross-reference note to `docs/comms/backlog.md`. |

After redistribution, delete the `docs/app/` directory.

**7c. Merge `docs/comms/protocol.md` into `.agents/protocol.md`**

The comms protocol file describes the async handoff flow between agents. This is agent communication protocol and belongs in `.agents/`. Merge its content into `.agents/protocol.md` (which already covers the brief lifecycle). Delete `docs/comms/protocol.md` after merge.

**7d. Create `docs/prd/` directory**

Establish a domain-scoped PRD (Product Requirements Document) system:

```
docs/prd/
├── overview.md               ← Product vision, user personas, success metrics
│                                (migrated from existing PRD.md content)
├── database/
│   └── schema.md             ← Human-readable schema reference (moved from docs/app/)
├── frontend/
│   ├── design-system.md      ← Terminal-wide design directive (references frontend/DESIGN.md)
│   ├── journal.md            ← Journal page requirements
│   ├── watchlist.md          ← Watchlist page requirements
│   └── research.md           ← Research page requirements
├── backend/
│   ├── api-conventions.md    ← Route patterns, error handling, auth strategy
│   ├── journal-api.md        ← Journal API requirements
│   └── watchlist-api.md      ← Watchlist API requirements
└── pipelines/
    ├── ingestion.md          ← Feed and filing ingestion requirements
    ├── enrichment.md         ← Market data enrichment requirements
    └── reports.md            ← AI report generation requirements
```

Not all PRD files need to be written in this brief — the directory structure and `overview.md` are created now. Domain-specific PRDs are written incrementally as each area is briefed. Briefs reference relevant PRDs ("See `docs/prd/frontend/journal.md`"). PRDs are persistent and always current; briefs are ephemeral and get archived.

**7e. Delete `docs/README.md`**

Already completed (2026-02-10). The docs README was a stale directory index that conflicted with the root README. Its function is replaced by `docs/STRUCTURE.md`.

**7f. Create `docs/STRUCTURE.md`**

Already completed (2026-02-10). This is the documentation map — a diagram showing where every type of document lives, naming conventions, ownership rules, and cross-referencing guidance. Must be updated whenever the documentation structure changes.

### 8. Update Existing Files

**`CLAUDE.md`** — Update the "Agent Roles & Communication" section:
```
See `.agents/initiation.md` for the role contract and boot sequence.
See `.agents/registry.md` for the full agent directory.
See `.agents/protocol.md` for communication format and brief lifecycle.
Each agent's scoped instructions live in `.agents/[group]/[specialization]/INSTRUCTIONS.md`.
```

Also update the "Project Structure" tree to include `.agents/`, `docs/prd/`, and remove `docs/app/`.

**`AGENTS.md`** — Reduce to a thin pointer:
```
## Scoped Instructions

Your detailed, role-specific instructions are in `.agents/build/backend/INSTRUCTIONS.md`
(or `.agents/build/frontend/INSTRUCTIONS.md` if you're working on frontend tasks).

Read your scoped instructions file at the start of every session. It defines your
read order, file ownership boundaries, and domain conventions.
```

Remove Codex-specific operating instructions that will now live in `.agents/build/backend/INSTRUCTIONS.md`.

**`docs/roadmap.md`** (after move to docs root) — Add a note at the top:
```
> **Active execution queue:** `docs/comms/backlog.md`
> This roadmap is the long-term feature vision. The backlog is what's being built now.
```

**`docs/comms/backlog.md`** — Add cross-reference:
```
> **Long-term roadmap:** `docs/roadmap.md`
```

---

## Files to Create

| File | Description |
|------|-------------|
| `.agents/initiation.md` | Boot sequence (moved from `docs/initiation.md`) |
| `.agents/README.md` | How the agent system works |
| `.agents/registry.md` | Master agent index |
| `.agents/protocol.md` | Communication protocol + brief lifecycle (merges `docs/comms/protocol.md` + `docs/app/orchestration.md` content) |
| `.agents/build/AGENT.md` | Build group shared context |
| `.agents/build/orchestrator/INSTRUCTIONS.md` | Claude's scoped instructions |
| `.agents/build/backend/INSTRUCTIONS.md` | Backend builder instructions |
| `.agents/build/frontend/INSTRUCTIONS.md` | Frontend builder instructions |
| `.agents/research/AGENT.md` | Research group shared context |
| `.agents/research/equity/INSTRUCTIONS.md` | Equity research agent instructions |
| `docs/STRUCTURE.md` | Documentation structure diagram (already created) |
| `docs/prd/overview.md` | Product vision (migrated from existing PRD.md) |
| `docs/prd/database/schema.md` | Schema reference (moved from `docs/app/schema.md`) |
| `docs/prd/frontend/` | Directory for frontend PRDs (populated incrementally) |
| `docs/prd/backend/` | Directory for backend PRDs (populated incrementally) |
| `docs/prd/pipelines/` | Directory for pipeline PRDs (populated incrementally) |

## Files to Move

| From | To |
|------|----|
| `docs/initiation.md` | `.agents/initiation.md` |
| `docs/app/architecture.md` | `docs/architecture.md` |
| `docs/app/roadmap.md` | `docs/roadmap.md` |
| `docs/app/schema.md` | `docs/prd/database/schema.md` |

## Files to Delete

| File | Reason |
|------|--------|
| `docs/README.md` | Replaced by `docs/STRUCTURE.md` (already deleted) |
| `docs/comms/protocol.md` | Merged into `.agents/protocol.md` |
| `docs/app/orchestration.md` | Absorbed into `.agents/protocol.md` + `.agents/registry.md` |
| `docs/app/` (directory) | Dissolved — contents redistributed |

## Files to Modify

| File | Change |
|------|--------|
| `CLAUDE.md` | Add `.agents/` references, update project structure tree, remove `docs/app/` references |
| `AGENTS.md` | Reduce to thin pointer to `.agents/` |
| `docs/comms/backlog.md` | Add roadmap cross-reference |

## Files NOT to Modify

- `frontend/` — no code changes in this brief
- `core/python/` — no code changes (service convention applied in future briefs)
- `api/python/` — no code changes
- `supabase/migrations/` — no migrations
- `docs/comms/status.md` — Codex's territory

---

## Commit Strategy

This brief is executed by Claude (orchestrator), not Codex. All changes are documentation and organizational structure. Commit in this order:

1. `feat: create .agents directory with registry, protocol, and instruction templates`
   - All files in `.agents/` including `initiation.md` (moved from docs)
2. `refactor: restructure docs — dissolve docs/app, create docs/prd, add STRUCTURE.md`
   - Move `docs/app/architecture.md` → `docs/architecture.md`
   - Move `docs/app/roadmap.md` → `docs/roadmap.md`
   - Move `docs/app/schema.md` → `docs/prd/database/schema.md`
   - Create `docs/prd/overview.md` and domain subdirectories
   - Create `docs/STRUCTURE.md`
   - Delete `docs/app/orchestration.md`, `docs/comms/protocol.md`, `docs/README.md`, `docs/app/`
3. `refactor: set up briefs archive and move completed Brief 000`
   - `docs/comms/briefs/archive/000-rename-and-refactor.md`
4. `docs: update CLAUDE.md, AGENTS.md, and backlog with new structure references`
   - `CLAUDE.md`, `AGENTS.md`, `docs/comms/backlog.md`

---

## Acceptance Criteria

### Agent Infrastructure
- [ ] `.agents/registry.md` contains entries for all 4 initial agents with complete field data
- [ ] Each `INSTRUCTIONS.md` follows the template structure (Identity, Read Order, Scope, Conventions, Output Format)
- [ ] Agent scope boundaries are non-overlapping — no two agents own the same files
- [ ] `.agents/protocol.md` documents the full brief lifecycle (Draft → Ready → In Progress → Review → Archived)
- [ ] `.agents/protocol.md` incorporates content from both `docs/comms/protocol.md` and `docs/app/orchestration.md`
- [ ] `.agents/initiation.md` exists and read order starts with scoped agent instructions

### Documentation Restructuring
- [ ] `docs/app/` directory no longer exists — all contents redistributed
- [ ] `docs/architecture.md` exists at docs root (moved from `docs/app/`)
- [ ] `docs/roadmap.md` exists at docs root (moved from `docs/app/`) with backlog cross-reference
- [ ] `docs/prd/` directory exists with `overview.md` and domain subdirectories
- [ ] `docs/prd/database/schema.md` exists (moved from `docs/app/schema.md`)
- [ ] `docs/STRUCTURE.md` exists and accurately maps the new structure
- [ ] `docs/README.md` is deleted
- [ ] `docs/comms/protocol.md` is deleted (merged into `.agents/protocol.md`)
- [ ] Brief 000 is in `docs/comms/briefs/archive/` with its audit results intact

### Cross-References
- [ ] `CLAUDE.md` project structure section reflects new layout (includes `.agents/`, `docs/prd/`, no `docs/app/`)
- [ ] `AGENTS.md` reduced to thin pointer to `.agents/`
- [ ] `docs/comms/backlog.md` cross-references `docs/roadmap.md`
- [ ] `docs/roadmap.md` cross-references `docs/comms/backlog.md`
- [ ] No code files were modified — this brief is documentation-only

---

## Design Decisions and Rationale

**Why `.agents/` at project root (not inside `docs/`)?**
Agent instructions are operational infrastructure, not project documentation. They're analogous to `.github/` or `.cursor/` — tooling configuration that sits alongside the codebase. Keeping them at root also makes them easy to reference from CLAUDE.md and AGENTS.md without deep nesting.

**Why scoped INSTRUCTIONS.md per agent instead of one big file?**
Context window efficiency. When you invoke a backend builder, it loads only its INSTRUCTIONS.md + group AGENT.md + the active brief. It doesn't need to parse frontend design tokens, research playbook conventions, or orchestrator protocols. Smaller, focused context → better output quality.

**Why group-level AGENT.md + specialization-level INSTRUCTIONS.md?**
Two-tier inheritance. The group file carries shared conventions (all build agents follow the same code standards). The specialization file carries role-specific scope and context. A new agent type can be added by creating a new INSTRUCTIONS.md under an existing group without duplicating shared conventions.

**Why not restructure `core/python/` in this brief?**
The service layer pattern (`core/python/services/`) is a convention, not a one-time migration. It gets applied incrementally as each domain is built. Brief 002 (Trade Journal) will create the first service. Restructuring existing code for its own sake adds risk with no user-facing value.

**Why a briefs archive instead of deleting completed briefs?**
Archived briefs serve as the project's ticket history — a permanent record of what was specified, what was built, and what the audit found. This is invaluable for understanding why past decisions were made and for onboarding new agents that need historical context.

---

## Future Extensions

These are NOT part of this brief but are enabled by the infrastructure it creates:

- **Agent dashboard in frontend:** The registry becomes a data source for a Brodus admin page showing agent status, active briefs, and task history.
- **Automated agent dispatch:** The orchestrator reads the registry to route incoming tasks to the right agent based on task type and agent capabilities.
- **Agent skills:** Each agent's directory can grow a `skills/` subdirectory with reusable playbooks, templates, and tools specific to that agent's domain.
- **New agent groups:** `ops/` for operations agents, `data/` for data pipeline agents, etc. — each follows the same directory pattern.
- **Cross-agent workflows:** Protocol.md can be extended with a handoff format for multi-agent tasks (e.g., backend agent builds the API, then hands off to frontend agent to wire the UI).

---

## Audit Results

**Reviewed by:** Claude (orchestrator)
**Date:** 2026-02-10
**Verdict: PASS — all 20 acceptance criteria met**

### Agent Infrastructure (6/6 pass)

| Criterion | Result |
|-----------|--------|
| Registry contains all 4 agents with complete field data | **PASS** |
| Each INSTRUCTIONS.md follows template structure | **PASS** |
| Agent scope boundaries are non-overlapping | **PASS** |
| Protocol documents full brief lifecycle | **PASS** |
| Protocol incorporates orchestration.md content | **PASS** |
| Initiation.md exists with correct read order | **PASS** |

### Documentation Restructuring (9/9 pass)

| Criterion | Result |
|-----------|--------|
| `docs/app/` directory dissolved | **PASS** |
| `docs/architecture.md` at docs root | **PASS** |
| `docs/roadmap.md` at docs root with backlog cross-ref | **PASS** |
| `docs/prd/` with overview.md and subdirectories | **PASS** |
| `docs/prd/database/schema.md` exists | **PASS** |
| `docs/STRUCTURE.md` exists | **PASS** |
| `docs/README.md` deleted | **PASS** |
| `docs/comms/protocol.md` deleted | **PASS** |
| Brief 000 archived with audit results | **PASS** |

### Cross-References (5/5 pass)

| Criterion | Result |
|-----------|--------|
| CLAUDE.md includes `.agents/` and `docs/prd/`, no `docs/app/` | **PASS** |
| AGENTS.md reduced to thin pointer | **PASS** |
| Backlog cross-references roadmap | **PASS** |
| Roadmap cross-references backlog | **PASS** |
| No application code modified | **PASS** |

### Post-Audit Fix

`.agents/README.md` was deleted post-audit (product owner feedback). Its "Adding New Agents" and "Adding New Groups" content was folded into `.agents/registry.md`. One README per repo.
