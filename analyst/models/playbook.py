"""Playbook models."""

from pydantic import BaseModel


class Playbook(BaseModel):
    """Complete playbook with content."""

    name: str
    filename: str
    role: str
    sections: list[str]
    content: str


class PlaybookSummary(BaseModel):
    """Playbook summary without content."""

    name: str
    filename: str
    role: str
