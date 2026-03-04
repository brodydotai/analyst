# Analyst — Investment Research Framework

## What This Is

Analyst is a sequential investment research pipeline for Claude Cowork. Give it a ticker, get a structured report.

## Quick Start

- `research NVDA`
- `analyze CLF, COPX, UUUU`
- `run playbook on OKLO`

## Pipeline (2 Phases)

```
Phase 0: Setup    → Validate ticker, resolve playbook
Phase 1: Research → Web research + write report (single pass)
Deliver           → Present report to user
```

Reports are written SEQUENTIALLY — one at a time, not in parallel. This ensures consistency across every report.

## Source of Truth

| What | Where |
|------|-------|
| Pipeline definition | `skills/research/SKILL.md` |
| Report template | `.agents/templates/report-template.md` |
| Equity agent | `.agents/research/equity/INSTRUCTIONS.md` |
| Playbook index | `.agents/playbooks/index.yaml` |
| Playbooks | `.agents/playbooks/{name}/playbook.prompt.md` |
| Search queries | `.agents/templates/search-queries.md` |
| Opinion schema | `.agents/templates/opinion-block.yaml` |
| Data source config | `.agents/data-sources.yaml` |
| Reports (dashboard) | `reports/` |
| Reports (archive) | `artifacts/{asset_class}/reports/` |

## Report Structure

Every report follows `report-template.md` exactly:

1. Title + metadata (Date, Playbook, Sector)
2. Executive Summary (3-5 sentences)
3. Macro Context (3-5 sentences)
4. Bull Case (3 numbered arguments)
5. Bear Case (3 numbered arguments)
6. Primary Trade (Setup, Entry, Target, Stop, Timeframe, Catalyst, Invalidation)
7. Research (playbook sections ### 1. through ### 4-6.)
8. Opinion (strict YAML block)

Target: 1,500-2,500 words per report.

## Opinion YAML — CRITICAL

The dashboard parses these exact keys. Every report must include all of them:

```yaml
ticker: UUUU
rating: 8
action: "Accumulate"
confidence: 0.72
data_confidence: 0.68
timeframe: "12M"
thesis: "One sentence max 30 words"
catalysts:
  - "Catalyst with timing"
risks:
  - "Risk description"
invalidation: "Measurable condition"
```

## Operating Rules

- Never fabricate financial data
- Cite sources for all financial claims
- Process tickers sequentially, never in parallel
- Follow report-template.md exactly — no creative formatting
- Opinion YAML keys are machine-parsed — no renames, no additions

## Optional Deep Runs

Available on request but NOT part of default pipeline:
- `run compliance on {ticker}` — playbook scoring
- `run perspectives on {ticker}` — bull/bear/macro agents
- `synthesize {ticker}` — reconcile all views

## Token Budget

Target: < 25K tokens per report.

## Data Sources

Configured in `.agents/data-sources.yaml`:
- **FRED** — macro data (rates, CPI, GDP, DXY)
- **Findatasets** — SEC filings (10-K, 13F, Form 4)
- **yfinance** — pricing, fundamentals, analyst estimates

Currently blocked in Cowork VM; functional when running locally. Pipeline falls back to WebSearch.
