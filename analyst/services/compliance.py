"""Compliance verification service for playbook-based report scoring."""

import json
import re
from pathlib import Path

from analyst.models import Scorecard, ScorecardMetrics, SectionResult

RULES_PATH = Path("research/compliance/rules.json")


def load_compliance_rules() -> dict:
    """Load compliance scoring rules from disk."""
    default_rules = {
        "weights": {"section_coverage": 0.4, "element_coverage": 0.4, "structural": 0.2},
        "thresholds": {"a": 90, "b": 80, "c": 70, "d": 60},
        "structural": {
            "min_words": 500,
            "require_h1": True,
            "require_section_headers": True,
            "require_lists": True,
            "require_opinion_block": True,
        },
    }
    if not RULES_PATH.exists():
        return default_rules
    with RULES_PATH.open(encoding="utf-8") as rules_file:
        loaded = json.load(rules_file)
    return loaded


def parse_playbook_sections(playbook_text: str) -> list[dict]:
    """Parse top-level A-H sections and element hints from a playbook."""
    sections: list[dict] = []
    pattern = re.compile(r"\*\*([A-H])\.\s+(.+?)\*\*", re.MULTILINE)
    matches = list(pattern.finditer(playbook_text))

    if not matches:
        return sections

    for index, match in enumerate(matches):
        section_id = match.group(1)
        section_title = match.group(2).strip()
        start = match.end()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(playbook_text)
        section_content = playbook_text[start:end]

        elements = []
        bold_terms = re.findall(r"\*\*(.+?)\*\*", section_content)
        bullet_terms = re.findall(r"^\s*[-*]\s+(.+)$", section_content, re.MULTILINE)
        for term in bold_terms + bullet_terms:
            cleaned = term.strip().rstrip(":")
            if cleaned and len(cleaned) < 140 and cleaned not in elements:
                elements.append(cleaned)

        sections.append(
            {
                "id": section_id.lower(),
                "title": section_title,
                "elements": elements[:20],
            }
        )

    return sections


def _keyword_score(text: str, phrase: str) -> float:
    """Compute simple keyword coverage score for a phrase."""
    words = [word.lower() for word in re.findall(r"[A-Za-z0-9]+", phrase) if len(word) > 3]
    if not words:
        return 0.0
    text_lower = text.lower()
    hits = sum(1 for word in words if word in text_lower)
    return (hits / len(words)) * 100


def check_section_coverage(report_text: str, section_title: str, elements: list[str]) -> dict:
    """Check section title and element coverage for one playbook section."""
    title_coverage = _keyword_score(report_text, section_title)
    covered_elements = 0
    for element in elements:
        if _keyword_score(report_text, element) >= 60 or element.lower() in report_text.lower():
            covered_elements += 1

    total_elements = len(elements)
    element_coverage = (covered_elements / total_elements * 100) if total_elements else 0.0
    section_coverage = (title_coverage * 0.5) + (element_coverage * 0.5)

    if section_coverage >= 80:
        status = "✓"
    elif section_coverage >= 50:
        status = "⚠"
    else:
        status = "✗"

    return {
        "section_title": section_title,
        "status": status,
        "section_coverage": section_coverage,
        "covered": covered_elements,
        "total": total_elements,
        "element_coverage": element_coverage,
    }


