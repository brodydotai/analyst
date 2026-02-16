"""Report service — CRUD operations on reports table."""

from uuid import UUID

from analyst.db import get_client
from analyst.models import Report, ReportCreate, ReportSummary


def list_reports(
    ticker: str | None = None,
    report_type: str | None = None,
    period: str | None = None,
) -> list[ReportSummary]:
    """List reports with optional filters, returning only summary fields."""
    client = get_client()
    query = client.table("reports").select(
        "id, ticker, title, report_type, period, compliance_score, compliance_grade, word_count, created_at"
    )

    if ticker:
        query = query.eq("ticker", ticker.upper())
    if report_type:
        query = query.eq("report_type", report_type)
    if period:
        query = query.eq("period", period)

    response = query.execute()
    return [ReportSummary(**row) for row in response.data]


def get_report(report_id: UUID) -> Report | None:
    """Fetch a single report by ID."""
    client = get_client()
    response = client.table("reports").select("*").eq("id", str(report_id)).execute()

    if not response.data:
        return None

    return Report(**response.data[0])


def get_reports_by_ticker(ticker: str) -> list[Report]:
    """Fetch all reports for a given ticker."""
    client = get_client()
    response = (
        client.table("reports")
        .select("*")
        .eq("ticker", ticker.upper())
        .order("created_at", desc=True)
        .execute()
    )

    return [Report(**row) for row in response.data]


def create_report(data: ReportCreate) -> Report:
    """Create a new report."""
    client = get_client()
    payload = data.model_dump()

    response = client.table("reports").insert(payload).execute()
    return Report(**response.data[0])


def delete_report(report_id: UUID) -> bool:
    """Delete a report by ID. Returns True if successful."""
    client = get_client()
    response = client.table("reports").delete().eq("id", str(report_id)).execute()

    return bool(response.data)


def search_reports(query: str) -> list[ReportSummary]:
    """Search reports by ticker and title using case-insensitive matching."""
    client = get_client()
    search_term = f"%{query}%"

    response = (
        client.table("reports")
        .select(
            "id, ticker, title, report_type, period, compliance_score, compliance_grade, word_count, created_at"
        )
        .or_(
            f"ticker.ilike.{search_term},title.ilike.{search_term}",
        )
        .execute()
    )

    return [ReportSummary(**row) for row in response.data]
