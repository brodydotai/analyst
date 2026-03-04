# Analyst — Investment Research Framework

## What This Is

Analyst is a sequential investment research pipeline for Claude Cowork. Give it a ticker, get a structured report backed by SEC-sourced financial data.

## Quick Start

- `research NVDA`
- `analyze CLF, COPX, UUUU`
- `run playbook on OKLO`

## Pipeline (3 Phases)

```
Phase 0:   Setup         → Validate ticker, resolve playbook
Phase 0.5: Data Gather   → Findatasets MCP + FRED + web search
Phase 1:   Research       → Write report using structured data
Deliver                   → Present report to user
```

Reports are written SEQUENTIALLY — one at a time, not in parallel. This ensures consistency across every report.

## Data Architecture

### Provider Hierarchy (prefer in order)

1. **Findatasets MCP** — SEC-sourced financials, metrics, filings, estimates, earnings, insider trades, news
2. **FRED REST API** — macro data (rates, CPI, yields, DXY, commodities)
3. **Yahoo Finance** — real-time price only (demoted; fundamentals now from Findatasets)
4. **WebSearch** — qualitative context, analyst commentary, catalyst timing

### Findatasets MCP Tools (primary data source)

| Tool | Data |
|------|------|
| `getCompanyFacts` | Name, CIK, employees, sector, market cap |
| `getIncomeStatement` | Revenue, net income, EPS, margins, R&D |
| `getBalanceSheet` | Assets, liabilities, equity, debt, cash |
| `getCashFlowStatement` | FCF, operating CF, capex, buybacks |
| `getFinancialMetrics` | 40+ ratios (valuation, profitability, growth, liquidity) |
| `getFilings` | SEC filing list (10-K, 10-Q, 8-K) |
| `getFilingItems` | Extract specific 10-K sections (risk factors, business desc) |
| `getNews` | Recent news articles |

MCP server: `https://mcp.financialdatasets.ai/api` (API key auth via X-API-KEY header)
Config reference: `.agents/mcp-config.json`

### Data used in both Dev and Production

- **Dev (Cowork):** Claude calls MCP tools directly during report generation
- **Production (app server):** Server calls Findatasets MCP/REST, feeds structured data to LLM
- **Testing:** `scripts/data-layer/` REST test harness validates coverage per ticker

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
| API routing | `.agents/templates/api-routing-index.yaml` |
| MCP server config | `.agents/mcp-config.json` |
| Data layer test harness | `scripts/data-layer/` |
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
- Cite Findatasets (SEC-sourced) figures over web-scraped numbers for the same metric
- Cite sources for all financial claims — date all metrics
- Process tickers sequentially, never in parallel
- Follow report-template.md exactly — no creative formatting
- Opinion YAML keys are machine-parsed — no renames, no additions
- Set `data_confidence` based on actual structured data coverage from Phase 0.5

## Optional Deep Runs

Available on request but NOT part of default pipeline:
- `run compliance on {ticker}` — playbook scoring
- `run perspectives on {ticker}` — bull/bear/macro agents
- `synthesize {ticker}` — reconcile all views

## Token Budget

Target: < 25K tokens per report.

## Test Harness

Standalone Node.js scripts for validating data coverage before running full pipeline:

```bash
cd scripts/data-layer
cp .env.example .env   # add FRED_API_KEY + FINDATASETS_API_KEY
npm install
node gather.js NVDA           # single ticker data check
node test-harness.js --quick  # 3 tickers, validates all providers
```
