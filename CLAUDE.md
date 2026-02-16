# Analyst — Project Intelligence File

This file is the shared source of truth for project context, architecture, and constraints.
Agent role contracts and coordination live in `.agents/`.

## What Analyst Is

An AI-powered equity research system that generates institutional-grade investment reports. Analyst executes industry-specific analytical playbooks against company data, verifies report compliance against prompt specifications, and stores structured research artifacts in a database.

Analyst is designed as a modular research service — it will be consumed by a larger agentic operating system but operates independently with its own data layer, CLI tools, and API.

Single user. No multi-tenancy. Research-first architecture.

## Current State

**What exists:**
- Investment research playbooks: `research/prompts/` (18 industry-specific analytical frameworks)
- Generated reports + scorecards: `research/reports/` (13 tickers, paired report + scorecard per asset)
- Prompt compliance verifier: `research/verify_prompt_compliance.py`
- Agent infrastructure: `.agents/` directory with registry and scoped instructions

**What is being built:**
- Python backend (FastAPI) for report management, playbook execution, compliance verification
- Supabase database for structured report storage and metadata
- CLI tools for running research workflows
- API endpoints for integration with parent orchestration system

## Project Structure

```
analyst/                         → Python package (backend + services)
  __init__.py
  config.py                      → Environment config (Supabase, OpenAI keys)
  db.py                          → Supabase client singleton
  models/                        → Pydantic models (reports, playbooks, scorecards)
    __init__.py
    report.py
    playbook.py
    scorecard.py
  services/                      → Business logic
    __init__.py
    reports.py                   → Report CRUD, search, filtering
    compliance.py                → Prompt compliance verification (refactored from script)
    generation.py                → AI report generation pipeline
    ingestion.py                 → Seed reports from markdown files into DB
  api/                           → FastAPI routes
    __init__.py
    routes.py                    → Report endpoints (list, get, search, generate)
  cli/                           → CLI tools
    __init__.py
    main.py                      → Click CLI (generate, verify, seed, list)

research/
  prompts/                       → Investment playbooks (analytical frameworks)
    *.prompt.md                  → 18 industry-specific prompts
  reports/                       → Generated artifacts (reports + scorecards)
    *.feb.md                     → Full investment reports
    *.feb.scorecard.md           → Compliance scorecards

.agents/                         → Agent infrastructure
  registry.md                    → Agent routing table
  protocol.md                    → Communication protocol
  research/
    equity/INSTRUCTIONS.md       → Equity research agent instructions
    compliance/INSTRUCTIONS.md   → Compliance verification agent instructions

docs/
  architecture.md                → System design and data flow
  prd.md                         → Product requirements document
  roadmap.md                     → Phased development plan

tests/                           → Test suite
  __init__.py
  test_models.py
  test_services.py
  test_api.py

pyproject.toml                   → Python project config (dependencies, build)
.env.example                     → Environment variable template
README.md                        → Project overview and setup
```

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| API | FastAPI | Async Python, auto-generated OpenAPI docs |
| Database | Supabase (PostgreSQL) | Report storage, metadata, full-text search |
| AI | OpenAI (gpt-4o, text-embedding-3-small) | Report generation and embeddings |
| Validation | Pydantic v2 | Models in `analyst/models/` |
| CLI | Click | Command-line research workflows |
| Data Science | pandas, numpy | Report analysis, data processing |
| Testing | pytest | Unit and integration tests |

## Conventions

### Architecture Rules
- **Services contain business logic.** API routes are thin — validate input, call service, return response.
- **Database access through `db.py` only.** Never instantiate a Supabase client elsewhere.
- **Config from environment only.** All env vars flow through `analyst/config.py`. No hardcoded keys.
- **Pydantic models are the contract.** All data structures defined in `analyst/models/`. No raw dicts in service boundaries.

### Code Standards
- Python 3.11+. Type hints on all function signatures.
- No dead code — no commented-out blocks, no unused imports.
- Every API endpoint handles: bad input (422), not found (404), server error (500).
- One responsibility per module. If a module does two unrelated things, split it.
- Docstrings on all public functions. Google style.

### Data Patterns
- Reports keyed by `(ticker, report_type, period)` — unique constraint.
- Scorecards linked to reports by ticker + period.
- Playbooks referenced by filename (e.g., `semiconductors-and-accelerators.prompt.md`).
- Compliance scores extracted and stored as structured data, not just markdown.

### Dependencies
- `fastapi` + `uvicorn` for API
- `supabase` for database
- `openai` for AI generation
- `pydantic` for validation
- `click` for CLI
- `pandas` for data processing
- `httpx` for async HTTP
- `python-dotenv` for env loading
- No ORMs beyond Supabase client

### EDGAR (Future)
- SEC rate limit: 10 req/sec max. Enforce 100ms minimum delay.
- Always send configured `EDGAR_USER_AGENT` header.
- EFTS API for discovery, submissions API for entity-specific lookups.

## Report Naming Convention

Reports follow the pattern: `{ticker}.{period}.md` and `{ticker}.{period}.scorecard.md`

Examples:
- `intc.feb.md` → Intel full report, February 2026
- `intc.feb.scorecard.md` → Intel compliance scorecard, February 2026

Tickers are lowercase in filenames, uppercase in display and database.

## Integration Contract

Analyst exposes a REST API that the parent orchestration system can call:

```
GET  /api/reports                    → List all reports (filterable by ticker, type, period)
GET  /api/reports/{id}               → Get single report with content
GET  /api/reports/ticker/{ticker}    → Get all reports for a ticker
POST /api/reports/generate           → Generate a new report (async)
POST /api/reports/verify             → Run compliance verification
GET  /api/playbooks                  → List available playbooks
GET  /api/playbooks/{name}           → Get playbook content
GET  /api/health                     → Health check
```
