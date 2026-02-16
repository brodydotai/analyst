"""Supabase client singleton."""

from supabase import create_client

from analyst.config import settings

_client = None


def get_client():
    """Get or create a cached Supabase client."""
    global _client
    if _client is None:
        _client = create_client(
            supabase_url=settings.SUPABASE_URL,
            supabase_key=settings.SUPABASE_SERVICE_ROLE_KEY,
        )
    return _client
