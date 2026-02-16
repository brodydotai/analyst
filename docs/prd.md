# Analyst — Product Requirements Document

## Vision

Analyst is an AI equity research system that autonomously produces institutional-quality investment analysis. The system executes domain-specific analytical frameworks (playbooks) against securities data to generate structured reports, verifies compliance against prompt specifications, and maintains a queryable research database.

Analyst serves as a core intelligence layer within a larger agentic operating system, processing investment opportunities across 18 industry verticals and delivering grade-assessed research artifacts in real time.

---

## Core Problem

Institutional investors require deep, structured analysis across diverse industry verticals before making deployment decisions. Manual research is slow and inconsistent. Playbook-driven AI research is fast, repeatable, and verifiable—but only if the system systematically validates that generated reports contain required analytical elements and maintain institutional standards.

---

## Solution Overview

Analyst provides:

1. **Playbook-Driven Analysis** — 18 industry-specific analytical frameworks that define role, tone, and multi-section requirements
2. **Automated Report Generation** — LLM-powered execution of playbooks to produce structured markdown reports
3. **Compliance Verification** — Scorecard engine that measures section coverage, element coverage, and structural integrity
4. **Persistent Storage** — Database of reports with metadata, compliance grades, and full-text search capability
5. **Research API** — REST endpoints for querying, filtering, and retrieving reports within parent OS

---

## Asset Research Pipeline: Full Lifecycle

### 1. Playbook Selection
- **Input:** Ticker symbol, optional industry override
- **Process:** Match ticker to industry vertical (e.g., INTC → semiconductors, SNAP → social media)
- **Output:** Load appropriate playbook from `research/prompts/`
- **Status:** Manual selection (future: auto-categorization via market data)

### 2. Data Collection (Future)
- **Input:** Ticker, playbook requirements
- **Process:** Gather structured company data:
  - SEC filings (10-K, 10-Q, 8-K) via EDGAR
  - Financial metrics (revenue, margins, growth)
  - News articles and research summaries
  - Competitive landscape data
- **Output:** Enriched company context in memory
- **Status:** Currently manual/placeholder; scheduled for Phase 3

### 3. Report Generation
- **Input:** Playbook, company context, data sources
- **Process:** Execute playbook via OpenAI (gpt-4o-mini or equivalent):
  - Pass prompt specification to LLM
  - Stream structured markdown output following playbook sections (A-H)
  - Inject Interesting Data Points (IDPs) as discoverable flags
  - Define Investigation Tracks for follow-up research
- **Output:** Markdown report file with metadata header
- **Status:** Scheduled for Phase 2; infrastructure ready

### 4. Compliance Verification
- **Input:** Generated report, playbook specification
- **Process:** Run compliance scorecard engine:
  - Measure section coverage (each section present and substantive)
  - Measure element coverage (required analytical elements present within sections)
  - Assess structural requirements (formatting, length, citation density)
  - Score weighted: 40% Section Coverage + 40% Element Coverage + 20% Structural
- **Output:** Compliance report with per-section status, overall grade (A-F), score (0-100)
- **Status:** Python verification tool exists (`research/verify_prompt_compliance.py`); scheduled for integration in Phase 2

### 5. Storage
- **Input:** Report content, compliance scorecard, metadata
- **Process:** Persist to Supabase:
  - Insert into `reports` table
  - Store full report markdown in `content` field
  - Index ticker, prompt_used, compliance_grade for queries
  - Record timestamps (created_at, updated_at)
- **Output:** Persistent research artifact with unique ID
- **Status:** Infrastructure ready; pending Phase 1 migration and Phase 2 integration

### 6. Retrieval & Search
- **Input:** Query filters (ticker, industry, grade, date range) or free-text search
- **Process:** Query Supabase via REST API:
  - Single report lookup by ID
  - List reports by ticker or industry
  - Filter by compliance grade threshold
  - Full-text search on content (future: vector embeddings)
- **Output:** Report(s) with metadata accessible to parent OS or CLI
- **Status:** API routes stubbed; scheduled for Phase 2-4

---

## Playbook Architecture

Each playbook is a prompt specification file (`*.prompt.md`) containing:

### Playbook Header
- **Filename:** `{industry-name}.prompt.md`
- **Metadata:** Industry name, applicable sectors, related industries, codename

### Role & Tone Definition
- **Role:** Persona the LLM assumes (e.g., "Semiconductor Sector Analyst")
- **Tone:** Voice requirements (e.g., "institutional, technical, skeptical")
- **Context:** Industry-specific nuances and analytical focus

