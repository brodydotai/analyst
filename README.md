# Analyst

A multi-agent investment research framework for Claude Cowork. Drop it into your session, give it a ticker, and get a complete research package — structured report, compliance scorecard, bull/bear/macro perspectives, and synthesized recommendation.

## How to Use

### Setup

1. Add this folder to your Claude Cowork session (select it as your working directory)
2. Say `research NVDA` (or any ticker)
3. The orchestrator handles the rest

### Commands

| Command | What It Does |
|---------|-------------|
| `research {TICKER}` | Full pipeline — report, scorecard, perspectives, synthesis |
| `analyze {TICKER}` | Same as above |
| `run equity research on {TICKER}` | Report only |
| `run compliance on {TICKER}` | Scorecard only (needs existing report) |
| `run perspectives on {TICKER}` | Bull/bear/macro only (needs existing report) |
| `run bull case on {TICKER}` | Single perspective agent |
| `synthesize {TICKER}` | Final recommendation (needs report + perspectives) |
| `research watchlist {URL}` | Batch research from a TradingView watchlist link (up to 10 tickers) |
| `analyze {T1}, {T2}, {T3}, ...` | Batch research from a comma-separated ticker list |

### What You Get

**Single ticker** (full pipeline) produces four artifacts in `artifacts/{asset_class}/`:

```
artifacts/equities/
├── reports/nvda.mar.md              # Full research report
├── scorecards/nvda.mar.scorecard.md # Compliance scorecard
├── perspectives/nvda.mar.perspectives.json  # Bull/bear/macro views
└── synthesis/nvda.mar.synthesis.md  # Final recommendation
```

**Watchlist batch** produces streamlined reports per ticker plus a summary:

```
artifacts/equities/reports/nvda.mar.md     # Streamlined report (bull/bear + trade ideas + research + enrichment)
artifacts/equities/reports/clf.mar.md
artifacts/equities/reports/mara.mar.md
artifacts/watchlist-summary.mar.md         # Coverage table, top picks, sector exposure
```

Each watchlist report includes: thesis at a glance (3 bull + 3 bear bullets), trade ideas anchored to current macro/market/sector conditions, full playbook research, opinion block, and data enrichment suggestions.

## Architecture

### Pipeline

The framework chains five specialized agents in sequence:

```
Phase 0: Setup         → Auto-detect playbook from ticker
Phase 1: Equity Agent  → Web research + structured report
Phase 2: Compliance    → Score report against playbook requirements
Phase 3: Perspectives  → Bull, Bear, Macro agents (run in parallel)
Phase 4: Synthesis     → Reconcile all views into recommendation
Phase 5: Deliver       → Present results with links
```

### Directory Structure

```
.agents/
├── playbooks/              # 20+ sector-specific research templates
│   ├── index.yaml          # Ticker → playbook auto-mapping
│   ├── {name}/             # One folder per sector playbook
│   │   ├── playbook.prompt.md    # Playbook instructions
│   │   └── sections.json         # Section index for compliance
│   ├── sections.schema.json
│   └── _default/           # Generic fallback playbook
├── research/
│   ├── equity/             # Report generation agent
│   ├── compliance/         # Scorecard verification agent
│   ├── bull/               # Bull perspective agent
│   ├── bear/               # Bear perspective agent
│   ├── macro/              # Macro overlay agent
│   └── synthesis/          # Final recommendation agent
├── compliance/
│   └── rules.json          # Scoring weights + thresholds
├── templates/              # Report skeleton, opinion schema, search queries
├── registry.md             # Agent index
└── protocol.md             # Communication + handoff rules

skills/
└── research/
    └── SKILL.md            # Orchestrator skill (pipeline definition)

artifacts/                  # Generated output (gitignored)
├── equities/
├── commodities/
└── crypto/

CLAUDE.md                   # Orchestrator boot context
```

### Available Playbooks

The framework includes sector-specific playbooks for: Semiconductors, Precious Metal Miners, Base Metal Miners, Uranium Miners, Industrial Metals, Precious & Rare Earth Metals, Steel Producers, Oil & Gas E&P, Oil & Gas Midstream, Renewable Energy, Defense & Aerospace, Bitcoin Mining, Critical Minerals, Nuclear Energy, Shipping & Maritime, Agriculture, Water & Utilities, REITs, and Crypto/DeFi — plus a generic fallback for any company not covered by a specific sector.

### How Playbook Auto-Detection Works

When you say `research NVDA`, the orchestrator:
1. Checks `.agents/playbooks/index.yaml` for a direct ticker match
2. If no match, searches the web to identify the company's sector
3. Matches the sector to the closest playbook via keywords
4. Falls back to `_default.prompt.md` if nothing matches

### Token Efficiency

The framework now defaults to a lean mode designed for <35K tokens per full run via:
- compressed handoffs (`Summary for Perspectives` + `Opinion`)
- section index scoring (instead of full playbook reads)
- API-first evidence retrieval before web search

## API Configuration

Configure provider keys in local environment variables (copy `.env.example` to `.env`):

- `FRED_API_KEY` (macro series)
- `FINDATASETS_API_KEY` (SEC filings)
- optional: `DROYD_API_KEY` (crypto overlay)

For market pricing context, install yfinance:

`pip install yfinance`

Routing and provider policy live in `.agents/templates/api-routing-index.yaml`.

## Adding a New Playbook

1. Create `.agents/playbooks/{name}/playbook.prompt.md` with section requirements
2. Create `.agents/playbooks/{name}/sections.json` (follow `sections.schema.json`)
3. Add ticker mappings to `.agents/playbooks/index.yaml`

## Adding a New Agent

1. Create `.agents/research/{name}/INSTRUCTIONS.md`
2. Define: Identity, Read Order, Scope, Output Format
3. Register in `.agents/registry.md`
4. Keep instructions under 100 lines
