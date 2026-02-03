"""Centralized configuration loaded from environment variables."""

import os

from dotenv import load_dotenv

load_dotenv()

# Supabase
SUPABASE_URL: str = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY: str = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

# QStash
QSTASH_TOKEN: str = os.environ["QSTASH_TOKEN"]
QSTASH_CURRENT_SIGNING_KEY: str = os.environ.get("QSTASH_CURRENT_SIGNING_KEY", "")
QSTASH_NEXT_SIGNING_KEY: str = os.environ.get("QSTASH_NEXT_SIGNING_KEY", "")

# OpenAI
OPENAI_API_KEY: str = os.environ["OPENAI_API_KEY"]
OPENAI_EMBEDDING_MODEL: str = os.environ.get("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")
OPENAI_SUMMARY_MODEL: str = os.environ.get("OPENAI_SUMMARY_MODEL", "gpt-4o-mini")

# EDGAR
EDGAR_USER_AGENT: str = os.environ["EDGAR_USER_AGENT"]  # SEC requires identification
EDGAR_BASE_URL: str = "https://efts.sec.gov/LATEST"
EDGAR_SUBMISSIONS_URL: str = "https://data.sec.gov/submissions"
EDGAR_RATE_LIMIT: float = 0.11  # seconds between requests (SEC limit: 10 req/sec)

# Vercel deployment base URL (for QStash callbacks)
VERCEL_URL: str = os.environ.get("VERCEL_URL", "http://localhost:3000")
