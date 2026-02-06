#!/usr/bin/env python3
"""
Prompt Compliance Verification Engine
--------------------------------------
Verifies that an investment research report accurately follows its corresponding
industry prompt by checking section coverage, analytical element inclusion, and
structural completeness.

Usage:
    python verify_prompt_compliance.py --prompt <prompt.md> --report <report.md> --output <scorecard.md>
"""

import re
import sys
import argparse
from pathlib import Path
from datetime import datetime


def parse_prompt_sections(prompt_text):
    """Extract required sections and their key analytical elements from the prompt."""
    sections = []

    # Match section headers like **A. Title**, **B1. Title**, etc.
    # Also match ## or ### markdown headers
    section_pattern = re.compile(
        r'\*\*([A-H]\d?)\.\s+(.+?)\*\*', re.MULTILINE
    )

    matches = list(section_pattern.finditer(prompt_text))

    for i, match in enumerate(matches):
        section_id = match.group(1).strip()
        section_title = match.group(2).strip()

        # Get the content between this section and the next
        start = match.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(prompt_text)
        section_content = prompt_text[start:end]

        # Extract key analytical elements (bullet points and bold terms)
        elements = []

        # Find bold terms within the section (key metrics/concepts)
        bold_terms = re.findall(r'\*\*(.+?)\*\*', section_content)
        for term in bold_terms:
            # Filter out section headers that got captured
            if not re.match(r'^[A-H]\d?\.', term) and len(term) < 100:
                elements.append(term.strip().rstrip(':'))

        # Find bullet point items (key requirements)
        bullets = re.findall(r'[-•]\s+\*\*(.+?)\*\*', section_content)
        for b in bullets:
            clean = b.strip().rstrip(':')
            if clean not in elements:
                elements.append(clean)

        sections.append({
            'id': section_id,
            'title': section_title,
            'elements': elements[:15],  # Cap at 15 elements per section
            'content': section_content[:500]  # First 500 chars for context
        })

    return sections


def extract_top_level_sections(prompt_text):
    """Extract just the top-level sections (A, B, C, D, E, F, G, H)."""
    top_sections = []
    pattern = re.compile(r'\*\*([A-H])\.\s+(.+?)\*\*', re.MULTILINE)

    matches = list(pattern.finditer(prompt_text))
    for i, match in enumerate(matches):
        section_id = match.group(1)
        title = match.group(2).strip()

        start = match.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(prompt_text)
        content = prompt_text[start:end]

        top_sections.append({
            'id': section_id,
            'title': title,
            'content': content
        })

    return top_sections


def check_section_coverage(report_text, section_title, elements):
    """Check if a report covers a given section and its elements."""
    report_lower = report_text.lower()

    # Check if section title (or close variant) appears in report
    title_words = [w.lower() for w in section_title.split() if len(w) > 3]
    title_coverage = sum(1 for w in title_words if w in report_lower) / max(len(title_words), 1)

    # Check individual elements
    element_results = []
    for elem in elements:
        elem_words = [w.lower() for w in elem.split() if len(w) > 3]
        if not elem_words:
            continue

        # Check for exact phrase or majority of words present
        exact_match = elem.lower() in report_lower
        word_coverage = sum(1 for w in elem_words if w in report_lower) / len(elem_words)

        covered = exact_match or word_coverage >= 0.6
        element_results.append({
            'element': elem,
            'covered': covered,
            'confidence': 'HIGH' if exact_match else ('MEDIUM' if word_coverage >= 0.6 else 'LOW')
        })

    covered_count = sum(1 for e in element_results if e['covered'])
    total = max(len(element_results), 1)

    return {
        'title_coverage': title_coverage,
        'elements': element_results,
        'coverage_pct': covered_count / total * 100,
        'covered': covered_count,
        'total': total
    }


