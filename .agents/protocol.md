# Analyst — Agent Communication Protocol

How agents coordinate work and hand off tasks.

---

## Task Format

Tasks are assigned inline (via chat) or as markdown files. Every task specifies:

```
Agent: research/equity
Ticker: INTC
Playbook: semiconductors-and-accelerators.prompt.md
Deliverables: research/reports/intc.mar.md, research/reports/intc.mar.scorecard.md
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
Step 1: Equity agent → report + opinion block       (writes to research/reports/)
Step 2: Compliance agent → scorecard                 (writes to research/reports/)
Step 3: Bull + Bear + Macro agents → perspectives    (in-memory, parallel)
Step 4: Orchestrator → synthesis note (optional)     (chat output or markdown artifact)
```

Steps 1-2 are sequential. Steps 3 can run in parallel after Step 1 completes.
Step 4 runs after all perspectives are collected.

### Perspective Agents

Bull, Bear, and Macro agents are **lightweight and stateless**. They:
- Read the completed report (not the playbook)
- Return a structured `PerspectiveOpinion` JSON object
- Do NOT write files to disk
- Are orchestrated by the parent system, not self-directed

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

## Context Window Optimization

Agent boot sequence should consume < 2000 tokens:

1. Read `INSTRUCTIONS.md` (~80 lines)
2. Read assigned task (~20 lines)
3. Read relevant playbook (loaded as-needed, not on boot)

Do NOT read on boot: CLAUDE.md (orchestrator reads this), registry.md, protocol.md, unrelated reports.

## Delegation Matrix

| Task | Agent | Output |
|------|-------|--------|
| Generate investment report | research/equity | `research/reports/{ticker_lower}.{period}.md` |
| Run compliance scorecard | research/compliance | `research/reports/{ticker_lower}.{period}.scorecard.md` |
| Bull perspective | research/bull | `PerspectiveOpinion` (in-memory) |
| Bear perspective | research/bear | `PerspectiveOpinion` (in-memory) |
| Macro overlay | research/macro | `PerspectiveOpinion` (in-memory) |
| Synthesize opinions | orchestrator | recommendation + rationale |
| Architecture decision | orchestrator | `docs/`, `CLAUDE.md` |
| Playbook creation/edit | orchestrator | `research/playbooks/` |
