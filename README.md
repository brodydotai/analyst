# Atlas

Atlas is a single-user market intelligence platform that brings SEC EDGAR filings and financial news into one system, enriches them with AI, and turns them into structured, searchable research. The vision is a unified dashboard where watchlist assets, filings, and articles connect through shared entities and summarized context.

The current codebase focuses on the backend foundation: a Supabase schema, shared Python modules for config, database, queue, and models, plus serverless API route stubs for ingestion and processing. The frontend is planned but not yet initialized.

## Stack

- **Backend:** Python serverless functions on Vercel
- **Database:** Supabase (PostgreSQL + pgvector)
- **Async Processing:** Upstash QStash
- **AI:** OpenAI (embeddings + summarization)
- **Frontend:** Next.js 15 (planned)

## Project Structure

```
api/python/          — Vercel serverless functions (cron + QStash handlers)
core/python/         — Shared business logic, clients, models
supabase/migrations/ — Database schema
docs/                — PRD, architecture, schema documentation
frontend/            — Next.js dashboard (planned)
```

## Setup

1. Copy `.env.example` to `.env` and fill in credentials
2. Deploy the schema: run `supabase/migrations/001_initial_schema.sql` against your Supabase database
3. Install dependencies: `pip install -r requirements.txt`
4. Deploy to Vercel: `vercel --prod`

## Development

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for system design and data flows.