def check_structural_requirements(report_text, prompt_text):
    """Check structural requirements: IDP flagging, investigation tracks, information request."""
    checks = []

    # Check for IDP / Interesting Data Point flagging
    idp_keywords = ['interesting data point', 'idp', 'non-obvious', 'diverge', 'divergence', 'flag']
    idp_found = any(kw in report_text.lower() for kw in idp_keywords)
    checks.append({
        'requirement': 'IDP (Interesting Data Point) Flagging',
        'found': idp_found,
        'required': 'pattern matching' in prompt_text.lower() or 'idp' in prompt_text.lower()
    })

    # Check for Investigation Tracks
    track_keywords = ['investigation track', 'deep dive', 'follow-up', 'hypothesis', 'further research']
    tracks_found = any(kw in report_text.lower() for kw in track_keywords)
    checks.append({
        'requirement': 'Investigation Tracks',
        'found': tracks_found,
        'required': 'investigation track' in prompt_text.lower()
    })

    # Check for Information Request
    info_keywords = ['information request', 'additional data', 'expert call', 'refine the analysis']
    info_found = any(kw in report_text.lower() for kw in info_keywords)
    checks.append({
        'requirement': 'Information Request',
        'found': info_found,
        'required': 'information request' in prompt_text.lower()
    })

    # Check for Valuation Framework
    val_keywords = ['valuation', 'ev/ebitda', 'dcf', 'p/e', 'ev/revenue', 'multiple', 'fair value']
    val_found = any(kw in report_text.lower() for kw in val_keywords)
    checks.append({
        'requirement': 'Valuation Framework',
        'found': val_found,
        'required': 'valuation' in prompt_text.lower()
    })

    # Check for Risk Assessment
    risk_keywords = ['risk', 'downside', 'bear case', 'threat', 'headwind']
    risk_found = sum(1 for kw in risk_keywords if kw in report_text.lower()) >= 2
    checks.append({
        'requirement': 'Risk Assessment',
        'found': risk_found,
        'required': True
    })

    return checks


