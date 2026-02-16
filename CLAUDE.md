# Analyst — Project Intelligence

Shared context for this repository.

## What Analyst Is

Analyst is an agentic investment research workspace.
It focuses on:
- Playbook-driven report generation
- Compliance scorecard verification
- Perspective overlays (bull, bear, macro)
- Orchestrated synthesis in chat or markdown artifacts

## Scope

This repo is file-first and research-first.
There is no backend application, frontend application, API server, or database layer in scope.

## Source of Truth

- Agent contracts and workflow: `.agents/`
- Playbooks: `research/playbooks/`
- Compliance rules: `research/compliance/rules.json`
- Research artifacts: `research/reports/`
- Templates: `research/templates/`

## Core Workflow

1. `research/equity` produces `research/reports/{ticker_lower}.{period}.md`
2. `research/compliance` produces `research/reports/{ticker_lower}.{period}.scorecard.md`
3. `research/bull`, `research/bear`, and `research/macro` return in-memory perspective opinions
4. Orchestrator synthesizes a final recommendation

## Naming Convention

- Report: `{ticker_lower}.{period}.md`
- Scorecard: `{ticker_lower}.{period}.scorecard.md`

Examples:
- `intc.feb.md`
- `intc.feb.scorecard.md`

## Operating Rules

- Never fabricate data in reports
- Cite sources for financial claims
- Keep instructions lean and explicit
- Keep artifacts reproducible and auditable
