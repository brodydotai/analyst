# Brodus — Agent Registry

Master index of all agents. Consult this file to route tasks to the correct agent.

---

## build/orchestrator

| Field | Value |
|-------|-------|
| **Name** | Claude (Orchestrator) |
| **Group** | build |
| **Role** | Interprets user intent, writes briefs, audits results, maintains backlog and agent infrastructure |
| **Entry point** | `.agents/build/orchestrator/INSTRUCTIONS.md` |
| **Owns** | `CLAUDE.md`, `AGENTS.md`, `.agents/`, `docs/comms/backlog.md`, `docs/comms/briefs/*.md`, `docs/comms/logs/context.md`, `docs/STRUCTURE.md`, `docs/prd/` |
| **Reads** | `docs/comms/status.md`, `docs/comms/logs/changelog.md`, `docs/comms/logs/best-practices.md`, `docs/roadmap.md`, `docs/architecture.md` |
| **Never touches** | `frontend/src/`, `supabase/migrations/`, `docs/comms/status.md` (Codex's territory) |
| **Status** | Active |

---

## build/backend

| Field | Value |
|-------|-------|
| **Name** | Backend Builder |
| **Group** | build |
| **Role** | Implements database migrations, Zod schemas, API routes, and service layer |
| **Entry point** | `.agents/build/backend/INSTRUCTIONS.md` |
| **Owns** | `supabase/migrations/`, `frontend/src/schemas/`, `frontend/src/services/`, `frontend/src/app/api/`, `frontend/src/types/`, `vercel.json` |
| **Reads** | `CLAUDE.md` (conventions), `frontend/src/components/` (data requirements), `docs/prd/database/`, `docs/prd/backend/`, active brief |
| **Never touches** | `frontend/src/components/`, `frontend/src/app/[pages]/page.tsx`, `CLAUDE.md`, `AGENTS.md`, `.agents/`, `docs/comms/briefs/`, `docs/comms/backlog.md` |
| **Status** | Active |

---

## build/frontend

| Field | Value |
|-------|-------|
| **Name** | Frontend Builder |
| **Group** | build |
| **Role** | Implements React components, pages, TypeScript types, and styling following the design system |
| **Entry point** | `.agents/build/frontend/INSTRUCTIONS.md` |
| **Owns** | `frontend/src/components/`, `frontend/src/app/[pages]/page.tsx`, `frontend/DESIGN.md` |
| **Reads** | `CLAUDE.md` (conventions), `frontend/src/schemas/` (type definitions), `docs/prd/frontend/`, active brief |
| **Never touches** | `frontend/src/app/api/`, `frontend/src/schemas/`, `frontend/src/services/`, `supabase/`, `CLAUDE.md`, `AGENTS.md`, `.agents/`, `docs/comms/briefs/`, `docs/comms/backlog.md` |
| **Status** | Active |

---

## research/equity

| Field | Value |
|-------|-------|
| **Name** | Equity Research Agent |
| **Group** | research |
| **Role** | Executes investment playbooks, generates company reports and scorecards |
| **Entry point** | `.agents/research/equity/INSTRUCTIONS.md` |
| **Owns** | `research/reports/` (generated artifacts) |
| **Reads** | `research/prompts/` (playbooks), data layer (via API or Supabase), assigned brief or task |
| **Never touches** | `frontend/`, `supabase/migrations/`, `docs/comms/`, `.agents/`, `CLAUDE.md`, `AGENTS.md` |
| **Status** | Active |

---

## Planned Agents

| ID | Group | Role | Status |
|----|-------|------|--------|
| `build/pm` | build | Project management — tracks milestones, dependencies, blockers | Planned |
| `research/macro` | research | Macro/thematic research — market-level analysis, sector rotations | Planned |
| `ops/monitoring` | ops | Portfolio monitoring — price alerts, filing alerts, position tracking | Planned |
| `ops/scheduling` | ops | Task scheduling — cron management, pipeline orchestration | Planned |
| `data/ingestion` | data | Data pipeline agent — feed ingestion, EDGAR sync, enrichment | Planned |

---

## Adding a New Agent

1. Create a directory under the appropriate group (e.g., `.agents/build/devops/`)
2. Add an `INSTRUCTIONS.md` following the template (Identity, Read Order, Scope, Conventions, Output Format — see any existing agent for reference)
3. Register the agent in this file with all required fields
4. Update `docs/STRUCTURE.md` to reflect the new agent

## Adding a New Group

1. Create a top-level directory under `.agents/` (e.g., `.agents/ops/`)
2. Add an `AGENT.md` with shared group conventions
3. Add agent specializations as subdirectories with `INSTRUCTIONS.md`
4. Register all new agents in this file
5. Update `docs/STRUCTURE.md`
