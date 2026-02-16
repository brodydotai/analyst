# Analyst — System Architecture

## System Overview

Analyst is a distributed AI research system composed of four layers: CLI/API frontend, service layer, database, and external integrations. The system executes industry-specific analytical playbooks to generate structured equity research reports, verifies compliance against specifications, and persists artifacts for retrieval and cross-analysis.

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface Layer                     │
├─────────────────────┬─────────────────────────────────────┤
│  CLI Tools          │  REST API (FastAPI)                 │
│  - generate         │  - GET /reports                     │
│  - verify           │  - POST /reports                    │
│  - list             │  - GET /reports/:id                 │
│  - search           │  - GET /reports/search              │
└─────────────┬───────┴──────────────┬──────────────────────┘
              │                      │
┌─────────────v──────────────────────v──────────────────────┐
│                    Service Layer                          │
├───────────────────────────────────────────────────────────┤
│  • Report Generation (LLM orchestration)                  │
│  • Playbook Resolution & Validation                       │
│  • Compliance Scoring Engine                              │
│  • Report Query & Retrieval                               │
│  • Data Enrichment (future)                               │
└─────────────┬───────────────────────────────────────────┘
              │
┌─────────────v──────────────────────────────────────────────┐
│                    Database Layer                          │
├───────────────────────────────────────────────────────────┤
│  Supabase (PostgreSQL)                                    │
│  • reports (id, ticker, content, compliance_score, ...)  │
│  • Index: ticker, prompt_used, compliance_grade          │
│  • Full-text search (content)                             │
│  • Vector embeddings (future: pgvector)                   │
└─────────────┬───────────────────────────────────────────┘
              │
┌─────────────v──────────────────────────────────────────────┐
│                External Integrations                       │
├───────────────────────────────────────────────────────────┤
│  • OpenAI (gpt-4o-mini, text-embedding-3-small)          │
│  • SEC EDGAR (future)                                     │
│  • Financial Data APIs (future)                           │
│  • News Aggregators (future)                              │
└───────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### 1. CLI Tools
**Purpose:** Local command-line interface for development, testing, and operational tasks.

**Components:**
- `analyst generate` — Execute playbook against ticker; output report to file
- `analyst verify` — Score existing report against playbook specification
- `analyst list` — Query and list stored reports (by ticker, industry, grade)
- `analyst search` — Full-text search across report database
- `analyst fetch` — Retrieve single report by ID

**Technology:** Node.js or Python CLI framework, Supabase client library, OpenAI client

**Current Status:** Stub implementation; full implementation Phase 1

---

### 2. REST API

**Purpose:** Stateless HTTP endpoints for parent OS integration and external clients.

**Key Endpoints:**
- `GET /api/research/reports` — List reports with filters
- `GET /api/research/reports/:id` — Fetch single report
- `GET /api/research/reports/search` — Full-text search
- `POST /api/research/reports` — Create/store report
- `POST /api/research/reports/generate` — Generate new report
- `POST /api/research/reports/:id/verify` — Run compliance check

**Technology:** FastAPI routes, Pydantic validation, Supabase client

**Current Status:** Route stubs exist; business logic Phase 2

---

### 3. Service Layer

**Key Services:**

**ReportService:**
- `generateReport()` — Execute playbook via LLM
- `getReport()` — Retrieve single report
- `listReports()` — Query with filters
- `searchReports()` — Full-text search
- `storeReport()` — Persist to database

**ComplianceService:**
- `verifyReport()` — Score against playbook
- `scoreSections()` — Section-level coverage
- `scoreElements()` — Element-level coverage

**PlaybookService:**
- `loadPlaybook()` — Read prompt specification
- `resolvePlaybookForTicker()` — Match ticker to industry
- `listPlaybooks()` — Enumerate available playbooks

**DataService (Future):**
- `getCompanyData()` — Fetch fundamentals
- `getRecentFilings()` — SEC EDGAR data
- `getRecentNews()` — News feed

**Technology:** Python services, Pydantic models, explicit orchestration

**Current Status:** Stubs defined; implementation Phase 1-2

---

### 4. Database Layer

