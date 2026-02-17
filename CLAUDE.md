# Analyst — Workflow Context

Operational context for this repository.

## Purpose

Analyst is an agentic investment research workspace focused on:
- Playbook-driven report generation
- Compliance scorecard verification
- Perspective overlays (bull, bear, macro)
- Orchestrated synthesis in chat or markdown artifacts

## Scope

This repo is file-first and research-first.
There is no backend application, frontend application, API server, or database layer in scope.

## Source of Truth

- Agent contracts and workflow: `.agents/`
- Playbooks: `.agents/playbooks/`
- Compliance rules: `.agents/compliance/rules.json`
- Research artifacts: `artifacts/{asset_class}/reports/` and `artifacts/{asset_class}/scorecards/`
- Templates: `.agents/templates/`

## Core Workflow

1. `research/equity` produces `artifacts/{asset_class}/reports/{ticker_lower}.{period}.md`
2. `research/compliance` produces `artifacts/{asset_class}/scorecards/{ticker_lower}.{period}.scorecard.md`
3. `research/bull`, `research/bear`, and `research/macro` return in-memory perspective opinions
4. Orchestrator synthesizes a final recommendation

## Naming Convention

- Report: `{asset_class}/reports/{ticker_lower}.{period}.md`
- Scorecard: `{asset_class}/scorecards/{ticker_lower}.{period}.scorecard.md`

Examples:
- `equities/reports/intc.feb.md`
- `equities/scorecards/intc.feb.scorecard.md`

## Operating Rules

- Never fabricate data in reports
- Cite sources for financial claims
- Keep instructions lean and explicit
- Keep artifacts reproducible and auditable
