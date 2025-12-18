"""
Atlas News Terminal - Database Models
SQLAlchemy models that map to Supabase PostgreSQL tables.
These models are kept in sync with the schema defined in backend/database/schema.sql
"""

from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    TIMESTAMP,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID as PGUUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from pgvector.sqlalchemy import Vector


class Base(DeclarativeBase):
    """Base class for all models"""
    pass


class Source(Base):
    """RSS feeds and news sources"""
    __tablename__ = "sources"

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
        server_default="gen_random_uuid()"
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    url: Mapped[str] = mapped_column(Text, nullable=False, unique=True)
    type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="rss",
        server_default="rss"
    )  # 'rss', 'api', 'scraper'
    last_fetched_at: Mapped[Optional[datetime]] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=True
    )
    priority: Mapped[int] = mapped_column(
        Integer,
        default=50,
        server_default="50"
    )
    status: Mapped[str] = mapped_column(
        String(20),
        default="active",
        server_default="active"
    )  # 'active', 'paused', 'error'
    fetch_interval_minutes: Mapped[int] = mapped_column(
        Integer,
        default=15,
        server_default="15"
    )
    metadata: Mapped[dict] = mapped_column(
        JSONB,
        default=dict,
        server_default="{}"
    )
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        default=datetime.utcnow,
        server_default="NOW()"
    )
    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        server_default="NOW()"
    )

    # Relationships
    articles: Mapped[list["Article"]] = relationship(
        "Article",
        back_populates="source",
        cascade="all, delete-orphan"
    )

    __table_args__ = (
        CheckConstraint("priority >= 0 AND priority <= 100", name="check_priority_range"),
    )


class Article(Base):
    """Article content with vector embeddings"""
    __tablename__ = "articles"

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
        server_default="gen_random_uuid()"
    )
    source_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("sources.id", ondelete="CASCADE"),
        nullable=False
    )
    title: Mapped[str] = mapped_column(Text, nullable=False)
    url: Mapped[str] = mapped_column(Text, nullable=False, unique=True)
    raw_content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    cleaned_content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    fingerprint: Mapped[Optional[str]] = mapped_column(
        String(64),
        nullable=True
    )  # Content hash for quick duplicate checks
    embedding: Mapped[Optional[list[float]]] = mapped_column(
        Vector(1536),  # OpenAI text-embedding-3-small dimension
        nullable=True
    )
    published_at: Mapped[Optional[datetime]] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=True
    )
    author: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    language: Mapped[str] = mapped_column(
        String(10),
        default="en",
        server_default="en"
    )
    metadata: Mapped[dict] = mapped_column(
        JSONB,
        default=dict,
        server_default="{}"
    )
    processing_status: Mapped[str] = mapped_column(
        String(20),
        default="pending",
        server_default="pending"
    )  # 'pending', 'processing', 'completed', 'failed'
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        default=datetime.utcnow,
        server_default="NOW()"
    )
    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        server_default="NOW()"
    )

    # Relationships
    source: Mapped["Source"] = relationship("Source", back_populates="articles")
    summary: Mapped[Optional["Summary"]] = relationship(
        "Summary",
        back_populates="article",
        uselist=False,
        cascade="all, delete-orphan"
    )
    categories: Mapped[list["ArticleCategory"]] = relationship(
        "ArticleCategory",
        back_populates="article",
        cascade="all, delete-orphan"
    )


class Summary(Base):
    """AI-generated summaries for articles"""
    __tablename__ = "summaries"

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
        server_default="gen_random_uuid()"
    )
    article_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("articles.id", ondelete="CASCADE"),
        nullable=False,
        unique=True
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    model_used: Mapped[str] = mapped_column(String(100), nullable=False)
    summary_type: Mapped[str] = mapped_column(
        String(20),
        default="standard",
        server_default="standard"
    )  # 'brief', 'standard', 'detailed'
    key_points: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        default=datetime.utcnow,
        server_default="NOW()"
    )
    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        server_default="NOW()"
    )

    # Relationships
    article: Mapped["Article"] = relationship("Article", back_populates="summary")


class Category(Base):
    """Topic categories for articles"""
    __tablename__ = "categories"

    id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
        server_default="gen_random_uuid()"
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    slug: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    parent_id: Mapped[Optional[UUID]] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("categories.id", ondelete="SET NULL"),
        nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        default=datetime.utcnow,
        server_default="NOW()"
    )
    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        server_default="NOW()"
    )

    # Relationships
    parent: Mapped[Optional["Category"]] = relationship(
        "Category",
        remote_side=[id],
        backref="children"
    )
    article_categories: Mapped[list["ArticleCategory"]] = relationship(
        "ArticleCategory",
        back_populates="category"
    )


class ArticleCategory(Base):
    """Many-to-many relationship between articles and categories"""
    __tablename__ = "article_categories"

    article_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("articles.id", ondelete="CASCADE"),
        primary_key=True
    )
    category_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("categories.id", ondelete="CASCADE"),
        primary_key=True
    )
    confidence: Mapped[float] = mapped_column(
        Float,
        default=1.0,
        server_default="1.0"
    )
    is_primary: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        server_default="false"
    )
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        default=datetime.utcnow,
        server_default="NOW()"
    )

    # Relationships
    article: Mapped["Article"] = relationship("Article", back_populates="categories")
    category: Mapped["Category"] = relationship("Category", back_populates="article_categories")

    __table_args__ = (
        CheckConstraint("confidence >= 0.0 AND confidence <= 1.0", name="check_confidence_range"),
    )

