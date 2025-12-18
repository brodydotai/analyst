"""
Atlas News Terminal - Supabase Database Client
Initializes and provides Supabase client for serverless functions.
"""

import os
from typing import Optional

from supabase import Client, create_client


class DatabaseClient:
    """Singleton wrapper for Supabase client"""
    _client: Optional[Client] = None

    @classmethod
    def get_client(cls) -> Client:
        """
        Get or create Supabase client instance.
        Uses service role key for serverless functions (bypasses RLS).
        
        Returns:
            Supabase Client instance
            
        Raises:
            ValueError: If required environment variables are missing
        """
        if cls._client is None:
            supabase_url = os.getenv("SUPABASE_URL")
            supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

            if not supabase_url:
                raise ValueError(
                    "SUPABASE_URL environment variable is required. "
                    "Set it in your .env file or Vercel environment variables."
                )
            
            if not supabase_key:
                raise ValueError(
                    "SUPABASE_SERVICE_ROLE_KEY environment variable is required. "
                    "Set it in your .env file or Vercel environment variables."
                )

            cls._client = create_client(supabase_url, supabase_key)

        return cls._client

    @classmethod
    def reset_client(cls) -> None:
        """Reset client instance (useful for testing)"""
        cls._client = None


def get_db() -> Client:
    """
    Convenience function to get Supabase client.
    Use this in serverless functions to access the database.
    
    Example:
        from core.python.database import get_db
        
        db = get_db()
        result = db.table("articles").select("*").limit(10).execute()
    
    Returns:
        Supabase Client instance
    """
    return DatabaseClient.get_client()

