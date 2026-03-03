# Analyst — Agent Communication Protocol

How agents coordinate work and hand off tasks.

---

## Task Format

Tasks are assigned inline (via chat) or as markdown files. Every task specifies:

```
Agent: research/equity
Ticker: INTC
Playbook: semiconductors-and-accelerators.prompt.md
Deliverables: artifacts/equities/reports/intc.mar.md, artifacts/equities/scorecards/intc.mar.scorecard.md
```

## Task Lifecycle

```
Assigned → In Progress → Delivered → Reviewed → Done
```

| Stage | Who | What |
|-------|-----|------|
| **Assigned** | Orchestrator | Specifies agent, ticker, playbook, deliverables |
| **In Progress** | Agent | Reads playbook, gathers data, generates output |
| **Delivered** | Agent | Writes artifacts to specified paths |
| **Reviewed** | Orchestrator | Audits against playbook, checks scorecard |
| **Done** | Orchestrator | Accepts or requests revision |

## Full Analysis Pipeline

For a complete analysis (report + scorecard + perspectives + synthesis):

```
Phase 0: Orchestrator resolves playbook from index.yaml       → auto-detection
Phase 1: Equity agent → report + opinion + perspective summary → artifacts/{asset_class}/reports/
Phase 2: Compliance agent → scorecard from sections index      → artifacts/{asset_class}/scorecards/
Phase 3: Bull + Bear + Macro agents → perspectives from summary → artifacts/{asset_class}/perspectives/ (JSON)
Phase 4: Synthesis agent → final recommendation                → artifacts/{asset_class}/synthesis/
Phase 5: Orchestrator → delivers all artifacts to user         → chat output with links
```

Phases 1-2 are sequential. Phase 3 agents can run in parallel after Phase 1 completes.
Phase 4 runs after Phase 3 perspectives are collected. Phase 2 can run in parallel with Phase 3.

### Playbook Auto-Detection

Before Phase 1, the orchestrator resolves which playbook to use:

1. Read `.agents/playbooks/index.yaml`
2. Match ticker directly against `tickers` arrays
3. If no direct match, use web search to identify the company's sector
4. Match sector against `keywords` arrays in the index
5. Fall back to `_default.prompt.md` if no match found

### Perspective Agents

Bull, Bear, and Macro agents are **lightweight and stateless**. They:
- Read `## Summary for Perspectives` and `## Opinion` from the completed report
- Fallback to full report only if summary is missing
- Return a structured `PerspectiveOpinion` JSON object
- Do NOT write files to disk — the orchestrator collects and saves the perspectives JSON
- Are orchestrated by the parent system, not self-directed

### Synthesis Agent

The synthesis agent reconciles all pipeline outputs:
- Reads: Report (Summary + Opinion only), scorecard (overall grade only), perspectives JSON
- Produces: Final recommendation with conviction rating, position framework, monitoring triggers
- Writes to: `artifacts/{asset_class}/synthesis/{ticker_lower}.{period}.synthesis.md`

### Compliance Input Contract

Compliance should score from:
1. `.agents/compliance/rules.json`
2. `.agents/playbooks/{name}/sections.json` (primary)
3. `artifacts/{asset_class}/reports/{ticker_lower}.{period}.md`

Fallback path:
- If `{name}/sections.json` is missing, compliance may load full playbook (`{name}/playbook.prompt.md`) and continue.

### Playbook Index Contract

Every playbook includes a sibling index file:
- Playbook: `.agents/playbooks/{name}/playbook.prompt.md`
- Index: `.agents/playbooks/{name}/sections.json`

The index captures only: section IDs/titles, required elements per section, and global structural requirements.

Schema definition: `.agents/playbooks/sections.schema.json`

### Crypto Experiment Overlay

For crypto report runs, apply the Droyd experiment layer before finalizing opinion:
- Routing map: `.agents/templates/api-routing-index.yaml`
- Experiment instructions: `.agents/templates/droyd-crypto-experiments.md`

Execution: run at least 2 experiment modes, capture high-signal findings, corroborate before elevating confidence. If provider unavailable, continue with fallback research and mark experiment as skipped.

## Agent Rules

1. **Agents own their output paths.** Don't write outside your scope.
2. **Read your INSTRUCTIONS.md first.** It defines what you can and cannot touch.
3. **Never fabricate data.** If a metric isn't available, say so.
4. **Save work frequently.** Don't risk losing output to context limits.
5. **Keep it lean.** Minimize files read on boot. Only load what you need for the current task.
6. **Use compressed handoffs first.** Prefer section indexes and perspective summaries over full artifacts.

## Context Window Optimization

Agent boot sequence should consume < 2000 tokens:

1. Read `INSTRUCTIONS.md` (~80 lines)
2. Read assigned task (~20 lines)
3. Read only required supporting artifact:
   - Equity: assigned full playbook
   - Compliance: `{name}/sections.json` (full playbook only as fallback)
   - Perspectives: `## Summary for Perspectives` + `## Opinion`
   - Synthesis: Report summary + Opinion, scorecard grade, perspectives JSON

Do NOT read on boot: CLAUDE.md (orchestrator reads this), registry.md, protocol.md, unrelated reports.

## Target Token Budget Per Run

Design target: < 80K tokens end-to-end for full pipeline.

| Phase | Budget | Notes |
|-------|--------|-------|
| Setup | < 2K | Index lookup + dir creation |
| Equity | 28–40K | Web research + full report (largest phase) |
| Compliance | 8–15K | Section index + report scoring |
| Perspectives | 12–20K | Three agents, compressed input |
| Synthesis | 5–10K | Lightweight reconciliation |

Token sink controls:
1. Avoid full playbook re-read in compliance with `{name}/sections.json`.
2. Avoid full report re-read in perspectives via `## Summary for Perspectives`.
3. Use targeted search templates before exploratory search.
4. Load `rules.json` once per compliance run.
5. Prefer single-pass scoring and extraction.

## Delegation Matrix

| Task | Agent | Output |
|------|-------|--------|
| Detect playbook | orchestrator | playbook filename from `index.yaml` |
| Generate investment report | research/equity | `artifacts/{asset_class}/reports/{ticker_lower}.{period}.md` |
| Run compliance scorecard | research/compliance | `artifacts/{asset_class}/scorecards/{ticker_lower}.{period}.scorecard.md` |
| Bull perspective | research/bull | `PerspectiveOpinion` (in-memory) |
| Bear perspective | research/bear | `PerspectiveOpinion` (in-memory) |
| Macro overlay | research/macro | `PerspectiveOpinion` (in-memory) |
| Synthesize recommendation | research/synthesis | `artifacts/{asset_class}/synthesis/{ticker_lower}.{period}.synthesis.md` |
| Architecture decision | orchestrator | `CLAUDE.md`, `.agents/` |
| Playbook creation/edit | orchestrator | `.agents/playbooks/` |
