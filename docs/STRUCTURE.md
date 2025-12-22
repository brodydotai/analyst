# Atlas Project Structure

## Directory Layout

```
atlas/
├── api/
│   └── python/
│       ├── ingest/          # Vercel serverless function (Cron trigger)
│       │   ├── index.py    # Entry point: RSS → QStash tasks
│       │   └── README.md
│       └── process/         # Vercel serverless function (QStash trigger)
│           ├── index.py    # Entry point: Process article → Supabase
│           └── README.md
│
├── core/
│   └── python/
│       ├── scrapers/        # Shared scraping logic
│       │   ├── rss.py      # RSS feed parser (httpx)
│       │   └── web.py      # Web scraper (newspaper4k)
│       ├── processing/      # Shared AI processing
│       │   ├── extract.py  # Content extraction
│       │   ├── vectorize.py# Embedding generation
│       │   ├── dedupe.py   # Deduplication logic
│       │   ├── summarize.py# LLM summarization
│       │   └── categorize.py# LLM categorization
│       ├── database/        # Supabase client wrapper
│       │   └── client.py   # Database operations
│       ├── qstash/          # QStash client wrapper
│       │   └── client.py   # Task dispatch utilities
│       └── README.md
│
├── frontend/                # Next.js 15 app
│   ├── app/                # App router
│   ├── components/         # React components
│   ├── lib/                # Supabase client, utilities
│   └── README.md
│
├── docs/                    # Documentation
│   ├── architecture.md     # System architecture
│   ├── roadmap.md          # Development phases
│   ├── schema.md           # Database schema
│   └── STRUCTURE.md        # This file
│
└── .cursor/
    └── rules/              # Cursor AI rules
        ├── atlas-main.mdc  # Main architecture rules
        ├── serverless-pipeline.mdc # Serverless constraints
        └── ai-deduplication.mdc # AI processing rules
```

## Key Architectural Patterns

### Fan-Out Pattern
- **Ingest Function** reads multiple RSS feeds
- Dispatches **individual tasks** to QStash for each article URL
- **Process Functions** scale independently and process articles in parallel

### Serverless Data Flow
```
Vercel Cron → Ingest Function → QStash → Process Function → Supabase → Frontend (Realtime)
```

### Entry Points
- `api/python/ingest/index.py` - Cron-triggered ingestion
- `api/python/process/index.py` - QStash-triggered processing

### Shared Logic
- All reusable code lives in `core/python/`
- Imported by serverless functions
- No direct execution from `core/`

## Technology Decisions

- **Scraping:** `newspaper4k` + `httpx` (NOT Scrapy)
- **Task Queue:** Upstash QStash (NOT RabbitMQ)
- **Database:** Supabase (PostgreSQL + pgvector)
- **Real-time:** Supabase Realtime (NOT raw WebSockets)
- **Frontend:** Next.js 15 (App Router)

## Migration Notes

This structure replaces the old `backend/python/` and `backend/node/` structure:
- `backend/python/` → `api/python/` (entry points) + `core/python/` (shared)
- `backend/node/` → Removed (Next.js API routes handle API needs)
- Traditional persistent servers → Serverless functions




