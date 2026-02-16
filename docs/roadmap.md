# Analyst — Development Roadmap

## Overview

Analyst is building an institutional-grade AI equity research system in five phases over 12-18 months. Each phase builds on the previous and delivers concrete value to the parent OS (Brodus).

---

## Phase 1: Foundation (Current — Weeks 1-4)

**Goal:** Build data persistence layer, compliance engine, tooling, and seed database with existing reports.

**Entry Criteria:**
- Project structure initialized
- Playbook inventory complete (18 playbooks)
- Existing reports available (9+ reports across commodities and equities)
- CLAUDE.md and team onboarded

**Deliverables:**

1. **Database Migration**
   - Create `reports` table with proper schema and indexes
   - Schema: id, ticker, title, report_type, period, prompt_used, content, word_count, compliance_score, compliance_grade, metadata, created_at, updated_at
   - Indexes on: ticker, prompt_used, compliance_grade, created_at
   - Migration file: `supabase/migrations/002_analyst_reports.sql`

2. **Report Seeding**
   - Write data import script to parse existing markdown reports
   - Extract metadata (industry, codename, compliance grade)
   - Import all existing reports (INTC, ADBE, VNET, SNAP, ASPI, CRCL, S, TIC, commodities)
   - Verify import consistency

3. **Compliance Verification Tool**
   - Integrate existing `research/verify_prompt_compliance.py` into codebase
   - Output JSON scorecard: section coverage, element coverage, structural assessment
   - Grade assignment (A-F) based on score (90+, 80-89, 70-79, 60-69, <60)
   - Run against all seeded reports to establish baseline

4. **List API Endpoint** (`GET /api/research/reports`)
   - Query parameters: ticker, industry, grade, min_score, offset, limit
   - Return paginated report list with metadata
   - Response contract: { reports: [...], total, offset, limit }
   - Handle bad input with 422, missing records with 404

5. **Fetch API Endpoint** (`GET /api/research/reports/:id`)
   - Retrieve single report by ID
   - Return full report content + metadata
   - Error handling: 404 if not found, 500 on database failure

6. **CLI Tools**
   - `analyst list --ticker INTC --grade A --offset 0 --limit 20` — List reports
   - `analyst fetch --id {uuid}` — Retrieve single report
   - `analyst verify --report {path} --playbook {path}` — Score report locally
   - Output results as JSON or formatted table

7. **Documentation**
   - `/docs/prd.md` — Full product requirements document
   - `/docs/architecture.md` — System architecture and component breakdown
   - `/docs/roadmap.md` — Development phases (this file)
   - `/README.md` — Project overview and quick start

**Testing:**
- Unit tests for compliance scoring (verify against known good reports)
- Integration tests for API endpoints (valid queries, error cases)
- Manual testing of CLI commands
- Spot-check report data quality

**Exit Criteria:**
- All existing reports successfully imported and indexed
- Compliance scores stable and match baseline verification
- API endpoints return correct data with proper error handling
- CLI tools operational and documented
- Documentation complete and reviewed
- Team confident in data model and API contracts
- 95%+ test coverage for core services

---

## Phase 2: Generation Pipeline (Weeks 5-8)

**Goal:** Implement automated report generation via LLM with real-time compliance verification.

**Entry Criteria:**
- Phase 1 complete
- OpenAI API credentials configured
- Playbook format standardized and documented
- Team familiar with Zod schema patterns

**Deliverables:**

1. **Playbook Processing Engine**
   - `PlaybookService.loadPlaybook()` — Parse *.prompt.md files into structured spec
   - Extract: role definition, tone, required sections (A-H), elements per section, structural requirements
   - Validate playbook structure (all required sections present)
   - Support version pinning for reproducibility

2. **LLM Integration**
   - `OpenAIService.generateReport()` — Call gpt-4o-mini with playbook prompt
   - Construct system prompt from playbook role/tone
   - Construct user prompt with company context
   - Stream output for real-time updates
   - Extract metadata (IDPs, investigation tracks) from markdown

3. **Report Generation Endpoint** (`POST /api/research/reports/generate`)
   - Input: { ticker, playbook, company_context? }
   - Orchestrate: PlaybookService → OpenAI → ComplianceService → Database
   - Return 201 { id, status, compliance_score, compliance_grade, content }
   - Handle errors: 422 (invalid input), 503 (timeout), 500 (failure)
   - Implement request logging and retry logic

4. **Real-Time Compliance Scoring**
   - Run `ComplianceService.verifyReport()` immediately after generation
   - Score and grade computed before return
   - Include section coverage, element coverage, structural assessment in metadata
   - Store full scorecard in report metadata JSONB

