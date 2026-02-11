# Brief Template

This is the canonical template for writing task briefs. The orchestrator uses this when creating new briefs in `docs/comms/briefs/`. Every brief must follow this structure.

For the brief lifecycle (Draft → Ready → In Progress → Review → Promote → Archived), see `.agents/protocol.md`.

---

## Template

```markdown
# Brief [NNN]: [Short Title] — [Scope Tag]

**Assigned to:** [Agent ID from registry, e.g., "Codex (build/backend + build/frontend)" or "Claude (build/orchestrator)"]
**Phase:** [Roadmap phase this advances, e.g., "Phase 1: Command Center" — see docs/roadmap.md]
**Priority:** [P0 (execute immediately) | P1 (next up) | P2 (queued)]
**Status:** [Draft | Ready | In Progress | Review | Archived]

---

## Objective

[2-4 sentences. What are we building and why? State the user-facing outcome, not implementation details. If this brief establishes patterns that future briefs depend on, say so explicitly.]

**Work on a new branch:** `feature/[kebab-case-name]`

Branch from `main`. All work goes on this branch. Do NOT merge — Claude will review and approve first.

---

## Context

[OPTIONAL — include when the brief needs background that isn't obvious from the objective.]

[Why now? What does this unblock? What problem does this solve? Link to relevant PRDs, architecture docs, or previous briefs for deeper context. Keep this section short — if it's longer than the Objective, you're over-explaining.]

**References:**
- [Link to relevant PRD, e.g., `docs/prd/frontend/journal.md`]
- [Link to relevant architecture section, e.g., `docs/architecture.md` → "Domain Module Pattern"]
- [Link to previous brief if this is a continuation, e.g., `docs/comms/briefs/archive/002-trade-journal.md`]

---

## Reusable Patterns

[OPTIONAL — include ONLY when this brief introduces conventions, design patterns, or standards that will be promoted to PRDs after audit. If this brief is just implementing existing patterns, omit this section and reference the relevant PRD instead.]

[Document the pattern here in full detail. After the brief passes audit, this section will be extracted into the appropriate `docs/prd/` file as part of the Promote step (see .agents/protocol.md → "Promote Step").]

**Promotion target:** `docs/prd/[domain]/[file].md`

---

## Deliverables

[Numbered list. Each deliverable is a concrete output — a file, a component, a migration, an API route. Include enough specification that the assigned agent can build it without guessing. Code examples are encouraged for patterns the agent hasn't seen before.]

### 1. [Deliverable Name]

**File:** `[exact path]`

[What this deliverable is, what it contains, and how it fits into the system. Include schema definitions, type signatures, component patterns, or API contracts as needed.]

### 2. [Deliverable Name]

**File(s):** `[exact path(s)]`

[Same level of detail. For API routes, include the method, path, request/response shape, and status codes. For frontend components, include the props interface and visual layout if applicable.]

### N. [Continue as needed]

---

## File Manifest

[Explicitly list every file the agent will touch. This is the agent's scope boundary for this brief.]

### Files to Create

| File | Description |
|------|-------------|
| `[path]` | [One-line purpose] |

### Files to Modify

| File | Change |
|------|--------|
| `[path]` | [What's changing and why] |

### Files NOT to Modify

[List files that are adjacent to the work but off-limits. Be specific — agents need clear boundaries.]

- `[path]` — [reason, e.g., "Claude's territory", "different brief's scope", "append-only migration"]

---

## Commit Strategy

[Ordered list of commits. One commit per logical unit of work. Each commit should leave the project in a buildable state.]

1. `[conventional commit message]`
   - [Files included in this commit]
2. `[conventional commit message]`
   - [Files included]

After all commits, update `docs/comms/status.md` and append to `docs/comms/logs/changelog.md`.

---

## Acceptance Criteria

[Grouped by category. Every criterion must be specific and auditable — the orchestrator will check each one during the Review stage. Avoid vague criteria like "works correctly" or "looks good".]

### [Category, e.g., "Backend"]
- [ ] [Specific, verifiable criterion]
- [ ] [Another criterion]

### [Category, e.g., "Frontend"]
- [ ] [Specific, verifiable criterion]

### [Category, e.g., "Design Compliance"]
- [ ] [Specific, verifiable criterion]

---

## Notes

[OPTIONAL — include only if there are implementation hints, dependency notes, or known constraints that don't fit elsewhere.]

- [Note about existing utilities the agent should use]
- [Note about potential gotchas or edge cases]
- [Note about vercel.json or config changes that might be needed]
```

---

## Section Reference

| Section | Required? | Purpose |
|---------|-----------|---------|
| **Header** | Yes | Identity, assignment, status. The backlog references this. |
| **Objective** | Yes | What and why. Must fit in 4 sentences. |
| **Context** | No | Background, rationale, references. Include when non-obvious. |
| **Reusable Patterns** | No | New conventions that will be promoted to PRDs post-audit. Include only when the brief introduces something new. |
| **Deliverables** | Yes | The work itself. Numbered, specific, with code examples. |
| **File Manifest** | Yes | Explicit scope boundary. Create, Modify, and NOT Modify lists. |
| **Commit Strategy** | Yes | Ordered commits with conventional messages and file lists. |
| **Acceptance Criteria** | Yes | Grouped, specific, auditable. The orchestrator checks each one. |
| **Notes** | No | Implementation hints, known constraints, existing utilities. |

---

## Writing Guidelines

**Objective:** State the user-facing outcome. "Build a Trade Journal page with P&L tracking" not "Create database tables and API routes for trade entries." The agent needs to understand the goal, not just the task list.

**Deliverables:** Be precise enough that the agent doesn't have to guess. If you want a specific schema, write it. If you want a specific component structure, draw the layout. Ambiguity in the brief becomes bugs in the code.

**Acceptance Criteria:** Write them as if the auditor has no context beyond this brief. Each criterion should be independently verifiable. Bad: "API works." Good: "POST /api/python/journal/trades returns 201 with the created object including a UUID id field."

**Reusable Patterns:** Only include this section when the brief establishes something new that future briefs will reference. If the brief is implementing an existing design system, reference the PRD instead of re-documenting the pattern. The Promote step in the post-audit checklist will extract this section into `docs/prd/`.

**File Manifest:** The "NOT to Modify" list is as important as the "Create" list. Agents work better with explicit boundaries. Include files that are thematically close to the work but belong to other agents or other briefs.

**Commit Strategy:** Each commit should be independently reviewable. Don't batch migrations with frontend changes. The conventional commit prefix (`feat:`, `fix:`, `refactor:`, `docs:`) helps the changelog stay clean.

---

## Numbering Convention

Briefs are numbered sequentially starting from 000. Numbers are never reused, even for abandoned briefs. The number is a permanent identifier — it appears in the filename, the header, the backlog, and the archive.

Format: `docs/comms/briefs/NNN-kebab-case-description.md`

Examples:
- `000-rename-and-refactor.md`
- `001-watchlist-crud.md`
- `002-trade-journal.md`
- `003-agent-infrastructure.md`