def check_structural_requirements(report_text: str, rules: dict) -> list[dict]:
    """Check baseline structure requirements from compliance rules."""
    structural_rules = rules["structural"]
    checks = []

    checks.append(
        {
            "requirement": "Report has H1 title",
            "passed": bool(re.search(r"^# ", report_text, re.MULTILINE))
            if structural_rules.get("require_h1", True)
            else True,
        }
    )
    checks.append(
        {
            "requirement": "Report has section headers",
            "passed": bool(re.search(r"^## ", report_text, re.MULTILINE))
            if structural_rules.get("require_section_headers", True)
            else True,
        }
    )
    checks.append(
        {
            "requirement": "Report uses bullet points",
            "passed": bool(re.search(r"^\s*[-*] ", report_text, re.MULTILINE))
            if structural_rules.get("require_lists", True)
            else True,
        }
    )
    min_words = structural_rules.get("min_words", 500)
    checks.append(
        {
            "requirement": f"Report meets minimum word count ({min_words})",
            "passed": len(report_text.split()) >= min_words,
        }
    )
    checks.append(
        {
            "requirement": "Report includes opinion block",
            "passed": "## Opinion" in report_text and "```yaml" in report_text
            if structural_rules.get("require_opinion_block", True)
            else True,
        }
    )
    return checks


def verify_report_content(
    playbook_text: str,
    playbook_filename: str,
    report_text: str,
    ticker: str,
    period: str,
) -> Scorecard:
    """Verify report compliance against a playbook using in-memory content."""
    rules = load_compliance_rules()
    sections = parse_playbook_sections(playbook_text)

    section_results = []
    section_scores = []
    total_covered_elements = 0
    total_elements = 0

    for section in sections:
        coverage = check_section_coverage(report_text, section["title"], section["elements"])
        section_scores.append(coverage["section_coverage"])
        total_covered_elements += coverage["covered"]
        total_elements += coverage["total"]
        section_results.append(
            SectionResult(
                section_id=section["id"],
                title=section["title"],
                status=coverage["status"],
                coverage_pct=coverage["section_coverage"],
                covered=coverage["covered"],
                total=coverage["total"],
            )
        )

    structural_checks = check_structural_requirements(report_text, rules)
    structural_passed = sum(1 for item in structural_checks if item["passed"])
    structural_pct = (structural_passed / len(structural_checks) * 100) if structural_checks else 0.0

    section_coverage_pct = sum(section_scores) / len(section_scores) if section_scores else 0.0
    element_coverage_pct = (
        (total_covered_elements / total_elements * 100) if total_elements else 0.0
    )
    weights = rules["weights"]
    weighted_overall = (
        section_coverage_pct * weights["section_coverage"]
        + element_coverage_pct * weights["element_coverage"]
        + structural_pct * weights["structural"]
    )

    thresholds = rules["thresholds"]
    if weighted_overall >= thresholds["a"]:
        grade = "A"
    elif weighted_overall >= thresholds["b"]:
        grade = "B"
    elif weighted_overall >= thresholds["c"]:
        grade = "C"
    elif weighted_overall >= thresholds["d"]:
        grade = "D"
    else:
        grade = "F"

    gaps = []
    for section in section_results:
        if section.coverage_pct < 80:
            gaps.append(f"{section.title}: {section.coverage_pct:.0f}% covered")
    for check in structural_checks:
        if not check["passed"]:
            gaps.append(f"Structural: {check['requirement']}")

    return Scorecard(
        ticker=ticker.upper(),
        period=period,
        prompt_used=playbook_filename,
        metrics=ScorecardMetrics(
            section_coverage=f"{section_coverage_pct:.1f}%",
            element_coverage=f"{element_coverage_pct:.1f}%",
            structural_requirements=f"{structural_pct:.1f}%",
            weighted_overall=weighted_overall,
            grade=grade,
        ),
        sections=section_results,
        gaps=gaps,
    )


def verify_compliance(playbook_path: Path, report_path: Path) -> Scorecard:
    """Verify compliance between a playbook file and report file."""
    playbook_text = playbook_path.read_text(encoding="utf-8")
    report_text = report_path.read_text(encoding="utf-8")
    period = report_path.stem.split(".")[-1] if "." in report_path.stem else "unknown"
    ticker = report_path.stem.split(".")[0] if "." in report_path.stem else "unknown"
    return verify_report_content(
        playbook_text=playbook_text,
        playbook_filename=playbook_path.name,
        report_text=report_text,
        ticker=ticker,
        period=period,
    )


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
