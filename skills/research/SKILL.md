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

## Pipeline (2 Phases)

### Phase 0: Setup

1. **Validate ticker.** Web search `{ticker} stock price`. If it doesn't resolve to a real security, abort.
2. **Resolve playbook.** Read `.agents/playbooks/index.yaml`. Match ticker to playbook + asset_class. If no match, web search the company's sector, match closest playbook. Fall back to `_default/playbook.prompt.md`.
3. **Set variables:** `ticker_lower`, `period` (current month lowercase), `asset_class`.

### Phase 1: Research & Write

**Read in order:**
1. `.agents/templates/report-template.md` (THE template — follow it exactly)
2. The resolved playbook `.agents/playbooks/{name}/playbook.prompt.md`
3. `.agents/templates/search-queries.md` (query patterns for this sector)
4. `.agents/templates/opinion-block.yaml` (Opinion schema reference)

**Execute:**
1. Run 6-10 targeted web searches using the search query templates for this sector.
2. Write the report following `report-template.md` EXACTLY. Every section, every field, in order.
3. The Opinion YAML block MUST use the exact keys shown in the template. No variations. No extra fields. No nested objects. The dashboard parses these keys literally.

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
- `data_confidence`: decimal 0.0-1.0.
- `timeframe`: quoted string. "3M", "6M", "12M", "18M".
- `thesis`: one sentence, max 30 words. Quoted string.
- `catalysts`: array of short strings. NOT objects. NOT nested YAML.
- `risks`: array of short strings. NOT objects.
- `invalidation`: one sentence, quoted string.

## Batch Mode (Watchlist)

When given multiple tickers, process them SEQUENTIALLY — one at a time. Do NOT parallelize. This ensures every report follows the template consistently.

For each ticker: Phase 0 → Phase 1 → Deliver → next ticker.

## Token Budget

Target: < 25K tokens per report.

| Step | Budget |
|------|--------|
| Setup | < 2K |
| Web Research | 8-12K |
| Report Writing | 8-12K |
| Delivery | < 1K |

## Error Handling

- **Playbook not found:** Use `_default/playbook.prompt.md`, warn user.
- **Web search fails:** Continue with available data, set `data_confidence` low.
- **Ticker invalid:** Abort, tell user.

## Optional Deep Runs (On Request Only)

Users can explicitly request deeper analysis:
- `run compliance on {ticker}` — scores report against playbook (requires existing report)
- `run perspectives on {ticker}` — bull/bear/macro agents (requires existing report)
- `synthesize {ticker}` — reconciles all views (requires report + perspectives)

These are NOT part of the default pipeline. They exist for when a user wants to go deeper on a specific ticker.