5. **Report Storage & Indexing**
   - `ReportService.storeReport()` — INSERT report with all metadata
   - Auto-populate: created_at, word_count, compliance_score, compliance_grade
   - Ensure indexes on ticker, prompt_used, compliance_grade are efficient
   - Implement upsert logic (handle duplicate generation requests)

6. **Error Handling & Observability**
   - Log all generation attempts (timestamp, ticker, playbook, duration, result)
   - Track failures: LLM errors, timeouts, compliance failures, database errors
   - Implement exponential backoff for retries
   - Add monitoring for generation success rate, average latency, grade distribution

7. **CLI Generation Command**
   - `analyst generate --ticker INTC --playbook semiconductors-and-accelerators`
   - `analyst generate --ticker SNAP --playbook social-media-and-digital-advertising --save`
   - Output: report content to stdout or file, compliance scorecard
   - Options: `--save` (write to file), `--format` (markdown, json)

8. **Testing & Validation**
   - Generate reports for 5 test tickers (INTC, ADBE, SNAP, VNET, TIC)
   - Validate compliance scores against Phase 1 baseline
   - Measure generation latency, error rates
   - Manual quality review of generated reports

**Quality Thresholds:**
- 90%+ of generated reports achieve grade B or higher
- Generation latency < 60 seconds per report
- Error rate < 2% (transient failures excluded)
- Compliance scores consistent ±5 points from verification tool

**Exit Criteria:**
- Full end-to-end report generation working
- All 18 playbooks tested successfully
- Generation quality meets thresholds
- Monitoring dashboards in place
- Documentation complete

---

## Phase 3: Data Ingestion (Weeks 9-14)

**Goal:** Build data collection layer for company fundamentals, filings, and news.

**Entry Criteria:**
- Phase 2 complete
- External API credentials configured (SEC EDGAR, financial data, news)
- Data schema designed and reviewed

**Deliverables:**

1. **SEC EDGAR Integration**
   - Implement EFTS API client for filing discovery
   - Implement Submissions API client for entity-specific data
   - Extract: accession_number, filing_type, filed_date, financial data, risk factors, MD&A
   - Enforce rate limits: 10 req/sec, 100ms min delay, custom User-Agent
   - Parse JSON response and extract key metrics

2. **Filings Table & Schema**
   - `CREATE TABLE filings` with: id, ticker, filing_type, accession_number, filed_date, content, metadata
   - Unique constraint on accession_number (deduplication)
   - Index on ticker and filed_date for fast queries
   - Store full filing text for full-text search

3. **Financial Data Enrichment**
   - Integrate financial data API (Alpha Vantage, IEX Cloud, or equivalent)
   - Fetch quarterly and annual financials: revenue, gross profit, operating income, margins, growth rates
   - Enrich company_context object with: latest revenue, margins, growth, valuation ratios
   - Cache financial data with TTL (e.g., update daily)

4. **News Aggregation**
   - Integrate NewsAPI or RSS feed aggregator
   - Fetch recent articles by ticker
   - `CREATE TABLE articles` with: id, ticker, headline, url, published_date, content, source
   - Unique constraint on URL (deduplication)
   - Filter and rank by relevance to ticker

5. **Data Ingestion Pipeline**
   - Scheduled job: Daily refresh of filings for tracked tickers
   - Scheduled job: Daily refresh of financial data
   - Scheduled job: Hourly news aggregation
   - Implement data quality checks: validate data format, detect anomalies
   - Implement backoff and retry logic for API failures

6. **Company Context Builder**
   - `DataService.getCompanyData(ticker)` — Aggregate data from all sources
   - Return enriched context: financials, recent filings, recent news, metadata
   - Pass to LLM for improved report generation

7. **Testing & Validation**
   - Verify EDGAR integration against known filings (INTC 10-K, SNAP 10-Q)
   - Validate financial data accuracy against trusted sources
   - Spot-check news ingestion for relevance and deduplication
   - Monitor data freshness and pipeline error rates

**Quality Thresholds:**
- Complete financials available for 50+ tickers
- Latest filings ingested within 24 hours of SEC publication
- News feed returning 10+ articles per ticker per day
- Data quality checks pass 95%+ of the time

**Exit Criteria:**
- All data sources integrated and tested
- Filings and articles tables populated with historical data
- Scheduled ingestion pipeline running stable
- Company context builder used in generation (Phase 2 updated)
- Performance and reliability meet thresholds

---

## Phase 4: Intelligence Layer (Weeks 15-18)

**Goal:** Add embedding, search, and recommendation capabilities.

