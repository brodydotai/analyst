# Analyst — Investment Research Orchestration Framework

Operational context and boot instructions for the Analyst research pipeline.

## What This Is

Analyst is a self-contained, multi-agent investment research framework for Claude Cowork. Give it a ticker, get back a complete research package: structured report, compliance scorecard, bull/bear/macro perspectives, and synthesized recommendation.

## Quick Start

Say any of:
- `research NVDA`
- `analyze CLF`
- `run playbook on OKLO`
- `research watchlist https://www.tradingview.com/watchlists/12345678/`
- `analyze NVDA, CLF, COPX, MARA, OKLO`

The orchestrator skill at `skills/research/SKILL.md` drives the full single-ticker pipeline. The watchlist skill at `skills/watchlist/SKILL.md` handles batch runs from TradingView links or ticker lists (up to 10 tickers).

## Boot Sequence

On session start, the orchestrator reads:
1. This file (context + rules)
2. `skills/research/SKILL.md` (pipeline definition)
3. `.agents/playbooks/index.yaml` (ticker-to-playbook mapping)

Everything else is loaded on-demand by individual agents during execution.

## Pipeline Overview

```
Phase 0: Setup         → Resolve playbook, bootstrap output dirs
Phase 1: Equity        → Full research report with web data
Phase 2: Compliance    → Scorecard against playbook requirements
Phase 3: Perspectives  → Bull, Bear, Macro agents (parallel)
Phase 4: Synthesis     → Final recommendation reconciling all views
Phase 5: Deliver       → Present results with links to all artifacts
```

## Source of Truth

| What | Where |
|------|-------|
| Agent contracts | `.agents/research/{agent}/INSTRUCTIONS.md` |
| Playbooks | `.agents/playbooks/*.prompt.md` |
| Playbook index | `.agents/playbooks/index.yaml` |
| Section indexes | `.agents/playbooks/{name}/sections.json` |
| Compliance rules | `.agents/compliance/rules.json` |
| Templates | `.agents/templates/` |
| Output artifacts | `artifacts/{asset_class}/` |
| Orchestrator skill | `skills/research/SKILL.md` |

## Naming Convention

```
artifacts/{asset_class}/reports/{ticker_lower}.{period}.md
artifacts/{asset_class}/scorecards/{ticker_lower}.{period}.scorecard.md
artifacts/{asset_class}/perspectives/{ticker_lower}.{period}.perspectives.json
artifacts/{asset_class}/synthesis/{ticker_lower}.{period}.synthesis.md
```

Examples: `equities/reports/intc.mar.md`, `commodities/scorecards/uranium.mar.scorecard.md`

## Operating Rules

- Never fabricate financial data in reports
- Cite sources for all financial claims
- Keep agent instructions lean and explicit (< 100 lines each)
- Keep artifacts reproducible and auditable
- Use compressed handoffs between agents (Summary for Perspectives + Opinion block)
- Prefer section indexes over full playbook reads for compliance

## Token Budget

Target: < 80K tokens for a full pipeline run.

| Phase | Budget | Notes |
|-------|--------|-------|
| Setup | < 2K | Index lookup + dir creation |
| Equity | 28–40K | Web research + full report (largest phase) |
| Compliance | 8–15K | Section index + report scoring |
| Perspectives | 12–20K | Three agents, compressed input |
| Synthesis | 5–10K | Lightweight reconciliation |

## Individual Agent Runs

Users can run any step in isolation:
- `run equity research on CLF` → Phase 1 only
- `run compliance on CLF` → Phase 2 only (requires existing report)
- `run perspectives on CLF` → Phase 3 only (requires existing report)
- `synthesize CLF` → Phase 4 only (requires report + perspectives)
- `run bull case on CLF` → Single perspective agent

## Error Handling

- **Playbook not found:** Falls back to `_default/playbook.prompt.md`, warns user
- **Web search fails:** Continues with available data, flags low confidence
- **Report missing tail blocks:** Downstream agents warn but attempt partial execution
- **Scorecard grade F:** Flags to user, suggests re-running equity agent with more depth
