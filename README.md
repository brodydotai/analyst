# Brodus

Brodus is a single-user market intelligence platform that brings SEC EDGAR filings and financial news into one system, enriches them with AI, and turns them into structured, searchable research. The vision is a unified dashboard where watchlist assets, filings, and articles connect through shared entities and summarized context.

The current codebase focuses on the backend foundation (schema, shared Python modules, serverless API route stubs) and a Next.js 15 frontend shell wired to the watchlist/report APIs.

## Stack

- **Backend:** Python serverless functions on Vercel
- **Database:** Supabase (PostgreSQL + pgvector)
- **Async Processing:** Upstash QStash
- **AI:** OpenAI (embeddings + summarization)
- **Frontend:** Next.js 15 (App Router, TypeScript, Tailwind)

## Project Structure

```
api/python/          — Vercel serverless functions (cron + QStash handlers)
core/python/         — Shared business logic, clients, models
supabase/migrations/ — Database schema
docs/                — PRD, architecture, schema documentation
frontend/            — Next.js dashboard (App Router + TS)
```

## Setup

1. Copy `.env.example` to `.env` and fill in credentials (never commit `.env`)
2. Deploy the schema: run `supabase/migrations/001_initial_schema.sql` against your Supabase database
3. Install dependencies: `pip install -r requirements.txt`
4. Deploy to Vercel: `vercel --prod`

## Frontend Development

1. Install dependencies: `cd frontend && npm install`
2. Start dev server: `npm run dev`
3. Open `http://localhost:3000`

## Development

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for system design and data flows.
