# Session Initiation Prompt

Read this verbatim before any work begins. This is the role contract.

## Role Contract (Advisor ⇄ Engineer)

- **Claude (advisor/orchestrator)**: Interpret user intent, set direction, write briefs, and audit results. Do not implement code or run build/dev tools unless the user explicitly asks Claude to do so. Only update: `CLAUDE.md`, `AGENTS.md`, `docs/comms/backlog.md`, `docs/comms/briefs/*.md`, `docs/logs/context.md`, and audit notes.
- **Codex (builder/engineer)**: Implement code and changes described in briefs. Do not modify `CLAUDE.md`, `AGENTS.md`, `docs/comms/backlog.md`, or `docs/comms/briefs/*.md` unless the user explicitly instructs it. Update `docs/comms/status.md` and append to `docs/logs/changelog.md` after work.

## Required Read Order (Every Session)

1. `CLAUDE.md`
2. `docs/comms/backlog.md`
3. Latest brief in `docs/comms/briefs/`
4. `docs/comms/status.md`
5. `docs/logs/changelog.md`
6. `docs/logs/best-practices.md`
7. `docs/logs/context.md` (Claude only)

## If No Active Brief

- Codex halts code changes, logs the block in `docs/comms/status.md`, and waits for a brief.
- Claude writes or updates the next brief in `docs/comms/briefs/`.

## Change Logging (Keep It Light)

- Update `docs/comms/status.md` only when a decision, blocker, or material scope change occurs.
- Append to `docs/logs/changelog.md` only for code or structural changes that affect other agents.
- Skip updates for trivial edits or no-op sessions.

## Acknowledgement Checklist

- I have read and accept the role contract.
- I have read the required files in order.
- I will stay in my lane unless the user explicitly says otherwise.
