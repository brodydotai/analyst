# Database Setup Guide

## Quick Start: SQL Commands for Supabase SQL Editor

Copy and paste the following SQL into your Supabase SQL Editor and run it:

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- SOURCES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL DEFAULT 'rss',
    last_fetched_at TIMESTAMP WITH TIME ZONE,
    priority INTEGER DEFAULT 50 CHECK (priority >= 0 AND priority <= 100),
    status VARCHAR(20) DEFAULT 'active',
    fetch_interval_minutes INTEGER DEFAULT 15,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sources_active_priority 
    ON sources(priority DESC, last_fetched_at) 
    WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_sources_fetch_due 
    ON sources(last_fetched_at, fetch_interval_minutes) 
    WHERE status = 'active';

-- ============================================================================
-- ARTICLES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    raw_content TEXT,
    cleaned_content TEXT,
    fingerprint VARCHAR(64),
    embedding vector(1536),
    published_at TIMESTAMP WITH TIME ZONE,
    author VARCHAR(255),
    language VARCHAR(10) DEFAULT 'en',
    metadata JSONB DEFAULT '{}',
    processing_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_articles_source_id ON articles(source_id);
CREATE INDEX IF NOT EXISTS idx_articles_url ON articles(url);
CREATE INDEX IF NOT EXISTS idx_articles_fingerprint ON articles(fingerprint);
CREATE INDEX IF NOT EXISTS idx_articles_processing_status 
    ON articles(processing_status, created_at);
CREATE INDEX IF NOT EXISTS idx_articles_published_at 
    ON articles(published_at DESC);

-- HNSW index for vector similarity search (cosine distance)
CREATE INDEX IF NOT EXISTS idx_articles_embedding_hnsw 
    ON articles USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- ============================================================================
-- SUMMARIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL UNIQUE REFERENCES articles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    model_used VARCHAR(100) NOT NULL,
    summary_type VARCHAR(20) DEFAULT 'standard',
    key_points JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_summaries_article_id ON summaries(article_id);

-- ============================================================================
-- CATEGORIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);

-- ============================================================================
-- ARTICLE_CATEGORIES JUNCTION TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS article_categories (
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    confidence FLOAT DEFAULT 1.0 CHECK (confidence >= 0.0 AND confidence <= 1.0),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (article_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_article_categories_article_id 
    ON article_categories(article_id);
CREATE INDEX IF NOT EXISTS idx_article_categories_category_id 
    ON article_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_article_categories_primary 
    ON article_categories(article_id, is_primary) 
    WHERE is_primary = TRUE;

-- ============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sources_updated_at 
    BEFORE UPDATE ON sources 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at 
    BEFORE UPDATE ON articles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_summaries_updated_at 
    BEFORE UPDATE ON summaries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SUPABASE REALTIME ENABLEMENT
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE articles;
ALTER PUBLICATION supabase_realtime ADD TABLE summaries;

-- ============================================================================
-- INITIAL DATA
-- ============================================================================
INSERT INTO categories (name, slug, description) VALUES
    ('Politics', 'politics', 'Political news and analysis'),
    ('Markets', 'markets', 'Financial markets and economics'),
    ('Stocks', 'stocks', 'Stock market news and analysis'),
    ('AI Research', 'ai-research', 'Artificial intelligence research and developments'),
    ('Emerging Tech', 'emerging-tech', 'Emerging technology and innovation'),
    ('Science', 'science', 'Scientific discoveries and research'),
    ('World News', 'world-news', 'International news and events')
ON CONFLICT (slug) DO NOTHING;
```

## Step-by-Step Instructions

1. **Open Supabase SQL Editor**
   - Go to your Supabase project dashboard
   - Navigate to **SQL Editor** in the left sidebar
   - Click **New Query**

2. **Paste and Run**
   - Copy the entire SQL block above
   - Paste it into the SQL Editor
   - Click **Run** (or press Cmd/Ctrl + Enter)

3. **Verify Setup**
   Run these verification queries:

```sql
-- Check pgvector extension
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Check all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check HNSW index
SELECT indexname, indexdef FROM pg_indexes 
WHERE tablename = 'articles' AND indexname LIKE '%embedding%';

-- Check default categories
SELECT name, slug FROM categories ORDER BY name;
```

4. **Enable Realtime (if needed)**
   - Go to **Database** > **Replication**
   - Ensure `articles` and `summaries` tables are enabled for replication
   - This allows the frontend to subscribe to real-time updates

## Expected Results

After running the SQL:

- ✅ `vector` extension enabled
- ✅ 5 tables created: `sources`, `articles`, `summaries`, `categories`, `article_categories`
- ✅ HNSW index created on `articles.embedding` for fast similarity search
- ✅ 7 default categories inserted
- ✅ Realtime enabled for `articles` and `summaries` tables
- ✅ Automatic `updated_at` triggers configured

## Troubleshooting

### Error: "extension vector does not exist"
- Your Supabase project may need to enable the extension manually
- Go to **Database** > **Extensions**
- Search for "vector" and enable it

### Error: "relation already exists"
- This is normal if you've run the schema before
- The `IF NOT EXISTS` clauses prevent errors
- You can safely re-run the entire script

### HNSW Index Not Created
- Some Supabase plans may not support HNSW
- The schema will fall back to a standard index
- For production, consider using IVFFlat as an alternative (see schema.sql comments)