def generate_scorecard(company, ticker, prompt_name, sections_results, structural_checks,
                       prompt_sections, report_word_count):
    """Generate a markdown compliance scorecard."""

    # Calculate overall scores
    total_elements = sum(r['total'] for r in sections_results.values())
    covered_elements = sum(r['covered'] for r in sections_results.values())
    overall_element_pct = (covered_elements / max(total_elements, 1)) * 100

    sections_covered = sum(1 for r in sections_results.values() if r['coverage_pct'] >= 50)
    total_sections = len(sections_results)
    section_pct = (sections_covered / max(total_sections, 1)) * 100

    structural_required = [c for c in structural_checks if c['required']]
    structural_met = sum(1 for c in structural_required if c['found'])
    structural_pct = (structural_met / max(len(structural_required), 1)) * 100

    # Weighted overall score
    overall_score = (section_pct * 0.4) + (overall_element_pct * 0.4) + (structural_pct * 0.2)

    # Grade
    if overall_score >= 90:
        grade = 'A'
    elif overall_score >= 80:
        grade = 'B'
    elif overall_score >= 70:
        grade = 'C'
    elif overall_score >= 60:
        grade = 'D'
    else:
        grade = 'F'

    lines = []
    lines.append(f'# Prompt Compliance Scorecard')
    lines.append(f'## {company} [{ticker}]')
    lines.append(f'')
    lines.append(f'**Prompt Used:** `{prompt_name}`')
    lines.append(f'**Verification Date:** {datetime.now().strftime("%B %d, %Y")}')
    lines.append(f'**Report Word Count:** {report_word_count:,}')
    lines.append(f'')
    lines.append(f'---')
    lines.append(f'')
    lines.append(f'## Overall Compliance Score: {overall_score:.1f}% — Grade: {grade}')
    lines.append(f'')
    lines.append(f'| Metric | Score |')
    lines.append(f'|--------|-------|')
    lines.append(f'| Section Coverage | {sections_covered}/{total_sections} ({section_pct:.0f}%) |')
    lines.append(f'| Element Coverage | {covered_elements}/{total_elements} ({overall_element_pct:.0f}%) |')
    lines.append(f'| Structural Requirements | {structural_met}/{len(structural_required)} ({structural_pct:.0f}%) |')
    lines.append(f'| **Weighted Overall** | **{overall_score:.1f}%** |')
    lines.append(f'')
    lines.append(f'---')
    lines.append(f'')

    # Section-by-section breakdown
    lines.append(f'## Section-by-Section Analysis')
    lines.append(f'')

    for section_id, result in sorted(sections_results.items()):
        status = '✅' if result['coverage_pct'] >= 50 else '⚠️' if result['coverage_pct'] >= 25 else '❌'
        # Find matching section info
        section_info = next((s for s in prompt_sections if s['id'] == section_id), None)
        title = section_info['title'] if section_info else section_id

        lines.append(f'### {status} Section {section_id}: {title}')
        lines.append(f'**Coverage:** {result["covered"]}/{result["total"]} elements ({result["coverage_pct"]:.0f}%)')
        lines.append(f'')

        if result['elements']:
            lines.append(f'| Element | Status | Confidence |')
            lines.append(f'|---------|--------|------------|')
            for elem in result['elements']:
                icon = '✅' if elem['covered'] else '❌'
                lines.append(f'| {elem["element"][:60]} | {icon} | {elem["confidence"]} |')
            lines.append(f'')

    # Structural requirements
    lines.append(f'## Structural Requirements')
    lines.append(f'')
    lines.append(f'| Requirement | Required | Found |')
    lines.append(f'|-------------|----------|-------|')
    for check in structural_checks:
        req_icon = '📋' if check['required'] else '—'
        found_icon = '✅' if check['found'] else '❌'
        lines.append(f'| {check["requirement"]} | {req_icon} | {found_icon} |')
    lines.append(f'')

    # Gaps and recommendations
    lines.append(f'---')
    lines.append(f'')
    lines.append(f'## Identified Gaps')
    lines.append(f'')

    gaps = []
    for section_id, result in sorted(sections_results.items()):
        if result['coverage_pct'] < 50:
            section_info = next((s for s in prompt_sections if s['id'] == section_id), None)
            title = section_info['title'] if section_info else section_id
            missing = [e['element'] for e in result['elements'] if not e['covered']]
            gaps.append(f'- **Section {section_id} ({title}):** Missing elements: {", ".join(missing[:5])}')

    for check in structural_checks:
        if check['required'] and not check['found']:
            gaps.append(f'- **{check["requirement"]}:** Not found in report')

    if gaps:
        for gap in gaps:
            lines.append(gap)
    else:
        lines.append('No significant gaps identified.')

    lines.append(f'')
    lines.append(f'---')
    lines.append(f'*Generated by Prompt Compliance Verification Engine*')

    return '\n'.join(lines)


def main():
    parser = argparse.ArgumentParser(description='Verify prompt compliance for investment reports')
    parser.add_argument('--prompt', required=True, help='Path to the industry prompt file')
    parser.add_argument('--report', required=True, help='Path to the generated report file')
    parser.add_argument('--company', required=True, help='Company name')
    parser.add_argument('--ticker', required=True, help='Ticker symbol')
    parser.add_argument('--output', required=True, help='Output path for compliance scorecard')

    args = parser.parse_args()

    # Read files
    prompt_text = Path(args.prompt).read_text()
    report_text = Path(args.report).read_text()

    # Parse prompt sections
    sections = parse_prompt_sections(prompt_text)
    prompt_name = Path(args.prompt).name

    # Count report words
    report_word_count = len(report_text.split())

    # Check each section
    sections_results = {}
    for section in sections:
        result = check_section_coverage(report_text, section['title'], section['elements'])
        sections_results[section['id']] = result

    # Check structural requirements
    structural_checks = check_structural_requirements(report_text, prompt_text)

    # Generate scorecard
    scorecard = generate_scorecard(
        args.company, args.ticker, prompt_name,
        sections_results, structural_checks, sections,
        report_word_count
    )

    # Write output
    Path(args.output).write_text(scorecard)
    print(f'Compliance scorecard written to: {args.output}')
    print(f'Overall score: {sections_results}')

    # Print summary
    total_elements = sum(r['total'] for r in sections_results.values())
    covered_elements = sum(r['covered'] for r in sections_results.values())
    print(f'Elements covered: {covered_elements}/{total_elements}')


if __name__ == '__main__':
    main()
