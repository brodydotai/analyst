# Analyst

AI equity research system. Generates institutional-grade investment reports using industry-specific playbooks, scores them for compliance, and synthesizes multi-perspective opinions.

Designed as a modular service consumed by a larger agentic operating system.

## Quick Start

```bash
pip install -e .
cp .env.example .env   # add your Supabase + OpenAI keys
analyst seed            # populate DB from existing reports
analyst serve           # start API at localhost:8000
```

Then open:
- `http://127.0.0.1:8000/ui/research` — Research report viewer/storage
- `http://127.0.0.1:8000/ui/system` — Testing, logging, and feedback monitor

## What It Does

1. **Playbooks** — 18 industry-specific analytical frameworks (semiconductors, SaaS, pharma, defense, etc.)
2. **Reports** — Structured markdown reports following playbook sections A-H, with sourced data and IDP flagging
3. **Scorecards** — Automated compliance verification grading reports A-F against their playbook
4. **Opinions** — Structured thesis metadata (rating 1-10, confidence, catalysts, risks, invalidation)
5. **Perspectives** — Bull, bear, and macro overlay agents produce independent takes on each report
6. **Synthesis** — Confidence-weighted combination of all opinions into a single view with consensus assessment
7. **Local Console** — Sidebar frontend for report readability plus persistent local logs/feedback for iterative agent tuning

## Project Structure

```
analyst/                  Python package (FastAPI + services)
  models/                 Pydantic models (report, opinion, scorecard, playbook)
  services/               Business logic (reports, compliance, generation, synthesis, ingestion)
  api/                    FastAPI routes
  cli/                    Click CLI
research/
  playbooks/              18 industry playbooks (*.prompt.md)
  templates/              Canonical report structure and opinion schema
  compliance/             Scoring rules consumed by compliance service
  reports/                Generated reports + scorecards
data/
  analyst_local.db        Local SQLite DB for UI report/log/feedback storage (auto-created)
.agents/                  Agent instructions (equity, compliance, bull, bear, macro, backend)
docs/                     Architecture, PRD, roadmap
tests/                    pytest suite
```

## CLI

```bash
analyst list              # list all reports
analyst show INTC         # show reports for a ticker
analyst playbooks         # list available playbooks
analyst seed              # seed DB from markdown files
analyst verify            # run compliance check
analyst serve             # start FastAPI dev server
```

## Local Frontend

The local console is built into the FastAPI app and provides two pages:

- `Research` — readable report browser and manual/imported report storage
- `System` — testing logs, runtime logs, and operator feedback capture

All console data is persisted to local SQLite at `data/analyst_local.db`.

## API

```
GET  /api/reports              list (filterable by ticker, type, period)
GET  /api/reports/{id}         single report
GET  /api/reports/ticker/INTC  all reports for ticker
POST /api/reports/generate     generate + verify + persist report
POST /api/reports/verify       compliance check for stored report
POST /api/reports/synthesize   combine opinions into weighted view
GET  /api/playbooks            list playbooks
GET  /api/health               health check
```

## Docs

- `docs/prd.md` — product requirements and phased development plan
- `docs/architecture.md` — system design and data flow
- `docs/roadmap.md` — 5-phase delivery plan
- `CLAUDE.md` — project intelligence file (conventions, tech stack, integration contract)
