# Atlas — Architecture

## System Overview

Atlas is a serverless market intelligence platform that ingests SEC filings and financial news, processes them with AI, and serves them through a search-enabled dashboard.

```
┌─────────────┐     ┌─────────────┐
│  Vercel Cron │     │  Vercel Cron │
│ ingest_filings│    │ ingest_feeds │
└──────┬──────┘     └──────┬──────┘
       │                    │
       │  QStash messages   │
       ▼                    ▼
┌──────────────┐   ┌───────────────┐
│process_filing│   │process_article│
└──────┬───────┘   └──────┬────────┘
       │                   │
       ▼                   ▼
┌─────────────────────────────────┐
│          Supabase               │
│  PostgreSQL + pgvector          │
│  (filings, articles, entities)  │
└────────────────┬────────────────┘
                 │
                 ▼
          ┌─────────────┐
          │  Next.js 15  │
          │  Dashboard   │
          └─────────────┘
```

## Data Flow

### 1. Filing Ingestion (Cron → QStash)

1. `ingest_filings` runs on a Vercel cron schedule
2. Queries EDGAR EFTS full-text search API for recent filings
3. For each new filing (deduped by accession number), inserts a row into `filings` and dispatches a QStash message to `process_filing`
4. Logs the run in `ingestion_log`

### 2. Filing Processing (QStash → Supabase)

1. `process_filing` receives a filing ID via QStash
2. Fetches the filing document from EDGAR
3. Extracts text content from the filing
4. Generates an embedding via OpenAI
5. Extracts and links entities (filer + mentioned companies/people)
6. Stores full text, embedding, and entity links in Supabase
7. Marks the filing as processed

### 3. Article Ingestion (Cron → QStash)

1. `ingest_feeds` runs on a Vercel cron schedule
2. Fetches and parses all active RSS feed sources
3. For each new article (deduped by URL), inserts a row into `articles` and dispatches a QStash message to `process_article`
4. Logs the run in `ingestion_log`

### 4. Article Processing (QStash → Supabase)

1. `process_article` receives an article ID via QStash
2. Fetches the full article content
3. Generates an embedding via OpenAI
4. Extracts and links entities mentioned in the article
5. Stores content, embedding, and entity links in Supabase
6. Marks the article as processed

### 5. AI Summarization

After a document is processed, a summary is generated and stored in the `summaries` table. Summaries use gpt-4o-mini for cost efficiency.

## EDGAR API Strategy

Atlas uses two EDGAR APIs:

- **EFTS Full-Text Search** (`efts.sec.gov/LATEST`) — Search for filings by keywords, form type, date range. Used for discovery.
- **Submissions** (`data.sec.gov/submissions`) — Look up all filings by a specific CIK. Used for entity-specific filing history.

Rate limiting: SEC requires max 10 requests/second and a User-Agent header identifying the caller. Atlas enforces a 100ms minimum delay between requests.

## Entity Linking

Entities are identified by:
- **CIK** for SEC-registered filers (exact match)
- **Name matching** using pg_trgm trigram similarity for fuzzy matching
- **Ticker symbols** extracted from article text

The `document_entities` junction table links documents to entities with a role (`filer`, `subject`, `mentioned`) and a confidence score.

## Deduplication

- Filings are deduped by `accession_number` (unique constraint)
- Articles are deduped by `url` (unique constraint)
- Semantic deduplication uses pgvector cosine similarity to flag near-duplicate content

## Deployment

All API routes deploy as Vercel Serverless Functions (Python runtime). Cron schedules are defined in `vercel.json`. The frontend deploys as a standard Next.js app on Vercel.
