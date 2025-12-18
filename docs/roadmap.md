# Atlas Roadmap: Serverless Edition

## Development Philosophy: Steel Thread Approach

Each phase implements a **complete vertical slice** from ingestion to UI display. We prioritize getting a working end-to-end flow before adding complexity.

---

## Phase 1: Infrastructure & Foundation (Week 1)

**Goal:** Set up serverless infrastructure and basic database schema

### Tasks

- [ ] **1.1 Vercel Project Setup**
  - Initialize Vercel project
  - Configure environment variables
  - Set up Vercel Cron jobs configuration

- [ ] **1.2 Supabase Setup**
  - Create Supabase project
  - Enable `pgvector` extension
  - Create initial database schema:
    - `sources` table (RSS feeds)
    - `articles` table (with `embedding` vector column)
    - `summaries` table
    - `categories` table
    - `article_categories` junction table
  - Set up Supabase Realtime for `articles` table
  - Create service role key for serverless functions

- [ ] **1.3 Upstash QStash Setup**
  - Create Upstash QStash project
  - Configure QStash webhook endpoint (will point to process function)
  - Set up QStash authentication token
  - Test QStash task dispatch and webhook delivery

- [ ] **1.4 Project Structure**
  - Create directory structure:
    - `api/python/ingest/`
    - `api/python/process/`
    - `core/python/`
  - Set up Python dependencies (`requirements.txt` or `pyproject.toml`)
  - Configure Vercel for Python functions

- [ ] **1.5 Frontend Scaffold**
  - Initialize Next.js 15 project in `frontend/`
  - Set up Tailwind CSS and shadcn/ui
  - Configure Supabase client for frontend
  - Create basic layout structure

**Deliverable:** Infrastructure is ready. Can manually trigger QStash tasks and see them in dashboard.

---

## Phase 2: The Ingestion Loop (Week 2)

**Goal:** Build the RSS ingestion function that dispatches tasks to QStash

### Tasks

- [ ] **2.1 RSS Parser (`core/python/scrapers/rss.py`)**
  - Implement RSS feed parsing using `httpx` and `feedparser`
  - Extract article URLs, titles, publish dates
  - Handle RSS 2.0, Atom, and JSON Feed formats
  - Error handling for malformed feeds

- [ ] **2.2 QStash Client (`core/python/qstash/client.py`)**
  - Create QStash client wrapper
  - Implement task dispatch function
  - Add retry logic and error handling
  - Logging for dispatched tasks

- [ ] **2.3 Supabase Client (`core/python/database/client.py`)**
  - Create Supabase client wrapper
  - Implement source fetching (read from `sources` table)
  - Basic connection testing

