# .agents Directory Guide

This folder contains all agent-operational assets.

## Layout

- `protocol.md` — workflow and handoff protocol
- `registry.md` — agent index and ownership map
- `research/` — per-agent instruction files
- `playbooks/` — domain playbook specs consumed by research agents
- `templates/` — report and opinion templates
- `templates/api-routing-index.yaml` — category/provider -> env var routing map
- `templates/droyd-crypto-experiments.md` — crypto experiment modes and scoring rubric
- `compliance/rules.json` — scoring weights and structural checks

## Boundary Rules

- Agents write consumable output only to:
  - `artifacts/{asset_class}/reports/`
  - `artifacts/{asset_class}/scorecards/`
- Agent-operational source files stay inside `.agents/`
- Keep instruction files concise and explicit
- Keep path references absolute to this repository layout
