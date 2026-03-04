# Analyst

Structured investment research powered by LLM analysis and sector-specific playbooks. Enter a ticker, get a complete research report with macro context, bull/bear cases, trade setup, and a scored opinion.

## Quick Start

```
research NVDA
analyze CLF, COPX, UUUU
run playbook on OKLO
```

Reports follow a strict template: executive summary, macro context, bull/bear cases, primary trade, deep research sections, and a machine-readable opinion block.

## What's Inside

### Pipeline

```
Ticker Input → Playbook Resolution → Web Research → Report Generation → Delivery
```

Each report is generated sequentially to ensure consistency across tickers. The pipeline resolves the correct sector playbook automatically via `index.yaml`, runs targeted web research, and writes a 1,500–2,500 word report following the report template exactly.

### Playbooks

30+ sector-specific research playbooks covering semiconductors, data centers, SaaS, cybersecurity, defense, space, drones, quantum, robotics, pharma, oil & gas, utilities, uranium, precious metal miners, base metals, rare earths, specialty materials, Chinese AI/tech, fintech, banking, bitcoin mining, consumer/e-commerce, healthcare/medtech, shipping, agriculture, REITs, EVs, gaming, and more. A generic fallback handles anything not covered by a specific sector.

Playbook auto-detection checks the ticker against `index.yaml` first, then falls back to keyword matching via web search.

### Dashboard

A React + Vite dashboard for browsing and reading generated reports. Dark theme, responsive layout, markdown rendering, opinion block parsing, and a metrics header with confidence visualization.

```
cd dashboard && npm install && npm run dev
```

### Opinion Schema

Every report ends with a YAML opinion block that the dashboard parses for display and comparison:

```yaml
ticker: NVDA
rating: 8
action: "Buy"
confidence: 0.82
data_confidence: 0.75
timeframe: "6M"
thesis: "One sentence, max 30 words"
catalysts:
  - "Catalyst with timing"
risks:
  - "Risk description"
invalidation: "Measurable condition"
```

## Directory Structure

```
.agents/
├── playbooks/           # 30+ sector playbooks + index.yaml
├── research/equity/     # Report generation agent
├── compliance/          # Scoring weights
├── templates/           # Report template, opinion schema, search queries
├── data-sources.yaml    # API configuration (FRED, Findatasets, yfinance)
└── protocol.md          # Agent communication rules

skills/research/         # Pipeline orchestrator
reports/                 # Generated reports (served by dashboard)
dashboard/               # React + Vite report viewer

CLAUDE.md                # Entry point and operating rules
```

## Adding a Playbook

1. Create `.agents/playbooks/{name}/playbook.prompt.md` with section requirements
2. Create `.agents/playbooks/{name}/sections.json` (follow `sections.schema.json`)
3. Add ticker mappings and keywords to `.agents/playbooks/index.yaml`

## Data Sources

Configured in `.agents/data-sources.yaml`. Currently uses web search as primary; FRED, Findatasets, and yfinance available when running locally with API keys configured.
