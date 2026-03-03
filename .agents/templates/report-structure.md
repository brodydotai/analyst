# {company} ({ticker}) Investment Report

## Report Metadata
- Playbook: {playbook_filename}
- Analyst Role: {role}
- Run Mode: {lean|standard|deep}
- Data Stack: {providers_used_and_fallbacks}

## Executive Summary
- 4-8 bullets only:
  - Thesis (1-2 lines)
  - Why now
  - 2 upside drivers
  - 2 downside drivers
  - Confidence context

## Research Sections
{sections_block}

## Opinion
{opinion_block}

## Summary for Perspectives
{perspective_summary_block}

## Compression Rules
- Default to concise outputs (no long narrative blocks unless deep mode is explicitly requested).
- Reuse a datapoint once; reference it later rather than restating.
- Prefer bullets over paragraphs for factual sections.
