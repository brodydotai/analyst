# Supabase MCP Server Configuration - Atlas News Terminal

The Supabase MCP (Model Context Protocol) server has been configured for the Atlas News Terminal project.

## Configuration

The MCP server is configured in `~/.cursor/mcp.json` with the following settings:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase"
      ],
      "env": {
        "SUPABASE_URL": "https://qnzltacohnxyreqppngf.supabase.co",
        "SUPABASE_ANON_KEY": "sb_publishable_P01tiI7zcaql3bYeTs5xGA_whG10JJY"
      }
    }
  }
}
```

## What This Enables

With the MCP server configured, you can now:

- **Query your database** using natural language
- **Deploy database schema** from `backend/database/schema.sql`
- **Create and modify tables** through AI commands
- **Manage data** without writing SQL directly
- **Get schema information** automatically
- **Execute database operations** via the AI assistant

## Atlas Database Schema

The Atlas News Terminal database schema includes:

### Tables
- **sources** - RSS feeds and news sources
- **articles** - Article content with vector embeddings (pgvector)
- **summaries** - AI-generated summaries
- **categories** - Topic categories
- **article_categories** - Many-to-many relationship

### Key Features
- **pgvector extension** - For semantic similarity search
- **HNSW index** - Fast vector similarity search for deduplication
- **Supabase Realtime** - Enabled for `articles` and `summaries` tables
- **Automatic triggers** - `updated_at` timestamps

## Usage

The MCP server will automatically be used by Cursor when you:
- Ask to deploy the database schema
- Request database operations
- Need to query or modify data
- Want to understand table structures

## Deploy Schema via MCP

To deploy the Atlas database schema:

1. **Restart Cursor IDE** (required to load MCP configuration)
2. Ask the AI: "Deploy the database schema from `backend/database/schema.sql` to Supabase"
3. The MCP server will execute the SQL in your Supabase project

## Verification

After deploying the schema:

1. Check tables exist: `sources`, `articles`, `summaries`, `categories`, `article_categories`
2. Verify pgvector extension is enabled
3. Check HNSW index exists on `articles.embedding`
4. Verify Realtime is enabled for `articles` and `summaries`

## Environment Variables

The MCP server uses:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anon/publishable key

**Note**: For serverless functions, you'll also need the `SUPABASE_SERVICE_ROLE_KEY` in your `.env` file (not in MCP config).

## Next Steps

1. ✅ Restart Cursor IDE to load MCP configuration
2. ✅ Deploy database schema via MCP or SQL Editor
3. ✅ Verify schema deployment
4. ✅ Continue with Phase 1 infrastructure setup

## Security Note

The MCP server uses the anon key, which respects Row Level Security (RLS) policies. For serverless functions that need to bypass RLS, use the service role key in your `.env` file (never in MCP config).

