# Atlas — Development Roadmap

## How to Read This Document

This roadmap is the operating contract between three roles:

- **Product owner** (Brody) — sets priorities, approves direction
- **Codex agent** (builder) — executes phases, writes code, proposes features
- **Claude agent** (reviewer) — audits code, runs debugging checks, approves merges

Each phase contains **directives** (instructions to Codex), **audit gates** (checks run by Claude), and **analyst recommendations** (where Codex is expected to propose additions from a senior investment analyst perspective).

---

## Phase 1: Watchlist Data Model + CRUD API

The watchlist is the product. Everything else serves it.

### Schema Changes

Add these tables to a new migration (`002_watchlist.sql`):

- **watchlist_categories** — user-defined groupings (name, sort_order)
- **watchlist_items** — assets on the watchlist (ticker, name, category_id, sort_order, metadata)

The existing `entities` table stays — watchlist_items will reference entities once entity linking is wired up later. For now, watchlist_items are standalone rows keyed by ticker.

### Directives for Codex

1. Write `supabase/migrations/002_watchlist.sql` with the two tables above. Include `updated_at` triggers, RLS policies (same pattern as 001), and indexes on `category_id` and `ticker`.
2. Write Pydantic models in `core/python/models/watchlist.py` for `WatchlistCategory`, `WatchlistCategoryCreate`, `WatchlistItem`, `WatchlistItemCreate`.
3. Write API routes:
   - `api/python/watchlist/index.py` — GET (list all items grouped by category), POST (add item)
   - `api/python/watchlist/[id]/index.py` — PUT (edit item), DELETE (remove item)
   - `api/python/watchlist/categories/index.py` — GET, POST
   - `api/python/watchlist/categories/[id]/index.py` — PUT, DELETE
   - `api/python/watchlist/reorder/index.py` — PUT (batch update sort_order)
4. Each route must validate input with Pydantic, return proper HTTP status codes, and handle Supabase errors without leaking internals.
5. No authentication yet — single-user assumption. Auth is a later concern.

### Analyst Recommendation Window

> Codex: After implementing the CRUD routes, evaluate whether the watchlist_items schema should include fields for `asset_class` (equity, ETF, crypto, commodity, forex), `notes` (free-text user annotation), or `target_price` / `stop_loss` levels. Propose additions only if they are low-cost to add now and would be painful to migrate later. Justify each recommendation from the perspective of a portfolio manager who uses this daily.

### Audit Gate (Claude Reviews)

- [ ] Migration SQL is valid: no syntax errors, constraints are correct, RLS enabled
- [ ] Pydantic models match the SQL schema exactly (field names, types, nullability)
- [ ] Every API route handles: missing resource (404), invalid input (422), duplicate ticker (409)
- [ ] No raw SQL — all DB access through Supabase client
- [ ] Routes are idempotent where appropriate (PUT, DELETE)

---

## Phase 2: Asset Data Enrichment

Each watchlist item needs live context: metrics, links, performance.

### Directives for Codex

1. Choose and integrate a financial data API for key metrics. Evaluate in this order of preference:
   - **Financial Modeling Prep (FMP)** — good free tier, covers multiples + price
   - **Yahoo Finance (yfinance)** — no API key, but unofficial and rate-limited
   - **Alpha Vantage** — free tier, but limited calls/day
2. Write `core/python/market_data/client.py` — a rate-limited client that fetches:
   - Current price
   - P/E ratio, EV/EBITDA, P/S, P/B
   - Performance: 1D change, 1W, 1M, 3M, YTD, 1Y
   - Market cap
   - 52-week high/low
3. Write `core/python/market_data/edgar_links.py` — given a ticker or CIK, generate direct URLs to:
   - EDGAR company filings page
   - Most recent 10-K, 10-Q, 8-K (use the submissions API at `data.sec.gov/submissions/CIK{cik}.json`)
4. Write `api/python/watchlist/enrich/index.py` — POST endpoint that takes a ticker, fetches metrics + EDGAR links, and returns the enriched data. This does NOT persist — it's a real-time lookup.
5. Write `core/python/market_data/tradingview.py` — generate TradingView chart URLs from ticker + exchange (the URL pattern is `https://www.tradingview.com/chart/?symbol={exchange}:{ticker}`).
6. Add `enrichment` to `requirements.txt` if new packages are needed.

### Analyst Recommendation Window

