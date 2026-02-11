# Research Agent Group

Shared conventions for all agents in the research group (equity, macro, thematic). Read this file after your specialization-level INSTRUCTIONS.md.

## Purpose

Research agents execute analytical playbooks against target entities, generating structured reports and scorecards. They consume data from the Brodus data layer and produce artifacts stored in `research/reports/`.

## Playbooks

Analytical frameworks live in `research/prompts/`. Each playbook defines the structure, sections, and evaluation criteria for a specific type of analysis (e.g., semiconductor industry, SaaS metrics, pharma pipeline).

**Rules:**
- Always map each target entity to the most relevant playbook(s) before starting
- Reports must follow the playbook's section structure exactly
- Generate a scorecard alongside each report
- Playbooks are read-only for research agents — refinements go through the orchestrator

## Report Standards

- **Format:** Markdown files in `research/reports/`
- **Naming:** `{TICKER}.{month}.md` for reports, `{TICKER}.{month}.scorecard.md` for scorecards
- **Content:** All financial figures must come from data sources, never fabricated by the model
- **Citations:** Reference specific filings, articles, or data points when making claims
- **Structure:** Follow the assigned playbook section order

## Data Access

- **Current:** Web search, SEC EDGAR (via web), financial data APIs (when available)
- **Future:** Direct Supabase queries for filings, articles, entities, and embeddings

Research agents do NOT have direct database write access for application tables. They write artifacts to `research/reports/` only.

## Feedback Loop

1. Reports are reviewed by the user (via the Brodus frontend or direct file review)
2. User provides approval/rejection signals
3. Feedback is logged in `docs/comms/logs/best-practices.md`
4. The orchestrator refines playbooks based on accumulated feedback
5. Future reports benefit from updated playbooks

## Quality Verification

- Reports should be verifiable against the source playbook's requirements
- The verification engine (`research/verify_prompt_compliance.py`) provides keyword-based scoring
- Semantic (LLM-as-judge) verification is the target state for accuracy assessment