**Entry Criteria:**
- Phase 3 complete
- 100+ reports in database
- pgvector extension available in Supabase
- OpenAI text-embedding-3-small API access

**Deliverables:**

1. **Vector Embeddings**
   - `EmbeddingService.embedReportSections()` — Call text-embedding-3-small on each section (A-H)
   - Store embeddings in `report_embeddings` table: report_id, section, embedding (1536-dim vector)
   - Index embeddings with pgvector for fast similarity search
   - Batch embed existing reports in Phase 3

2. **Semantic Search**
   - `SearchService.semanticSearch(query, limit)` — Embed user query, find similar sections
   - Return top K matching sections with relevance scores
   - Implement hybrid search: combine semantic + full-text (metadata JSONB search on IDP, investigation tracks)
   - Response: { results: [{ report_id, section, excerpt, relevance_score }], total }

3. **Report Similarity**
   - `AnalysisService.findSimilarReports(report_id, limit)` — Find most similar reports
   - Compare embeddings across all sections, weight by similarity
   - Useful for: "Show me analysis of 5 similar companies to INTC"

4. **IDP Extraction & Cross-Linking**
   - `IDPService.extractIDPs(report)` — Parse report for Interesting Data Points
   - Extract and store in `interesting_data_points` table: report_id, content, category (anomaly, threat, opportunity, pattern)
   - Build IDP graph: which companies mention which patterns?
   - Enable pattern detection: "Unusual cluster of X risk detected across 3 competitors"

5. **Recommendation Engine**
   - `RecommendationService.findRelatedAnalysis(ticker)` — Return similar companies, adjacent sectors
   - `RecommendationService.findPatternMatches(pattern)` — Find companies with similar characteristics
   - Drive insights: "5 companies showing margin expansion patterns like INTC"

6. **Search API Endpoints**
   - `GET /api/research/reports/search?q={query}&limit=10` — Semantic + full-text search
   - `GET /api/research/reports/{id}/similar` — Find similar reports
   - `GET /api/research/reports/{id}/recommendations` — Get recommendations based on report
   - Response format: { results: [...], total, relevance_scores }

7. **CLI Commands**
   - `analyst search "margin expansion" --limit 10` — Semantic search
   - `analyst similar --report-id {uuid} --limit 5` — Find similar reports
   - `analyst patterns --pattern "TAM growth" --sector semiconductors` — Cross-sector pattern search

8. **Testing & Validation**
   - Validate embedding quality on sample queries
   - A/B test semantic vs. full-text search effectiveness
   - Manual evaluation: does similarity matching return relevant reports?
   - Performance test: search latency < 500ms for 1000+ reports

**Quality Thresholds:**
- Semantic search latency < 500ms
- Embedding quality validated via manual samples (relevance > 80%)
- Recommendation engine returns relevant suggestions in 95%+ of cases
- Vector index efficient at 1000+ reports

**Exit Criteria:**
- All 100+ reports embedded and indexed
- Semantic search working across playbooks
- Recommendation engine live
- Performance and quality thresholds met

---

## Phase 5: Integration Hardening (Weeks 19-24)

**Goal:** Prepare for production deployment within Brodus as a hardened microservice.

**Entry Criteria:**
- Phase 4 complete
- Parent OS integration pattern defined
- Security and compliance requirements finalized

**Deliverables:**

1. **API Authentication & Authorization**
   - Implement API key authentication for parent OS
   - API key issued per consumer (Brodus, external integrations)
   - Rate limiting: 1000 req/min per consumer
   - Quota enforcement: X reports/month, Y searches/month
   - Implement rate limiting headers (X-RateLimit-Remaining, X-RateLimit-Reset)

2. **OAuth/SSO (Optional)**
   - Support OAuth 2.0 for user-facing clients
   - Integrate with parent OS identity provider
   - Token refresh and expiration handling

3. **Webhook Support**
   - Publish events: report.generated, report.failed, report.updated
   - Parent OS subscribes and receives notifications
   - Webhook retry logic with exponential backoff
   - Webhook signature verification (HMAC)

4. **API Versioning**
   - Endpoint scheme: `/api/v1/research/reports`
   - Backward compatibility strategy
   - Deprecation timeline (6+ month notice before sunset)

5. **SLA Monitoring & Alerting**
   - 99.5% uptime SLA
   - Automated health checks: database, OpenAI API, SECintregate
   - Alert on: error rate > 5%, latency p95 > 1s, SLA violation
   - Status dashboard for parent OS

6. **Load Testing & Scaling**
   - Validate system handles 1000 req/min without degradation
   - Test concurrent report generation (10+ simultaneous)
   - Identify bottlenecks and optimize
   - Horizontal scaling readiness (stateless API layer)

