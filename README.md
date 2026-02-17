# Analyst

Agentic investment research workspace focused on instructions, playbooks, and repeatable report artifacts.

## Focus Areas

1. **Agent instructions** in `.agents/research/` (equity, compliance, bull, bear, macro)
2. **Playbooks** in `.agents/playbooks/`
3. **Compliance rules** in `.agents/compliance/rules.json`
4. **Templates** in `.agents/templates/` (report structure and opinion schema)
5. **Consumable outputs** in `artifacts/` (reports and scorecards)

## Artifact Naming

- Report: `artifacts/{asset_class}/reports/{ticker_lower}.{period}.md`
- Scorecard: `artifacts/{asset_class}/scorecards/{ticker_lower}.{period}.scorecard.md`

Examples:

- `artifacts/equities/reports/intc.feb.md`
- `artifacts/equities/scorecards/intc.feb.scorecard.md`
- `artifacts/crypto/reports/hype.feb.md`
- `artifacts/commodities/scorecards/uranium.feb.scorecard.md`

## Workflow

1. `research/equity` generates a report + YAML opinion block
2. `research/compliance` verifies playbook adherence and writes scorecard in `artifacts/{asset_class}/scorecards/`
3. `research/bull`, `research/bear`, and `research/macro` produce perspective opinions
4. Orchestrator synthesizes recommendations

## Project Structure

```
.agents/
  compliance/
    rules.json
  playbooks/
  protocol.md
  registry.md
  research/
  templates/
artifacts/
  equities/
    reports/
    scorecards/
  commodities/
    reports/
    scorecards/
  crypto/
    reports/
    scorecards/
CLAUDE.md
```
