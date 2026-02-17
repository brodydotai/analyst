# Droyd Crypto Experiment Runbook

Purpose: standardized experiments for enriching crypto token reports with Droyd content intelligence.

## Activation

Run this play when:
- user asks for crypto token research, or
- report `asset_class` is `crypto`, or
- orchestrator requests "Droyd experiment" or "sentiment/narrative check".

Required references:
- `.agents/templates/api-routing-index.yaml`
- local env var `DROYD_API_KEY`
- Droyd docs: `https://api.droyd.ai/`

## Core Hypothesis

Using Droyd `POST /api/v1/search` as first-pass intelligence should:
1. improve catalyst/risk narrative quality,
2. reduce exploratory web-search noise,
3. increase actionable IDP quality in crypto reports.

## Experiment Modes

### Mode A: Narrative Lift
- Goal: discover high-signal narratives for bull/bear framing.
- Query defaults:
  - `search_mode`: `semantic`
  - `content_types`: `["posts","news"]`
  - `days_back`: `7`
  - `sort_by`: `relevance`
  - `minimum_relevance_score`: `0.55`
  - `include_analysis`: `true`
  - `snippet_limit`: `3`
  - `limit`: `20`

### Mode B: Catalyst Timeliness
- Goal: detect near-term catalysts and risk events earlier.
- Query defaults:
  - `search_mode`: `recent`
  - `content_types`: `["news","posts"]`
  - `days_back`: `3`
  - `sort_by`: `recent`
  - `minimum_relevance_score`: `0.45`
  - `include_analysis`: `false`
  - `snippet_limit`: `2`
  - `limit`: `25`

### Mode C: Risk Early Warning
- Goal: surface governance, security, liquidity, or regulatory stress.
- Query defaults:
  - `search_mode`: `semantic`
  - `content_types`: `["news","posts"]`
  - `days_back`: `14`
  - `sort_by`: `relevance`
  - `minimum_relevance_score`: `0.50`
  - `include_analysis`: `true`
  - `snippet_limit`: `4`
  - `limit`: `30`

## Query Packs

Replace `{token}` and `{ecosystem}`.

1. `{token} catalyst roadmap launch adoption partnership listings`
2. `{token} governance proposal vote treasury unlock emissions dilution`
3. `{token} exploit security incident outage liquidation depeg bridge risk`
4. `{token} volume open interest market share competitors`
5. `{token} regulation SEC CFTC enforcement jurisdiction AML KYC`
6. `{token} sentiment crowd positioning social narrative rotation`
7. `{token} {ecosystem} developer growth TVL activity retention`

Use `ecosystems` and `categories` filters when available to reduce noise.

## Integration Into Report Sections

Map experiment output into:
- Executive Summary: top 2-3 current narratives.
- Bull/Bear section: one Droyd-supported upside and downside thread.
- IDPs section: 2-4 high-signal divergences with source timestamp.
- Investigation Tracks: unresolved narratives requiring verification.
- Opinion + Summary for Perspectives: only decision-critical deltas, no long dumps.

## Evidence Handling Rules

- Treat Droyd results as intelligence leads, not sole ground truth.
- Corroborate important claims with at least one independent source before hard conclusions.
- If corroboration fails, keep as "unconfirmed narrative" with lower confidence.
- Record query parameters used so findings are reproducible.

## Scoring Rubric (Per Report)

Score each 0-2; max 10.

1. Narrative Lift: did Droyd add non-obvious insights?
2. Timeliness: did Droyd catch recent events missed by baseline search?
3. Risk Utility: did Droyd improve invalidation criteria quality?
4. Signal Quality: were results relevant after filtering?
5. Token Efficiency: did Droyd reduce exploratory search volume?

Interpretation:
- 8-10: adopt as standard layer.
- 5-7: keep as conditional overlay.
- 0-4: pause and revisit configuration.

## Output Block (append to Operator Notes)

```markdown
### Droyd Experiment Summary
- Mode(s): [A/B/C]
- Token: {token}
- Query count: {n}
- High-signal items captured: {n}
- Corroborated items: {n}
- Unconfirmed narratives: {n}
- Rubric score: {score}/10
- Recommendation: adopt | conditional | pause
```

