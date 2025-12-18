# Atlas News Terminal - Serverless Architecture

## System Overview

Atlas is a **serverless, event-driven** news aggregation platform built on Vercel, Supabase, and Upstash QStash. The architecture follows a **Fan-Out pattern** where ingestion functions dispatch tasks to a queue, and worker functions process articles asynchronously.

## Tech Stack

- **Frontend/API:** Next.js 15 (Vercel)
- **Task Queue:** Upstash QStash (event-driven task dispatch)
- **Database:** Supabase (PostgreSQL + pgvector + Realtime subscriptions)
- **AI Processing:** Python Serverless Functions (Vercel Python runtime)
- **Scraping:** `newspaper4k` + `httpx` (no Scrapy - too heavy for serverless)
- **Real-time:** Supabase Realtime (not raw WebSockets)

## Serverless Data Flow

```
┌─────────────┐
│ Vercel Cron │ (Scheduled triggers)
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│  Ingest Function │ (api/python/ingest/)
│  - Read RSS      │
│  - Parse feeds   │
│  - Extract URLs  │
└──────┬───────────┘
       │
       │ Fan-Out: Dispatch tasks
       ▼
┌──────────────────┐
│  Upstash QStash  │ (Task Queue)
└──────┬───────────┘
       │
       │ Async processing
       ▼
┌──────────────────┐
│ Process Function │ (api/python/process/)
│  - Extract       │ (newspaper4k)
│  - Vectorize     │ (pgvector embedding)
│  - Deduplicate   │ (cosine similarity)
│  - Summarize     │ (LLM)
│  - Categorize    │ (LLM)
│  - Save to DB    │ (Supabase)
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│   Supabase DB    │ (PostgreSQL + pgvector)
│   + Realtime     │
└──────┬───────────┘
       │
       │ Realtime subscription
       ▼
┌──────────────────┐
│  Next.js Frontend│ (frontend/)
│  Terminal UI     │
└──────────────────┘
```

## Directory Structure

```
atlas/
├── api/
│   └── python/
│       ├── ingest/          # Vercel serverless function (Cron trigger)
│       │   └── index.py     # Entry point: RSS → QStash tasks
│       └── process/         # Vercel serverless function (QStash trigger)
│           └── index.py     # Entry point: Process article → Supabase
├── core/
│   └── python/
│       ├── scrapers/        # Shared scraping logic
│       │   ├── rss.py       # RSS feed parser (httpx)
│       │   └── web.py       # Web scraper (newspaper4k)
│       ├── processing/      # Shared AI processing
│       │   ├── extract.py   # Content extraction
│       │   ├── vectorize.py # Embedding generation
│       │   ├── dedupe.py    # Deduplication logic
│       │   ├── summarize.py# LLM summarization
│       │   └── categorize.py# LLM categorization
│       ├── database/        # Supabase client wrapper
│       │   └── client.py    # Database operations
│       └── qstash/          # QStash client wrapper
│           └── client.py    # Task dispatch utilities
├── frontend/                # Next.js 15 app
│   ├── app/                 # App router
│   ├── components/          # React components
│   └── lib/                 # Supabase client, utilities
└── docs/                    # Documentation
```

## Core Components

### 1. Ingest Function (`api/python/ingest/`)

**Trigger:** Vercel Cron (configurable schedule)

**Responsibilities:**
- Read RSS feed list from Supabase `sources` table
- Parse RSS feeds using `httpx` and `feedparser`
- Extract article URLs
- Dispatch "process article" tasks to QStash (Fan-Out pattern)
- Log ingestion metrics

**Key Libraries:**
- `httpx` for HTTP requests
- `feedparser` for RSS parsing
- `upstash-qstash` for task dispatch

### 2. Process Function (`api/python/process/`)

**Trigger:** Upstash QStash webhook

**Responsibilities:**
- Receive article URL from QStash payload
- Extract content using `newspaper4k`
- Generate vector embedding
- Check for duplicates using pgvector (cosine similarity > 0.9)
- If duplicate: Cluster under existing article
- If new: Generate summary and categories via LLM
- Save to Supabase (articles, summaries, categories, tags)
- Supabase Realtime automatically notifies frontend

