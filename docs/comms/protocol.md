# Agent Communication Protocol

This directory is the async message bus between Claude (orchestrator) and Codex (builder). Both agents read and write files here to coordinate work without real-time messaging.

## Initiation Prompt (Required)

Before any work, both agents must read `docs/comms/initiation.md` and follow the role contract.

## How It Works

```
User gives task to Claude (via Cowork)
        │
        ▼
Claude writes a task brief to docs/comms/briefs/
        │
        ▼
User opens Cursor → Codex reads CLAUDE.md → reads docs/comms/briefs/
        │
        ▼
Codex executes the brief, commits code
        │
        ▼
Codex writes a status update to docs/comms/status.md
        │
        ▼
User returns to Cowork → Claude reads status.md → reviews work → writes next brief or audit
```

## Directory Structure

```
docs/comms/
├── protocol.md          ← You are here (rules of engagement)
├── status.md            ← Codex writes current status here after each session
├── backlog.md           ← Claude maintains the prioritized task backlog
└── briefs/
    └── 001-*.md         ← Numbered task briefs from Claude to Codex
```

## Rules

Role-specific rules and read order are centralized in `docs/comms/initiation.md`.
This file describes the comms directory flow and the async handoff.
