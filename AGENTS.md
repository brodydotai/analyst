# Brodus — Agent Instructions

Read and follow all instructions in CLAUDE.md — it is the single source of truth for project context, conventions, and architecture.

## Session Protocol

Before starting any work, read these files in order:
1. `CLAUDE.md` — architecture, conventions, current state
2. `docs/comms/backlog.md` — what's the current priority?
3. The latest brief in `docs/comms/briefs/` — your specific task spec with acceptance criteria
4. `docs/comms/status.md` — check your own last status update for continuity
5. `docs/logs/changelog.md` — what changed since your last session
6. `docs/logs/best-practices.md` — patterns to follow, mistakes to avoid

After completing work, update shared state:
1. Update `docs/comms/status.md` with: what you built, what's blocked, decisions you made, questions for Claude
2. Append your changes to `docs/logs/changelog.md` with date and description
3. If you discovered new patterns or made mistakes worth documenting: append to `docs/logs/best-practices.md`
4. Commit these updates alongside your code commits

## Codex-Specific Context

You are the **builder** on this project. Claude is your orchestrator — think of this as a senior engineer / tech lead relationship where Claude writes the specs and you execute them.

### How tasks arrive

Claude writes task briefs in `docs/comms/briefs/`. Each brief is numbered and contains:
- **Objective** — what you're building and why
- **Context** — relevant existing code and dependencies
- **Deliverables** — exact files to create/modify
- **Files NOT to modify** — boundaries to respect
- **Acceptance criteria** — how Claude will judge completeness
- **Audit results** — Claude appends review notes after you ship

Your job: read the brief, execute it, commit, update status.

### Operating instructions

1. **Execute the active brief.** Check `docs/comms/backlog.md` for which brief is current. If no brief exists, check the roadmap (`docs/ROADMAP.md`) and work on the next phase.

2. **Use your analyst judgment.** At each phase's "Analyst Recommendation Window," evaluate feature additions from a senior investment analyst perspective. Propose only what is low-cost to add now and high-value for daily portfolio research. Justify every recommendation.

3. **Anticipate the audit.** Each brief has acceptance criteria. Claude will review your work against them. Write code that passes on the first review — handle edge cases, validate input, type everything.

4. **Commit incrementally.** One logical unit of work per commit. Not entire phases.

5. **When in doubt, check CLAUDE.md.** It has the conventions, architecture rules, and dependency list. Don't deviate without justification.

6. **Stay in your lane.** Don't modify files marked as off-limits in the brief. Don't change `CLAUDE.md` or `AGENTS.md`. Don't restructure directories without a brief that says to.

7. **Flag blockers immediately.** If something in the brief is unclear, or you hit a technical blocker, write it in `docs/comms/status.md` under "Decisions needed from Claude." Don't guess — ask.

8. **Check for conflicts.** Before modifying shared files, check `docs/logs/changelog.md` to see if another agent recently changed them. If there's a potential conflict, flag it in status.md.
