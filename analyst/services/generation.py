"""Report generation service — stubs and playbook loading."""

import re
from pathlib import Path

from analyst.models import Playbook, PlaybookSummary, Report, ReportCreate


def generate_report(ticker: str, company: str, playbook_name: str) -> Report:
    """
    Generate a report using a playbook template.

    Process:
    1. Load the playbook by name
    2. Substitute ticker and company placeholders
    3. Call OpenAI to generate report content
    4. Parse response and create Report object
    5. Return Report (will be persisted separately)

    Currently: raises NotImplementedError
    """
    raise NotImplementedError("Report generation pipeline not yet implemented")


def list_playbooks(prompts_dir: Path = Path("research/prompts")) -> list[PlaybookSummary]:
    """List all available playbooks from the prompts directory."""
    playbooks = []

    if not prompts_dir.exists():
        return playbooks

    for prompt_file in sorted(prompts_dir.glob("*.md")):
        content = prompt_file.read_text(encoding="utf-8")

        # Extract role from first line starting with "# " or "Role:"
        role = None
        for line in content.split("\n"):
            if line.startswith("Role:") or line.startswith("Role :"):
                role = line.split(":", 1)[1].strip()
                break

        name = prompt_file.stem
        playbooks.append(
            PlaybookSummary(
                name=name,
                filename=prompt_file.name,
                role=role or "Unknown",
            )
        )

    return playbooks


def get_playbook(
    name: str, prompts_dir: Path = Path("research/prompts")
) -> Playbook | None:
    """Load a single playbook by name."""
    playbook_path = prompts_dir / f"{name}.md"

    if not playbook_path.exists():
        return None

    content = playbook_path.read_text(encoding="utf-8")

    # Extract role
    role = None
    for line in content.split("\n"):
        if line.startswith("Role:") or line.startswith("Role :"):
            role = line.split(":", 1)[1].strip()
            break

    # Extract section headers
    sections = re.findall(r"^## (.+)$", content, re.MULTILINE)

    return Playbook(
        name=name,
        filename=playbook_path.name,
        role=role or "Unknown",
        sections=sections,
        content=content,
    )
