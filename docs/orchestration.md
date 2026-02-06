# Brodus — Orchestration Framework

## How Tasks Flow Through the System

```
                    ┌─────────────────────────────────┐
                    │            USER (Brody)          │
                    │                                  │
                    │  • Edits playbooks & guidelines  │
                    │  • Reviews artifacts & outputs   │
                    │  • Sets strategic direction       │
                    │  • Approves/rejects agent work   │
                    └───────────────┬─────────────────┘
                                    │
                          Task / Question / Review
                                    │
                                    ▼
┌───────────────────────────────────────────────────────────────────┐
│                    ORCHESTRATION LAYER                            │
│                    Claude (Cowork)                                │
│                                                                   │
│  Responsibilities:                                                │
│  • Intake and interpret user requests                            │
│  • Break tasks into sub-tasks and delegate                       │
│  • Maintain persistent logs (context, changelog, best practices) │
│  • Coordinate between agents                                     │
│  • Quality-check agent outputs before surfacing to user          │
│  • Update shared state (CLAUDE.md, logs) so all agents stay      │
│    aligned                                                        │
│                                                                   │
│  Communication interfaces:                                        │
│  • Cowork UI (current) → Custom frontend (future)                │
│  • CLAUDE.md + AGENTS.md (shared project intelligence)           │
│  • docs/logs/ (persistent memory across sessions)                │
└────┬──────────┬──────────┬──────────┬──────────┬─────────────────┘
     │          │          │          │          │
     ▼          ▼          ▼          ▼          ▼
┌─────────┐┌─────────┐┌─────────┐┌─────────┐┌─────────────────┐
│ CODEX   ││RESEARCH ││ANALYSIS ││ FEED    ││ FUTURE AGENTS   │
│ (Code)  ││ AGENTS  ││ AGENTS  ││ AGENTS  ││                 │
│         ││         ││         ││         ││ • Deal sourcing  │
│ Build   ││ Web     ││ Report  ││ RSS     ││ • Portfolio mgmt │
│ features││ search  ││ gen     ││ ingest  ││ • Scheduling     │
│ per     ││ SEC     ││ Score-  ││ Filing  ││ • Email/comms    │
│ roadmap ││ EDGAR   ││ cards   ││ process ││ • Monitoring     │
│         ││ Data    ││ Verify  ││         ││                 │
│         ││ gather  ││         ││         ││                 │
└────┬────┘└────┬────┘└────┬────┘└────┬────┘└────────┬────────┘
     │          │          │          │               │
     │          │          │          │               │
     ▼          ▼          ▼          ▼               ▼
┌───────────────────────────────────────────────────────────────┐
│                       DATA LAYER                              │
│                                                               │
│  APIs & Connectors:           MCP Servers:                    │
│  • SEC EDGAR (EFTS + Sub)     • Supabase (future)            │
│  • Financial data API (TBD)   • Slack (future)               │
│  • TradingView sync           • Calendar (future)            │
│  • OpenAI (embeddings, gen)   • Email (future)               │
│  • Web search                 • File system                  │
│  • RSS feeds                  • Browser (Claude in Chrome)   │
│                                                               │
└───────────────────────────┬───────────────────────────────────┘
                            │
                            ▼
┌───────────────────────────────────────────────────────────────┐
│                    ARTIFACT STORE                              │
│                                                               │
│  Supabase (PostgreSQL + pgvector):                            │
│  • Watchlist items        • Entities & links                 │
│  • Filings & articles     • Embeddings                       │
│  • Summaries              • Ingestion logs                   │
│                                                               │
│  File System (temporary):                                     │
│  • research/prompts/      → Playbooks (→ DB migration later) │
│  • research/reports/      → Artifacts (→ DB migration later) │
│  • docs/logs/             → Agent memory (persists)          │
│                                                               │
└───────────────────────────┬───────────────────────────────────┘
                            │
                            ▼
┌───────────────────────────────────────────────────────────────┐
│                    FEEDBACK LOOP                              │
│                                                               │
│  • Verification scores (prompt compliance → scorecard)       │
│  • User approval/rejection signals                           │
│  • Outcome tracking (thesis → actual performance, future)    │
│  • Playbook refinement based on feedback                     │
│  • Agent capability logs (what worked, what didn't)          │
│  • Best practices accumulation across sessions               │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Agent Communication Protocol

### Shared State Files (Current)

All agents read these files at session start:

| File | Purpose | Who Writes | Who Reads |
|------|---------|-----------|-----------|
| `CLAUDE.md` | Project intelligence, conventions, architecture | Claude (coordinator) | All agents |
| `AGENTS.md` | Agent-specific operating instructions | Claude (coordinator) | Codex, future agents |
| `docs/ROADMAP.md` | Build phases, directives, audit gates | Claude + User | Codex |
| `docs/logs/context.md` | Strategic decisions, conversation history | Claude | Claude (across sessions) |
| `docs/logs/changelog.md` | Code/structural changes | Claude + Codex | All agents |
| `docs/logs/best-practices.md` | Patterns, capabilities, lessons | Claude | All agents |

### Communication Flow

```
User gives task to Claude
        │
        ▼
Claude reads: CLAUDE.md → logs/context.md → logs/changelog.md
        │
        ▼
Claude breaks task into sub-tasks
        │
        ├──→ Code task? → Update AGENTS.md directives → Codex executes
        │                                                     │
        │                                         Codex reads CLAUDE.md
        │                                         Codex follows ROADMAP.md
        │                                         Codex commits incrementally
        │                                                     │
        ├──→ Research task? → Spawn sub-agents → Gather data → Generate artifact
        │
        ├──→ Analysis task? → Run verification → Generate scorecard
        │
        └──→ System task? → Update docs, logs, architecture
                │
                ▼
Claude reviews all outputs → Updates logs → Surfaces results to user
```

### Future: Database-Backed Communication

When the Supabase artifact store is active, agent communication will evolve:

1. **Task queue table** — Claude writes tasks, agents claim and execute them
2. **Artifact registry** — All agent outputs stored with metadata (agent, timestamp, quality score)
3. **Agent state table** — Track what each agent knows, last sync timestamp
4. **Event log** — Append-only record of all agent actions for audit trail

This replaces file-based communication with structured, queryable state.

## Task Delegation Matrix

| Task Type | Primary Agent | Fallback | Output |
|-----------|--------------|----------|--------|
| Feature development | Codex | Claude (small fixes) | Code commits |
| Investment research | Research sub-agents | Claude (direct) | Markdown reports |
| Report verification | Analysis sub-agents | Claude (direct) | Scorecards |
| Architecture decisions | Claude | — | CLAUDE.md updates |
| Data ingestion | Feed agents (automated) | Manual trigger | DB records |
| Playbook creation | Claude | — | Prompt markdown files |
| Bug fixes / debugging | Codex | Claude | Code commits |
| Documentation | Claude | Codex | Markdown files |
| Database migrations | Codex | Claude | SQL files |
| Frontend changes | Codex | Claude | React/TS files |

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
