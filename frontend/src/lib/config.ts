// Server-side env vars (no NEXT_PUBLIC_ prefix — these are secret)
export const SUPABASE_URL = process.env.SUPABASE_URL!;
export const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// QStash
export const QSTASH_TOKEN = process.env.QSTASH_TOKEN!;
export const QSTASH_CURRENT_SIGNING_KEY =
  process.env.QSTASH_CURRENT_SIGNING_KEY ?? "";
export const QSTASH_NEXT_SIGNING_KEY = process.env.QSTASH_NEXT_SIGNING_KEY ?? "";

// OpenAI
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
export const OPENAI_EMBEDDING_MODEL =
  process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small";
export const OPENAI_SUMMARY_MODEL =
  process.env.OPENAI_SUMMARY_MODEL ?? "gpt-4o-mini";

// EDGAR
export const EDGAR_USER_AGENT = process.env.EDGAR_USER_AGENT!;
export const EDGAR_BASE_URL = "https://efts.sec.gov/LATEST";
export const EDGAR_SUBMISSIONS_URL = "https://data.sec.gov/submissions";
export const EDGAR_RATE_LIMIT = 0.11;

// Vercel deployment base URL (for QStash callbacks)
export const VERCEL_URL = process.env.VERCEL_URL ?? "http://localhost:3000";
