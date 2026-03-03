---
name: watchlist
description: "Batch research from a TradingView watchlist or ticker list. Accepts a TradingView public watchlist URL or a comma-separated list of tickers. Produces streamlined research reports for up to 10 tickers. Triggers on: 'research watchlist', 'run watchlist', 'analyze this watchlist', or any message containing a tradingview.com/watchlists/ URL."
---

# Watchlist Research Skill

You are the orchestrator for batch investment research from a watchlist. You accept a TradingView public watchlist link or a raw ticker list, resolve playbooks for each ticker, and produce streamlined single-document research reports — up to 10 tickers per run.

## Input Contract

**Accepted inputs (any of):**
- A TradingView public watchlist URL (e.g., `https://www.tradingview.com/watchlists/57610753/`)
- A comma-separated ticker list (e.g., `NVDA, CLF, COPX, OKLO, MARA`)
- A plain text list of tickers (one per line)
- A text file upload containing tickers

**Limits:** Maximum 10 tickers per run. If the watchlist contains more than 10, ask the user which 10 to run — or take the first 10 and note the overflow.

## Phase 0: Ticker Extraction

### From TradingView URL

1. Detect any URL matching `tradingview.com/watchlists/` in the user's message.
2. Attempt to fetch the page using browser tools (navigate to URL, read page content).
3. Extract ticker symbols from the watchlist table/grid. TradingView watchlists display symbols in a table with columns like Symbol, Last, Change, etc. The ticker symbols are in the first column, formatted as `EXCHANGE:SYMBOL` (e.g., `NASDAQ:NVDA`). Strip the exchange prefix — keep only the symbol.
4. **If browser fetch fails** (page blocked, requires login, or content not accessible): inform the user that the URL couldn't be accessed and ask them to paste the ticker list directly. Provide instructions: "Open the watchlist in your browser, select all tickers, and paste them here — I'll parse any format."

### From Raw Input

1. Parse comma-separated, space-separated, or newline-separated tickers.
2. Strip exchange prefixes (`NASDAQ:`, `NYSE:`, `AMEX:`, etc.) if present.
3. Deduplicate and uppercase all symbols.
4. Validate: discard any token that doesn't look like a ticker (more than 5 characters without dots, contains numbers mixed with letters in non-standard patterns, etc.). Keep standard formats like `BRK.B`.

### Confirmation

Before proceeding, show the user the parsed ticker list and ask for confirmation:

```
Found {N} tickers: {TICKER1}, {TICKER2}, ...
Ready to run research on {min(N, 10)} tickers. Proceed?
```

If more than 10, note: "Your watchlist has {N} tickers. I'll run the first 10. Want to pick specific ones instead?"

## Phase 1: Batch Report Generation

For each confirmed ticker, run the following sequentially:

### 1a. Resolve Playbook

Read `.agents/playbooks/index.yaml` and match the ticker to a playbook. If no match, use web search to identify the sector, then match via keywords. Fall back to `_default/playbook.prompt.md`.

### 1b. Generate Streamlined Report

For each ticker, produce a **single-document streamlined report** using the format defined in `.agents/templates/watchlist-report-structure.md`.

**Agent instructions:**

1. Read `.agents/research/equity/INSTRUCTIONS.md` for core research methodology.
2. Read the resolved playbook from `.agents/playbooks/{name}/playbook.prompt.md`.
3. Read `.agents/templates/watchlist-report-structure.md` for the output format.
4. Conduct web research on the ticker (use `.agents/templates/search-queries.md` for query patterns).
5. Write the report in the streamlined format:
   - **Thesis At a Glance** — 3 bull bullets + 3 bear bullets (above the fold)
   - **Trade Ideas** — 1-3 actionable trade setups anchored to current macro, market, and sector conditions at query time. Include entry, thesis, timeframe, risk/reward, and invalidation. Must flow from the research — no generic setups.
   - **Full Research Body** — all playbook sections (A through F)
   - **Opinion Block** — YAML structured rating
   - **Data Enrichment Suggestions** — compact list of what data sources would improve the analysis

### 1c. Save Report

Save to: `artifacts/{asset_class}/reports/{ticker_lower}.{period}.md`

Use the same naming convention as the standard pipeline.

## Phase 2: Watchlist Summary

After all individual reports are complete, produce a **watchlist summary** document:

```markdown
# Watchlist Research Summary — {date}

## Coverage

| # | Ticker | Sector | Rating | Confidence | Action | Key Catalyst |
|---|--------|--------|--------|------------|--------|-------------|
| 1 | {TICKER} | {sector} | {X}/10 | {conf} | {action} | {one-line catalyst} |
| ... | ... | ... | ... | ... | ... | ... |

## Strongest Conviction (Top 3)

[Ranked by rating × confidence, with 2-3 sentence thesis for each]

## Highest Risk (Bottom 3)

[Ranked by lowest rating or lowest confidence, with key concern for each]

## Sector Exposure

[Pie-chart-style text breakdown of how many tickers fall into each sector]

## Links

- [TICKER1 Report](artifacts/{asset_class}/reports/{ticker1}.{period}.md)
- [TICKER2 Report](artifacts/{asset_class}/reports/{ticker2}.{period}.md)
- ...
```

Save to: `artifacts/watchlist-summary.{period}.md`

## Phase 3: Deliver

Present the user with:
1. **Headline:** "Watchlist Research Complete — {N} Tickers Analyzed"
2. **Summary table** from the watchlist summary
3. **Top conviction pick** with one-paragraph thesis
4. **Links** to all individual reports and the summary document

## Error Handling

- **TradingView URL inaccessible:** Fall back to manual ticker input. Do not fail silently.
- **Ticker not recognized / no data found:** Skip the ticker, note it in the summary as "Insufficient data — skipped."
- **Rate limiting on web search:** Pause between tickers (the orchestrator should space out research). Continue with available data.
- **Playbook not found:** Use `_default/playbook.prompt.md` and note it in the report.

## Token Budget

Target per ticker: ~15-25K tokens (streamlined format is leaner than full pipeline).
Total for 10 tickers: ~150-250K tokens.

The streamlined format saves tokens by:
- Combining bull/bear into the report header (no separate perspective agents)
- Inlining the scorecard as a compact tail section (no separate compliance pass)
- Skipping the synthesis agent (the watchlist summary serves this purpose)