**Primary Table: reports**
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker VARCHAR(10) NOT NULL,
  title VARCHAR(255) NOT NULL,
  report_type VARCHAR(50) DEFAULT 'equity_analysis',
  period VARCHAR(20),
  prompt_used VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  word_count INTEGER,
  compliance_score FLOAT CHECK (compliance_score >= 0 AND compliance_score <= 100),
  compliance_grade VARCHAR(1) CHECK (compliance_grade IN ('A', 'B', 'C', 'D', 'F')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  KEY idx_ticker (ticker),
  KEY idx_prompt_used (prompt_used),
  KEY idx_compliance_grade (compliance_grade),
  KEY idx_created_at (created_at DESC)
);
```

**Metadata Fields (JSONB):**
```json
{
  "industry": "Semiconductors & Accelerators",
  "codename": "INTC-Q3-2024",
  "model_used": "gpt-4o-mini",
  "idp_count": 8,
  "investigation_tracks": ["TAM expansion", "Design win retention"],
  "section_coverage": {"A": 0.95, "B": 0.88},
  "element_coverage": {"A": [7, 7], "B": [5, 6]},
  "generated_by": "analyst-v1"
}
```

**Future Tables (Phase 3+):**
- `filings` — SEC 10-K, 10-Q, 8-K documents
- `articles` — News articles and research summaries
- `report_embeddings` — Vector embeddings (pgvector)
- `interesting_data_points` — Extracted IDPs and cross-links

**Technology:** Supabase (PostgreSQL), pgvector (future), pg_trgm (future)

**Current Status:** Schema designed; migration Phase 1

---

### 5. External Integrations

**OpenAI Integration:**
- Report generation via `gpt-4o-mini` (Phase 2)
- Embeddings via `text-embedding-3-small` (Phase 4)
- Rate limiting and retry logic
- Configuration via `OPENAI_API_KEY` environment variable

**SEC EDGAR Integration (Future):**
- EFTS API for discovery
- Submissions API for entity data
- Rate limit: 10 req/sec, 100ms min delay
- Filing parsing and financial data extraction

**Financial Data APIs (Future):**
- Potential sources: Alpha Vantage, IEX Cloud, Finnhub, Twelve Data
- Revenue, margins, growth, valuation, debt metrics

**News Aggregation (Future):**
- NewsAPI, RSS feeds, press releases
- Daily/hourly refresh, deduplication, filtering

---

## Data Flow Diagrams

### Report Generation Flow (Phase 2+)

```
User/Parent OS
  ↓
POST /api/research/reports/generate
  ↓
Validate input (Pydantic models)
  ↓
ReportService.generateReport()
  ├─ PlaybookService.loadPlaybook()
  ├─ Construct LLM prompt (role, tone, sections A-H)
  ├─ Call OpenAI API (gpt-4o-mini)
  ├─ ComplianceService.verifyReport()
  │  ├─ Score section coverage
  │  ├─ Score element coverage
  │  └─ Calculate grade (A-F)
  ├─ ReportService.storeReport()
  │  └─ INSERT into reports table
  └─ Return report object
  ↓
Return 201 { id, content, compliance_score }
  ↓
Database (reports table)
```

### Report Retrieval Flow

```
User/Parent OS
  ↓
GET /api/research/reports?ticker=INTC&grade=A
  ↓
Validate query params (Pydantic models)
  ↓
ReportService.listReports(filters)
  ↓
SELECT * FROM reports WHERE ticker=? AND compliance_grade=?
  ↓
Return 200 { reports, total, offset, limit }
  ↓
Client receives report list
```

### Compliance Verification Flow

```
User/CLI
  ↓
analyst verify --report reports/INTC_report.md --playbook research/playbooks/semiconductors-and-accelerators.prompt.md
  ↓
Read report from file
  ↓
ComplianceService.verifyReport()
  ├─ PlaybookService.loadPlaybook()
  ├─ Extract sections A-H from markdown
  ├─ For each section:
  │  ├─ Check presence (binary)
  │  ├─ Count elements (present vs. required)
  │  └─ Calculate coverage %
  ├─ Assess structural requirements
  │  ├─ Word count
  │  ├─ IDP density
  │  └─ Investigation track count
  └─ Calculate weighted score
      (section_coverage*0.4 + element_coverage*0.4 + structural*0.2)
  ↓
Print scorecard to console
  ↓
