---
name: investment-research
description: >
  Generate deep-dive investment research reports for publicly traded companies using
  the Brodus playbook system. Triggers on: any request to research a stock, analyze
  a company, generate an investment report, write a thesis, or evaluate a ticker.
  Also triggers on: "research [TICKER]", "report on [COMPANY]", "analyze [TICKER]",
  "investment thesis for [COMPANY]", "deep dive on [TICKER]", or any mention of
  generating a stock/equity research report. This skill enforces the Brodus prompt
  framework — it matches companies to industry-specific analytical playbooks, conducts
  web research, generates structured reports, runs compliance verification, and saves
  all outputs to the research workspace.
---

# Investment Research Report Generator

Generate institutional-quality investment research reports using the Brodus playbook system. Every report follows an industry-specific analytical framework (prompt), is backed by current web research, and is scored for compliance.

## Workspace Paths

- **Prompts:** `research/prompts/`
- **Reports:** `research/reports/`
- **Verifier:** `research/verify_prompt_compliance.py`

## Workflow

Execute in order for every report:

### 1. Identify company

Extract ticker and full company name. Confirm both before proceeding.

### 2. Match to playbook

Read available prompts in `research/prompts/`. See `references/prompt-index.md` for the catalog.

Select the prompt whose industry best fits. If multiple industries apply (e.g., Chinese data center company), use multiple prompts and synthesize.

**If no prompt exists:** Create one first. Follow `references/prompt-style-guide.md` exactly. Save to `research/prompts/{industry-slug}.prompt.md`.

### 3. Research

Use web search to gather current data across:
- Business model, competitive position, moat
- Latest quarterly results, margins, revenue trend, guidance
- Leadership, insider activity, board composition
- Catalysts, risks, regulatory changes
- Valuation multiples vs. peers and historical range

For complex companies or multi-prompt reports, spawn parallel sub-agents via Task tool.

### 4. Generate report

Follow the matched prompt's section structure exactly (`A`, `B`, `C`, ... with subsections `A1`, `A2`, `B1`, ...).

**Header format:**
```markdown
# {Company Name} [{TICKER}] — Investment Research Report
## {Codename from prompt} | {Month} {Year}

**Prompt Used:** `{filename}`
**Analyst Framework:** {Role line from prompt}

---
```

**Body rules:**
- Every section and subsection from the prompt must appear in the report
- Bold IDP callouts as blockquotes: `> **IDP: {Title}**\n> {Explanation}`
- Use specific numbers, dates, sources. Never fabricate financial data.
- End with investigation tracks per the prompt
- Tone: professional, objective, empirically grounded. Bull and bear with equal rigor.

**Save as:** `research/reports/{ticker_lower}.{month_lower}.md`

### 5. Verify

```bash
python3 research/verify_prompt_compliance.py \
  --prompt research/prompts/{prompt} \
  --report research/reports/{report} \
  --output research/reports/{ticker}.{month}.scorecard.md
```

If multiple prompts used, verify against each.

### 6. Deliver

Present: report link, scorecard link, grade, any flagged gaps. Note the verifier is keyword-based and intentionally strict.

## Multiple Companies

Spawn parallel sub-agents (one per company) via Task tool. Each follows the same workflow. Collect and present results together.

## References

- `references/prompt-index.md` — Current catalog of all playbooks with industry mappings
- `references/prompt-style-guide.md` — Required format for creating new playbooks
