"""Pydantic models for news articles."""

from datetime import datetime

from pydantic import BaseModel


class ArticleCreate(BaseModel):
    """Data required to insert a new article."""

    source_id: int
    url: str
    title: str
    author: str | None = None
    published_at: datetime | None = None
    metadata: dict = {}


class Article(ArticleCreate):
    """An article as stored in the database."""

    id: int
    content: str | None = None
    embedding: list[float] | None = None
    processed: bool = False
    created_at: datetime
