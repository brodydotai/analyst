"""Ingestion service — seed database from flat files."""

import re
from pathlib import Path

from analyst.db import get_client
from analyst.models import ReportCreate


def parse_report_filename(filename: str) -> dict:
    """
    Parse a report filename to extract metadata.

    Examples:
    - "intc.feb.md" -> {"ticker": "INTC", "period": "feb-2026", "report_type": "report"}
    - "intc.feb.scorecard.md" -> {"ticker": "INTC", "period": "feb-2026", "report_type": "scorecard"}
    """
    # Remove .md extension
    name = filename.replace(".md", "")
    parts = name.split(".")

    if len(parts) < 2:
        return None

    ticker = parts[0].upper()
    period = f"{parts[1]}-2026"  # Assume current year
    report_type = "scorecard" if "scorecard" in name else "report"

    return {
        "ticker": ticker,
        "period": period,
        "report_type": report_type,
    }


def extract_compliance_score(content: str) -> tuple[float | None, str | None]:
    """
    Extract compliance score and grade from scorecard content.

    Looks for pattern: "Weighted Overall** | **XX.X%**" or similar markdown table format.
    Returns: (score_float, grade_str) or (None, None) if not found.
    """
    # Try to match the pattern "Weighted Overall" with a percentage
    match = re.search(r"Weighted Overall\*?\*? \| \*?\*?(\d+\.?\d*)%", content)
    if match:
        score = float(match.group(1))
    else:
        return None, None

    # Try to extract grade (A-F) from the same row or nearby
    grade_match = re.search(r"Weighted Overall.*?([A-F])\)?\*?\*?", content)
    if grade_match:
        grade = grade_match.group(1)
    else:
        # Infer grade from score
        if score >= 90:
            grade = "A"
        elif score >= 80:
            grade = "B"
        elif score >= 70:
            grade = "C"
        elif score >= 60:
            grade = "D"
        else:
            grade = "F"

    return score, grade


def extract_title(content: str) -> str:
    """Extract title from the first H1 line in content."""
    for line in content.split("\n"):
        if line.startswith("# "):
            return line[2:].strip()

    return "Untitled"


def seed_reports(reports_dir: Path = Path("research/reports")) -> int:
    """
    Read all .md files from reports directory, parse metadata, and upsert to DB.

    Returns: count of records upserted.
    """
    if not reports_dir.exists():
        return 0

    client = get_client()
    upserted_count = 0

    for report_file in sorted(reports_dir.glob("*.md")):
        content = report_file.read_text(encoding="utf-8")

        # Parse filename for metadata
        parsed = parse_report_filename(report_file.name)
        if not parsed:
            continue

        # Extract additional fields
        title = extract_title(content)
        word_count = len(content.split())
        compliance_score, compliance_grade = extract_compliance_score(content)

        # Create payload
        payload = {
            "ticker": parsed["ticker"],
            "title": title,
            "report_type": parsed["report_type"],
            "period": parsed["period"],
            "content": content,
            "word_count": word_count,
            "compliance_score": compliance_score,
            "compliance_grade": compliance_grade,
        }

        # Upsert by (ticker, period, report_type) composite
        response = (
            client.table("reports")
            .upsert(
                payload,
                on_conflict="ticker,period,report_type",
            )
            .execute()
        )

        if response.data:
            upserted_count += len(response.data)

    return upserted_count
