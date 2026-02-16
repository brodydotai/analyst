"""Click CLI for Analyst."""

import sys
from pathlib import Path

import click
import uvicorn

from analyst.api.app import create_app
from analyst.services.compliance import generate_scorecard_markdown, verify_compliance
from analyst.services.generation import list_playbooks
from analyst.services.ingestion import seed_reports
from analyst.services.reports import get_reports_by_ticker, list_reports


@click.group()
def cli():
    """Analyst — AI Equity Research System"""
    pass


@cli.command()
def seed():
    """Seed database from flat files in research/reports/."""
    try:
        count = seed_reports()
        click.echo(f"✓ Seeded {count} report(s)")
    except Exception as e:
        click.echo(f"✗ Error: {e}", err=True)
        sys.exit(1)


@cli.command()
def list():
    """List all reports in table format."""
    try:
        reports = list_reports()

        if not reports:
            click.echo("No reports found")
            return

        # Print table header
        click.echo(
            f"{'Ticker':<8} {'Type':<12} {'Period':<12} {'Grade':<6} {'Words':<8} {'Title':<40}"
        )
        click.echo("-" * 90)

        # Print rows
        for report in reports:
            grade = report.compliance_grade or "-"
            title = report.title[:39] if len(report.title) > 39 else report.title
            click.echo(
                f"{report.ticker:<8} {report.report_type:<12} {report.period:<12} "
                f"{grade:<6} {report.word_count:<8} {title:<40}"
            )

    except Exception as e:
        click.echo(f"✗ Error: {e}", err=True)
        sys.exit(1)


@cli.command()
@click.argument("ticker")
def show(ticker: str):
    """Show all reports for a given ticker."""
    try:
        reports = list_reports(ticker=ticker)

        if not reports:
            click.echo(f"No reports found for {ticker.upper()}")
            return

        click.echo(f"\nReports for {ticker.upper()}:")
        click.echo("-" * 80)

        for report in reports:
            grade = report.compliance_grade or "-"
            click.echo(f"  • {report.title}")
            click.echo(f"    Type: {report.report_type} | Period: {report.period} | Grade: {grade}")
            click.echo(f"    Words: {report.word_count} | Created: {report.created_at}")
            click.echo()

    except Exception as e:
        click.echo(f"✗ Error: {e}", err=True)
        sys.exit(1)


@cli.command()
@click.option("--playbook", type=click.Path(exists=True), required=True, help="Path to playbook file")
@click.option("--report", type=click.Path(exists=True), required=True, help="Path to report file")
@click.option("--company", required=True, help="Company name for output")
@click.option("--ticker", required=True, help="Stock ticker symbol")
@click.option(
    "--output",
    type=click.Path(),
    default=None,
    help="Output path for scorecard markdown (optional)",
)
def verify(playbook: str, report: str, company: str, ticker: str, output: str):
    """Verify compliance between a playbook and report."""
    try:
        playbook_path = Path(playbook)
        report_path = Path(report)

        click.echo(f"Verifying compliance: {report_path.name}")
        click.echo(f"Against playbook: {playbook_path.name}")
        click.echo()

        scorecard = verify_compliance(playbook_path, report_path)

        # Print scorecard summary
        click.echo(f"Compliance Scorecard: {company} ({ticker})")
        click.echo("=" * 60)
        click.echo(f"Weighted Overall: {scorecard.metrics.weighted_overall:.1f}% ({scorecard.metrics.grade})")
        click.echo(f"Section Coverage: {scorecard.metrics.section_coverage}")
        click.echo(f"Element Coverage: {scorecard.metrics.element_coverage}")
        click.echo(f"Structural Requirements: {scorecard.metrics.structural_requirements}")
        click.echo()

        # Print section coverage
        click.echo("Section Coverage:")
        for section in scorecard.sections:
            click.echo(
                f"  {section.status} {section.title}: {section.covered}/{section.total} "
                f"({section.coverage_pct:.0f}%)"
            )

        if scorecard.gaps:
            click.echo()
            click.echo("Gaps & Opportunities:")
            for gap in scorecard.gaps:
                click.echo(f"  - {gap}")

        # Save markdown if requested
        if output:
            markdown = generate_scorecard_markdown(scorecard, company, ticker)
            output_path = Path(output)
            output_path.write_text(markdown, encoding="utf-8")
            click.echo()
            click.echo(f"✓ Scorecard saved to {output_path}")

    except Exception as e:
        click.echo(f"✗ Error: {e}", err=True)
        sys.exit(1)


@cli.command()
@click.option(
    "--host",
    default="127.0.0.1",
    help="Host to bind to",
)
@click.option(
    "--port",
    default=8000,
    type=int,
    help="Port to bind to",
)
@click.option(
    "--reload",
    is_flag=True,
    help="Enable auto-reload on code changes",
)
def serve(host: str, port: int, reload: bool):
    """Start the API server."""
    app = create_app()

    click.echo(f"Starting Analyst API on {host}:{port}")
    click.echo(f"Docs available at http://{host}:{port}/docs")

    uvicorn.run(
        app,
        host=host,
        port=port,
        reload=reload,
    )


@cli.command()
def playbooks():
    """List available playbooks."""
    try:
        available = list_playbooks()

        if not available:
            click.echo("No playbooks found in research/playbooks/")
            return

        click.echo("\nAvailable Playbooks:")
        click.echo("-" * 60)

        for playbook in available:
            click.echo(f"  • {playbook.name}")
            click.echo(f"    Role: {playbook.role}")
            click.echo()

    except Exception as e:
        click.echo(f"✗ Error: {e}", err=True)
        sys.exit(1)


if __name__ == "__main__":
    cli()