> Codex: Evaluate whether to include: short interest %, institutional ownership %, next earnings date, dividend yield, or sector/industry classification. These are standard screener fields. Recommend which ones are available from the chosen data API at no additional cost and would make the watchlist more useful for daily portfolio review.

### Audit Gate (Claude Reviews)

- [ ] Data API client respects rate limits and handles API errors (timeout, 429, bad ticker)
- [ ] EDGAR link generation works for tickers that map to a known CIK (test with AAPL, TSLA, BRK-B)
- [ ] TradingView URL generation handles exchange prefixes correctly
- [ ] No API keys hardcoded — all from config.py / environment
- [ ] Enrichment endpoint returns a clean, typed response (not raw API passthrough)

---

## Phase 3: AI Report Generation

Two report types: per-asset deep dive and 24-hour watchlist briefing.

### Directives for Codex

1. Write `core/python/processing/reports.py`:
   - `generate_asset_report(ticker, metrics, filings, articles)` — produces a structured report with: company overview, recent price action, key metrics interpretation, recent filings summary, bull/bear considerations.
   - `generate_daily_briefing(watchlist_items_with_context)` — produces a single briefing covering all watchlist assets for the last 24 hours.
2. Use OpenAI `gpt-4o-mini` via the existing config. Structure prompts to return consistent markdown.
3. Write `api/python/reports/asset/index.py` — POST with `{ticker}`. Fetches current metrics + recent filings/articles, generates report, returns it. Optionally persists to `summaries` table.
4. Write `api/python/reports/daily/index.py` — POST (no body needed). Fetches all watchlist items, enriches each, generates the 24h briefing, returns it.
5. Reports should stream if possible (Vercel supports streaming responses). If streaming adds complexity, skip it — return the full response.

### Analyst Recommendation Window

> Codex: Evaluate the report prompt structure. A useful asset report for an investment analyst typically includes: valuation context (is it cheap or expensive relative to sector peers?), catalyst timeline (upcoming earnings, FDA dates, index rebalances), and risk flags (debt maturity, insider selling, SEC investigation disclosures). Recommend which of these can be populated from available data sources and which would require additional API integrations.

### Audit Gate (Claude Reviews)

- [ ] OpenAI prompts are well-structured: clear system message, structured user context, consistent output format
- [ ] Token usage is reasonable — no dumping raw filing text into the prompt without truncation
- [ ] Error handling: what happens if OpenAI returns an error, if a ticker has no filings, if the watchlist is empty?
- [ ] Daily briefing doesn't make N serial OpenAI calls — batch context into one prompt or use parallel calls
- [ ] Reports don't hallucinate financial data — all numbers come from the data API, not the LLM

---

## Phase 4: Frontend — Watchlist Dashboard

The primary user interface. This is what I open every day.

### Directives for Codex

1. Initialize Next.js 15 app in `frontend/` with App Router, TypeScript, Tailwind CSS.
2. Build the watchlist page (`/`):
   - Grouped by category with collapsible sections
   - Each row: ticker, name, price, key metrics (P/E, EV/EBITDA), 1D/1W/1M performance with color coding (green/red), TradingView link icon, EDGAR link icon, "Generate Report" button
   - Top-level "24h Summary" button
   - "Add Asset" flow: search by ticker, assign to category
   - Edit mode: reorder items (drag or arrows), move between categories, delete
3. Report view: clicking "Generate Report" opens a panel/modal showing the AI report (markdown rendered). "24h Summary" shows the daily briefing the same way.
4. Keep the UI dense and functional — this is a terminal for research, not a marketing page. Think Bloomberg, not Robinhood.
5. Use `fetch` against the Python API routes. No direct Supabase client calls from the frontend.

### Analyst Recommendation Window

> Codex: Consider whether the watchlist would benefit from: inline sparkline charts (tiny 7-day price charts next to each asset — achievable with a lightweight SVG library), color-coded heat indicators for metrics (e.g., P/E below sector average = green), or a "Flagged" column where the system highlights assets with unusual activity (big price move, new filing, earnings within 7 days). Recommend what adds daily decision-making value without cluttering the view.

### Audit Gate (Claude Reviews)

- [ ] Page loads with zero data gracefully (empty state, not a crash)
- [ ] API errors surface as user-visible messages, not console errors
- [ ] No layout shifts when data loads — use skeletons or fixed-height rows
- [ ] TypeScript is strict — no `any` types, API response types match backend Pydantic models
- [ ] Responsive enough to not break on a laptop screen (1280px+), but mobile is not a target

