# Analyst

Agentic investment research workspace focused on instruction quality, playbooks, and repeatable report artifacts.

## Focus Areas

1. **Agent instructions** in `.agents/` (equity, compliance, bull, bear, macro, orchestration protocol)
2. **Playbooks** in `research/playbooks/` (industry-specific analytical frameworks)
3. **Compliance rules** in `research/compliance/rules.json`
4. **Research artifacts** in `research/reports/` (reports and scorecards)
5. **Templates** in `research/templates/` (report structure and opinion schema)

## Artifact Naming

- Report: `research/reports/{ticker_lower}.{period}.md`
- Scorecard: `research/reports/{ticker_lower}.{period}.scorecard.md`

Examples:

- `research/reports/intc.feb.md`
- `research/reports/intc.feb.scorecard.md`
- `research/reports/hype.feb.md`
- `research/reports/uranium.feb.scorecard.md`

## Workflow

1. `research/equity` generates a report + YAML opinion block
2. `research/compliance` verifies playbook adherence and writes scorecard
3. `research/bull`, `research/bear`, and `research/macro` produce perspective opinions
4. Orchestrator synthesizes recommendations

## Project Structure

```
.agents/
  protocol.md
  registry.md
  research/
research/
  playbooks/
  templates/
  compliance/
  reports/
CLAUDE.md
```