### Multi-Section Framework (A through H)
Each playbook defines 6-8 required sections:

- **Section A — Foundational Synthesis:** Executive summary of company, industry position, key narratives
- **Section B — Core Economics (Industry-Specific):** Revenue drivers, unit economics, margin structure, growth mechanics (varies by vertical)
- **Section C — Ecosystem & Moat:** Competitive positioning, network effects, switching costs, supplier dynamics
- **Section D — Financial Logic:** Historical financials, key ratios, burn/profitability, capital allocation
- **Section E — Risk & Headwinds:** Regulatory, competitive, technological, market, execution risks
- **Section F — Product/Tech Roadmap:** Innovation trajectory, feature velocity, technical debt, strategic bets
- **Section G — Pattern Matching & IDPs:** Interesting Data Points (flagged anomalies, outliers) and cross-company pattern matches
- **Section H — Investigation Tracks:** Specific follow-up investigations required before confidence in thesis

### Section-Level Specifications
Each section includes:
- **Required Elements:** Specific analytical items that must appear (e.g., "gross margin trend analysis," "TAM expansion analysis")
- **Scope:** Typical length, depth, specificity expected
- **Tie-ins:** How this section connects to other sections

### Interesting Data Points (IDPs) & Investigation Tracks
- **IDPs:** Flagged, discoverable facts that warrant attention (e.g., "Competitor X captured 12% share in 18 months")
- **Investigation Tracks:** Open questions requiring follow-up research (e.g., "Quantify exact TAM in emerging markets")

### Current Playbook Inventory
18 industry-specific playbooks:
- semiconductors-and-accelerators.prompt.md
- saas.prompt.md
- oil-and-gas.prompt.md
- cybersecurity.prompt.md
- pharmaceuticals.prompt.md
- utilities.prompt.md
- quantum.prompt.md
- defense-and-weapons.prompt.md
- space.prompt.md
- chinese-ai-and-deep-tech.prompt.md
- precious-metals-commodity.prompt.md
- precious-and-rare-earth-metals.prompt.md
- precious-metal-miners.prompt.md
- data-centers-and-cloud-infrastructure.prompt.md
- robotics-and-process-automation.prompt.md
- drones.prompt.md
- industrial-testing-inspection-certification.prompt.md
- social-media-and-digital-advertising.prompt.md

---

## Report Structure

### Report Header
```
# {Ticker} — {Company Name} — {Codename}

**Industry:** {Industry Vertical}
**Analyst:** AI Analyst System
**Date:** {Generation Date}
**Prompt Used:** {playbook filename}
**Compliance Grade:** {A|B|C|D|F}
**Compliance Score:** {0-100}
```

### Report Body
Sections A through H as defined by playbook, with:
- **Substantive analysis** (500–1500 words typical per section)
- **Structured facts** (data points, metrics, comparisons)
- **IDPs flagged inline** with metadata
- **Investigation Tracks** collected at end of Section H

### Report Footer
- **Report Metadata:** Word count, section coverage, element coverage
- **Compliance Scorecard:** Per-section status (coverage %, elements present)
- **Generated Timestamp:** Creation time, LLM model used

---

## Scorecard System

The compliance scorecard measures whether a generated report meets playbook specifications.

### Scoring Methodology

**Weighted Components:**
- **Section Coverage (40%):** Does each required section appear with substantial content? (Y/N per section, averaged)
- **Element Coverage (40%):** Do required analytical elements appear within their sections? (Count present / count required, per section, weighted by importance)
- **Structural Requirements (20%):** Does the report meet formatting, length, and density standards?
  - Minimum word count: 3,000–5,000 depending on playbook
  - Minimum citations/references per section
  - IDP density: At least 5–10 flagged IDPs
  - Investigation tracks: At least 3 open questions

**Overall Score Calculation:**
```
score = (section_coverage_pct * 0.40) + (element_coverage_pct * 0.40) + (structural_pct * 0.20)
```

### Grading Scale
| Grade | Score | Status |
|-------|-------|--------|
| A | 90–100 | Institutional grade; publishable as-is |
| B | 80–89 | Strong report; minor gaps acceptable |
| C | 70–79 | Usable; requires manual review for omissions |
| D | 60–69 | Weak; significant gaps; remediation needed |
| F | <60 | Below threshold; regenerate or assign to human |

### Per-Section Status
For each section, the scorecard records:
- Coverage (%) — how much of the section-level specification is met
- Elements present (count / required)
- Estimated word count
- IDP count in section