- [ ] **2.4 Ingest Function (`api/python/ingest/index.py`)**
  - Vercel serverless function entry point
  - Read sources from Supabase
  - Parse RSS feeds
  - Dispatch "process article" tasks to QStash for each article URL
  - Log ingestion metrics
  - Handle errors gracefully (don't crash on single feed failure)

- [ ] **2.5 Vercel Cron Configuration**
  - Set up cron job to trigger ingest function (e.g., every 15 minutes)
  - Test cron trigger locally and in Vercel

**Deliverable:** Ingest function runs on schedule, reads RSS feeds, and dispatches tasks to QStash. Can see tasks in QStash dashboard.

---

## Phase 3: The AI Worker (Week 3)

**Goal:** Build the article processing function that QStash triggers

### Tasks

- [ ] **3.1 Content Extraction (`core/python/processing/extract.py`)**
  - Implement article extraction using `newspaper4k`
  - Extract title, content, author, publish date, images
  - Clean HTML to Markdown or structured JSON
  - Handle extraction failures gracefully

- [ ] **3.2 Vectorization (`core/python/processing/vectorize.py`)**
  - Generate embeddings using OpenAI `text-embedding-3-small` or similar
  - Create embedding from title + content
  - Store embedding for similarity search

- [ ] **3.3 Deduplication (`core/python/processing/dedupe.py`)**
  - Query Supabase with pgvector for cosine similarity > 0.9
  - Implement clustering logic (link to existing article if duplicate)
  - Return whether article is new or duplicate

- [ ] **3.4 Summarization (`core/python/processing/summarize.py`)**
  - Implement LLM summarization (OpenAI GPT-4o or Claude 3.5)
  - Generate brief, standard, and detailed summaries
  - Extract key points
  - Cache summaries in Redis (optional, for Phase 4)

- [ ] **3.5 Categorization (`core/python/processing/categorize.py`)**
  - Implement LLM-based categorization
  - Assign primary and secondary categories
  - Extract entities (companies, people, locations)
  - Generate tags

- [ ] **3.6 Process Function (`api/python/process/index.py`)**
  - Vercel serverless function entry point (QStash webhook handler)
  - Receive article URL from QStash payload
  - Orchestrate: Extract → Vectorize → Dedupe → Summarize → Categorize → Save
  - Save to Supabase (articles, summaries, categories, tags)
  - Make function idempotent (safe to retry)
  - Error handling and logging

- [ ] **3.7 Database Operations (`core/python/database/client.py`)**
  - Implement article save operations
  - Link summaries, categories, tags
  - Handle duplicate clustering
  - Transaction management

**Deliverable:** Process function receives QStash tasks, processes articles, and saves to Supabase. Articles appear in database with summaries and categories.

---

## Phase 4: Terminal UI (Week 4)

**Goal:** Build the React dashboard with real-time article feed

### Tasks

- [ ] **4.1 Supabase Realtime Integration**
  - Set up Supabase Realtime subscription in Next.js
  - Subscribe to `articles` table changes
  - Handle new article events
  - Test real-time updates

- [ ] **4.2 Article List Component**
  - Create article list view with terminal aesthetic
  - Display article cards (title, summary, source, date)
  - Implement infinite scroll or pagination
  - Show real-time updates as articles are processed

- [ ] **4.3 Article Detail View**
  - Create article detail page
  - Display full content, summary, categories, tags
  - Show source attribution
  - Related articles (from same cluster)

- [ ] **4.4 Filtering & Search**
  - Category filter chips
  - Source filter
  - Search functionality (full-text search via Supabase)
  - Date range filter

- [ ] **4.5 Source Management**
  - List sources from Supabase
  - Add/edit source form
  - Source status indicators
  - Source metrics (articles per day)

- [ ] **4.6 Terminal UI Polish**
  - Keyboard shortcuts (Cmd+K for command palette)
  - Terminal-style command interface
  - Loading states and error handling
  - Responsive design

**Deliverable:** Complete terminal UI with real-time article feed. Users can see articles "pop in" as they're processed.

---

## Phase 5: Polish & Optimization (Week 5)

**Goal:** Performance optimization, error handling, and production readiness

### Tasks

- [ ] **5.1 Error Handling & Monitoring**
  - Comprehensive error logging
  - Error tracking (Sentry or similar)
  - Function timeout handling
  - QStash retry configuration

- [ ] **5.2 Performance Optimization**
  - Optimize database queries (indexes, query patterns)
  - Implement caching for summaries (Redis via Upstash)
  - Optimize embedding generation (batch if possible)
  - Frontend code splitting and optimization

- [ ] **5.3 Testing**
  - Unit tests for core Python modules
  - Integration tests for serverless functions
  - E2E tests for critical user flows
  - Test QStash task dispatch and processing

- [ ] **5.4 Documentation**
  - API documentation
  - Deployment guide
  - Developer setup guide
  - User documentation

- [ ] **5.5 Production Deployment**
  - Production environment variables
  - Vercel production deployment
  - Supabase production database
  - Monitoring and alerts setup

**Deliverable:** Production-ready system with monitoring, error handling, and documentation.

---

## Phase 6: Advanced Features (Week 6+)

**Goal:** Enhanced features and scaling

### Tasks

- [ ] **6.1 Notification System**
  - Telegram bot integration
  - Slack webhook integration
  - Notification preferences
  - Digest mode

- [ ] **6.2 Advanced Filtering**
  - User preferences and saved filters
  - Keyword filtering
  - Sentiment filtering
  - Relevance scoring

- [ ] **6.3 Source Discovery**
  - Automatic source detection
  - Source quality scoring
  - Source suggestions

- [ ] **6.4 Analytics**
  - Source performance metrics
  - Processing analytics
  - User engagement tracking

---

## Success Criteria

Each phase is considered complete when:

1. **End-to-End Flow Works**: Can trigger ingestion → see tasks in QStash → see processed articles in database → see articles in UI
2. **Error Handling**: System handles errors gracefully without crashing
3. **Logging**: Sufficient logging for debugging
4. **Documentation**: Phase-specific documentation updated

## Notes

- **Steel Thread First**: Always prioritize getting a working end-to-end flow before adding features
- **Serverless Constraints**: Keep functions lightweight, avoid long-running operations
- **QStash for Background**: Any processing > 10s should use QStash
- **Real-time First**: Use Supabase Realtime, not polling
- **No Scraping Logic Yet**: Focus on infrastructure and pipeline first (as per constraint)
