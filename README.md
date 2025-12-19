# Atlas News Terminal

A serverless, event-driven news aggregation platform that scrapes, synthesizes, categorizes, and delivers personalized news across multiple topics (politics, markets, stocks, AI research, emerging tech) with weighted source prioritization, AI-powered summarization, and real-time delivery.

## 🏗️ Architecture

Atlas is built on a **serverless, event-driven architecture** using:

- **Vercel** - Serverless functions and hosting
- **Supabase** - PostgreSQL database with pgvector for semantic search
- **Upstash QStash** - Task queue for async processing
- **Next.js 15** - Frontend with real-time subscriptions

### Data Flow

```
Vercel Cron → Ingest Function → QStash → Process Function → Supabase → Frontend (Realtime)
```

## 🚀 Tech Stack

- **Backend (Python)**: FastAPI-style serverless functions
  - `newspaper4k` + `httpx` for scraping
  - OpenAI/Anthropic for AI processing
  - pgvector for semantic deduplication

- **Frontend**: Next.js 15, Tailwind CSS, shadcn/ui
  - Terminal-style keyboard-centric UI
  - Supabase Realtime for live updates

- **Database**: Supabase (PostgreSQL + pgvector)
- **Task Queue**: Upstash QStash

## 📁 Project Structure

```
atlas/
├── api/python/          # Vercel serverless functions
│   ├── ingest/          # Cron-triggered RSS ingestion
│   └── process/         # QStash-triggered article processing
├── core/python/         # Shared Python logic
│   ├── scrapers/        # RSS and web scraping
│   ├── processing/      # AI processing pipelines
│   ├── database/        # Supabase client
│   └── qstash/          # QStash client
├── frontend/            # Next.js 15 app
├── backend/database/   # Database schema and migrations
└── docs/               # Architecture and roadmap documentation
```

## 🛠️ Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- Supabase account
- Upstash QStash account
- OpenAI API key (or Anthropic)

### 1. Clone and Install

```bash
git clone https://github.com/brodyadreon/atlas.git
cd atlas
pip install -r requirements.txt
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `QSTASH_URL` - Upstash QStash URL
- `QSTASH_TOKEN` - QStash authentication token
- `OPENAI_API_KEY` - OpenAI API key for embeddings/summaries

### 3. Database Setup

1. Create a Supabase project
2. Open SQL Editor
3. Run the schema from `backend/database/schema.sql`
4. See `backend/database/SETUP.md` for detailed instructions

The schema includes:
- pgvector extension for semantic search
- Tables: `sources`, `articles`, `summaries`, `categories`
- HNSW index for fast vector similarity search
- Supabase Realtime enabled

### 4. Deploy to Vercel

```bash
vercel
```

Configure environment variables in Vercel dashboard.

## 📚 Documentation

- **[Architecture](docs/architecture.md)** - System architecture and design decisions
- **[Roadmap](docs/roadmap.md)** - Development phases and milestones
- **[Database Schema](backend/database/README.md)** - Database structure and setup
- **[Project Structure](docs/STRUCTURE.md)** - Directory layout and organization

## 🔑 Key Features

- **Fan-Out Pattern**: Ingest function dispatches individual tasks to QStash
- **Semantic Deduplication**: Uses pgvector cosine similarity to detect duplicate articles
- **AI Summarization**: Multi-provider support (OpenAI, Anthropic)
- **Real-time Updates**: Supabase Realtime subscriptions for live article feed
- **Terminal UI**: Keyboard-centric interface with command palette

## 🧪 Development

### Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run tests (when implemented)
pytest

# Lint code
ruff check .
```

### Project Rules

See `.cursor/rules/` for development guidelines:
- `atlas-main.mdc` - Core architecture principles
- `serverless-pipeline.mdc` - Serverless constraints
- `ai-deduplication.mdc` - AI processing rules

## 📝 Current Status

**Phase 1: Infrastructure Setup** ✅
- Database schema created
- Python models and Supabase client
- Project structure established
- Documentation complete

**Next: Phase 2** - RSS ingestion and QStash integration

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome!

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

Built with:
- [Supabase](https://supabase.com) - Open source Firebase alternative
- [Vercel](https://vercel.com) - Serverless platform
- [Upstash](https://upstash.com) - Serverless Redis and QStash
- [pgvector](https://github.com/pgvector/pgvector) - Vector similarity search



