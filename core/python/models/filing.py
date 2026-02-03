"""Pydantic models for SEC filings."""

from datetime import datetime

from pydantic import BaseModel


class FilingCreate(BaseModel):
    """Data required to insert a new filing."""

    accession_number: str
    form_type: str
    filed_at: datetime
    accepted_at: datetime | None = None
    filer_cik: str
    filer_name: str
    url: str
    metadata: dict = {}


class Filing(FilingCreate):
    """A filing as stored in the database."""

    id: int
    full_text: str | None = None
    embedding: list[float] | None = None
    processed: bool = False
    created_at: datetime
