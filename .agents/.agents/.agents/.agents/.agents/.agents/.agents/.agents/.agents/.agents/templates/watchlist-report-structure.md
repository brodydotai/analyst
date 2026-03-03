# Streamlined Report Structure — Watchlist Mode

This template defines the output format for watchlist batch runs. It produces a single self-contained document per ticker that combines the bull/bear thesis, full research, and data enrichment suggestions.

---

## Report Format

```markdown
# {COMPANY} ({TICKER}) — Investment Research

**Date:** {YYYY-MM-DD}
**Playbook:** {playbook_name}
**Sector:** {sector_label}

---

## Thesis At a Glance

### Bull Case
1. {Strongest bull argument — one sentence with a specific data point}
2. {Second bull argument — one sentence with a specific data point}
3. {Third bull argument — one sentence with a specific data point}

### Bear Case
1. {Strongest bear argument — one sentence with a specific data point}
2. {Second bear argument — one sentence with a specific data point}
3. {Third bear argument — one sentence with a specific data point}

---

## Trade Ideas

{Synthesize the bull/bear thesis, current macro regime, broad market conditions, and sector performance into 1-3 actionable trade ideas for this ticker at the time of writing. Each trade idea should be specific and time-aware.}

### Primary Trade
- **Setup:** {What the trade is — long equity, pair trade, options structure, etc.}
- **Entry:** {Current price context and suggested entry zone or trigger}
- **Thesis:** {2-3 sentences connecting the macro backdrop, sector rotation dynamics, and company-specific catalyst into a cohesive narrative for WHY this trade works right now}
- **Timeframe:** {e.g., "3-6 months into Q3 earnings catalyst"}
- **Risk/Reward:** {Approximate upside target vs downside stop, with rationale}
- **Invalidation:** {What kills this trade — be specific}

### Alternative Trade (if applicable)
- **Setup:** {A different way to express the same thesis — e.g., selling puts instead of buying shares, or a sector ETF proxy if single-stock risk is too high}
- **Why This Instead:** {When would the alternative be better than the primary}

### Macro Context
{2-3 sentences on the current macro regime (Fed policy, yield curve, dollar strength, risk appetite) and how it specifically affects this ticker's sector. Reference real current conditions — rates, spreads, VIX level, sector rotation trends. This should feel like a point-in-time snapshot that anchors the trade ideas.}

---

## Research

{Full playbook sections A through F here. Follow the assigned playbook exactly.
Each section should use the playbook's section header format:
**A. {Section Title}**, **B. {Section Title}**, etc.
Include all required elements per the playbook.
Cite every financial claim. Date all metrics.}

---

## Opinion

```yaml
ticker: {TICKER}
company: {COMPANY}
date: {YYYY-MM-DD}
playbook: {playbook_file}
rating: {1-10}
action: {Strong Sell|Sell|Reduce|Underperform|Hold|Neutral-Positive|Accumulate|Buy|Strong Buy|High-Conviction Buy}
confidence: {0.0-1.0}
thesis: "{One-sentence core thesis}"
target_timeframe: "{e.g., 6-12 months}"
key_catalyst: "{Single most important upcoming catalyst}"
invalidation: "{What would break the thesis}"
```

---

## Data Enrichment Suggestions

> The following data sources would improve this analysis if available. These are not report failures — they represent opportunities to deepen the research with additional access.

{List each missing data dimension as a compact bullet. Group by category.}

**Financials:**
- {e.g., "Granular segment-level margins from 10-K (SEC EDGAR access would enable this)"}
- {e.g., "Consensus EPS estimates from sell-side (requires terminal access)"}

**Market Data:**
- {e.g., "Options flow and implied volatility skew (requires real-time options data)"}
- {e.g., "Institutional ownership changes from latest 13F filings"}

**Alternative Data:**
- {e.g., "Web traffic trends via SimilarWeb or Semrush"}
- {e.g., "Patent filing analysis from USPTO"}
- {e.g., "Satellite imagery for supply chain monitoring"}

**Industry-Specific:**
- {e.g., "Rig count data from Baker Hughes (for O&G)"}
- {e.g., "Fab utilization rates from SEMI (for semiconductors)"}

{Only include categories that are relevant. Typically 4-8 bullets total.
Do NOT list things the report already covers. Only list what would ADD value.}
```

---

## Rules

1. **Thesis At a Glance comes first.** The user should know the bull and bear case within 10 seconds of opening the document.
2. **Each bullet must contain a specific data point.** Not "strong revenue growth" but "revenue grew 34% YoY to $2.1B in Q3 2025."
3. **Trade Ideas must be time-anchored.** Reference the actual macro conditions, Fed posture, sector performance, and market regime at the time of the query. These should read as "here's what I'd do right now" not generic strategy.
4. **Trade Ideas come from the research, not from thin air.** The primary trade should flow directly from the strongest bull or bear argument. Don't invent setups that aren't supported by the analysis.
5. **The research body follows the playbook exactly.** Don't skip sections or merge them.
6. **The opinion block is machine-readable YAML.** Keep it clean and parseable.
7. **Data Enrichment Suggestions are constructive, not critical.** Frame them as "what would make this even better" not "what's missing."
8. **Keep each report under 3,500 words.** Watchlist mode favors breadth over depth. If a ticker warrants a deeper dive, note it in the opinion block with a flag: `deep_dive_recommended: true`.
