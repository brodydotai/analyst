"""Report generation service and playbook loading utilities."""

import re
from pathlib import Path

from analyst.models import Playbook, PlaybookSummary, ReportCreate

PLAYBOOKS_DIR = Path("research/playbooks")
TEMPLATES_DIR = Path("research/templates")


def _extract_role(content: str) -> str:
    """Extract the role line from a playbook file."""
    for line in content.split("\n"):
        if line.startswith("Role:") or line.startswith("Role :"):
            return line.split(":", 1)[1].strip()
        if line.startswith("**Role:**"):
            return line.split(":", 1)[1].strip()
    return "Unknown"


def _extract_sections(content: str) -> list[str]:
    """Extract top-level section headers from a playbook."""
    sections: list[str] = []

    # Match markdown headers.
    markdown_sections = re.findall(r"^## (.+)$", content, re.MULTILINE)
    sections.extend(markdown_sections)

    # Match bold section markers like **A. ...**.
    for match in re.findall(r"\*\*([A-H])\.\s+(.+?)\*\*", content):
        label = f"{match[0]}. {match[1].strip()}"
        if label not in sections:
            sections.append(label)

    return sections


def _load_report_template() -> str:
    """Load the canonical report template if present."""
    template_path = TEMPLATES_DIR / "report-structure.md"
    if template_path.exists():
        return template_path.read_text(encoding="utf-8")
    return (
        "# {company} ({ticker}) Investment Report\n\n"
        "## Playbook Context\n"
        "- Playbook: {playbook_filename}\n"
        "- Role: {role}\n\n"
        "## Research Sections\n"
        "{sections_block}\n\n"
        "{opinion_block}\n"
    )


def _load_opinion_template() -> str:
    """Load the canonical opinion block template if present."""
    opinion_path = TEMPLATES_DIR / "opinion-block.yaml"
    if opinion_path.exists():
        return opinion_path.read_text(encoding="utf-8")
    return (
        "```yaml\n"
        "rating: 5\n"
        "confidence: 0.50\n"
        "action: hold\n"
        "timeframe: 12M\n"
        "thesis: \"Fill in thesis.\"\n"
        "catalysts: []\n"
        "risks: []\n"
        "invalidation: \"Define invalidation condition.\"\n"
        "data_confidence: 0.50\n"
        "```"
    )


def generate_report(
    ticker: str, company: str, playbook_name: str, period: str
) -> ReportCreate:
    """
    Build a report draft from the canonical template and selected playbook.

    This function enforces a consistent output structure before downstream
    verification and persistence.
    """
    playbook = get_playbook(playbook_name)
    if not playbook:
        raise ValueError(f"Playbook not found: {playbook_name}")

    section_lines = []
    for section in playbook.sections:
        section_lines.append(f"## {section}")
        section_lines.append("- Required evidence: pending")
        section_lines.append("- Key metrics: pending")
        section_lines.append("- Risks and counterpoints: pending")
        section_lines.append("")

    sections_block = "\n".join(section_lines).strip()
    opinion_block = _load_opinion_template()
    template = _load_report_template()
    rendered = template.format(
        company=company,
        ticker=ticker.upper(),
        playbook_filename=playbook.filename,
        role=playbook.role,
        sections_block=sections_block,
        opinion_block=opinion_block,
    )

    return ReportCreate(
        ticker=ticker.upper(),
        title=f"{company} ({ticker.upper()}) Investment Research Report",
        report_type="report",
        period=period,
        prompt_used=playbook.filename,
        content=rendered,
        word_count=len(rendered.split()),
        metadata={
            "generation_mode": "template_scaffold",
            "playbook": playbook.name,
            "instruction_loop": "generate->verify->persist",
        },
    )


def list_playbooks(playbooks_dir: Path = PLAYBOOKS_DIR) -> list[PlaybookSummary]:
    """List all available playbooks from the playbooks directory."""
    playbooks = []

    if not playbooks_dir.exists():
        return playbooks

    for playbook_file in sorted(playbooks_dir.glob("*.md")):
        content = playbook_file.read_text(encoding="utf-8")
        role = _extract_role(content)
        name = playbook_file.stem
        playbooks.append(
            PlaybookSummary(
                name=name,
                filename=playbook_file.name,
                role=role,
            )
        )

    return playbooks


def get_playbook(name: str, playbooks_dir: Path = PLAYBOOKS_DIR) -> Playbook | None:
    """Load a single playbook by name."""
    playbook_path = playbooks_dir / f"{name}.md"

    if not playbook_path.exists():
        return None

    content = playbook_path.read_text(encoding="utf-8")
    role = _extract_role(content)
    sections = _extract_sections(content)

    return Playbook(
        name=name,
        filename=playbook_path.name,
        role=role,
        sections=sections,
        content=content,
    )
