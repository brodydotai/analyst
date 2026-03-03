# .agents Directory Guide

This folder contains all agent-operational assets for the Analyst research pipeline.

## Layout

- `protocol.md` — workflow, handoff protocol, and token budget
- `registry.md` — agent index and ownership map
- `research/` — per-agent instruction files (equity, compliance, bull, bear, macro, synthesis)
- `playbooks/` — domain playbook specs, one subfolder per sector
- `playbooks/index.yaml` — ticker-to-playbook auto-detection mapping
- `playbooks/{name}/playbook.prompt.md` — sector playbook instructions
- `playbooks/{name}/sections.json` — compressed section index for compliance scoring
- `templates/` — report skeleton, opinion schema, search query patterns
- `compliance/rules.json` — scoring weights and structural checks

## Boundary Rules

- Agents write consumable output only to:
  - `artifacts/{asset_class}/reports/`
  - `artifacts/{asset_class}/scorecards/`
  - `artifacts/{asset_class}/perspectives/`
  - `artifacts/{asset_class}/synthesis/`
- Agent-operational source files stay inside `.agents/`
- Keep instruction files concise and explicit (< 100 lines)
- Keep path references absolute to this repository layout