User sees verification results
```

---

## Integration with Parent OS

Analyst operates as a microservice within the larger agentic OS (Analyst):

**API Contract:**
- Parent OS calls `/api/research/reports/generate` with ticker and playbook
- Analyst returns report ID, content, compliance metadata
- Parent OS stores report reference in its state

**Webhook (Future):**
- Analyst publishes: `report.generated`, `report.failed`
- Parent OS subscribes for async workflows

**Data Sharing (Future):**
- Semantic search API for cross-report queries
- Pattern detection and portfolio insights
- Cross-asset comparison

**Authentication (Future):**
- API key or OAuth for parent OS
- Rate limiting and quota management
- Audit logging

---

## Technology Rationale

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **API Framework** | FastAPI | Typed Python API layer with OpenAPI docs |
| **Database** | Supabase | Built-in full-text search; pgvector support; managed backups |
| **Validation** | Pydantic | Runtime validation with typed Python models |
| **LLM** | OpenAI gpt-4o-mini | Low latency; economical; proven for structured output |
| **Embeddings** | text-embedding-3-small | 1536 dims; fast inference; good quality |
| **CLI** | Click (Python) | Reuses backend services directly |
| **Config** | Environment variables | Secure; zero-config deployment; no secrets in code |

---

## Error Handling & Resilience

**Report Generation:**
- LLM error → log, retry with exponential backoff
- Timeout (>60s) → abort, return 503
- Invalid playbook → return 422
- Database failure → return 500, log

**Compliance Verification:**
- Playbook not found → 404
- Malformed markdown → log, score what can be extracted
- Unexpected structure → degrade gracefully

**Database:**
- Connection timeout → retry 3x with backoff
- Query timeout → return 503, log slow query
- Transaction rollback → return 500, log

**Rate Limiting (Future):**
- OpenAI: Respect per-minute token limits, queue excess
- API endpoints: 1000 req/min per consumer
- SEC EDGAR: 10 req/sec enforced

---

## Monitoring & Observability

**Metrics:**
- Generation: count, latency, success rate, grade distribution
- Compliance: score distribution, coverage trends
- API: request count, error rates, response times
- Database: query latency, row count, index hit rates

**Logging:**
- All generation attempts with timestamp, ticker, playbook, result
- All failures with error message and stack trace
- API requests with method, path, status, duration

**Alerting (Future):**
- Generation failure rate >5% → alert
- Compliance score divergence → investigate
- API p95 latency >1s → investigate
- Database query timeout → investigate

---

## Security Considerations

**Input Validation:**
- All API inputs validated with Pydantic; 422 on failure
- Ticker symbols matched against whitelist (future)
- Playbook paths verified (prevent directory traversal)

**API Authentication (Phase 5):**
- API key or OAuth required
- Rate limiting per-consumer
- IP whitelisting optional

**Data Protection:**
- No PII in reports (company data only)
- Sanitized error responses; no stack traces
- Credentials via environment; never hardcoded

**Supply Chain:**
- No untrusted dependencies
- HTTPS for all external APIs
- Dependency updates reviewed

---

## Deployment Architecture

**Development:**
- Local Supabase (Docker)
- OpenAI API key configured locally
- CLI and API on localhost:3000

**Staging:**
- Supabase staging environment
- OpenAI API (separate quota)
- Full integration tests

**Production:**
- Supabase managed service (backup, failover)
- OpenAI API with billing limits
- Vercel or similar PaaS
- CLI via npm, Homebrew

---

## Future Enhancements

**Phase 4 — Vector Search:**
- Index sections in pgvector
- Semantic search: "margin expansion across all reports"
- Similarity matching: "5 companies most like INTC"

**Phase 4 — IDP Cross-Linking:**
- Extract IDPs into dedicated table
- Build IDP graph; cross-company patterns
- Anomaly detection: "unusual cluster across 3 competitors"

**Phase 5 — Versioning & Editing:**
- Manual report edits
- Edit history tracking
- Playbook A/B testing

**Phase 5 — Multimodal Reports:**
- Charts and tables in markdown
- Auto-generated sparklines
- PDF/Word export

**Phase 5 — Real-Time Feeds:**
- Streaming updates as data arrives
- Compliance re-scoring
- Webhook notifications
