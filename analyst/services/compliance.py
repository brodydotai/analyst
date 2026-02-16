"""Compliance verification service — refactored from verify_prompt_compliance.py."""

import re
from pathlib import Path

from analyst.models import Scorecard, ScorecardMetrics, SectionResult


def parse_prompt_sections(prompt_text: str) -> list[dict]:
    """Parse a prompt into sections with headers and element lists."""
    sections = []
    lines = prompt_text.split("\n")

    current_section = None

    for line in lines:
        # Check for section header (## format)
        if line.startswith("## "):
            if current_section:
                sections.append(current_section)

            section_title = line[3:].strip()
            current_section = {
                "title": section_title,
                "id": section_title.lower().replace(" ", "_"),
                "elements": [],
            }
        # Check for bullet points (elements)
        elif line.startswith("- ") and current_section:
            element = line[2:].strip()
            current_section["elements"].append(element)

    if current_section:
        sections.append(current_section)

    return sections


def check_section_coverage(
    report_text: str, section_title: str, elements: list[str]
) -> dict:
    """Check how many elements from a section are covered in the report."""
    covered_count = 0
    covered_elements = []
    missing_elements = []

    for element in elements:
        # Simple substring matching (case-insensitive)
        if element.lower() in report_text.lower():
            covered_count += 1
            covered_elements.append(element)
        else:
            missing_elements.append(element)

    total = len(elements)
    coverage_pct = (covered_count / total * 100) if total > 0 else 0.0

    # Determine status
    if coverage_pct >= 80:
        status = "✓"
    elif coverage_pct >= 50:
        status = "⚠"
    else:
        status = "✗"

    return {
        "section_title": section_title,
        "covered": covered_count,
        "total": total,
        "coverage_pct": coverage_pct,
        "status": status,
        "covered_elements": covered_elements,
        "missing_elements": missing_elements,
    }


def check_structural_requirements(report_text: str, prompt_text: str) -> list[dict]:
    """Check structural requirements like headings, formatting, minimum length."""
    results = []

    # Check for H1 header
    has_h1 = bool(re.search(r"^# ", report_text, re.MULTILINE))
    results.append(
        {
            "requirement": "Report has H1 title",
            "passed": has_h1,
            "status": "✓" if has_h1 else "✗",
        }
    )

    # Check for section headers (##)
    section_count = len(re.findall(r"^## ", report_text, re.MULTILINE))
    has_sections = section_count > 0
    results.append(
        {
            "requirement": f"Report has section headers ({section_count} found)",
            "passed": has_sections,
            "status": "✓" if has_sections else "✗",
        }
    )

    # Check word count (minimum 500 words as baseline)
    word_count = len(report_text.split())
    min_words = 500
    passes_word_count = word_count >= min_words
    results.append(
        {
            "requirement": f"Report meets minimum word count ({word_count} words, min {min_words})",
            "passed": passes_word_count,
            "status": "✓" if passes_word_count else "✗",
        }
    )

    # Check for lists (bullet points)
    has_lists = bool(re.search(r"^\s*[-*] ", report_text, re.MULTILINE))
    results.append(
        {
            "requirement": "Report uses bullet points or lists",
            "passed": has_lists,
            "status": "✓" if has_lists else "✗",
        }
    )

    return results


def verify_compliance(
    prompt_path: Path, report_path: Path
) -> tuple[Scorecard, str]:
    """
    Verify compliance between a prompt and report.

    Returns: (Scorecard object, error message if any)
    """
    try:
        prompt_text = prompt_path.read_text(encoding="utf-8")
        report_text = report_path.read_text(encoding="utf-8")
    except FileNotFoundError as e:
        raise FileNotFoundError(f"Missing file: {e}")

    # Parse sections from prompt
    sections = parse_prompt_sections(prompt_text)

    # Check coverage for each section
    section_results = []
    total_covered = 0
    total_elements = 0

    for section in sections:
        coverage = check_section_coverage(
            report_text, section["title"], section["elements"]
        )
        total_covered += coverage["covered"]
        total_elements += coverage["total"]

        section_results.append(
            SectionResult(
                section_id=section["id"],
                title=section["title"],
                status=coverage["status"],
                coverage_pct=coverage["coverage_pct"],
                covered=coverage["covered"],
                total=coverage["total"],
            )
        )

    # Check structural requirements
    structural_checks = check_structural_requirements(report_text, prompt_text)
    structural_passed = sum(1 for c in structural_checks if c["passed"])
    structural_pct = (
        (structural_passed / len(structural_checks) * 100)
        if structural_checks
        else 0.0
    )

    # Calculate overall coverage
    section_coverage_pct = (
        (total_covered / total_elements * 100) if total_elements > 0 else 0.0
    )
    element_coverage_pct = section_coverage_pct
    weighted_overall = (section_coverage_pct * 0.6) + (structural_pct * 0.4)

    # Determine grade
    if weighted_overall >= 90:
        grade = "A"
    elif weighted_overall >= 80:
        grade = "B"
    elif weighted_overall >= 70:
        grade = "C"
    elif weighted_overall >= 60:
        grade = "D"
    else:
        grade = "F"

    # Gather gaps
    gaps = []
    for section_result in section_results:
        if section_result.coverage_pct < 80:
            gaps.append(f"{section_result.title}: {section_result.coverage_pct:.0f}% covered")

    for structural_check in structural_checks:
        if not structural_check["passed"]:
            gaps.append(f"Structural: {structural_check['requirement']}")

    # Extract ticker and period from filenames
    ticker = prompt_path.stem.upper()
    period = report_path.stem.split(".")[-2] if "." in report_path.stem else "unknown"

    metrics = ScorecardMetrics(
        section_coverage=f"{section_coverage_pct:.1f}%",
        element_coverage=f"{element_coverage_pct:.1f}%",
        structural_requirements=f"{structural_pct:.1f}%",
        weighted_overall=weighted_overall,
        grade=grade,
    )

    scorecard = Scorecard(
        ticker=ticker,
        period=period,
        prompt_used=prompt_path.name,
        metrics=metrics,
        sections=section_results,
        gaps=gaps,
    )

    return scorecard


def generate_scorecard_markdown(
    scorecard: Scorecard, company: str, ticker: str
) -> str:
    """Generate a markdown representation of the scorecard."""
    lines = []

    lines.append(f"# {company} ({ticker}) — Compliance Scorecard")
    lines.append("")

    # Summary metrics
    lines.append("## Scorecard Summary")
    lines.append("")
    lines.append(f"| Metric | Score |")
    lines.append(f"|--------|-------|")
    lines.append(f"| **Weighted Overall** | **{scorecard.metrics.weighted_overall:.1f}% ({scorecard.metrics.grade})** |")
    lines.append(f"| Section Coverage | {scorecard.metrics.section_coverage} |")
    lines.append(f"| Element Coverage | {scorecard.metrics.element_coverage} |")
    lines.append(f"| Structural Requirements | {scorecard.metrics.structural_requirements} |")
    lines.append("")

    # Per-section results
    lines.append("## Section Coverage")
    lines.append("")
    for section in scorecard.sections:
        lines.append(
            f"- {section.status} **{section.title}**: {section.covered}/{section.total} "
            f"({section.coverage_pct:.0f}%)"
        )

    lines.append("")

    # Gaps
    if scorecard.gaps:
        lines.append("## Gaps & Opportunities")
        lines.append("")
        for gap in scorecard.gaps:
            lines.append(f"- {gap}")
        lines.append("")

    lines.append(f"*Evaluated against prompt: {scorecard.prompt_used}*")

    return "\n".join(lines)
