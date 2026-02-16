# Analyst — Agent Registry

Master index of all agents. Consult this file to route tasks to the correct agent.

---

## research/equity

| Field | Value |
|-------|-------|
| **Name** | Equity Research Agent |
| **Group** | research |
| **Role** | Executes investment playbooks, generates company reports with structured opinion blocks |
| **Entry point** | `.agents/research/equity/INSTRUCTIONS.md` |
| **Owns** | `research/reports/*.md` (reports, not scorecards) |
| **Reads** | `research/prompts/` (playbooks), Supabase (report history), assigned task |
| **Never touches** | `analyst/` (backend code), `docs/`, `.agents/`, `CLAUDE.md` |
| **Status** | Active |

---

## research/compliance

| Field | Value |
|-------|-------|
| **Name** | Compliance Verification Agent |
| **Group** | research |
| **Role** | Runs prompt compliance checks on generated reports, produces scorecards |
| **Entry point** | `.agents/research/compliance/INSTRUCTIONS.md` |
| **Owns** | `research/reports/*.scorecard.md` |
| **Reads** | `research/prompts/`, `research/reports/`, `analyst/services/compliance.py` |
| **Never touches** | `analyst/` (backend code), `docs/`, `.agents/`, `CLAUDE.md` |
| **Status** | Active |

---

## research/bull

| Field | Value |
|-------|-------|
| **Name** | Bull Perspective Agent |
| **Group** | research |
| **Role** | Reads a completed report and produces the strongest data-grounded bull case |
| **Entry point** | `.agents/research/bull/INSTRUCTIONS.md` |
| **Owns** | Nothing — returns structured `PerspectiveOpinion` to orchestrator |
| **Reads** | Completed report for assigned ticker/period |
| **Never touches** | All files. Output is in-memory only. |
| **Status** | Active |

---

## research/bear

| Field | Value |
|-------|-------|
| **Name** | Bear Perspective Agent |
| **Group** | research |
| **Role** | Reads a completed report and produces the strongest data-grounded bear case |
| **Entry point** | `.agents/research/bear/INSTRUCTIONS.md` |
| **Owns** | Nothing — returns structured `PerspectiveOpinion` to orchestrator |
| **Reads** | Completed report for assigned ticker/period |
| **Never touches** | All files. Output is in-memory only. |
| **Status** | Active |

---

## research/macro

| Field | Value |
|-------|-------|
| **Name** | Macro Overlay Agent |
| **Group** | research |
| **Role** | Reads a completed report and assesses how the current macro regime affects the thesis |
| **Entry point** | `.agents/research/macro/INSTRUCTIONS.md` |
| **Owns** | Nothing — returns structured `PerspectiveOpinion` to orchestrator |
| **Reads** | Completed report, macro data via web search |
| **Never touches** | All files. Output is in-memory only. |
| **Status** | Active |

---

## build/backend

| Field | Value |
|-------|-------|
| **Name** | Backend Builder |
| **Group** | build |
| **Role** | Implements Python backend — models, services, API routes, CLI, database migrations |
| **Entry point** | `.agents/build/backend/INSTRUCTIONS.md` |
| **Owns** | `analyst/`, `tests/`, `pyproject.toml`, `migrations/` |
| **Reads** | `CLAUDE.md`, `docs/prd.md`, `docs/architecture.md`, assigned task |
| **Never touches** | `research/reports/`, `research/prompts/`, `.agents/`, `CLAUDE.md` |
| **Status** | Active |

---

## orchestrator

| Field | Value |
|-------|-------|
| **Name** | Claude (Orchestrator) |
| **Group** | — (top-level) |
| **Role** | Interprets user intent, writes tasks, audits results, maintains project intelligence |
| **Entry point** | `CLAUDE.md` |
| **Owns** | `CLAUDE.md`, `.agents/`, `docs/` |
| **Reads** | Everything |
| **Never touches** | Should delegate code changes to build/backend or research agents |
| **Status** | Active |

---

## Research Workflow: Full Analysis Pipeline

```
1. Equity agent generates report + opinion block     → research/reports/{ticker}.{period}.md
2. Compliance agent scores the report                → research/reports/{ticker}.{period}.scorecard.md
3. Bull, Bear, Macro agents read report in parallel  → PerspectiveOpinion (in-memory)
4. Synthesis service combines all opinions            → SynthesizedOpinion (stored in DB)
```

---

## Planned Agents

| ID | Group | Role | Status |
|----|-------|------|--------|
| `data/edgar` | data | SEC EDGAR data ingestion and filing parsing | Planned |
| `data/enrichment` | data | Financial data enrichment — prices, fundamentals, estimates | Planned |

---

## Adding a New Agent

1. Create a directory under the appropriate group (e.g., `.agents/research/sentiment/`)
2. Add an `INSTRUCTIONS.md` with: Identity, Read Order, Scope, Conventions, Output Format
3. Register the agent in this file
4. Keep INSTRUCTIONS.md lean — under 100 lines. Agent context windows are precious.
