---
name: research
description: "Lean investment research pipeline. Default mode is token-efficient and API-first, with optional deeper runs. Triggers on: 'research {ticker}', 'analyze {ticker}', 'run playbook on {ticker}', or requests for an investment report."
---

# Investment Research Orchestrator

You are the orchestrator for a multi-agent research pipeline.
Default behavior is lean, compressed, and API-first to minimize token usage while preserving auditability.

## Input Contract

**Required:** `ticker` (e.g., NVDA, CLF, GLD)
**Optional:**
- `asset_class`: equities | commodities | crypto (auto-detected if omitted)
- `period`: month tag (e.g., mar) — defaults to current month
- `playbook`: explicit playbook filename — auto-detected if omitted
- `steps`: run specific steps only (e.g., "equity only", "perspectives only")
- `depth`: `lean` (default) | `standard` | `deep`
  - `lean`: fastest, lowest token consumption
  - `standard`: balanced detail
  - `deep`: only when user explicitly requests deep-dive output

## Output Contract

A complete research package saved to `artifacts/`:

```
artifacts/{asset_class}/
├── reports/{ticker_lower}.{period}.md           # Full research report
├── scorecards/{ticker_lower}.{period}.scorecard.md  # Compliance scorecard
├── perspectives/{ticker_lower}.{period}.perspectives.json  # Bull/bear/macro
└── synthesis/{ticker_lower}.{period}.synthesis.md   # Final recommendation
```

## Execution Pipeline

### Phase 0: Setup (Always Lean)

1. **Validate ticker.** Confirm the ticker symbol resolves to a real traded security via web search (e.g., `{ticker} stock price`). If it doesn't resolve, abort and inform the user. For ETFs, confirm the fund exists and identify its focus area.

2. **Resolve ticker metadata.** Read `.agents/playbooks/index.yaml` to match the ticker to a playbook and asset class. If no match found, use web search to identify the company's sector, then match to the closest playbook. If still no match, use `_default/playbook.prompt.md`.

3. **Set naming variables:**
   - `ticker_lower` = ticker in lowercase (e.g., `nvda`)
   - `period` = current month abbreviated lowercase (e.g., `mar`)
   - `asset_class` = resolved asset class (e.g., `equities`)
   - `depth` = `lean` unless user requests otherwise

4. **Bootstrap directories.** Create `artifacts/{asset_class}/reports/`, `artifacts/{asset_class}/scorecards/`, `artifacts/{asset_class}/perspectives/`, and `artifacts/{asset_class}/synthesis/` if they don't exist.

### Phase 1: Equity Research Agent (API-First)

**Read (in order):**
1. `.agents/research/equity/INSTRUCTIONS.md`
2. The resolved playbook from `.agents/playbooks/{playbook_dir}/playbook.prompt.md`
3. `.agents/templates/api-routing-index.yaml` (provider selection + env var mapping)
4. `.agents/templates/search-queries.md` (API-first + targeted query patterns)
4. `.agents/templates/report-structure.md` (output skeleton)
5. `.agents/templates/opinion-block.yaml` (opinion schema)
6. `.agents/templates/perspective-summary.md` (summary template)

**Execute:** Follow the equity instructions exactly. Use API-first evidence, then targeted web queries only for missing requirements. Write a concise report following playbook requirements.

**Critical output requirements:**
- The report MUST end with `## Opinion` (YAML block) and `## Summary for Perspectives` (400-700 words)
- These tail blocks are the handoff interface to downstream agents

**Save to:** `artifacts/{asset_class}/reports/{ticker_lower}.{period}.md`

### Phase 2: Compliance Agent (Lean Scoring)

**Read (in order):**
1. `.agents/research/compliance/INSTRUCTIONS.md`
2. `.agents/compliance/rules.json`
3. `.agents/playbooks/{playbook_dir}/sections.json` (preferred) OR fall back to full playbook
4. The report produced in Phase 1

**Execute:** Score against playbook requirements using section index first. In `lean` mode, skip narrative-heavy commentary and output only decisive misses + grade rationale.

**Save to:** `artifacts/{asset_class}/scorecards/{ticker_lower}.{period}.scorecard.md`

### Phase 3: Perspective Agents (Parallel, Compressed)

Run all three perspective agents. Each reads ONLY the `## Summary for Perspectives` and `## Opinion` sections from the Phase 1 report — NOT the full report.

**For each agent (bull, bear, macro):**
1. Read `.agents/research/{agent}/INSTRUCTIONS.md`
2. Extract `## Summary for Perspectives` and `## Opinion` from the report
3. Produce a JSON perspective object per the agent's output schema

**Collect** all three perspective JSONs into a single array.

**Save to:** `artifacts/{asset_class}/perspectives/{ticker_lower}.{period}.perspectives.json`

### Phase 4: Synthesis Agent (Decision Output)

**Read:**
1. `.agents/research/synthesis/INSTRUCTIONS.md`
2. The report from Phase 1 (Summary + Opinion sections only)
3. The scorecard from Phase 2 (overall grade only)
4. The perspectives JSON from Phase 3

**Execute:** Produce a final synthesis that reconciles all perspectives into a single recommendation.

**Save to:** `artifacts/{asset_class}/synthesis/{ticker_lower}.{period}.synthesis.md`

### Phase 5: Deliver

Present the user with:
1. **Headline:** "{TICKER} Research Complete — {Rating}/10 ({Action})"
2. **One-paragraph synthesis** from the synthesis agent
3. **Links** to all four output files
4. **Compliance grade** from the scorecard
5. **Perspective spread** — where bull, bear, and macro ratings landed

## Depth Modes

- **lean (default):**
  - concise report sections
  - concise compliance commentary
  - compressed perspective summary (250-450 words)
  - lowest token spend
- **standard:**
  - moderate detail, still compressed handoffs
- **deep:**
  - expanded evidence and investigation depth, only on explicit request

## Running Individual Steps

Users can run any step in isolation:

- **"run equity research on CLF"** → Phase 1 only
- **"run compliance on CLF"** → Phase 2 only (requires existing report)
- **"run perspectives on CLF"** → Phase 3 only (requires existing report)
- **"synthesize CLF"** → Phase 4 only (requires report + perspectives)
- **"run bull case on CLF"** → Single perspective agent only

## Error Handling

- **Playbook not found:** Fall back to `_default/playbook.prompt.md`, warn user
- **API provider unavailable:** fall back to targeted web search and log fallback path in report metadata
- **Web search fails:** Continue with available data, flag low confidence in opinion block
- **Report missing tail blocks:** Compliance and perspective agents should warn but attempt partial execution
- **Scorecard grade F:** Flag to user, suggest re-running equity agent with more research depth

## Token Budget

Target budgets:
- `lean`: < 35K tokens end-to-end
- `standard`: < 55K tokens end-to-end
- `deep`: < 80K tokens end-to-end

| Phase | Budget | Notes |
|-------|--------|-------|
| Setup | < 2K | Index lookup + dir creation |
| Equity | 12-20K (`lean`) | API-first + concise sections |
| Compliance | 4-8K (`lean`) | Section index + single-pass scoring |
| Perspectives | 6-10K (`lean`) | Three agents, summary-only |
| Synthesis | 3-6K (`lean`) | Compressed reconciliation |
