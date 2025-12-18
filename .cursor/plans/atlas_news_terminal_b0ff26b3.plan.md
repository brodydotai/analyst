---
name: Atlas News Terminal
overview: Build a comprehensive news and information aggregation terminal that scrapes, synthesizes, categorizes, and delivers personalized news across multiple topics (politics, markets, stocks, AI research, emerging tech) with weighted source prioritization, AI-powered summarization, and delivery via Telegram/Slack notifications plus a web dashboard.
todos: []
---

# Atlas News Terminal - Architecture Plan

## System Overview

Atlas will be a hybrid system with:

- **Python backend** for news aggregation, scraping, AI processing, and summarization
- **Node.js/TypeScript API layer** for real-time data serving and webhook integrations
- **React/TypeScript frontend** for web dashboard/terminal UI
- **PostgreSQL database** for storing articles, sources, categories, and user preferences
- **Redis** for caching and real-time updates
- **Message queue** (RabbitMQ or similar) for async processing

## Core Components

### 1. Data Collection Layer (Python)

**Location**: `backend/python/`

- **Source Scrapers** (`scrapers/`)
  - RSS feed parser
  - Web scraper (using Scrapy or BeautifulSoup)
  - Twitter/X API integration
  - Reddit API integration
  - News API integrations (NewsAPI, Google News, etc.)
  - Custom source adapters for specific sites

- **Source Discovery** (`discovery/`)
  - Automatic source detection from articles
  - Source quality scoring
  - Duplicate source detection
  - Source metadata extraction

- **Source Weighting System** (`weighting/`)
  - Configurable source priority weights
  - Dynamic weight adjustment based on relevance
  - Source reliability scoring

### 2. AI Processing Layer (Python)

**Location**: `backend/python/processing/`

- **Content Extraction** (`extractors/`)
  - Article content extraction (Readability, newspaper3k)
  - Image extraction
  - Metadata extraction (author, date, tags)

- **AI Summarization** (`summarization/`)
  - Multi-provider support (OpenAI, Anthropic, Ollama)
  - Configurable summary length
  - Key points extraction
  - Actionable insights generation

- **Categorization & Tagging** (`categorization/`)
  - Topic classification (politics, markets, AI, tech, etc.)
  - Entity extraction (companies, people, locations)
  - Sentiment analysis
  - Relevance scoring
  - Custom tag generation

- **Deduplication** (`deduplication/`)
  - Article similarity detection
  - Cluster related articles
  - Merge duplicate stories

### 3. API Layer (Node.js/TypeScript)

**Location**: `backend/node/`

- **REST API** (`api/`)
  - Article endpoints (list, search, filter)
  - Source management endpoints
  - Category/tag endpoints
  - User preferences endpoints
  - Webhook endpoints for notifications

- **Real-time Updates** (`websocket/`)
  - WebSocket server for live updates
  - Article streaming
  - Notification delivery

- **Notification Services** (`notifications/`)
  - Telegram bot integration
  - Slack webhook integration
  - Configurable notification rules
  - Rate limiting and batching

### 4. Database Schema

**Location**: `backend/database/schema.sql`

Tables:

- `sources` - RSS feeds, websites, APIs, social accounts
- `articles` - Full article content, metadata, processing status
- `summaries` - AI-generated summaries and insights
- `categories` - Topic categories and hierarchies
- `tags` - Flexible tagging system
- `source_weights` - Source priority configuration
- `user_preferences` - Notification settings, filters
- `article_clusters` - Related/duplicate article groups
- `processing_jobs` - Job queue tracking

### 5. Frontend Dashboard (React/TypeScript)

**Location**: `frontend/`

- **Terminal UI** (`components/terminal/`)
  - Terminal-style interface with command palette
  - Real-time article feed
  - Category/tag filtering
  - Source filtering
  - Search functionality

- **Article Views** (`components/articles/`)
  - List view with summaries
  - Detail view with full content
  - Related articles sidebar
  - Source attribution

- **Source Management** (`components/sources/`)
  - Add/edit sources
  - Configure source weights
  - Source performance metrics
  - Source discovery interface

- **Settings** (`components/settings/`)
  - Notification preferences
  - Category preferences
  - AI provider configuration
  - Filter rules

### 6. Infrastructure & DevOps

**Location**: Root level configs

- **Docker Compose** (`docker-compose.yml`)
  - Python service
  - Node.js service
  - PostgreSQL database
  - Redis cache
  - Message queue

- **Environment Configuration** (`.env.example`)
  - API keys (OpenAI, Anthropic, NewsAPI, etc.)
  - Database credentials
  - Telegram/Slack tokens
  - Scraping rate limits

- **Scheduling** (`backend/python/scheduler/`)
  - Cron jobs for periodic scraping
  - Source-specific polling intervals
  - Processing pipeline orchestration

## Data Flow

```
Sources → Scrapers → Content Extraction → Deduplication → 
AI Processing (Summarization + Categorization) → Database → 
API Layer → [Notifications + Web Dashboard]
```

## Key Features

1. **Weighted Source System**: Configurable priority weights per source
2. **Auto Source Discovery**: Identify and suggest new relevant sources
3. **AI Summarization**: Multi-provider support with configurable output
4. **Smart Categorization**: Automatic topic/entity/tag extraction
5. **Deduplication**: Cluster related articles, merge duplicates
6. **Real-time Notifications**: Telegram/Slack with filtering rules
7. **Terminal UI**: Command-line inspired web interface
8. **Flexible Filtering**: By category, tag, source, date, relevance

## Technology Stack

- **Backend (Python)**: FastAPI, Scrapy/BeautifulSoup, LangChain, transformers
- **Backend (Node.js)**: Express/Fastify, TypeScript, Prisma/TypeORM
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Database**: PostgreSQL with pgvector for similarity search
- **Cache**: Redis
- **Queue**: RabbitMQ or Bull (Redis-based)
- **AI**: OpenAI API, Anthropic API, Ollama (local) support
- **Notifications**: Telegram Bot API, Slack Webhooks

## Initial Setup

1. Project structure with monorepo layout
2. Docker Compose for local development
3. Database migrations
4. Basic scraper framework
5. AI processing pipeline skeleton
6. API endpoints for articles
7. Simple terminal UI
8. Telegram/Slack notification setup