---

## Phase 5: Sources Admin Page

Configuration surface for the feed pipeline. Behind an admin gate.

### Directives for Codex

1. Implement a simple admin gate: environment variable `ADMIN_PASSWORD`, checked via a middleware or a login page that sets a cookie/session. No user management — just a single password.
2. Build the sources page (`/admin/sources`):
   - Table of all sources: name, type (rss/edgar), URL, active toggle, last ingestion timestamp
   - Add source form: name, URL, type dropdown
   - Edit inline or via modal
   - Delete with confirmation
3. Wire up to the existing `sources` table and API routes. If routes don't exist yet, create:
   - `api/python/sources/index.py` — GET, POST
   - `api/python/sources/[id]/index.py` — PUT, DELETE
4. Add a "Test" button per source that fetches the URL and shows whether it returned valid RSS/EDGAR data.

### Analyst Recommendation Window

> Codex: Recommend a starter set of 10-15 high-value financial RSS feeds and EDGAR search configurations that would be useful for a generalist equity analyst. Include sources for: macro news, earnings coverage, SEC filing alerts, and sector-specific feeds. These can be seeded into the sources table as defaults.

### Audit Gate (Claude Reviews)

- [ ] Admin gate actually blocks unauthenticated access (test with and without the cookie)
- [ ] CRUD operations are reflected in the database immediately (no stale UI)
- [ ] Source URL validation: reject obviously invalid URLs, warn on non-RSS URLs
- [ ] Active toggle persists and affects ingestion (inactive sources should not be fetched)
- [ ] No XSS vectors in source names or URLs rendered in the UI

---

## Phase 6: Feed Page + Ingestion Pipeline

The feed is powered by the sources. This phase wires up the ingestion backend and builds the feed UI.

### Directives for Codex

1. Implement the ingestion pipeline (activate the existing route stubs):
   - `api/python/ingest_feeds/index.py` — fetch all active RSS sources, parse with feedparser, insert new articles, dispatch QStash jobs
   - `api/python/ingest_filings/index.py` — query EDGAR EFTS for recent filings, insert new rows, dispatch QStash jobs
   - `api/python/process_article/index.py` — fetch full content, generate embedding, extract entities
   - `api/python/process_filing/index.py` — fetch filing text, generate embedding, extract entities
2. Write `core/python/feeds/fetcher.py` and `core/python/edgar/client.py` with the actual implementation.
3. Build the feed page (`/feed`):
   - Reverse-chronological list of articles and filings
   - Each item: title, source name, timestamp, snippet (first 200 chars or summary if available)
   - Filter tabs: All / News / Filings
   - Filter by ticker (shows items linked to watchlist entities)
   - Visual indicator when an item mentions a watchlist asset
4. Verify cron schedules in `vercel.json` work in production.

### Analyst Recommendation Window

> Codex: Evaluate whether the feed should support: saved searches (e.g., "all 13F filings" or "all articles mentioning 'activist investor'"), priority scoring (rank items by relevance to watchlist), or a "digest" mode that groups related items (e.g., multiple articles about the same earnings report). Recommend what adds signal-to-noise value for a daily research workflow.

### Audit Gate (Claude Reviews)

- [ ] Ingestion is idempotent — running twice doesn't create duplicates (unique constraints hold)
- [ ] EDGAR rate limiting is enforced — verify 100ms+ delay between requests
- [ ] QStash message dispatch handles failures (what if QStash is down? log and continue)
- [ ] Feed page pagination works — doesn't load 10,000 items at once
- [ ] Entity extraction produces reasonable results — spot-check 10 filings and 10 articles

---

## Phase 7: TradingView Sync

Import/export watchlists to keep Atlas and TradingView in sync.

### Directives for Codex

1. Research TradingView's watchlist export format (typically a comma- or newline-separated list of `EXCHANGE:TICKER` symbols, in a `.txt` file).
2. Write `core/python/tradingview/sync.py`:
   - `parse_watchlist(file_content: str) -> list[dict]` — parse TradingView export into structured data
   - `export_watchlist(items: list[WatchlistItem]) -> str` — generate TradingView-compatible export