Example:
```
## Compliance Report

| Section | Coverage | Elements | Status |
|---------|----------|----------|--------|
| A (Foundational) | 95% | 7/7 | ✓ |
| B (Core Economics) | 88% | 5/6 | ✓ |
| C (Ecosystem) | 92% | 8/8 | ✓ |
| D (Financial) | 85% | 5/7 | ⚠ |
| E (Risk) | 90% | 6/6 | ✓ |
| F (Roadmap) | 78% | 4/5 | ⚠ |
| G (Pattern Matching) | 91% | 5/5 | ✓ |
| H (Investigation) | 88% | 4/4 | ✓ |

**Overall Score: 88/100 — Grade B**
```

---

## Data Model

### Reports Table
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker VARCHAR(10) NOT NULL,
  title VARCHAR(255) NOT NULL,
  report_type VARCHAR(50) DEFAULT 'equity_analysis',
  period VARCHAR(20), -- e.g., "Q3 2024"
  prompt_used VARCHAR(255) NOT NULL, -- playbook filename
  content TEXT NOT NULL, -- full markdown report
  word_count INTEGER,
  compliance_score FLOAT, -- 0-100
  compliance_grade VARCHAR(1), -- A-F
  metadata JSONB, -- {industry, codename, model_used, idp_count, investigation_tracks: [...]}
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX ON reports(ticker);
CREATE INDEX ON reports(prompt_used);
CREATE INDEX ON reports(compliance_grade);
CREATE FULLTEXT INDEX ON reports(content); -- future
```

### Metadata Fields (JSONB)
```json
{
  "industry": "Semiconductors & Accelerators",
  "codename": "INTC-Q3-2024",
  "model_used": "gpt-4o-mini",
  "idp_count": 8,
  "investigation_tracks": ["TAM expansion in automotive", "Design win retention"],
  "section_coverage": {"A": 0.95, "B": 0.88, ...},
  "element_coverage": {"B": [5, 6], "D": [5, 7], ...},
  "generated_by": "analyst-v1"
}
```

---

## API Contract

### REST Endpoints

**Get Single Report**
```
GET /api/research/reports/{report_id}
Response: 200 { id, ticker, title, content, compliance_grade, metadata }
          404 if not found
```

**List Reports**
```
GET /api/research/reports?ticker=INTC&grade=A&offset=0&limit=20
Query Params:
  - ticker: filter by ticker
  - industry: filter by industry (from metadata)
  - grade: filter by compliance grade (A-F)
  - min_score: filter by minimum compliance score
  - offset: pagination offset
  - limit: page size (max 100)
Response: 200 { reports: [...], total: int, offset, limit }
```

**Search Reports**
```
GET /api/research/reports/search?q=margin+expansion&limit=10
Query Params:
  - q: full-text search query
  - limit: result limit (max 100)
Response: 200 { results: [{id, ticker, title, excerpt, relevance_score}] }
          (future: vector embeddings)
```

**Create Report** (internal/admin)
```
POST /api/research/reports
Body: { ticker, title, prompt_used, content, word_count, compliance_score, compliance_grade, metadata }
Response: 201 { id, created_at }
          422 if validation fails
