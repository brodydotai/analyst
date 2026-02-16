"""Tests for Pydantic models."""

from datetime import datetime
from uuid import uuid4

import pytest

from analyst.models import (
    Playbook,
    PlaybookSummary,
    Report,
    ReportCreate,
    ReportSummary,
    Scorecard,
    ScorecardMetrics,
    SectionResult,
)


def test_report_create():
    """Test creating a ReportCreate instance."""
    report = ReportCreate(
        ticker="AAPL",
        title="Apple Inc. Analysis",
        report_type="report",
        period="feb-2026",
        content="## Executive Summary\nApple is a strong performer...",
        word_count=1500,
    )

    assert report.ticker == "AAPL"
    assert report.title == "Apple Inc. Analysis"
    assert report.report_type == "report"
    assert report.word_count == 1500
    assert report.metadata == {}


def test_report_with_metadata():
    """Test ReportCreate with metadata."""
    report = ReportCreate(
        ticker="AAPL",
        title="Apple Analysis",
        report_type="report",
        period="feb-2026",
        content="Content...",
        word_count=1000,
        metadata={"source": "equity_analyst", "version": 1},
    )

    assert report.metadata["source"] == "equity_analyst"
    assert report.metadata["version"] == 1


def test_report_full():
    """Test creating a full Report instance."""
    report_id = uuid4()
    now = datetime.now()

    report = Report(
        id=report_id,
        ticker="TSLA",
        title="Tesla Growth Analysis",
        report_type="report",
        period="feb-2026",
        content="Tesla continues to expand...",
        word_count=2000,
        created_at=now,
        updated_at=now,
    )

    assert report.id == report_id
    assert report.ticker == "TSLA"
    assert report.created_at == now


def test_report_summary():
    """Test ReportSummary without content."""
    now = datetime.now()

    summary = ReportSummary(
        id=uuid4(),
        ticker="INTC",
        title="Intel Market Position",
        report_type="scorecard",
        period="jan-2026",
        compliance_score=85.5,
        compliance_grade="B",
        word_count=1200,
        created_at=now,
    )

    assert summary.compliance_score == 85.5
    assert summary.compliance_grade == "B"
    assert not hasattr(summary, "content")


def test_playbook():
    """Test Playbook model."""
    playbook = Playbook(
        name="equity_analyst",
        filename="equity_analyst.md",
        role="Senior Equity Analyst",
        sections=["Executive Summary", "Valuation", "Risks"],
        content="# Equity Analyst Playbook\n\nRole: Senior Equity Analyst\n\n## Executive Summary\n...",
    )

    assert playbook.name == "equity_analyst"
    assert len(playbook.sections) == 3
    assert "Executive Summary" in playbook.sections


def test_playbook_summary():
    """Test PlaybookSummary without content."""
    summary = PlaybookSummary(
        name="macro_analyst",
        filename="macro_analyst.md",
        role="Macro Strategist",
    )

    assert summary.name == "macro_analyst"
    assert summary.role == "Macro Strategist"
    assert not hasattr(summary, "content")


def test_scorecard_metrics():
    """Test ScorecardMetrics model."""
    metrics = ScorecardMetrics(
        section_coverage="92.3%",
        element_coverage="88.5%",
        structural_requirements="95.0%",
        weighted_overall=90.6,
        grade="A",
    )

    assert metrics.grade == "A"
    assert metrics.weighted_overall == 90.6


def test_section_result():
    """Test SectionResult model."""
    section = SectionResult(
        section_id="valuation",
        title="Valuation Analysis",
        status="✓",
        coverage_pct=92.5,
        covered=37,
        total=40,
    )

    assert section.section_id == "valuation"
    assert section.coverage_pct == 92.5
    assert section.covered == 37


def test_scorecard():
    """Test full Scorecard model."""
    metrics = ScorecardMetrics(
        section_coverage="85.0%",
        element_coverage="80.0%",
        structural_requirements="90.0%",
        weighted_overall=85.0,
        grade="B",
    )

    sections = [
        SectionResult(
            section_id="exec_summary",
            title="Executive Summary",
            status="✓",
            coverage_pct=95.0,
            covered=19,
            total=20,
        ),
        SectionResult(
            section_id="financials",
            title="Financial Analysis",
            status="⚠",
            coverage_pct=70.0,
            covered=14,
            total=20,
        ),
    ]

    scorecard = Scorecard(
        ticker="AAPL",
        period="feb-2026",
        prompt_used="equity_analyst.md",
        metrics=metrics,
        sections=sections,
        gaps=["Financials: 70% covered", "Missing: Industry comparison"],
    )

    assert scorecard.ticker == "AAPL"
    assert scorecard.metrics.grade == "B"
    assert len(scorecard.sections) == 2
    assert len(scorecard.gaps) == 2


def test_report_validation_errors():
    """Test that invalid data raises validation errors."""
    with pytest.raises(Exception):
        ReportCreate(
            ticker="AAPL",
            title="Test",
            report_type="invalid_type",  # Not "report" or "scorecard"
            period="feb-2026",
            content="Test",
            word_count=100,
        )


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