**Key Libraries:**
- `newspaper4k` for content extraction
- `openai` or `anthropic` for embeddings and LLM
- `supabase-py` for database operations
- `pgvector` for similarity search

### 3. Shared Core Logic (`core/python/`)

**Purpose:** Reusable code shared between serverless functions

**Modules:**
- **scrapers/**: RSS parsing, web scraping utilities
- **processing/**: AI processing pipelines (extract, vectorize, dedupe, summarize, categorize)
- **database/**: Supabase client wrapper with typed models
- **qstash/**: QStash client utilities for task dispatch

### 4. Frontend (`frontend/`)

**Framework:** Next.js 15 (App Router)

**Key Features:**
- Terminal-style UI (keyboard-centric)
- Supabase Realtime subscriptions for live article feed
- Article list, detail views, filtering
- Source management interface
- Settings and preferences

**Key Libraries:**
- `@supabase/supabase-js` for database and realtime
- `tailwindcss` for styling
- `shadcn/ui` for components

## Data Flow Details

### Fan-Out Pattern (Task Dispatcher)

The ingest function implements a **Fan-Out pattern**:

1. **Single Ingest Function** reads multiple RSS feeds
2. **Dispatches individual tasks** to QStash for each article URL
3. **QStash handles** retries, rate limiting, and async execution
4. **Multiple Process Functions** can run in parallel (auto-scaling)

This pattern ensures:
- Scalability: Process functions scale independently
- Resilience: Failed tasks are retried by QStash
- Cost efficiency: Only pay for actual processing time

### Deduplication Strategy

1. **Vector Embedding**: Generate embedding for article content (title + body)
2. **Similarity Search**: Query Supabase with `pgvector` for cosine similarity > 0.9
3. **Clustering**: If duplicate found, link new source to existing "master" article
4. **Metadata Merge**: Update source list, timestamps, but keep original content

### Real-time Updates

- **Supabase Realtime**: Database changes trigger realtime events
- **Frontend Subscription**: Next.js app subscribes to `articles` table changes
- **Live Feed**: New articles "pop in" as they're processed, no polling needed

## Key Architectural Decisions

### Why Serverless?

- **Cost Efficiency**: Pay only for execution time
- **Auto-scaling**: Handles traffic spikes automatically
- **No Infrastructure**: No servers to manage
- **Fast Iteration**: Deploy functions independently

### Why QStash over RabbitMQ?

- **Serverless-native**: No infrastructure to manage
- **Built-in retries**: Automatic retry logic with exponential backoff
- **Rate limiting**: Built-in rate limiting per queue
- **Webhook-based**: Simple HTTP integration
- **Vercel-compatible**: Works seamlessly with Vercel functions

### Why newspaper4k over Scrapy?

- **Lighter weight**: Scrapy is too heavy for serverless (large dependencies)
- **Simpler**: newspaper4k is a single-purpose library
- **Faster cold starts**: Smaller package size = faster function startup
- **Sufficient**: Handles most news sites adequately

### Why Supabase Realtime over WebSockets?

- **Built-in**: No WebSocket server to maintain
- **Database-native**: Changes in DB automatically trigger events
- **Scalable**: Handles connections automatically
- **Simple**: Just subscribe to table changes

## Environment Variables

```bash
# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Upstash QStash
QSTASH_URL=
QSTASH_TOKEN=

# OpenAI / Anthropic
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Vercel Cron
CRON_SECRET=
```

## Constraints & Best Practices

1. **No Long-Running Loops**: Use Cron triggers, not `while True`
2. **Function Timeout**: Vercel functions have timeout limits (10s for Hobby, 60s for Pro)
3. **QStash for Background Tasks**: Any processing > 10s should use QStash
4. **Idempotency**: Process functions must be idempotent (safe to retry)
5. **Error Handling**: Log errors, but don't crash - let QStash handle retries
6. **Database Migrations**: Use Supabase migrations (not Alembic - serverless constraint)

## Next Steps

See `docs/roadmap.md` for phased implementation plan.
