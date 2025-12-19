-- Atlas News Terminal - Database Schema
-- PostgreSQL with pgvector extension for Supabase

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- SOURCES TABLE
-- ============================================================================
-- Stores RSS feeds and other news sources
CREATE TABLE IF NOT EXISTS sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL DEFAULT 'rss', -- 'rss', 'api', 'scraper'
    last_fetched_at TIMESTAMP WITH TIME ZONE,
    priority INTEGER DEFAULT 50 CHECK (priority >= 0 AND priority <= 100),
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'paused', 'error'
    fetch_interval_minutes INTEGER DEFAULT 15,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for active sources ordered by priority
CREATE INDEX IF NOT EXISTS idx_sources_active_priority 
    ON sources(priority DESC, last_fetched_at) 
    WHERE status = 'active';

-- Index for fetching sources that need updates
CREATE INDEX IF NOT EXISTS idx_sources_fetch_due 
    ON sources(last_fetched_at, fetch_interval_minutes) 
    WHERE status = 'active';

-- ============================================================================
-- ARTICLES TABLE
-- ============================================================================
-- Stores article content with vector embeddings for deduplication
CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    raw_content TEXT, -- Original HTML/raw content
    cleaned_content TEXT, -- Cleaned Markdown or structured content
    fingerprint VARCHAR(64), -- Content hash for quick duplicate checks
    embedding vector(1536), -- OpenAI text-embedding-3-small dimension
    published_at TIMESTAMP WITH TIME ZONE,
    author VARCHAR(255),
    language VARCHAR(10) DEFAULT 'en',
    metadata JSONB DEFAULT '{}',
    processing_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Foreign key index
CREATE INDEX IF NOT EXISTS idx_articles_source_id ON articles(source_id);

-- Index for URL lookups (unique constraint already creates index, but explicit for clarity)
CREATE INDEX IF NOT EXISTS idx_articles_url ON articles(url);

-- Index for fingerprint (quick duplicate checks before vector search)
CREATE INDEX IF NOT EXISTS idx_articles_fingerprint ON articles(fingerprint);

-- Index for processing status
CREATE INDEX IF NOT EXISTS idx_articles_processing_status 
    ON articles(processing_status, created_at);

-- Index for published date (for sorting and filtering)
CREATE INDEX IF NOT EXISTS idx_articles_published_at 
    ON articles(published_at DESC);

-- HNSW index for vector similarity search (cosine distance)
-- This is the critical index for deduplication
CREATE INDEX IF NOT EXISTS idx_articles_embedding_hnsw 
    ON articles USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- Alternative: IVFFlat index (uncomment if HNSW is not available)
-- CREATE INDEX IF NOT EXISTS idx_articles_embedding_ivfflat 
--     ON articles USING ivfflat (embedding vector_cosine_ops)
--     WITH (lists = 100);

-- ============================================================================
-- SUMMARIES TABLE
-- ============================================================================
-- Stores AI-generated summaries for articles
CREATE TABLE IF NOT EXISTS summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL UNIQUE REFERENCES articles(id) ON DELETE CASCADE,
    content TEXT NOT NULL, -- The summary text
    model_used VARCHAR(100) NOT NULL, -- e.g., 'gpt-4o', 'claude-3-5-sonnet'
    summary_type VARCHAR(20) DEFAULT 'standard', -- 'brief', 'standard', 'detailed'
    key_points JSONB, -- Array of key points
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for article lookup
CREATE INDEX IF NOT EXISTS idx_summaries_article_id ON summaries(article_id);

-- ============================================================================
-- CATEGORIES TABLE
-- ============================================================================
-- Stores topic categories for articles
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for hierarchical queries
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);

-- ============================================================================
-- ARTICLE_CATEGORIES JUNCTION TABLE
-- ============================================================================
-- Many-to-many relationship between articles and categories
CREATE TABLE IF NOT EXISTS article_categories (
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    confidence FLOAT DEFAULT 1.0 CHECK (confidence >= 0.0 AND confidence <= 1.0),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (article_id, category_id)
);

-- Indexes for efficient queries
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
-- Automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
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
-- Enable Realtime for articles table (frontend will subscribe to changes)
ALTER PUBLICATION supabase_realtime ADD TABLE articles;
ALTER PUBLICATION supabase_realtime ADD TABLE summaries;

-- ============================================================================
-- INITIAL DATA (Optional)
-- ============================================================================
-- Insert some default categories
INSERT INTO categories (name, slug, description) VALUES
    ('Politics', 'politics', 'Political news and analysis'),
    ('Markets', 'markets', 'Financial markets and economics'),
    ('Stocks', 'stocks', 'Stock market news and analysis'),
    ('AI Research', 'ai-research', 'Artificial intelligence research and developments'),
    ('Emerging Tech', 'emerging-tech', 'Emerging technology and innovation'),
    ('Science', 'science', 'Scientific discoveries and research'),
    ('World News', 'world-news', 'International news and events')
ON CONFLICT (slug) DO NOTHING;



