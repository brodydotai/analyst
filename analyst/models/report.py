"""Report models."""

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field


class ReportBase(BaseModel):
    """Base report fields."""

    ticker: str
    title: str
    report_type: Literal["report", "scorecard"]
    period: str
    prompt_used: str | None = None
    content: str
    word_count: int
    metadata: dict = Field(default_factory=dict)


class ReportCreate(ReportBase):
    """Input for creating a new report."""

    pass


class Report(ReportBase):
    """Complete report with database fields."""

    id: UUID
    created_at: datetime
    updated_at: datetime


class ReportSummary(BaseModel):
    """Report summary without content field."""

    id: UUID
    ticker: str
    title: str
    report_type: Literal["report", "scorecard"]
    period: str
    compliance_score: float | None = None
    compliance_grade: str | None = None
    word_count: int
    created_at: datetime
