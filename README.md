# Atlas

Market intelligence platform that aggregates SEC EDGAR filings and financial news, processes them with AI, and serves them through a searchable dashboard.

## Stack

- **Backend:** Python serverless functions on Vercel
- **Database:** Supabase (PostgreSQL + pgvector)
- **Async Processing:** Upstash QStash
- **AI:** OpenAI (embeddings + summarization)
- **Frontend:** Next.js 15

## Project Structure

```
api/python/          — Vercel serverless functions (cron + QStash handlers)
core/python/         — Shared business logic, clients, models
supabase/migrations/ — Database schema
docs/                — PRD, architecture, schema documentation
frontend/            — Next.js dashboard (future)
```

## Setup

1. Copy `.env.example` to `.env` and fill in credentials
2. Deploy the schema: run `supabase/migrations/001_initial_schema.sql` against your Supabase database
3. Install dependencies: `pip install -r requirements.txt`
4. Deploy to Vercel: `vercel --prod`

## Development

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for system design and data flows.
