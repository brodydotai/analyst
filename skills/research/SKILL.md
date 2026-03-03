---
name: research
description: "Full-pipeline investment research. Give it a ticker and get a structured report, compliance scorecard, bull/bear/macro perspectives, and synthesized recommendation. Triggers on: 'research {ticker}', 'analyze {ticker}', 'run playbook on {ticker}', or any request to produce an investment report."
---

# Investment Research Orchestrator

You are the orchestrator for a multi-agent investment research pipeline. When invoked, you chain five specialized agents in sequence to produce a complete, auditable research package.

## Input Contract

**Required:** `ticker` (e.g., NVDA, CLF, GLD)
**Optional:**
- `asset_class`: equities | commodities | crypto (auto-detected if omitted)
- `period`: month tag (e.g., mar) — defaults to current month
- `playbook`: explicit playbook filename — auto-detected if omitted
- `steps`: run specific steps only (e.g., "equity only", "perspectives only")

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

### Phase 0: Setup

1. **Validate ticker.** Confirm the ticker symbol resolves to a real traded security via web search (e.g., `{ticker} stock price`). If it doesn't resolve, abort and inform the user. For ETFs, confirm the fund exists and identify its focus area.

2. **Resolve ticker metadata.** Read `.agents/playbooks/index.yaml` to match the ticker to a playbook and asset class. If no match found, use web search to identify the company's sector, then match to the closest playbook. If still no match, use `_default/playbook.prompt.md`.

2. **Set naming variables:**
   - `ticker_lower` = ticker in lowercase (e.g., `nvda`)
   - `period` = current month abbreviated lowercase (e.g., `mar`)
   - `asset_class` = resolved asset class (e.g., `equities`)

3. **Bootstrap directories.** Create `artifacts/{asset_class}/reports/`, `artifacts/{asset_class}/scorecards/`, `artifacts/{asset_class}/perspectives/`, and `artifacts/{asset_class}/synthesis/` if they don't exist.

### Phase 1: Equity Research Agent

**Read (in order):**
1. `.agents/research/equity/INSTRUCTIONS.md`
2. The resolved playbook from `.agents/playbooks/{playbook_dir}/playbook.prompt.md`
3. `.agents/templates/search-queries.md` (for web research query patterns)
4. `.agents/templates/report-structure.md` (output skeleton)
5. `.agents/templates/opinion-block.yaml` (opinion schema)
6. `.agents/templates/perspective-summary.md` (summary template)

**Execute:** Follow the equity agent instructions exactly. Conduct web research using the search query templates. Write a complete report following the playbook's section requirements.

**Critical output requirements:**
- The report MUST end with `## Opinion` (YAML block) and `## Summary for Perspectives` (400-700 words)
- These tail blocks are the handoff interface to downstream agents

**Save to:** `artifacts/{asset_class}/reports/{ticker_lower}.{period}.md`

### Phase 2: Compliance Agent

**Read (in order):**
1. `.agents/research/compliance/INSTRUCTIONS.md`
2. `.agents/compliance/rules.json`
3. `.agents/playbooks/{playbook_dir}/sections.json` (preferred) OR fall back to full playbook
4. The report produced in Phase 1

**Execute:** Score the report against the playbook's requirements using the weighted scoring system (30% section + 30% element + 15% citation quality + 10% data recency + 15% structural).

**Save to:** `artifacts/{asset_class}/scorecards/{ticker_lower}.{period}.scorecard.md`

### Phase 3: Perspective Agents (Parallel)

Run all three perspective agents. Each reads ONLY the `## Summary for Perspectives` and `## Opinion` sections from the Phase 1 report — NOT the full report.

**For each agent (bull, bear, macro):**
1. Read `.agents/research/{agent}/INSTRUCTIONS.md`
2. Extract `## Summary for Perspectives` and `## Opinion` from the report
3. Produce a JSON perspective object per the agent's output schema

**Collect** all three perspective JSONs into a single array.

**Save to:** `artifacts/{asset_class}/perspectives/{ticker_lower}.{period}.perspectives.json`

### Phase 4: Synthesis Agent

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

## Running Individual Steps

Users can run any step in isolation:

- **"run equity research on CLF"** → Phase 1 only
- **"run compliance on CLF"** → Phase 2 only (requires existing report)
- **"run perspectives on CLF"** → Phase 3 only (requires existing report)
- **"synthesize CLF"** → Phase 4 only (requires report + perspectives)
- **"run bull case on CLF"** → Single perspective agent only

## Error Handling

- **Playbook not found:** Fall back to `_default/playbook.prompt.md`, warn user
- **Web search fails:** Continue with available data, flag low confidence in opinion block
- **Report missing tail blocks:** Compliance and perspective agents should warn but attempt partial execution
- **Scorecard grade F:** Flag to user, suggest re-running equity agent with more research depth

## Token Budget

Target: < 80K tokens end-to-end for full pipeline.

| Phase | Budget | Notes |
|-------|--------|-------|
| Setup | < 2K | Index lookup + dir creation |
| Equity | 28-40K | Largest phase — web research + full report |
| Compliance | 8-15K | Section index path saves ~5K vs full playbook |
| Perspectives | 12-20K | Three agents, compressed input |
| Synthesis | 5-10K | Lightweight reconciliation |