```

**CLI Commands** (Python / Node)
```bash
analyst generate --ticker INTC --playbook semiconductors-and-accelerators
analyst verify --report-path ./reports/INTC_report.md
analyst list --industry "Semiconductors" --grade A
analyst search --query "margin expansion"
analyst fetch --id {report_id}
```

---

## Phased Development

### Phase 1: Foundation (Current)
**Goal:** Build data persistence, compliance engine, tooling, and seed existing reports.

**Deliverables:**
- [ ] `reports` table migration
- [ ] Existing reports scraped/imported to Supabase
- [ ] Compliance verification tool integrated with database output
- [ ] List/fetch API endpoints
- [ ] CLI tools for report management (list, fetch, verify)
- [ ] Documentation complete (this PRD, architecture, roadmap)

**Entry Criteria:**
- Project initialized with docs structure
- Playbook inventory complete (18 playbooks, 9+ existing reports)

**Exit Criteria:**
- All existing reports in database with compliance grades
- Verification tool produces consistent scores
- API endpoints return correct data
- CLI tools operational

---

### Phase 2: Generation Pipeline
**Goal:** Implement automated report generation via LLM and real-time compliance verification.

**Deliverables:**
- [ ] OpenAI integration (`generate_report` service)
- [ ] Playbook-to-prompt translation engine
- [ ] Report generation API endpoint (`POST /api/research/reports/generate`)
- [ ] Real-time compliance scoring during generation
- [ ] Report storage with auto-indexing
- [ ] Monitoring and error handling (failed generations, retries)

**Entry Criteria:**
- Phase 1 complete
- OpenAI API access configured
- Playbook format standardized

**Exit Criteria:**
- Generate reports end-to-end for 5 test tickers
- Compliance scores consistent with Phase 1 baseline
- Generation latency < 60 seconds per report
- Error rate < 2%

---

### Phase 3: Data Ingestion
**Goal:** Build data collection layer for company fundamentals, filings, and news.

**Deliverables:**
- [ ] SEC EDGAR integration (fetch 10-K, 10-Q, 8-K)
- [ ] Financial data API integration (Alpha Vantage or equivalent)
- [ ] News feed aggregation (RSS or news APIs)
- [ ] Company metadata enrichment
- [ ] Ingestion pipeline (scheduled daily updates)
- [ ] Data quality checks and deduplication

**Entry Criteria:**
- Phase 2 complete
- External API credentials configured
- Data schema finalized

**Exit Criteria:**
- Complete financials available for 50+ tickers
- Latest filings ingested within 24 hours of SEC publication
- News feed returning 10+ articles per ticker per day

---

### Phase 4: Intelligence Layer
**Goal:** Add embedding, search, and recommendation capabilities.

**Deliverables:**
- [ ] Vector embeddings on report sections (OpenAI text-embedding-3-small)
- [ ] Semantic search across research database
- [ ] Report similarity matching (find related analyses)
- [ ] IDP extraction and cross-ticker pattern detection
- [ ] Recommendation engine (similar companies, industries)

**Entry Criteria:**
- Phase 3 complete
- 100+ reports in database
- Vector database configured (pgvector)

**Exit Criteria:**
- Semantic search latency < 500ms
- Embedding quality validated via manual samples
- Recommendation engine returns relevant suggestions

---

### Phase 5: Integration Hardening
**Goal:** Prepare for deployment as a service within parent OS.

**Deliverables:**
- [ ] Authentication & authorization (API key or OAuth)
- [ ] Rate limiting and quota management
- [ ] Webhook support for external notifications
- [ ] SLA monitoring and alerting
- [ ] API versioning strategy
- [ ] Load testing and scaling optimization
- [ ] Comprehensive API documentation (OpenAPI/Swagger)

**Entry Criteria:**
- Phase 4 complete
- Parent OS integration pattern defined
- Security requirements finalized

**Exit Criteria:**
- 99.5% uptime SLA achieved in staging
- API handles 1000 req/min without degradation
- Auth/rate limiting validated
- Public documentation ready

---

## Non-Functional Requirements

### Performance
- Report generation: < 60 seconds per report
- API response time: < 500ms for list/fetch, < 1s for search
- Database queries: < 100ms at scale (100K+ reports)

### Reliability
- Database backups: Daily snapshots retained for 30 days
- Failed generations: Logged and retryable
- Compliance verification: Deterministic (same input → same score)

### Scalability
- Support 1000+ reports
- Support 10+ concurrent generation requests
- Horizontal scaling via stateless API layer

### Security
- No hardcoded API keys; all config via environment
- Input validation on all API endpoints
- Rate limiting on public endpoints
- Audit logging of report generation and access

### Compliance & Quality
- All generated reports verified against playbooks
- Compliance scores reproducible and auditable
- Section and element coverage tracked and reported

---

## Success Metrics

1. **Adoption:** Parent OS integrates Analyst API within 6 months
2. **Quality:** 95% of generated reports achieve grade B or higher
3. **Velocity:** Generate new report in < 60 seconds
4. **Coverage:** 18 playbooks deployed; 10+ tickers seeded
5. **Reliability:** 99.5% uptime, < 2% generation failures

---

## Assumptions & Dependencies

**Assumptions:**
- OpenAI API available and reliable
- Playbook specifications remain stable
- SEC EDGAR and news APIs remain accessible
- Parent OS provides ticker/industry metadata

**Dependencies:**
- Supabase infrastructure (Phase 1+)
- OpenAI API key (Phase 2+)
- Data API credentials (Phase 3+)
- Vector database support (Phase 4+)

---

## Out of Scope (Current)

- Report editing or human review workflows
- Multi-user collaboration or roles
- Report export formats (PDF, Word)
- Backtesting or portfolio integration
- Market data streaming
- Real-time news ingestion
