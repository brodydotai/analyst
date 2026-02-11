# Brodus — Product Requirements Overview

## What Brodus Is

A personal operating system powered by AI agents. The first workstream is market intelligence — tracking assets across TradingView, SEC EDGAR, and financial news — but the architecture is designed to support any autonomous agent workflow: deal sourcing, portfolio monitoring, business operations, scheduling, and more.

## User Persona

**Single user: Brody (product owner)**
- Spends time editing guidelines (playbooks) and reviewing agent outputs
- Needs a dense, data-rich terminal for daily portfolio research
- Values autonomous execution — agents should do work without hand-holding
- Cares about accuracy of financial data and quality of analysis

## End-State Vision

- Agents autonomously execute tasks across investment research, deal sourcing, portfolio monitoring, business operations
- Agents self-improve through feedback loops and outcome tracking
- Modular architecture scales as new models, APIs, MCPs, and orchestration techniques emerge
- Brodus command center (frontend) is the single pane of glass for monitoring all agent activity and reviewing outputs
- User's primary interaction is editing playbooks, reviewing artifacts, and setting strategic direction

## Terminology

| Term | Meaning |
|------|---------|
| **Playbooks** | Analytical frameworks that guide agent research work (formerly "prompts") |
| **Artifacts** | Any agent-generated output: reports, scorecards, code, analysis (formerly "reports") |
| **Command Center** | The Brodus frontend dashboard (Next.js) |
| **Brief** | A task specification from the orchestrator to a build/research agent |
| **Domain** | A self-contained feature area with its own models, services, routes, and components |

## Design Direction

Messari.io-inspired dark terminal aesthetic. Panel-based layouts, dense data tables, pill toggles, value coloring (green/red), monospace numbers. See `frontend/DESIGN.md` and `docs/prd/frontend/design-system.md` for the full design directive.

## Current Domains

| Domain | Status | Description |
|--------|--------|-------------|
| Watchlist | Frontend built, backend pending | Core product — asset tracking with categories, metrics, links |
| Journal | Brief written (002) | Trade log + daily journal with P&L tracking |
| Research | Frontend built, generation pending | Investment reports from playbooks, report viewer |

## Planned Domains

| Domain | Description |
|--------|-------------|
| Portfolio | Position tracking, allocation, performance monitoring |
| Deals | Deal sourcing and pipeline management |
| Operations | Business operations, scheduling, task management |
| Feed | Aggregated news and filing feed from monitored sources |

## Non-Goals (Current Phase)

- Multi-tenancy or public-facing auth (admin gate only)
- Mobile-responsive design (laptop 1280px+ is the target)
- Real-time streaming data (polling/cron is sufficient)
- Self-hosted deployment (Vercel + Supabase cloud)

## PRD Directory Guide

Product requirements are organized by domain in this directory:

- `database/schema.md` — Database schema reference (migrations are source of truth)
- `frontend/` — Frontend page and design requirements
- `backend/` — API conventions and route requirements
- `pipelines/` — Data ingestion, enrichment, and generation pipeline requirements

PRDs are persistent and always current. Briefs reference PRDs for context but are ephemeral (they get archived after completion).
