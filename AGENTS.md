# Brodus — Agent Instructions

Read `.agents/initiation.md` before any work. It defines the role contract and session steps.
`CLAUDE.md` remains the source of truth for project context and architecture.

## Scoped Instructions

Your detailed, role-specific instructions live in the `.agents/` directory:

- **Backend builder:** `.agents/build/backend/INSTRUCTIONS.md`
- **Frontend builder:** `.agents/build/frontend/INSTRUCTIONS.md`
- **Orchestrator (Claude):** `.agents/build/orchestrator/INSTRUCTIONS.md`
- **Equity research:** `.agents/research/equity/INSTRUCTIONS.md`

Read your scoped instructions file at the start of every session. It defines your read order, file ownership boundaries, and domain conventions.

## Agent Registry

See `.agents/registry.md` for the full index of all agents, their capabilities, and entry points.

## Communication Protocol

See `.agents/protocol.md` for the brief lifecycle, handoff rules, and communication channels.

## Quick Reference

| Role | Entry Point | Primary Output |
|------|-------------|----------------|
| Orchestrator | `.agents/build/orchestrator/INSTRUCTIONS.md` | Briefs, audits, documentation |
| Backend builder | `.agents/build/backend/INSTRUCTIONS.md` | Migrations, models, routes, services |
| Frontend builder | `.agents/build/frontend/INSTRUCTIONS.md` | Components, pages, types, styling |
| Equity research | `.agents/research/equity/INSTRUCTIONS.md` | Reports, scorecards |
