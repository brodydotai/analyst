# Brodus — Best Practices & Capabilities

Patterns, lessons learned, and capability notes that should persist across sessions. This file helps agents avoid repeating mistakes and leverage proven approaches.

---

## Agent Capabilities (Cowork / Claude)

### What Claude Can Do Well
- **Parallel research:** Spawn multiple sub-agents to research different companies simultaneously
- **Markdown report generation:** Produce structured investment reports following playbook frameworks
- **Code generation:** Build full applications (React, Python, Node) from specification
- **File management:** Read, write, edit files across the mounted workspace
- **Web research:** Search the web and fetch page content for current data (subject to paywalls)
- **Verification:** Build and run automated quality checks on generated outputs
- **Architecture design:** Create diagrams, design systems, plan implementation phases
- **Context management:** Maintain logs and documentation across session boundaries

### What Claude Cannot Do (Current Constraints)
- **No persistent memory across sessions** — Must rely on log files (this system) to retain context
- **No real-time financial data APIs** — Cannot pull live prices, fundamentals, or market data
- **No direct SEC EDGAR integration** — Can search the web for filing info but can't query EDGAR APIs directly
- **No earnings transcript access** — Paywalled by providers (Seeking Alpha, etc.)
- **No code execution on remote servers** — Can write code but can't deploy or run it on Vercel/Supabase
- **No direct Supabase access** — Can write migration SQL and API code but can't execute queries against the live database
- **Context window limits** — Long sessions require summarization; details can be lost during compaction

### What Claude Does Poorly (Avoid These Patterns)
- **Keyword-only verification** — Scores are artificially low. Use LLM-as-judge for semantic evaluation.
- **Overwriting existing infrastructure** — Must always explore a codebase before building. The Vite terminal incident (building a new frontend when one already existed) was avoidable.
- **Assuming file paths** — Always verify directory structure before writing files. Don't assume directories exist.

---

## Proven Patterns

### Report Generation
1. Map each company to the most relevant playbook(s) before starting
2. Use parallel sub-agents for research — one per company
3. Reports should follow playbook section structure exactly
4. Always generate a scorecard alongside each report
5. Store reports as `{ticker}.{month}.md` and scorecards as `{ticker}.{month}.scorecard.md`

### Codebase Changes
1. Always read CLAUDE.md first — it's the source of truth
2. Check `docs/ROADMAP.md` for the current phase before starting any build work
3. Commit after each logical unit, not entire phases
4. Never edit deployed migrations — create new ones
5. All Python functions need full type hints
6. All TypeScript must be strict mode, no `any`

### Session Management
1. Start every session by reading `docs/logs/context.md` for strategic context
2. Read `docs/logs/changelog.md` to understand recent changes
3. Read `docs/logs/best-practices.md` (this file) for patterns to follow
4. At session end, append to all three log files
5. If context window is getting large, prioritize updating logs before compaction

### File Organization
- `research/prompts/` — Playbook markdown files (analytical frameworks)
- `research/reports/` — Generated reports and scorecards
- `docs/` — Project documentation (PRD, architecture, schema, roadmap)
- `docs/logs/` — Persistent agent logs (context, changelog, best practices)
- `atlas/frontend/` — Next.js 15 command center
- `atlas/core/python/` — Shared business logic
- `atlas/api/python/` — Vercel serverless function routes
- `atlas/supabase/migrations/` — Append-only SQL migrations

### Communication with Codex
- CLAUDE.md and AGENTS.md are the shared communication layer
- Any architectural decision must be reflected in CLAUDE.md
- Codex reads CLAUDE.md at session start — keep it current
- Use `docs/logs/changelog.md` to leave breadcrumbs for Codex about what changed and why

---

## Lessons Learned

### 2026-02-06
- **Always explore before building.** Discovered the atlas repo had a full Next.js frontend, Supabase schema, and 8-phase roadmap after building a duplicate Vite frontend. Cost: wasted effort and a directory conflict to clean up.
- **Verification engines need semantic understanding.** Pure keyword matching produces scores that don't reflect actual report quality. The INTC report was comprehensive but scored 45% because section headers didn't match keyword patterns. Plan: use LLM-as-judge approach.
- **Session compaction loses files.** The NVDA report was generated but lost when the previous session was compacted. Mitigation: save all artifacts to persistent storage immediately, reference them in changelog.
- **User's vision is broader than any single task.** What started as "build investment research reports" evolved into "build a personal AI operating system." Always understand the strategic context before executing tactically.
