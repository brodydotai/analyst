# Report Template v2

This is the ONLY accepted report format. Every report must follow this structure exactly. No additions, no omissions, no reordering.

---

## Format

```markdown
# {COMPANY NAME} ({TICKER})

**Date:** {MM/DD/YYYY}
**Playbook:** {playbook_name}
**Sector:** {sector_label}

---

## Executive Summary

{3-5 sentences. What the company does, market position, current state. Include: current price, market cap, and one key financial metric (revenue, P/E, yield — whatever matters most for this type of security). For ETFs: AUM, expense ratio, top holding and weight.}

---

## Macro Context

{3-5 sentences. Current macro regime and how it specifically impacts this ticker. Fed policy, rates trajectory, dollar strength, sector rotation, commodity cycle, or geopolitical factor — whichever is most relevant. Time-stamp it: "As of March 2026..." This is the macro lens through which the rest of the report should be read.}

---

## Bull Case

1. {Strongest bull argument — one sentence, one specific datapoint}
2. {Second bull argument — one sentence, one specific datapoint}
3. {Third bull argument — one sentence, one specific datapoint}

## Bear Case

1. {Strongest bear argument — one sentence, one specific datapoint}
2. {Second bear argument — one sentence, one specific datapoint}
3. {Third bear argument — one sentence, one specific datapoint}

---

## Primary Trade

- **Setup:** {Long equity / short / pair / options — what the trade IS}
- **Entry:** {Current price and entry zone with trigger condition}
- **Target:** {Price target with reasoning}
- **Stop:** {Stop loss level with reasoning}
- **Timeframe:** {e.g., "6M through Q3 2026 earnings"}
- **Catalyst:** {The specific event or data release that drives this trade}
- **Invalidation:** {What kills the thesis — be specific and measurable}

---

## Research

{Follow the assigned playbook sections exactly. Use numbered headings:}

### 1. {Playbook Section 1 Title}
{Content — cite every financial claim, date all metrics}

### 2. {Playbook Section 2 Title}
{Content}

### 3. {Playbook Section 3 Title}
{Content}

{Continue through all required playbook sections, typically 4-6 total.}

---

## Opinion

```yaml
ticker: {TICKER}
rating: {1-10, integer or one decimal}
action: "{Buy / Sell / Hold / Accumulate / Reduce — max 5 words}"
confidence: {0.0-1.0}
data_confidence: {0.0-1.0}
timeframe: "{3M / 6M / 12M / 18M}"
thesis: "{One sentence, max 30 words}"
catalysts:
  - "{Catalyst 1 with timing}"
  - "{Catalyst 2 with timing}"
risks:
  - "{Risk 1}"
  - "{Risk 2}"
invalidation: "{One sentence, measurable condition}"
```
```

---

## Rules

1. **Every report follows this template exactly.** No extra sections. No renamed fields. No creative formatting in Opinion YAML.
2. **Opinion YAML is machine-parsed.** The dashboard reads: ticker, rating, action, confidence, data_confidence, timeframe, thesis, catalysts, risks, invalidation. If ANY key is missing or renamed, the dashboard breaks.
3. **Opinion YAML keys are lowercase, no underscores except where shown.** `data_confidence` is the only underscore. `action` not `recommended_action`. `rating` not `conviction_level`. `timeframe` not `timeframe_months`.
4. **`action` must be short.** "Buy", "Accumulate", "Hold", "Reduce", "Sell". Not a sentence. Not a paragraph.
5. **`thesis` must be one sentence under 30 words.** Not a paragraph.
6. **`rating` must be a number.** Not "BUY". Not "ACCUMULATE_INTO_STRENGTH". A number: 7, 8.5, etc.
7. **`confidence` and `data_confidence` are decimals 0.0-1.0.** Not percentages. Not integers.
8. **`catalysts` and `risks` are arrays of short strings.** Not objects. Not nested YAML.
9. **Report target: 1,500-2,500 words total.** Executive Summary + Macro + Bull/Bear + Trade + Research + Opinion.
10. **No Summary for Perspectives section.** Removed from template. Bull/bear/macro agents read the full report if needed.
11. **Cite every financial claim.** Undated claims are worthless. Always include the date or period for any metric.