7. **Comprehensive Documentation**
   - OpenAPI/Swagger specification for all endpoints
   - API authentication guide
   - Rate limiting and quota documentation
   - Error code reference
   - Integration guide for parent OS

8. **Security Hardening**
   - Input validation on all endpoints (Zod schemas)
   - Sanitized error responses (no stack traces, internal details)
   - CORS configuration for parent OS domain
   - Security headers: X-Content-Type-Options, X-Frame-Options, CSP
   - Regular dependency updates and security scanning

9. **Audit Logging**
   - Log all report generation, retrieval, and search requests
   - Track: timestamp, consumer_id, endpoint, parameters, result
   - Retain audit logs for 90 days
   - Audit dashboard for compliance and investigation

10. **Performance Optimization**
    - Database query optimization (plan analysis, index tuning)
    - Caching layer (Redis) for frequently accessed reports
    - API response compression (gzip)
    - CDN for static assets (if applicable)

11. **Disaster Recovery**
    - Automated daily backups (Supabase)
    - Point-in-time recovery capability (14-day retention minimum)
    - Tested restore procedures
    - RTO/RPO targets defined (< 1 hour)

12. **Operational Runbooks**
    - Incident response playbook (generation failures, data issues)
    - Manual report reprocessing guide
    - Database rollback procedures
    - API rollback strategy

**Exit Criteria:**
- 99.5% uptime maintained over 2-week test period
- Load testing validates 1000+ req/min handling
- API documentation complete and validated
- Security audit passed
- All alerting configured and tested
- Parent OS integration ready for prod

---

## Long-Term Vision (Post-Phase 5)

### Multimodal Reports (Phase 5+)
- Embed charts, tables, and visualizations in markdown reports
- Auto-generate sparklines for key metrics
- PDF/Word export for institutional distribution

### Report Versioning & Editing
- Support manual edits to generated reports
- Track edit history and attribution
- Playbook A/B testing (generate with variant, compare scores)

### Real-Time Data Feeds
- Streaming updates to reports as new data arrives
- Compliance re-scoring on material changes
- Webhook notifications for threshold breaches (e.g., margin drop > 5%)

### Advanced Analytics
- Predictive scoring: "This company likely to outperform peers"
- Portfolio analysis: cross-holding sector concentration, correlation matrices
- Risk aggregation: sum of downside scenarios across portfolio

### Third-Party Integrations
- TradingView connector: sync watchlists, link to analysis
- Slack bot: "/analyst $INTC" → inline report snippet
- Email newsletter: weekly digest of new analyses

---

## Milestones & Key Dates

| Phase | Duration | Start | End | Key Milestones |
|-------|----------|-------|-----|-----------------|
| 1: Foundation | 4 weeks | Week 1 | Week 4 | Reports imported, API working, CLI functional |
| 2: Generation | 4 weeks | Week 5 | Week 8 | End-to-end generation working for all playbooks |
| 3: Ingestion | 6 weeks | Week 9 | Week 14 | EDGAR, financials, news feeds live |
| 4: Intelligence | 4 weeks | Week 15 | Week 18 | Vector search, recommendations, IDP extraction |
| 5: Hardening | 6 weeks | Week 19 | Week 24 | Production-ready, hardened, documented |

**Total: 18 weeks (~4.5 months)**

---

## Dependencies & Blockers

**Critical Dependencies:**
- Supabase infrastructure availability
- OpenAI API stability and quota
- External API credentials (SEC EDGAR, financial data, news)
- Parent OS integration contract defined

**Potential Blockers:**
- API rate limit exhaustion (mitigation: queue and backoff)
- LLM quality degradation (mitigation: prompt tuning, fallback strategies)
- Data quality issues from ingestion (mitigation: validation, monitoring)
- Performance scaling (mitigation: caching, indexing, query optimization)

---

## Success Metrics

- **Adoption:** Parent OS integrates Analyst API within Phase 5
- **Quality:** 95% of generated reports achieve grade B or higher
- **Velocity:** Generate new report in < 60 seconds
- **Coverage:** 18 playbooks deployed, 100+ reports in database
- **Reliability:** 99.5% uptime, < 2% generation failure rate
- **Search:** Semantic search latency < 500ms for 1000+ reports
- **Scalability:** Handle 1000+ req/min without degradation

---

## Review & Iteration

- Weekly sync with stakeholders on progress and blockers
- Phase completion review before advancing
- Post-phase retrospective: lessons learned, process improvements
- Quarterly roadmap update based on feedback and market changes
