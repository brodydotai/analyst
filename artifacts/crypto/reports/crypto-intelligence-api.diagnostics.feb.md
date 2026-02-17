# Crypto Intelligence API Diagnostics

## Report Metadata
- Objective: Assess whether a crypto intelligence API should be integrated into the Analyst workflow for higher-quality crypto reports.
- Scope: No-code, file-first, agent-driven workflow (`.agents/`, `artifacts/`, `CLAUDE.md` conventions).
- Baseline reference: `artifacts/crypto/reports/hype.feb.md` and `artifacts/crypto/scorecards/hype.feb.scorecard.md`.
- Date: 2026-02-16

## Executive Verdict
- Provisional recommendation: **Integrate via staged pilot**, not full rollout yet.
- Why: Current crypto reports are strong on structure and thesis quality, but still show recurring blind spots that crypto intelligence APIs can directly close.
- Expected uplift: Better evidence quality for protocol risk, market microstructure, user concentration, and token flow analysis; improved confidence calibration and faster refresh loops.
- Condition: Proceed only if the API can consistently supply at least 70% of the Tier-1 metric set defined below.

## Baseline Diagnostics (Current State)
- Current crypto reporting quality is high (example scorecard grade: A), but coverage still depends on mixed confidence assumptions.
- Important metrics are flagged as "need deeper investigation" rather than resolved evidence (validator identity, cohort retention, flow concentration, treasury linkage, regulatory exposure granularity).
- Current process relies heavily on broad web search and stitched sources, which introduces noise and token overhead.
- Compliance can score well even when some crypto-native data confidence is moderate/low; this leaves decision risk hidden inside "good structure."

## Where API Data Strengthens Existing Crypto Reports

### A. Protocol Classification and Strategic Position
- Improves classification confidence with objective chain/protocol telemetry (active addresses, protocol dependency maps, revenue source mix).
- Reduces reliance on narrative-only positioning statements.

### B. Architecture and Technical Moat
- Adds real uptime, finality, throughput, validator concentration, and incident history metrics.
- Enables direct evidence on decentralization claims and liveness under stress.

### C. Market Sizing and Demand Drivers
- Replaces rough extrapolations with measured flow metrics: notional volume by pair, open interest trends, liquidation regimes, user activity cohorts.
- Supports scenario modeling from empirical volatility-volume sensitivity.

### D. Competitive Landscape
- Enables apples-to-apples competitor benchmarking with the same metric definitions across protocols.
- Strengthens share-shift detection (weekly or monthly) with reproducible snapshots.

### E. Token Economics and Valuation
- Directly improves token unlock tracking, holder concentration, treasury movement, buyback/burn verification, and circulating supply drift.
- Supports higher-confidence valuation assumptions around dilution and float velocity.

### F/G/H. Bull-Bear-IDP-Investigation
- Converts several IDPs from "monitor" to "measured" with threshold-based triggers.
- Tightens invalidation logic in opinion blocks (explicit metric tripwires).
- Shortens investigation cycles by pre-loading hard-to-source crypto-native telemetry.

## Priority Metric Set for Integration

### Tier 1 (Must Have for Go Decision)
- Protocol revenue by day/week/month and fee breakdown (maker/taker or equivalent).
- Notional volume and open interest by market and asset.
- Active users and cohort retention proxies (30/90-day where available).
- Validator count, concentration, and uptime/liveness indicators.
- Token supply schedule, realized unlocks, circulating vs total supply, top-holder concentration.
- On-chain treasury flows (major inflows/outflows, exchange-bound flows, bridge flows).

### Tier 2 (High Value)
- Liquidation distributions, leverage regime indicators, and stress event telemetry.
- Cross-protocol market share panel (same normalized definition across competitors).
- Smart-contract and incident risk feeds (exploits, pause events, oracle failures).

### Tier 3 (Nice to Have)
- Social/sentiment overlays.
- Developer activity and governance participation quality metrics.

## Diagnostic Fit to Existing HYPE Report Gaps
- Validator/operator transparency: API likely closes this from low-confidence estimates to medium/high confidence evidence.
- Revenue attribution and microstructure: high fit; likely largest incremental insight gain.
- User concentration and retention: medium-high fit; quality depends on API cohort methodology.
- Treasury risk linkage: high fit if treasury labeling and flow tagging are available.
- Regulatory risk: medium fit (API helps exposure mapping, but legal interpretation still requires external policy sources).

## Token and Workflow Impact Estimate

### Quality
- Evidence confidence for crypto-native sections likely increases from mixed medium/low to mostly medium/high.
- Invalidation criteria become metric-driven rather than narrative-driven.

### Token Consumption
- Web-search token noise should drop if agents query API-backed concise metric payloads instead of broad exploratory search.
- Net impact estimate per crypto run:
  - Minus: 8K-18K from reduced exploratory web search and less reconciliation churn.
  - Plus: 2K-6K from ingesting structured API output.
  - Expected net reduction: **6K-12K tokens** per crypto report cycle.

### Throughput
- Faster refresh loops for monthly or event-driven updates because fewer metrics need manual source triangulation.

## No-Code Integration Blueprint (Model-Agnostic)

### 1) Add a source contract in agent instructions
- Extend crypto/equity agent instructions with "preferred evidence source order":
  1. Crypto intelligence API snapshot
  2. Primary protocol docs/dashboards
  3. Secondary web corroboration

### 2) Add API metric templates (file-first)
- Add `.agents/templates/crypto-metrics-checklist.md` with Tier-1/Tier-2 fields and expected output schema.
- Add `.agents/templates/crypto-query-pack.md` containing compact query intents and fallback instructions.

### 3) Add confidence mapping rules
- In compliance or report instructions, map metric freshness/completeness to `data_confidence` adjustments.
- Example: if Tier-1 coverage <70%, cap `data_confidence` at 0.60.

### 4) Keep perspective token compression intact
- Populate `## Summary for Perspectives` with only decision-critical API-derived deltas (no large raw tables).
- Continue using the compressed summary path for bull/bear/macro.

## Pilot Acceptance Criteria (2-3 Runs)
- Metric coverage: >=70% Tier-1 fields present with timestamps and source IDs.
- Consistency: same metric queried twice within 24h yields explainable variance.
- Latency: API pull and synthesis does not materially slow report delivery.
- Insight delta: at least 3 decision-relevant findings per report are newly supported by API-only evidence.
- Token delta: net reduction of >=5K tokens per run relative to current crypto baseline.

## Risk Register
- Vendor lock-in if metric definitions are proprietary or opaque.
- Data drift if methodology changes are not versioned.
- False confidence if dashboards are delayed or lagged without freshness flags.
- Security/compliance risk if API credentials are stored in tracked files.

## Security and Key Handling
- Do not place API keys in markdown, JSON, or any committed instruction file.
- Store keys in local runtime env only (not in repository artifacts).
- Rotate keys if exposed in chat or logs.

## Final Recommendation
- **Proceed with a controlled pilot** for this crypto intelligence API.
- This API is likely to materially enrich crypto reports, especially for market microstructure, concentration risk, tokenomics reality checks, and investigation-track closure.
- Move to full adoption only after pilot meets coverage, consistency, and token-reduction thresholds.

