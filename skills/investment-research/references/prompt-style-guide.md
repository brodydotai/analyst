# Prompt Style Guide — Creating New Playbooks

Follow this format exactly when creating a new industry-specific prompt.

## Filename

`{industry-slug}.prompt.md` — lowercase, hyphens, no spaces.

Examples: `fintech-and-payments.prompt.md`, `e-commerce-and-marketplaces.prompt.md`

## Structure

Every prompt must contain these elements in order:

### Header

```markdown
# {Industry Name} — Investment Research Prompt
## Codename: {Short Memorable Name}

*Replace `[TICKER]` and `[COMPANY]` before use.*

---
```

The codename should be 1-3 words that capture the thesis angle (e.g., "Silicon Thesis", "Rack Thesis", "Integrity Thesis").

### Role Definition

```markdown
**Role:** You are a Senior {Industry} Investment Strategist specializing in {specific domain expertise}. Your analytical edge comes from {what makes this analyst perspective unique}.
```

One paragraph. Define the analyst's domain expertise and what differentiates their approach.

### Tone Instruction

```markdown
**Instruction on Tone:** Maintain a professional, objective, and intellectually curious tone. {1-2 sentences specific to the industry's analytical nuances}. Your goal is to build a thesis that could survive a skeptical institutional investor's cross-examination.
```

### Sections (A through F minimum)

Each prompt must define **at least 6 analytical sections** labeled A through F (or more). Structure:

**A. Foundational Synthesis** — Industry position, value chain, business model classification, leadership/insider alignment. Every prompt starts here.

**B. Core Economics** — The industry-specific deep dive. This is the analytical core:
- SaaS → unit economics (NRR, CAC, LTV/CAC, Rule of 40)
- Semiconductors → wafer economics (process node, ASP, yield, gross margin bridge)
- TIC → service mix economics (NDT margins vs. AIM vs. consulting)
- Each industry has its own version. Include specific metrics and formulas.

**C. Competitive & Ecosystem Mapping** — Market structure, competitive dynamics, disruption vectors (especially AI), platform dependencies.

**D. Financial Logic & Valuation** — Industry-appropriate valuation frameworks. Specify which multiples matter and why.

**E. Pattern Matching & IDP Flagging** — Divergences to flag as Interesting Data Points. List 4-6 specific patterns unique to the industry.

**F. Investigation Tracks** — Conclude with 3 specific investigation tracks: what expert network calls, data sources, or checks would refine the thesis.

### Section Formatting

Within each section, use subsections for complex industries:

```markdown
**A. Foundational Synthesis — {Subtitle}**

**A1. {Subsection Title}**

{Content with specific analytical instructions}

**A2. {Subsection Title}**

{Content}
```

Simpler industries (e.g., utilities) can use flat sections without subsections.

### Content Rules

1. **Be specific, not generic.** Don't write "analyze the financials." Write "decompose gross margin into wafer cost, yield, die size, mix shift, and fixed cost absorption."
2. **Include industry-specific metrics.** Every industry has metrics that matter more than others. Name them explicitly with formulas or calculation methods.
3. **Reference real benchmarks.** "An NRR above 120% with gross retention above 90% indicates compounding embedded growth" — not "a good NRR."
4. **Flag divergence patterns.** The IDP section should list specific combinations of metrics that, when they diverge, reveal something hidden.
5. **Use `[TICKER]` and `[COMPANY]` as placeholders** throughout. The report generator will substitute these.

## Example: Minimum Viable Prompt

A shorter prompt (like `saas.prompt.md` at ~48 lines) covers sections A-F with key metrics inline. A comprehensive prompt (like `semiconductors-and-accelerators.prompt.md` at ~300 lines) adds subsections, detailed formulas, and extensive pattern libraries. Match the depth to the industry's complexity.

## Quality Check

Before saving, verify:
- [ ] Header with codename and placeholder instruction
- [ ] Role definition with specific domain expertise
- [ ] Tone instruction
- [ ] Sections A through F (minimum) with clear analytical instructions
- [ ] Industry-specific metrics named explicitly
- [ ] IDP flagging patterns included
- [ ] Investigation tracks at the end
- [ ] `[TICKER]` and `[COMPANY]` placeholders used throughout
