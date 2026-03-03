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
| **Owns** | `artifacts/{asset_class}/reports/*.md` (reports, not scorecards) |
| **Reads** | `.agents/playbooks/` (playbooks), assigned task, prior reports |
| **Never touches** | `.agents/`, `CLAUDE.md` |
| **Status** | Active |

---

## research/compliance

| Field | Value |
|-------|-------|
| **Name** | Compliance Verification Agent |
| **Group** | research |
| **Role** | Runs playbook compliance checks on generated reports, produces scorecards |
| **Entry point** | `.agents/research/compliance/INSTRUCTIONS.md` |
| **Owns** | `artifacts/{asset_class}/scorecards/*.scorecard.md` |
| **Reads** | `.agents/playbooks/`, `artifacts/`, `.agents/compliance/rules.json` |
| **Never touches** | `.agents/`, `CLAUDE.md` |
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
| **Reads** | `## Summary for Perspectives` + `## Opinion` from completed report |
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
| **Reads** | `## Summary for Perspectives` + `## Opinion` from completed report |
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
| **Reads** | `## Summary for Perspectives` + `## Opinion` from completed report, macro data via web search |
| **Never touches** | All files. Output is in-memory only. |
| **Status** | Active |

---

## research/synthesis

| Field | Value |
|-------|-------|
| **Name** | Synthesis Agent |
| **Group** | research |
| **Role** | Reconciles equity report, compliance scorecard, and bull/bear/macro perspectives into a final recommendation |
| **Entry point** | `.agents/research/synthesis/INSTRUCTIONS.md` |
| **Owns** | `artifacts/{asset_class}/synthesis/*.synthesis.md` |
| **Reads** | Report (Summary + Opinion only), scorecard (grade only), perspectives JSON |
| **Never touches** | `.agents/`, `CLAUDE.md`, reports, scorecards |
| **Status** | Active |

---

## orchestrator

| Field | Value |
|-------|-------|
| **Name** | Claude (Orchestrator) |
| **Group** | — (top-level) |
| **Role** | Interprets user intent, detects playbooks, chains agents, delivers results |
| **Entry point** | `CLAUDE.md` + `skills/research/SKILL.md` |
| **Owns** | `CLAUDE.md`, `.agents/`, `skills/` |
| **Reads** | Everything |
| **Never touches** | Should delegate report and instruction edits to research agents |
| **Status** | Active |

---

## Research Workflow: Full Analysis Pipeline

```
1. Orchestrator resolves playbook via index.yaml         → playbook auto-detection
2. Equity agent generates report + opinion block          → artifacts/{asset_class}/reports/
3. Compliance agent scores the report                     → artifacts/{asset_class}/scorecards/
4. Bull, Bear, Macro agents read summary in parallel      → PerspectiveOpinion (in-memory)
5. Synthesis agent reconciles all views                   → artifacts/{asset_class}/synthesis/
6. Orchestrator delivers results to user                  → chat output with links
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