3. Write API routes:
   - `api/python/watchlist/import/index.py` — POST with file upload, parses and adds to watchlist (merges with existing, doesn't duplicate)
   - `api/python/watchlist/export/index.py` — GET, returns downloadable text file
4. Build UI: import button (file picker) and export button on the watchlist page.

### Audit Gate (Claude Reviews)

- [ ] Import handles: empty file, duplicate tickers, tickers not found in data API, malformed lines
- [ ] Export produces a file that TradingView actually accepts (test manually)
- [ ] Import merge logic is correct: existing items stay, new ones are added, no category disruption
- [ ] File upload is bounded (reject files > 1MB)

---

## Phase 8: Search + Polish

Semantic search across all documents, and UX polish.

### Directives for Codex

1. Write `api/python/search/index.py` — GET with `?q=` parameter. Generates an embedding for the query, searches filings and articles by cosine similarity, returns ranked results.
2. Add a search bar to the frontend header that works from any page.
3. Search results page: shows matched filings and articles with relevance score, snippet, entity tags.
4. Polish pass:
   - Loading states on all async operations
   - Error boundaries on all pages
   - Keyboard shortcuts: `/` to focus search, `Esc` to close modals
   - Dark mode (if not already implemented)

### Analyst Recommendation Window

> Codex: Evaluate whether to add: related assets suggestions (when viewing one ticker, suggest correlated tickers based on sector, supply chain, or filing co-mentions), a "what moved today" auto-generated section on the homepage, or a weekly digest email via a simple cron job. Recommend features that compound the value of having all this data in one place.

### Audit Gate (Claude Reviews)

- [ ] Vector search returns relevant results — test with known queries against known filings
- [ ] Search handles empty results, very long queries, special characters
- [ ] No regressions from polish work — all CRUD operations still function
- [ ] Performance: watchlist page loads in under 2 seconds with 50+ items
- [ ] Run a full end-to-end test: add asset → enrich → generate report → check feed → search

---

## Standing Directives (Apply to All Phases)

These rules apply to every phase. Codex must follow them. Claude enforces them at every audit gate.

### Code Quality

1. **No dead code.** Don't leave commented-out blocks, unused imports, or placeholder functions that do nothing.
2. **Type everything.** Python: full type hints on all function signatures. TypeScript: strict mode, no `any`.
3. **Errors are not optional.** Every API route handles: bad input (422), not found (404), server error (500). Never return a bare 200 with an error message in the body.
4. **Config from environment.** No hardcoded URLs, keys, or secrets. Everything flows through `core/python/config.py`.
5. **One responsibility per file.** If a module is doing two unrelated things, split it.

### Architecture

6. **API routes are thin.** Business logic lives in `core/python/`. Routes validate input, call core functions, format output.
7. **Database access through `db.py` only.** No direct Supabase client instantiation in routes.
8. **QStash through `queue.py` only.** Same principle.
9. **Pydantic models are the contract.** API input/output types are defined in `core/python/models/`. Frontend TypeScript types must mirror them.

### Process

10. **Commit after each sub-task.** Don't batch an entire phase into one commit. Logical units of work.
11. **Migration files are append-only.** Never edit a deployed migration. New changes get a new numbered migration file.
12. **Test with real data.** Don't just test the happy path. Use real tickers (AAPL, TSLA, BRK-B), real EDGAR CIKs, real RSS feeds.

### Security

13. **No secrets in code or git.** `.env` is in `.gitignore`. `.env.example` has placeholder values only.
14. **Validate all external input.** Ticker symbols, URLs, file uploads — sanitize and bound everything.
15. **Admin gate is enforced server-side.** Don't rely on hiding the route in the UI.

---

## Audit Protocol (Claude's Responsibilities)

At each audit gate, Claude will:

1. **Read all changed files** in the phase's commits.
2. **Verify schema consistency** — Pydantic models match SQL, TypeScript types match Pydantic.
3. **Check error handling** — call each endpoint with bad input and verify the response.
4. **Check for regressions** — ensure previous phases still work after new code is added.
5. **Review security** — no leaked secrets, no injection vectors, no unvalidated input.
6. **Verify data correctness** — spot-check that EDGAR links resolve, metrics are plausible, reports don't hallucinate.
7. **Provide a written audit summary** with pass/fail for each checklist item and specific file:line references for any issues.

Claude does NOT rubber-stamp. If a phase fails audit, it goes back to Codex with specific fix instructions before proceeding to the next phase.
