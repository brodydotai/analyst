# Atlas — Database Schema

## Extensions

- **pgvector** — Vector similarity search for embeddings
- **pg_trgm** — Trigram-based fuzzy text matching for entity names

## Tables

### sources

RSS feeds and EDGAR endpoints that Atlas monitors.

| Column | Type | Notes |
|--------|------|-------|
| id | bigint | PK, auto-increment |
| name | text | Display name |
| type | text | `rss` or `edgar` |
| url | text | Unique feed/endpoint URL |
| active | boolean | Whether to include in ingestion runs |
| config | jsonb | Source-specific settings |
| created_at | timestamptz | |
| updated_at | timestamptz | Auto-updated via trigger |

### entities

Companies, people, and funds tracked across all documents.

| Column | Type | Notes |
|--------|------|-------|
| id | bigint | PK, auto-increment |
| name | text | Entity display name |
| type | text | `company`, `person`, or `fund` |
| cik | text | SEC CIK number (unique, nullable) |
| ticker | text | Stock ticker symbol |
| exchange | text | Exchange (NYSE, NASDAQ, etc.) |
| metadata | jsonb | Additional attributes |
| created_at | timestamptz | |
| updated_at | timestamptz | Auto-updated via trigger |

**Indexes:** cik (partial), ticker (partial), name (gin trigram)

### filings

SEC filings fetched from EDGAR.

| Column | Type | Notes |
|--------|------|-------|
| id | bigint | PK, auto-increment |
| accession_number | text | Unique EDGAR accession number |
| form_type | text | 10-K, 10-Q, 8-K, etc. |
| filed_at | timestamptz | Date filed with SEC |
| accepted_at | timestamptz | Date accepted by SEC |
| filer_cik | text | CIK of the filing entity |
| filer_name | text | Name of the filing entity |
| url | text | EDGAR document URL |
| full_text | text | Extracted document text |
| embedding | vector(1536) | OpenAI embedding |
| metadata | jsonb | Additional filing data |
| processed | boolean | Whether processing is complete |
| created_at | timestamptz | |

**Indexes:** form_type, filer_cik, filed_at (desc), embedding (ivfflat cosine)

### articles

News articles from RSS feeds.

| Column | Type | Notes |
|--------|------|-------|
| id | bigint | PK, auto-increment |
| source_id | bigint | FK → sources |
| url | text | Unique article URL |
| title | text | Article headline |
| author | text | Author name |
| published_at | timestamptz | Publication date |
| content | text | Full article text |
| embedding | vector(1536) | OpenAI embedding |
| metadata | jsonb | Additional article data |
| processed | boolean | Whether processing is complete |
| created_at | timestamptz | |

**Indexes:** source_id, published_at (desc), embedding (ivfflat cosine)

### document_entities

Junction table linking filings and articles to entities.

| Column | Type | Notes |
|--------|------|-------|
| id | bigint | PK, auto-increment |
| entity_id | bigint | FK → entities (cascade delete) |
| filing_id | bigint | FK → filings (nullable, cascade delete) |
| article_id | bigint | FK → articles (nullable, cascade delete) |
| role | text | `filer`, `subject`, or `mentioned` |
| confidence | real | Match confidence (0.0–1.0) |
| created_at | timestamptz | |

**Constraint:** Exactly one of filing_id or article_id must be non-null.

### summaries

AI-generated summaries for documents.

| Column | Type | Notes |
|--------|------|-------|
| id | bigint | PK, auto-increment |
| filing_id | bigint | FK → filings (unique, nullable) |
| article_id | bigint | FK → articles (unique, nullable) |
| summary | text | Generated summary text |
| model | text | Model used for generation |
| metadata | jsonb | Generation parameters |
| created_at | timestamptz | |

**Constraint:** Exactly one of filing_id or article_id must be non-null. Each document gets at most one summary (unique constraints).

### ingestion_log

Tracks each ingestion run for monitoring.

| Column | Type | Notes |
|--------|------|-------|
| id | bigint | PK, auto-increment |
| source_type | text | `edgar` or `rss` |
| source_id | bigint | FK → sources (nullable for EDGAR) |
| status | text | `started`, `completed`, or `failed` |
| items_found | integer | Total items discovered |
| items_new | integer | New items inserted |
| error | text | Error message if failed |
| started_at | timestamptz | |
| completed_at | timestamptz | |

## Entity-Relationship Diagram

```
sources 1──* articles
entities 1──* document_entities
filings 1──* document_entities
articles 1──* document_entities
filings 1──? summaries
articles 1──? summaries
sources 1──* ingestion_log
```

## Row-Level Security

RLS is enabled on all tables. Current policies allow full access for the service role (used by backend functions). Anon/authenticated policies will be added when the frontend requires direct Supabase access.
