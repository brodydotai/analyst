"""Opinion models — structured investment thesis metadata.

Every report gets an Opinion block that captures the analyst's conviction
in a standardized, comparable format. Perspective agents (bull, bear, macro)
produce lightweight opinions that attach to the primary report.
"""

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field


class Opinion(BaseModel):
    """Structured investment opinion attached to a report.

    This is the standardized schema that makes reports comparable
    across tickers, timeframes, and analytical perspectives.
    """

    rating: int = Field(..., ge=1, le=10, description="1=strong sell, 10=strong buy")
    confidence: float = Field(..., ge=0.0, le=1.0, description="0=no conviction, 1=max conviction")
    action: Literal["strong_buy", "buy", "accumulate", "hold", "reduce", "sell", "strong_sell"]
    timeframe: str = Field(..., description="Investment horizon, e.g. '3M', '6M', '1Y'")
    thesis: str = Field(..., description="Core argument in 1-3 sentences")
    catalysts: list[str] = Field(default_factory=list, description="Events that drive the thesis")
    risks: list[str] = Field(default_factory=list, description="What could go wrong")
    invalidation: str = Field(..., description="Specific condition that kills the thesis")
    data_confidence: float = Field(
        default=0.5, ge=0.0, le=1.0,
        description="How complete/reliable the underlying data was"
    )


class PerspectiveOpinion(BaseModel):
    """Opinion from a perspective agent (bull, bear, macro overlay).

    Lighter than a full report — just a structured take on an existing report.
    """

    perspective: Literal["bull", "bear", "macro"]
    ticker: str
    period: str
    rating: int = Field(..., ge=1, le=10)
    confidence: float = Field(..., ge=0.0, le=1.0)
    argument: str = Field(..., description="Core argument from this perspective, 3-5 sentences")
    key_factors: list[str] = Field(..., description="Top 3-5 factors driving this view")
    timeframe: str
    invalidation: str


class SynthesizedOpinion(BaseModel):
    """Weighted synthesis of primary opinion + perspective opinions.

    Produced by the synthesis service after all perspectives are collected.
    """

    ticker: str
    period: str
    primary_opinion: Opinion
    perspectives: list[PerspectiveOpinion]
    synthesized_rating: float = Field(..., ge=1.0, le=10.0)
    synthesized_confidence: float = Field(..., ge=0.0, le=1.0)
    consensus: Literal["strong_agreement", "agreement", "mixed", "disagreement", "strong_disagreement"]
    consensus_summary: str = Field(..., description="How perspectives align or conflict")
    dissenting_views: list[str] = Field(
        default_factory=list,
        description="Notable disagreements worth flagging"
    )
    synthesized_at: datetime = Field(default_factory=datetime.utcnow)


class OpinionCreate(BaseModel):
    """Input for storing an opinion against a report."""

    report_id: UUID
    perspective: Literal["primary", "bull", "bear", "macro"]
    rating: int = Field(..., ge=1, le=10)
    confidence: float = Field(..., ge=0.0, le=1.0)
    action: str | None = None
    timeframe: str
    thesis: str
    catalysts: list[str] = Field(default_factory=list)
    risks: list[str] = Field(default_factory=list)
    invalidation: str
    data_confidence: float = 0.5
    metadata: dict = Field(default_factory=dict)


class StoredOpinion(OpinionCreate):
    """Opinion as stored in the database."""

    id: UUID
    created_at: datetime


# Rating scale reference
RATING_SCALE = {
    1: "Strong Sell",
    2: "Sell",
    3: "Reduce",
    4: "Underperform",
    5: "Hold",
    6: "Neutral-Positive",
    7: "Accumulate",
    8: "Buy",
    9: "Strong Buy",
    10: "High-Conviction Buy",
}


def rating_to_action(rating: int) -> str:
    """Convert numeric rating to action string."""
    if rating <= 2:
        return "strong_sell" if rating == 1 else "sell"
    if rating <= 4:
        return "reduce"
    if rating <= 5:
        return "hold"
    if rating <= 7:
        return "accumulate"
    if rating <= 9:
        return "buy" if rating == 8 else "strong_buy"
    return "strong_buy"
