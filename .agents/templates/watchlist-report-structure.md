# Condensed Report Structure — Watchlist Mode

This template is optimized for fast, token-efficient batch coverage. It favors decision quality over verbose narrative.

---

## Report Format

```markdown
# {COMPANY} ({TICKER})

**Date:** {MM/DD/YYYY}
**Playbook:** {playbook_name}
**Sector:** {sector_label}

---

## Thesis At a Glance

### Bull Case
- {Strongest bull argument with one concrete datapoint}
- {Second bull argument with one concrete datapoint}

### Bear Case
- {Strongest bear argument with one concrete datapoint}
- {Second bear argument with one concrete datapoint}

---

## Trade Ideas

{Synthesize bull/bear + macro into 1-2 actionable trade ideas. Keep it concise and time-aware.}

### Primary Trade
- **Setup:** {What the trade is — long equity, pair trade, options structure, etc.}
- **Entry:** {Current price context and suggested entry zone or trigger}
- **Thesis:** {2-3 sentences connecting the macro backdrop, sector rotation dynamics, and company-specific catalyst into a cohesive narrative for WHY this trade works right now}
- **Timeframe:** {e.g., "3-6 months into Q3 earnings catalyst"}
- **Risk/Reward:** {Approximate upside target vs downside stop, with rationale}
- **Invalidation:** {What kills this trade — be specific}

### Alternative Trade (if applicable)
- **Setup:** {Alternative expression of thesis}
- **Why This Instead:** {When it is superior to primary}

### Macro Context
{2-3 sentences on the current macro regime (Fed policy, yield curve, dollar strength, risk appetite) and how it specifically affects this ticker's sector. Reference real current conditions — rates, spreads, VIX level, sector rotation trends. This should feel like a point-in-time snapshot that anchors the trade ideas.}

---

## Research

{Follow assigned playbook exactly, but keep each section concise.
Use numbered headings: ### 1. {Section Title}, ### 2. {Section Title}, etc.
Include required elements only. Cite every numerical claim. Date all metrics.}

---

## Opinion

```yaml
ticker: {TICKER}
rating: {1-10}
action: "{specific action recommendation}"
confidence: {0.0-1.0}
data_confidence: {0.0-1.0}
timeframe: "{3M/6M/12M/18M}"
thesis: "{Core thesis in one sentence with evidence}"
catalysts:
  - "{Catalyst 1 with timing}"
  - "{Catalyst 2 with timing}"
risks:
  - "{Risk 1 with severity}"
  - "{Risk 2 with severity}"
invalidation: "{Specific condition that breaks the thesis}"
deep_dive_recommended: {true/false}
```

{The Opinion block is a structured data layer consumed by downstream agents (compliance, perspectives, synthesis). It is hidden from the dashboard UI but must be present in every report file.}

---

## Summary for Perspectives

{250-450 word compressed handoff for perspective agents. Follow `.agents/templates/perspective-summary.md`. Keep self-contained and decision-ready.}
```

---

## Rules

1. **Thesis At a Glance comes first.** Users should understand direction in <10 seconds.
2. **Every bullet must include evidence.** Use concrete datapoints.
3. **Trade ideas must be time-anchored and evidence-backed.**
4. **Follow playbook sections, but stay concise.**
5. **Keep report under 2,500 words in watchlist mode.**
6. **Opinion and Summary tail blocks are mandatory.**
7. **Opinion YAML must include all required fields.**
