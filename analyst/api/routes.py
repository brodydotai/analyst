"""FastAPI routes for Analyst API."""

from pathlib import Path
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query

from analyst.models import PlaybookSummary, Report, ReportSummary
from analyst.models.opinion import (
    Opinion,
    PerspectiveOpinion,
    SynthesizedOpinion,
)
from analyst.services.compliance import verify_compliance
from analyst.services.generation import generate_report, get_playbook, list_playbooks
from analyst.services.reports import (
    create_report,
    delete_report,
    get_report,
    get_reports_by_ticker,
    list_reports,
    search_reports,
)
from analyst.services.synthesis import synthesize

router = APIRouter(prefix="/api")


@router.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "ok"}


# --- Reports ---


@router.get("/reports", response_model=list[ReportSummary])
def list_reports_endpoint(
    ticker: str | None = Query(None),
    type: str | None = Query(None, alias="type"),
    period: str | None = Query(None),
):
    """List reports with optional filters."""
    return list_reports(ticker=ticker, report_type=type, period=period)


@router.get("/reports/search", response_model=list[ReportSummary])
def search_reports_endpoint(q: str = Query(...)):
    """Search reports by query string."""
    return search_reports(q)


@router.get("/reports/{report_id}", response_model=Report)
def get_report_endpoint(report_id: UUID):
    """Get a single report by ID."""
    report = get_report(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.get("/reports/ticker/{ticker}", response_model=list[Report])
def get_reports_by_ticker_endpoint(ticker: str):
    """Get all reports for a given ticker."""
    return get_reports_by_ticker(ticker)


@router.delete("/reports/{report_id}")
def delete_report_endpoint(report_id: UUID):
    """Delete a report by ID."""
    success = delete_report(report_id)
    if not success:
        raise HTTPException(status_code=404, detail="Report not found")
    return {"deleted": True}


# --- Generation ---


@router.post("/reports/generate", response_model=Report)
def generate_report_endpoint(
    ticker: str, company: str, playbook: str
):
    """Generate a new report using a playbook (stub)."""
    try:
        report = generate_report(ticker=ticker, company=company, playbook_name=playbook)
        return report
    except NotImplementedError as e:
        raise HTTPException(status_code=501, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# --- Compliance ---


@router.post("/reports/verify")
def verify_compliance_endpoint(
    ticker: str,
    period: str,
):
    """Verify compliance for a report (stub - needs prompt_path and report_path)."""
    raise HTTPException(
        status_code=501,
        detail="Compliance verification endpoint not yet fully implemented",
    )


# --- Synthesis ---


@router.post("/reports/synthesize", response_model=SynthesizedOpinion)
def synthesize_endpoint(
    ticker: str,
    period: str,
    primary: Opinion,
    perspectives: list[PerspectiveOpinion],
):
    """Synthesize primary opinion with perspective opinions into weighted view.

    Accepts the primary opinion (from equity agent) and a list of
    perspective opinions (from bull/bear/macro agents) and returns
    a confidence-weighted synthesis with consensus assessment.
    """
    return synthesize(
        ticker=ticker,
        period=period,
        primary=primary,
        perspectives=perspectives,
    )


# --- Playbooks ---


@router.get("/playbooks", response_model=list[PlaybookSummary])
def list_playbooks_endpoint():
    """List all available playbooks."""
    return list_playbooks()


@router.get("/playbooks/{name}")
def get_playbook_endpoint(name: str):
    """Get a single playbook by name."""
    playbook = get_playbook(name)
    if not playbook:
        raise HTTPException(status_code=404, detail="Playbook not found")
    return playbook
