"""Scorecard models."""

from pydantic import BaseModel


class ScorecardMetrics(BaseModel):
    """Scorecard evaluation metrics."""

    section_coverage: str
    element_coverage: str
    structural_requirements: str
    weighted_overall: float
    grade: str


class SectionResult(BaseModel):
    """Per-section scorecard result."""

    section_id: str
    title: str
    status: str  # checkmark, x, or warning
    coverage_pct: float
    covered: int
    total: int


class Scorecard(BaseModel):
    """Complete compliance scorecard."""

    ticker: str
    period: str
    prompt_used: str
    metrics: ScorecardMetrics
    sections: list[SectionResult]
    gaps: list[str]
