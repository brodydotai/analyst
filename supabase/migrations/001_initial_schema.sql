-- Atlas: Market Intelligence Platform
-- Initial schema migration

-- Extensions
create extension if not exists "vector" with schema "extensions";
create extension if not exists "pg_trgm" with schema "extensions";

-- ============================================================
-- sources: RSS feeds and EDGAR endpoints we track
-- ============================================================
create table sources (
    id          bigint generated always as identity primary key,
    name        text not null,
    type        text not null check (type in ('rss', 'edgar')),
    url         text not null unique,
    active      boolean not null default true,
    config      jsonb not null default '{}',
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

create index idx_sources_type on sources (type) where active = true;

-- ============================================================
-- entities: companies, people, funds
-- ============================================================
create table entities (
    id          bigint generated always as identity primary key,
    name        text not null,
    type        text not null check (type in ('company', 'person', 'fund')),
    cik         text unique,
    ticker      text,
    exchange    text,
    metadata    jsonb not null default '{}',
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

create index idx_entities_cik on entities (cik) where cik is not null;
create index idx_entities_ticker on entities (ticker) where ticker is not null;
create index idx_entities_name_trgm on entities using gin (name extensions.gin_trgm_ops);

-- ============================================================
-- filings: SEC filings
-- ============================================================
create table filings (
    id              bigint generated always as identity primary key,
    accession_number text not null unique,
    form_type       text not null,
    filed_at        timestamptz not null,
    accepted_at     timestamptz,
    filer_cik       text not null,
    filer_name      text not null,
    url             text not null,
    full_text       text,
    embedding       vector(1536),
    metadata        jsonb not null default '{}',
    processed       boolean not null default false,
    created_at      timestamptz not null default now()
);

create index idx_filings_form_type on filings (form_type);
create index idx_filings_filer_cik on filings (filer_cik);
create index idx_filings_filed_at on filings (filed_at desc);
create index idx_filings_embedding on filings using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- ============================================================
-- articles: news articles from RSS feeds
-- ============================================================
create table articles (
    id          bigint generated always as identity primary key,
    source_id   bigint not null references sources (id),
    url         text not null unique,
    title       text not null,
    author      text,
    published_at timestamptz,
    content     text,
    embedding   vector(1536),
    metadata    jsonb not null default '{}',
    processed   boolean not null default false,
    created_at  timestamptz not null default now()
);

create index idx_articles_source_id on articles (source_id);
create index idx_articles_published_at on articles (published_at desc);
create index idx_articles_embedding on articles using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- ============================================================
-- document_entities: links filings/articles to entities
-- ============================================================
create table document_entities (
    id          bigint generated always as identity primary key,
    entity_id   bigint not null references entities (id) on delete cascade,
    filing_id   bigint references filings (id) on delete cascade,
    article_id  bigint references articles (id) on delete cascade,
    role        text not null check (role in ('filer', 'subject', 'mentioned')),
    confidence  real not null default 1.0,
    created_at  timestamptz not null default now(),

    check (
        (filing_id is not null and article_id is null) or
        (filing_id is null and article_id is not null)
    )
);

create index idx_doc_entities_entity on document_entities (entity_id);
create index idx_doc_entities_filing on document_entities (filing_id) where filing_id is not null;
create index idx_doc_entities_article on document_entities (article_id) where article_id is not null;

-- ============================================================
-- summaries: AI-generated summaries for filings and articles
-- ============================================================
create table summaries (
    id          bigint generated always as identity primary key,
    filing_id   bigint unique references filings (id) on delete cascade,
    article_id  bigint unique references articles (id) on delete cascade,
    summary     text not null,
    model       text not null,
    metadata    jsonb not null default '{}',
    created_at  timestamptz not null default now(),

    check (
        (filing_id is not null and article_id is null) or
        (filing_id is null and article_id is not null)
    )
);

-- ============================================================
-- ingestion_log: tracks each ingestion run
-- ============================================================
create table ingestion_log (
    id          bigint generated always as identity primary key,
    source_type text not null check (source_type in ('edgar', 'rss')),
    source_id   bigint references sources (id),
    status      text not null check (status in ('started', 'completed', 'failed')),
    items_found integer not null default 0,
    items_new   integer not null default 0,
    error       text,
    started_at  timestamptz not null default now(),
    completed_at timestamptz
);

create index idx_ingestion_log_source_type on ingestion_log (source_type, started_at desc);

-- ============================================================
-- updated_at trigger
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on sources
    for each row execute function update_updated_at();

create trigger set_updated_at before update on entities
    for each row execute function update_updated_at();

-- ============================================================
-- Row-level security (enable but allow all for service role)
-- ============================================================
alter table sources enable row level security;
alter table entities enable row level security;
alter table filings enable row level security;
alter table articles enable row level security;
alter table document_entities enable row level security;
alter table summaries enable row level security;
alter table ingestion_log enable row level security;

-- Service role bypass policies
create policy "service_role_all" on sources for all using (true) with check (true);
create policy "service_role_all" on entities for all using (true) with check (true);
create policy "service_role_all" on filings for all using (true) with check (true);
create policy "service_role_all" on articles for all using (true) with check (true);
create policy "service_role_all" on document_entities for all using (true) with check (true);
create policy "service_role_all" on summaries for all using (true) with check (true);
create policy "service_role_all" on ingestion_log for all using (true) with check (true);
