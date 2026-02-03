"""Pydantic models for entities (companies, people, funds)."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class EntityCreate(BaseModel):
    """Data required to insert a new entity."""

    name: str
    type: Literal["company", "person", "fund"]
    cik: str | None = None
    ticker: str | None = None
    exchange: str | None = None
    metadata: dict = {}


class Entity(EntityCreate):
    """An entity as stored in the database."""

    id: int
    created_at: datetime
    updated_at: datetime
