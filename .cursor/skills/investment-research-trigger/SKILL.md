---
name: investment-research-trigger
description: Runs the Analyst no-code investment research workflow when the user says "do investment research on [ticker]" or asks for equity analysis. Use this skill to classify asset type, run covered workflows, and produce a build-request prompt for unsupported assets.
---

# Investment Research Trigger

## Purpose

Use this skill as the default workflow when the user asks for investment research, especially with trigger phrasing like:
- `do investment research on TSLA`
- `analyze AAPL`
- `run research on [ticker]`

This is a **no-code execution skill**. It does not change code.

## Guardrails

- Never modify files or code as part of this workflow.
- Use existing framework assets only.
- If required data is missing, state that clearly and continue with best-effort analysis.
- Keep outputs structured and ingestible by the current local UI workflow.

## Step 1: Detect Trigger and Extract Instrument

When user intent is investment analysis:
1. Extract the target instrument/ticker from the request.
2. Infer asset class if obvious.
3. If asset class is not obvious, ask a follow-up:
   - "Before I run research, confirm the asset class: equity, crypto, bond, commodity, ETF, or other?"

## Step 2: Route by Asset Class

### Equity (supported now)
Run the Analyst no-code research workflow:
- Playbook source: `research/playbooks/*.prompt.md`
- Report template: `research/templates/report-structure.md`
- Opinion schema: `research/templates/opinion-block.yaml`
- Compliance rules: `research/compliance/rules.json`
- Agent behavior reference: `.agents/research/equity/INSTRUCTIONS.md`

Output in this exact structure:
1. `## Report Markdown`
2. `## Compliance Self-Score`
3. `## System Monitoring Entries`
4. `## Operator Notes`

### Crypto / Bond / Commodity / ETF / Other (not fully covered)
If asset class is not fully supported by current playbooks/skillbase:
1. Say it is currently outside covered scope.
2. Ask whether the user wants:
   - a temporary best-effort analysis using a nearby playbook, or
   - a formal framework build request.
3. If user wants build request, output `## Build Request Prompt` (see format below).

## Step 3: Build Request Prompt (for unsupported scope)

When unsupported, generate this block exactly:

```markdown
## Build Request Prompt

Please extend Analyst to support **{asset_class}** research for **{instrument}**.

### Requested capability
- Asset class: {asset_class}
- Instrument example: {instrument}
- Target workflow: no-code research execution + report viewing in current local UI

### Requirements
1. Add or adapt playbook(s) for {asset_class}.
2. Define required report sections and opinion schema for {asset_class}.
3. Add compliance rules for scoring section/element/structure quality.
4. Keep compatibility with:
   - `research/templates/report-structure.md`
   - `research/templates/opinion-block.yaml` (or a class-specific variant)
   - `research/compliance/rules.json` (or class-specific rule set)
5. Ensure outputs remain viewable in current Research/System pages.

### Acceptance criteria
- User can say: "do investment research on {instrument}"
- Agent asks asset-class clarification if needed
- Agent runs correct workflow for {asset_class}
- Report + monitoring entries are produced with no code edits during runtime
```

## Response Style

- Be direct and operational.
- Prefer checklists and explicit sections.
- Do not add architecture brainstorming unless asked.
- Optimize for repeatable daily use.

## Quick Decision Logic

1. Trigger detected? -> yes.
2. Instrument extracted? -> if no, ask.
3. Asset class known? -> if no, ask.
4. Equity? -> run supported workflow.
5. Non-equity unsupported? -> generate build request prompt.
