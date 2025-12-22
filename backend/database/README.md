# Database Schema

This directory contains the PostgreSQL database schema for the Atlas News Terminal.

## Files

- `schema.sql` - Complete database schema with tables, indexes, and triggers

## Setup Instructions

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project
3. Note your project URL and service role key

### 2. Run Schema in Supabase SQL Editor

1. Open your Supabase project
2. Go to **SQL Editor**
3. Copy and paste the contents of `schema.sql`
4. Click **Run** to execute

The schema will:
- Enable the `pgvector` extension
- Create all necessary tables
- Set up indexes (including HNSW for vector similarity search)
- Enable Supabase Realtime for the `articles` table
- Insert default categories

### 3. Verify Setup

After running the schema, verify:

```sql
-- Check that pgvector extension is enabled
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check HNSW index exists
SELECT indexname, indexdef FROM pg_indexes 
WHERE tablename = 'articles' AND indexname LIKE '%embedding%';

-- Check default categories
SELECT * FROM categories;
```

### 4. Enable Realtime (if not automatic)

If Realtime is not automatically enabled:

1. Go to **Database** > **Replication**
2. Enable replication for `articles` and `summaries` tables
3. This allows the frontend to subscribe to real-time updates

## Schema Overview

### Tables

- **sources** - RSS feeds and news sources
- **articles** - Article content with vector embeddings
- **summaries** - AI-generated summaries
- **categories** - Topic categories
- **article_categories** - Many-to-many relationship

### Key Features

- **Vector Embeddings**: `articles.embedding` column uses pgvector for semantic similarity search
- **HNSW Index**: Fast approximate nearest neighbor search for deduplication
- **Realtime**: Articles and summaries tables are enabled for Supabase Realtime
- **Automatic Timestamps**: `updated_at` columns are automatically updated via triggers

## Important Notes

- The schema uses `IF NOT EXISTS` clauses, so it's safe to run multiple times
- The HNSW index is optimized for cosine similarity search (deduplication)
- All foreign keys use `ON DELETE CASCADE` for data integrity
- The `fingerprint` column in articles is for quick duplicate checks before vector search




