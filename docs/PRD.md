# Atlas — Product Requirements Document

## Problem

Financial professionals and researchers need to monitor SEC filings and financial news across many sources. Manually tracking filings, cross-referencing entities, and staying current with market-moving news is time-consuming and error-prone.

## Users

- Financial analysts monitoring public companies
- Researchers tracking regulatory filings
- Investors following portfolio companies and sectors

## MVP Capabilities

1. **SEC Filing Ingestion** — Automatically fetch recent filings from EDGAR (10-K, 10-Q, 8-K, and other form types)
2. **News Feed Ingestion** — Aggregate articles from curated financial RSS feeds
3. **Entity Linking** — Identify and link companies, people, and funds mentioned in filings and articles
4. **AI Summarization** — Generate structured summaries for every ingested document
5. **Semantic Search** — Natural language search across all filings and articles using vector embeddings
6. **Dashboard** — Web UI showing recent filings, news, and entity-centric views

## Data Sources

- **SEC EDGAR** — EFTS full-text search API and submissions API
- **RSS Feeds** — Financial news outlets (configurable source registry)

## Success Metric

A user can search for a company by name or ticker and see a unified timeline of its recent SEC filings and news coverage, each with an AI summary, within seconds.

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend API | Python on Vercel Serverless Functions |
| Database | Supabase (PostgreSQL + pgvector) |
| Async Processing | Upstash QStash |
| Embeddings | OpenAI text-embedding-3-small |
| Summarization | OpenAI gpt-4o-mini |
| Frontend | Next.js 15 |

## Non-Goals (MVP)

- Real-time streaming of filings (polling on cron is sufficient)
- User accounts or authentication
- Custom alerting or notifications
- Full XBRL financial data extraction
