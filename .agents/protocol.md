# Brodus — Agent Communication Protocol

How agents coordinate work, communicate status, and hand off tasks.

---

## Brief Lifecycle

Every unit of work flows through this lifecycle:

```
Draft → Ready → In Progress → Review → Promote → Archived
```

| Stage | Who | What happens |
|-------|-----|-------------|
| **Draft** | Claude (orchestrator) | Writes the brief in `docs/comms/briefs/`. Status field: `Draft`. Not yet on the backlog. |
| **Ready** | Claude | Marks the brief `Ready`, adds it to `docs/comms/backlog.md`. Assigned agent can pick it up. |
| **In Progress** | Assigned agent | Begins work. Updates `docs/comms/status.md` with current state. |
| **Review** | Claude | Agent completes work. Claude audits against the brief's acceptance criteria. |
| **Promote** | Claude | Extract reusable patterns into standing PRDs (see Promote step below). |
| **Archived** | Claude | Appends audit results to the brief, moves it to `docs/comms/briefs/archive/`, updates the backlog. |

### Promote Step: Reusable Patterns → PRDs

After a brief passes audit and before archiving, Claude evaluates whether the brief introduced patterns, conventions, or standards that future briefs will need to reference. If so, those patterns are extracted into persistent PRD documents in `docs/prd/`.

**When to promote:** A pattern qualifies for promotion if it meets ANY of these criteria:
- It will be referenced by 2+ future briefs (e.g., a design system, API convention, data model pattern)
- It establishes a convention that future agents must follow (e.g., component structure, error handling patterns)
- It defines a reusable component, utility, or architectural decision that should be consistent across the codebase
- Losing it in the archive would force a future agent to re-derive or re-invent it

**How to promote:**
1. Identify the reusable content in the brief (design directives, component patterns, API conventions, etc.)
2. Extract it into the appropriate PRD file in `docs/prd/` — create the file if it doesn't exist, append if it does
3. Replace the inline content in the brief with a cross-reference to the new PRD location
4. Update `docs/STRUCTURE.md` if a new PRD file was created

**Examples:**
- Brief 002 defines the terminal-wide design directive → promote to `docs/prd/frontend/design-system.md`
- A backend brief establishes an API error handling pattern → promote to `docs/prd/backend/api-conventions.md`
- A brief introduces a new data model convention → promote to `docs/prd/database/conventions.md`

**When NOT to promote:** Brief-specific implementation details (exact file lists, commit strategies, one-off acceptance criteria) stay in the archived brief. Only patterns that generalize beyond the brief get promoted.

**Rules:**
- Brief numbers are never reused.
- Archived briefs retain full content including audit results — they are the project's ticket history.
- The archive is append-only. Never delete or modify archived briefs.

---

## Communication Channels

| Channel | Location | Owner | Purpose |
|---------|----------|-------|---------|
| Backlog | `docs/comms/backlog.md` | Claude | Priority-ordered work queue |
| Briefs | `docs/comms/briefs/*.md` | Claude | Active task specifications |
| Archive | `docs/comms/briefs/archive/*.md` | Claude | Completed task history |
| Status | `docs/comms/status.md` | Codex | Current state, blockers, session log |
| Changelog | `docs/comms/logs/changelog.md` | Codex | Code and structural change history |
| Context | `docs/comms/logs/context.md` | Claude | Strategic decisions, session context |
| Best Practices | `docs/comms/logs/best-practices.md` | Any agent | Patterns, lessons learned |

---

## Async Handoff Flow

```
User gives task to Claude (via Cowork)
        │
        ▼
Claude writes a task brief to docs/comms/briefs/
        │
        ▼
User opens Cursor → Agent reads .agents/initiation.md → reads INSTRUCTIONS.md → reads brief
        │
        ▼
Agent executes the brief, commits code
        │
        ▼
Agent writes status update to docs/comms/status.md
        │
        ▼
User returns to Cowork → Claude reads status.md → audits work → archives brief or requests fixes
```

---

## Handoff Rules

1. **Agents never modify each other's files directly.** If one agent needs another to act, it writes a brief or a status update.
2. **The backlog is the single source of priority.** Agents work the top item assigned to them.
3. **Blockers go in status.md.** If an agent is stuck, it logs the blocker under "Decisions needed from Claude" and halts.
4. **Audit before archive.** No brief moves to archive without Claude reviewing the work against acceptance criteria.

---

## Task Delegation Matrix

| Task Type | Primary Agent | Output |
|-----------|--------------|--------|
| Feature development (backend) | build/backend | Code commits |
| Feature development (frontend) | build/frontend | Code commits |
| Architecture decisions | build/orchestrator | CLAUDE.md updates, briefs |
| Brief writing | build/orchestrator | docs/comms/briefs/*.md |
| Investment research | research/equity | Markdown reports in research/reports/ |
| Report verification | research/equity | Scorecards |
| Database migrations | build/backend | SQL files |
| Documentation updates | build/orchestrator | docs/ files |
| Playbook creation | build/orchestrator | research/prompts/ files |
| Bug fixes (backend) | build/backend | Code commits |
| Bug fixes (frontend) | build/frontend | Code commits |

---

## Daily Operating Loop (Target State)

```
06:00  Feed agents ingest overnight filings + news
06:30  Analysis agents process new documents, extract entities, generate embeddings
07:00  Claude generates 24h briefing across all watchlist assets
07:30  Briefing surfaced to user via command center
       ↓
       User reviews briefing, flags items for deeper research
       ↓
       Claude delegates deep-dive reports to research agents
       ↓
       Reports generated, verified, stored in artifact store
       ↓
       User reviews reports, provides feedback
       ↓
       Feedback logged → playbooks refined → next cycle improves
```

---

## Future: Database-Backed Communication

When the Supabase artifact store matures, agent communication will evolve:

1. **Task queue table** — Claude writes tasks, agents claim and execute them
2. **Artifact registry** — All agent outputs stored with metadata (agent, timestamp, quality score)
3. **Agent state table** — Track what each agent knows, last sync timestamp
4. **Event log** — Append-only record of all agent actions for audit trail

This replaces file-based communication with structured, queryable state.
