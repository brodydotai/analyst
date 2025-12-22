# Core Python Library

Shared Python code used by serverless functions.

## Structure

- **scrapers/**: RSS parsing, web scraping utilities
  - `rss.py` - RSS feed parser using `httpx` and `feedparser`
  - `web.py` - Web scraper using `newspaper4k`

- **processing/**: AI processing pipelines
  - `extract.py` - Content extraction from URLs
  - `vectorize.py` - Embedding generation for similarity search
  - `dedupe.py` - Deduplication logic using pgvector
  - `summarize.py` - LLM summarization
  - `categorize.py` - LLM categorization and tagging

- **database/**: Supabase client wrapper
  - `client.py` - Database operations, typed models

- **qstash/**: QStash client utilities
  - `client.py` - Task dispatch utilities

## Usage

Import from serverless functions:

```python
from core.python.scrapers.rss import parse_rss_feed
from core.python.processing.extract import extract_article
from core.python.database.client import get_supabase_client
from core.python.qstash.client import dispatch_task
```




