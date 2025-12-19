# Ingest Function

Vercel serverless function triggered by Cron schedule.

**Entry Point:** `index.py`

**Responsibilities:**
- Read RSS feed list from Supabase `sources` table
- Parse RSS feeds using `httpx` and `feedparser`
- Extract article URLs
- Dispatch "process article" tasks to QStash (Fan-Out pattern)
- Log ingestion metrics

**Trigger:** Vercel Cron (configured in `vercel.json`)

**Dependencies:**
- `core/python/scrapers/rss.py` - RSS parsing logic
- `core/python/database/client.py` - Supabase client
- `core/python/qstash/client.py` - QStash task dispatch



