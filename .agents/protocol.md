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

For a complete analysis (report + perspectives + synthesis):

```
Step 1: Equity agent → report + opinion block       (writes to research/reports/)
Step 2: Compliance agent → scorecard                 (writes to research/reports/)
Step 3: Bull + Bear + Macro agents → perspectives    (in-memory, parallel)
Step 4: Synthesis service → synthesized opinion       (stored in DB via API)
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

The synthesis service (`analyst/services/synthesis.py`) combines opinions using:
- Primary opinion gets 2x weight (it's from the deep analysis)
- Each perspective weighted by its confidence x domain relevance
- Disagreement between perspectives reduces overall confidence
- Consensus level assessed by rating spread

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
| Generate investment report | research/equity | `research/reports/{ticker}.{period}.md` |
| Run compliance scorecard | research/compliance | `research/reports/{ticker}.{period}.scorecard.md` |
| Bull perspective | research/bull | `PerspectiveOpinion` (in-memory) |
| Bear perspective | research/bear | `PerspectiveOpinion` (in-memory) |
| Macro overlay | research/macro | `PerspectiveOpinion` (in-memory) |
| Synthesize opinions | synthesis service | `SynthesizedOpinion` (API/DB) |
| Backend feature | build/backend | `analyst/` Python code |
| Database migration | build/backend | `migrations/*.sql` |
| Architecture decision | orchestrator | `docs/`, `CLAUDE.md` |
| Playbook creation/edit | orchestrator | `research/prompts/` |
