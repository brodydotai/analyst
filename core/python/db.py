"""Supabase client singleton."""

from supabase import Client, create_client

from core.python.config import SUPABASE_SERVICE_KEY, SUPABASE_URL

_client: Client | None = None


def get_client() -> Client:
    """Return a cached Supabase client using the service role key."""
    global _client
    if _client is None:
        _client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    return _client
