"""Orchestration service for the canonical research instruction loop."""

from analyst.models import Report
from analyst.services.compliance import verify_report_content
from analyst.services.generation import generate_report, get_playbook
from analyst.services.reports import create_report


def run_research_pipeline(
    ticker: str,
    company: str,
    playbook_name: str,
    period: str,
    min_overall_score: float = 60.0,
) -> Report:
    """
    Run the standard report lifecycle: generate -> verify -> persist.

    Args:
        ticker: Security ticker symbol.
        company: Company display name.
        playbook_name: Playbook filename stem.
        period: Reporting period label.
        min_overall_score: Minimum compliance score required before persistence.

    Returns:
        Persisted report row.
    """
    playbook = get_playbook(playbook_name)
    if not playbook:
        raise ValueError(f"Playbook not found: {playbook_name}")

    draft = generate_report(
        ticker=ticker,
        company=company,
        playbook_name=playbook_name,
        period=period,
    )
    scorecard = verify_report_content(
        playbook_text=playbook.content,
        playbook_filename=playbook.filename,
        report_text=draft.content,
        ticker=ticker.upper(),
        period=period,
    )

    if scorecard.metrics.weighted_overall < min_overall_score:
        raise ValueError(
            f"Compliance score {scorecard.metrics.weighted_overall:.1f} "
            f"is below minimum {min_overall_score:.1f}"
        )

    draft.metadata.update(
        {
            "compliance_score": scorecard.metrics.weighted_overall,
            "compliance_grade": scorecard.metrics.grade,
            "instruction_loop": "generate->verify->persist",
            "scorecard_gaps": scorecard.gaps,
        }
    )
    return create_report(draft)
