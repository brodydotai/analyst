# Brodus — Product Requirements Document

## Authority and Scope

This PRD captures product intent and user-facing requirements. It is not an implementation contract.

- **Architecture and constraints:** `CLAUDE.md`
- **Agent behavior and workflow:** `AGENTS.md`
- **If there is any conflict:** `CLAUDE.md` and `AGENTS.md` take precedence

## Problem

I track a portfolio of assets across TradingView, SEC EDGAR, earnings calls, and financial news — but there's no single place that ties them together. I want one dashboard where my watchlist lives alongside the research context I actually need: key metrics, filings, transcripts, and AI-generated reports.

## User

Single user (me). No auth system needed for MVP beyond an admin gate on the sources page.

## Features (in priority order)

### 1. Watchlist

The core of the product. A categorized list of assets I'm tracking.

**What I see for each asset:**
- Ticker / name
- Key metrics: multiples (P/E, EV/EBITDA, etc.) and performance (1D, 1W, 1M, YTD)
- Key links: recent SEC filings (direct EDGAR links), earnings transcripts
- Link to the asset's chart on TradingView
- Click-to-generate report button (AI report for that single asset)

**What I can do:**
- Add assets to the watchlist
- Remove assets from the watchlist
- Edit categories / groupings (e.g., "Tech," "Energy," "Short Ideas")
- Reorder within categories
- TradingView sync: import/export watchlist to stay in sync with my TradingView lists

**Watchlist-level action:**
- Click-to-generate 24-hour summary: a single AI-generated briefing covering all assets on the watchlist — what happened in the last 24 hours across filings, news, and price action.

### 2. Sources (Admin)

A page behind an admin gate where I curate the inputs that power the feed.

**What it does:**
- CRUD interface for feed sources (RSS feeds, specific EDGAR endpoints, etc.)
- Each source has: name, URL, type (rss/edgar), active toggle
- Sources are stored in the database and drive the ingestion pipeline

**Why it's separate:**
This is a configuration surface, not a daily-use page. It controls what shows up in the feed but shouldn't clutter the main experience.

### 3. Feed

A curated news/filings feed powered by the sources I've configured.

**What it shows:**
- Chronological stream of articles and filings from active sources
- Each item: title, source, timestamp, snippet/summary
- Filter by source type (news vs. filings) or by entity/ticker

**How it relates to the watchlist:**
Items in the feed that mention watchlist assets should be visually linked or filterable.

## Data Sources

- **SEC EDGAR** — EFTS full-text search API and submissions API for filings
- **RSS Feeds** — Financial news outlets (configured via Sources page)
- **TradingView** — Watchlist sync (import/export)
- **Financial data API** — For key metrics and multiples (TBD: Yahoo Finance, Financial Modeling Prep, or similar)

## Success Metric

I open Brodus, see my watchlist with current metrics, click "24h Summary," and get a useful briefing — all without visiting five different sites.

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend API | Python on Vercel Serverless Functions |
| Database | Supabase (PostgreSQL + pgvector) |
| Async Processing | Upstash QStash |
| AI | OpenAI (embeddings, summarization, reports) |
| Frontend | Next.js 15 |

## Non-Goals (MVP)

- Charts or price visualization (TradingView link is sufficient)
- Multi-user accounts or auth (single user, admin gate only)
- Real-time streaming (polling/cron is fine)
- Full XBRL financial data extraction
- Mobile app
