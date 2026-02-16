"""Configuration management using pydantic-settings."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Load configuration from environment variables (.env file)."""

    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str
    OPENAI_API_KEY: str
    OPENAI_MODEL: str = "gpt-4o"
    OPENAI_EMBEDDING_MODEL: str = "text-embedding-3-small"
    EDGAR_USER_AGENT: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
