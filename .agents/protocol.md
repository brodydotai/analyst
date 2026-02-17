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

For a complete analysis (report + scorecard + perspectives):

```
Step 1: Equity agent → report + opinion + perspective summary          (writes to artifacts/{asset_class}/reports/)
Step 2: Compliance agent → scorecard from sections index + report      (writes to artifacts/{asset_class}/scorecards/)
Step 3: Bull + Bear + Macro agents → perspectives from summary         (in-memory, parallel)
Step 4: Orchestrator → synthesis note (optional)                       (chat output or markdown artifact)
```

Steps 1-2 are sequential. Steps 3 can run in parallel after Step 1 completes.
Step 4 runs after all perspectives are collected.

### Perspective Agents

Bull, Bear, and Macro agents are **lightweight and stateless**. They:
- Read `## Summary for Perspectives` and `## Opinion` from the completed report
- Fallback to full report only if summary is missing
- Return a structured `PerspectiveOpinion` JSON object
- Do NOT write files to disk
- Are orchestrated by the parent system, not self-directed

### Compliance Input Contract

Compliance should score from:
1. `.agents/compliance/rules.json`
2. `.agents/playbooks/{name}.sections.json` (primary)
3. `artifacts/{asset_class}/reports/{ticker_lower}.{period}.md`

Fallback path:
- If `{name}.sections.json` is missing, compliance may load full playbook (`{name}.prompt.md`) and continue.

### Playbook Index Contract

Every playbook may include a sibling index file:
- Playbook: `.agents/playbooks/{name}.prompt.md`
- Index: `.agents/playbooks/{name}.sections.json`

The index captures only:
- section IDs and section titles
- required elements per section
- global structural requirements

Schema definition:
- `.agents/playbooks/sections.schema.json`

### Crypto Experiment Overlay

For crypto report runs, apply the Droyd experiment layer before finalizing opinion:
- Routing map: `.agents/templates/api-routing-index.yaml`
- Experiment instructions: `.agents/templates/droyd-crypto-experiments.md`

Execution expectations:
1. Run at least 2 experiment modes from the runbook.
2. Capture query settings and high-signal findings in operator notes.
3. Corroborate high-impact claims before elevating confidence.
4. If provider unavailable, continue with fallback research and mark experiment status as skipped.

### Synthesis

Synthesis is handled by the orchestrator using:
- Primary opinion as the anchor view
- Perspective confidence weighting
- Explicit disagreement handling (rating and thesis spread)
- A clear final recommendation with invalidation criteria

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
   - Compliance: `{name}.sections.json` (full playbook only as fallback)
   - Perspectives: `## Summary for Perspectives` + `## Opinion`

Do NOT read on boot: CLAUDE.md (orchestrator reads this), registry.md, protocol.md, unrelated reports.

## Target Token Budget Per Run

Design target: reduce end-to-end run from ~150K tokens to <80K.

Approximate budget after optimization:
- Equity agent: 28K-40K (dominant by design)
- Compliance agent: 8K-15K (index + report pass + rules)
- Bull + Bear + Macro combined: 12K-20K (shared compressed summary path)
- Orchestration + synthesis overhead: 5K-10K

Token sink controls:
1. Avoid full playbook re-read in compliance with `{name}.sections.json`.
2. Avoid full report re-read in perspectives via `## Summary for Perspectives`.
3. Use targeted search templates before exploratory search.
4. Load `rules.json` once per compliance run.
5. Prefer single-pass scoring and extraction.

## Delegation Matrix

| Task | Agent | Output |
|------|-------|--------|
| Generate investment report | research/equity | `artifacts/{asset_class}/reports/{ticker_lower}.{period}.md` |
| Run compliance scorecard | research/compliance | `artifacts/{asset_class}/scorecards/{ticker_lower}.{period}.scorecard.md` |
| Bull perspective | research/bull | `PerspectiveOpinion` (in-memory) |
| Bear perspective | research/bear | `PerspectiveOpinion` (in-memory) |
| Macro overlay | research/macro | `PerspectiveOpinion` (in-memory) |
| Synthesize opinions | orchestrator | recommendation + rationale |
| Architecture decision | orchestrator | `CLAUDE.md`, `.agents/` |
| Playbook creation/edit | orchestrator | `.agents/playbooks/` |
