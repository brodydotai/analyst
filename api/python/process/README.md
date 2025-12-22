# Process Function

Vercel serverless function triggered by QStash webhook.

**Entry Point:** `index.py`

**Responsibilities:**
- Receive article URL from QStash payload
- Extract content using `newspaper4k`
- Generate vector embedding
- Check for duplicates using pgvector (cosine similarity > 0.9)
- If duplicate: Cluster under existing article
- If new: Generate summary and categories via LLM
- Save to Supabase (articles, summaries, categories, tags)
- Supabase Realtime automatically notifies frontend

**Trigger:** Upstash QStash webhook (POST to function URL)

**Dependencies:**
- `core/python/processing/extract.py` - Content extraction
- `core/python/processing/vectorize.py` - Embedding generation
- `core/python/processing/dedupe.py` - Deduplication
- `core/python/processing/summarize.py` - LLM summarization
- `core/python/processing/categorize.py` - LLM categorization
- `core/python/database/client.py` - Supabase client

**Important:** Function must be idempotent (safe to retry).




