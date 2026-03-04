---
name: research
description: "Investment research pipeline. Give it a ticker, get a structured report. Triggers on: 'research {ticker}', 'analyze {ticker}', 'run playbook on {ticker}'."
---

# Investment Research Pipeline

You produce investment research reports. One ticker at a time, sequential, consistent.

## Input

**Required:** `ticker` (e.g., NVDA, CLF, ECH)

## Output

A single markdown report saved to `reports/{ticker_lower}.md` AND `artifacts/{asset_class}/reports/{ticker_lower}.{period}.md`.

## Pipeline (3 Phases)

### Phase 0: Setup

1. **Validate ticker.** Web search `{ticker} stock price`. If it doesn't resolve to a real security, abort.
2. **Resolve playbook.** Read `.agents/playbooks/index.yaml`. Match ticker to playbook + asset_class. If no match, web search the company's sector, match closest playbook. Fall back to `_default/playbook.prompt.md`.
3. **Set variables:** `ticker_lower`, `period` (current month lowercase), `asset_class`.

### Phase 0.5: Data Gathering

**Pull structured data BEFORE writing.** This gives you audited financials to cite, not just web search snippets.

**Findatasets MCP tools** (primary — call these for every ticker):
1. `getCompanyFacts` — company name, CIK, employees, sector, market cap
2. `getIncomeStatement` — revenue, net income, EPS, margins (annual, limit 2)
3. `getBalanceSheet` — assets, debt, equity, cash (annual, limit 2)
4. `getCashFlowStatement` — FCF, operating CF, capex (annual, limit 2)
5. `getFinancialMetrics` — 40+ ratios: P/E, EV/EBITDA, ROE, ROIC, margins, growth rates (annual + TTM)
6. `getFilings` — recent SEC filings list (10-K, 10-Q, 8-K)

**Findatasets MCP tools** (use when relevant to the playbook):
7. `getFilingItems` — extract specific 10-K sections (risk factors, business description)
8. `getNews` — recent news articles for context

**FRED REST API** (macro context — use for all tickers):
- Fed funds rate, 10Y yield, 2Y yield, yield curve spread, CPI YoY, unemployment, DXY

**Web search** (qualitative context — use query templates):
- Sector dynamics, competitive positioning, catalyst timing, risk factors
- Use `.agents/templates/search-queries.md` for sector-specific query patterns

**Set `data_confidence`** based on how much structured data you got:
- 0.80+ = strong coverage (financials + metrics + filings)
- 0.60-0.79 = moderate (some API data + web research)
- 0.40-0.59 = thin (mostly web research)
- <0.40 = very thin (flag to user)

### Phase 1: Research & Write

**Read in order:**
1. `.agents/templates/report-template.md` (THE template — follow it exactly)
2. The resolved playbook `.agents/playbooks/{name}/playbook.prompt.md`
3. `.agents/templates/search-queries.md` (query patterns for this sector)
4. `.agents/templates/opinion-block.yaml` (Opinion schema reference)

**Execute:**
1. Run 6-10 targeted web searches using the search query templates for this sector.
2. Write the report following `report-template.md` EXACTLY. Every section, every field, in order.
3. **Cite structured data from Phase 0.5.** Use SEC-sourced figures for all financial claims. Date all metrics. Cross-reference with web search findings.
4. The Opinion YAML block MUST use the exact keys shown in the template. No variations. No extra fields. No nested objects. The dashboard parses these keys literally.

**Save to:**
- `reports/{ticker_lower}.md` (dashboard reads from here)
- `artifacts/{asset_class}/reports/{ticker_lower}.{period}.md` (archive)

### Deliver

Present to user:
1. **Headline:** `{TICKER} — {Rating}/10 — {Action}`
2. **One sentence:** the thesis from the Opinion block
3. **Link** to the report file

## Opinion YAML — STRICT SCHEMA

This is the exact schema. Every key must be present. No additions. No renames.

```yaml
ticker: UUUU
rating: 8
action: "Accumulate"
confidence: 0.72
data_confidence: 0.68
timeframe: "12M"
thesis: "Structural uranium deficit plus sole US integrated uranium/rare earth producer"
catalysts:
  - "Phase 1 rare earth expansion Q4 2026"
  - "Uranium production ramp to 2.5M lbs 2026"
risks:
  - "Uranium spot below $70/lb compresses margins"
  - "Madagascar feedstock negotiations fail"
invalidation: "Uranium spot sustained below $65/lb for 2+ quarters"
```

**Rules for Opinion YAML:**
- `ticker`: uppercase string
- `rating`: number (integer or one decimal). NOT a word. NOT "BUY".
- `action`: short verb phrase, max 5 words. "Buy", "Accumulate", "Hold", "Reduce", "Sell".
- `confidence`: decimal 0.0-1.0. NOT a percentage. NOT an integer.
- `data_confidence`: decimal 0.0-1.0. Reflects actual data coverage from Phase 0.5.
- `timeframe`: quoted string. "3M", "6M", "12M", "18M".
- `thesis`: one sentence, max 30 words. Quoted string.
- `catalysts`: array of short strings. NOT objects. NOT nested YAML.
- `risks`: array of short strings. NOT objects.
- `invalidation`: one sentence, quoted string.

## Data Source Priority

For any given data point, prefer in this order:
1. **Findatasets MCP** — SEC-sourced, audited financial data
2. **FRED REST API** — government macro data
3. **Web search** — qualitative context, news, analyst commentary

Never cite Yahoo Finance when Findatasets data is available for the same metric. Findatasets data comes directly from SEC filings and is more reliable.

## Batch Mode (Watchlist)

When given multiple tickers, process them SEQUENTIALLY — one at a time. Do NOT parallelize. This ensures every report follows the template consistently.

For each ticker: Phase 0 → Phase 0.5 → Phase 1 → Deliver → next ticker.

## Token Budget

Target: < 25K tokens per report.

| Step | Budget |
|------|--------|
| Setup | < 2K |
| Data Gathering | 3-5K |
| Web Research | 5-8K |
| Report Writing | 8-12K |
| Delivery | < 1K |

## Error Handling

- **Playbook not found:** Use `_default/playbook.prompt.md`, warn user.
- **Findatasets MCP unavailable:** Fall back to web search, set `data_confidence` lower.
- **FRED unavailable:** Note macro data gaps in report, set `data_confidence` lower.
- **Web search fails:** Continue with available structured data.
- **Ticker invalid:** Abort, tell user.

## Optional Deep Runs (On Request Only)

Users can explicitly request deeper analysis:
- `run compliance on {ticker}` — scores report against playbook (requires existing report)
- `run perspectives on {ticker}` — bull/bear/macro agents (requires existing report)
- `synthesize {ticker}` — reconciles all views (requires report + perspectives)

These are NOT part of the default pipeline. They exist for when a user wants to go deeper on a specific ticker.
