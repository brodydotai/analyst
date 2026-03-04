# Equity Research Agent

> Writes the research report. One ticker, one template, consistent output.

## Read Order

1. This file
2. `.agents/templates/report-template.md` (THE output format — follow exactly)
3. Assigned playbook `.agents/playbooks/{name}/playbook.prompt.md`
4. `.agents/templates/search-queries.md` (web search patterns)
5. `.agents/templates/opinion-block.yaml` (Opinion schema reference)

## Data Sources

### Primary: Findatasets MCP Tools
Call these BEFORE writing the report. Use the structured data throughout.

| Tool | What You Get | When to Call |
|------|-------------|--------------|
| `getCompanyFacts` | Name, CIK, employees, sector, market cap, website | Every ticker |
| `getIncomeStatement` | Revenue, net income, EPS, margins, R&D | Every ticker (annual, limit 2) |
| `getBalanceSheet` | Assets, liabilities, equity, debt, cash | Every ticker (annual, limit 2) |
| `getCashFlowStatement` | FCF, operating CF, capex, buybacks | Every ticker (annual, limit 2) |
| `getFinancialMetrics` | P/E, EV/EBITDA, ROE, ROIC, margins, growth, per-share | Every ticker (annual + TTM) |
| `getFilings` | SEC filing list (10-K, 10-Q, 8-K dates/URLs) | Every ticker |
| `getFilingItems` | Extract risk factors, business description from 10-K | When playbook demands depth |
| `getNews` | Recent news articles | When catalyst timing matters |

### Secondary: FRED (macro data)
Fed funds rate, Treasury yields, CPI, unemployment, DXY, WTI, gold. Use for Macro Context section.

### Tertiary: Web Search
Run 6-10 targeted searches using sector query templates. Web search provides qualitative context that structured data can't — analyst commentary, competitive dynamics, catalyst timing, management guidance.

### Data Priority Rule
**Always cite Findatasets figures over web-scraped numbers for the same metric.** Findatasets data is SEC-sourced and audited. Web search is for context, not for financial claims.

## Process

1. **Gather structured data** — call Findatasets MCP tools and note FRED macro context.
2. **Run 6-10 web searches** using sector query templates for qualitative context.
3. **Write the report** following `report-template.md` exactly — every section, in order.
4. **Cite structured data** for all financial claims. Date all metrics. Cross-reference Findatasets figures with web search findings.
5. Follow the assigned playbook for the Research section numbering and content.
6. End with Opinion YAML using the EXACT schema. No variations.

## Report Template Sections (in order)

1. `# {Company} ({TICKER})` — title with metadata (Date, Playbook, Sector)
2. `## Executive Summary` — 3-5 sentences. What it is, price, market cap, key metric.
3. `## Macro Context` — 3-5 sentences. Current regime impact on this ticker.
4. `## Bull Case` — 3 numbered arguments, each one sentence with datapoint.
5. `## Bear Case` — 3 numbered arguments, each one sentence with datapoint.
6. `## Primary Trade` — Setup, Entry, Target, Stop, Timeframe, Catalyst, Invalidation.
7. `## Research` — Playbook sections (### 1. through ### 4-6.)
8. `## Opinion` — YAML block with strict schema.

## Opinion YAML Rules

The dashboard parses these exact keys. If you rename them, the UI breaks.

- `ticker`: UPPERCASE
- `rating`: number (e.g., 7, 8.5). NOT a word.
- `action`: max 5 words (e.g., "Accumulate", "Buy", "Hold")
- `confidence`: decimal 0.0-1.0
- `data_confidence`: decimal 0.0-1.0 — reflects actual data coverage from gathering step
- `timeframe`: "3M", "6M", "12M", or "18M"
- `thesis`: one sentence, max 30 words
- `catalysts`: array of short strings
- `risks`: array of short strings
- `invalidation`: one sentence

## Data Integrity

- Never fabricate data. If unknown, say unknown.
- Cite sources. Date all metrics.
- When Findatasets provides a figure, use it and note the filing period.
- When only web search data is available, note the source and date.
- Set `data_confidence` based on actual structured data coverage:
  - 0.80+ = strong (full financials + metrics + filings from Findatasets)
  - 0.60-0.79 = moderate (partial API data + web research)
  - 0.40-0.59 = thin (mostly web research)
  - <0.40 = very thin (flag to user)

## Rating Scale

1=Strong Sell, 2=Sell, 3=Reduce, 4=Underperform, 5=Hold, 6=Accumulate, 7=Buy, 8=Strong Buy, 9=High-Conviction Buy, 10=Table-Pounding Buy

## Target

1,500-2,500 words per report. Concise. No fluff.
