"""Synthesis service — combines primary opinion with perspective opinions.

Takes the equity agent's primary opinion and the bull/bear/macro perspective
opinions, applies confidence-weighted averaging, and produces a synthesized
view with consensus assessment.
"""

from analyst.models.opinion import (
    Opinion,
    PerspectiveOpinion,
    SynthesizedOpinion,
)


# Domain relevance multipliers — perspectives get boosted when their
# domain is most relevant to the current analysis
DOMAIN_WEIGHTS = {
    "bull": 1.0,   # Equal weight by default
    "bear": 1.0,   # Equal weight by default
    "macro": 0.8,  # Slightly less weight — macro is contextual, not asset-specific
}


def synthesize(
    ticker: str,
    period: str,
    primary: Opinion,
    perspectives: list[PerspectiveOpinion],
) -> SynthesizedOpinion:
    """Combine primary opinion with perspective opinions into a synthesized view.

    Weighting formula:
        weight = confidence × domain_relevance_factor
        synthesized_rating = (primary_weight * primary_rating + Σ(perspective_weight * rating)) / total_weight

    Primary opinion gets 2x base weight since it comes from the deep playbook analysis.

    Args:
        ticker: Asset ticker symbol.
        period: Report period identifier.
        primary: The equity agent's primary opinion from the full report.
        perspectives: List of bull/bear/macro perspective opinions.

    Returns:
        SynthesizedOpinion with weighted rating, confidence, and consensus assessment.
    """
    # Primary opinion gets 2x weight multiplier — it's the deep analysis
    primary_weight = primary.confidence * 2.0
    weighted_sum = primary.rating * primary_weight
    total_weight = primary_weight

    for p in perspectives:
        domain_factor = DOMAIN_WEIGHTS.get(p.perspective, 1.0)
        weight = p.confidence * domain_factor
        weighted_sum += p.rating * weight
        total_weight += weight

    synthesized_rating = weighted_sum / total_weight if total_weight > 0 else 5.0

    # Synthesized confidence: average of all confidences, reduced if there's disagreement
    all_ratings = [primary.rating] + [p.rating for p in perspectives]
    rating_spread = max(all_ratings) - min(all_ratings)

    all_confidences = [primary.confidence] + [p.confidence for p in perspectives]
    avg_confidence = sum(all_confidences) / len(all_confidences)

    # Penalize confidence when opinions diverge — spread of 5+ points = significant reduction
    disagreement_penalty = min(rating_spread / 10.0, 0.3)
    synthesized_confidence = max(0.1, avg_confidence - disagreement_penalty)

    # Assess consensus
    consensus = _assess_consensus(primary, perspectives)

    # Identify dissenting views
    dissenting = _find_dissenting_views(primary, perspectives)

    # Build consensus summary
    summary = _build_consensus_summary(primary, perspectives, consensus, synthesized_rating)

    return SynthesizedOpinion(
        ticker=ticker,
        period=period,
        primary_opinion=primary,
        perspectives=perspectives,
        synthesized_rating=round(synthesized_rating, 1),
        synthesized_confidence=round(synthesized_confidence, 2),
        consensus=consensus,
        consensus_summary=summary,
        dissenting_views=dissenting,
    )


def _assess_consensus(
    primary: Opinion,
    perspectives: list[PerspectiveOpinion],
) -> str:
    """Determine consensus level based on rating spread.

    Args:
        primary: Primary opinion.
        perspectives: Perspective opinions.

    Returns:
        Consensus level string.
    """
    all_ratings = [primary.rating] + [p.rating for p in perspectives]
    spread = max(all_ratings) - min(all_ratings)

    if spread <= 1:
        return "strong_agreement"
    if spread <= 2:
        return "agreement"
    if spread <= 4:
        return "mixed"
    if spread <= 6:
        return "disagreement"
    return "strong_disagreement"


def _find_dissenting_views(
    primary: Opinion,
    perspectives: list[PerspectiveOpinion],
) -> list[str]:
    """Identify perspectives that diverge significantly from the primary opinion.

    A dissent is any perspective rating that differs from the primary by 3+ points.

    Args:
        primary: Primary opinion.
        perspectives: Perspective opinions.

    Returns:
        List of dissent descriptions.
    """
    dissents = []
    for p in perspectives:
        diff = abs(p.rating - primary.rating)
        if diff >= 3:
            direction = "more bullish" if p.rating > primary.rating else "more bearish"
            dissents.append(
                f"{p.perspective.capitalize()} perspective ({p.rating}/10) is significantly "
                f"{direction} than primary ({primary.rating}/10): {p.argument[:120]}"
            )
    return dissents


def _build_consensus_summary(
    primary: Opinion,
    perspectives: list[PerspectiveOpinion],
    consensus: str,
    synthesized_rating: float,
) -> str:
    """Build a human-readable consensus summary.

    Args:
        primary: Primary opinion.
        perspectives: Perspective opinions.
        consensus: Consensus level.
        synthesized_rating: The final synthesized rating.

    Returns:
        Summary string.
    """
    perspective_map = {p.perspective: p for p in perspectives}

    parts = [f"Synthesized rating: {synthesized_rating:.1f}/10."]

    if consensus in ("strong_agreement", "agreement"):
        parts.append("All perspectives broadly align.")
    elif consensus == "mixed":
        parts.append("Perspectives show moderate divergence.")
    else:
        parts.append("Significant disagreement across perspectives.")

    bull = perspective_map.get("bull")
    bear = perspective_map.get("bear")
    macro = perspective_map.get("macro")

    if bull and bear:
        spread = bull.rating - bear.rating
        parts.append(f"Bull-bear spread: {spread} points ({bull.rating} vs {bear.rating}).")

    if macro:
        if macro.rating >= 7:
            parts.append("Macro environment is a tailwind.")
        elif macro.rating <= 4:
            parts.append("Macro environment is a headwind.")
        else:
            parts.append("Macro environment is neutral.")

    return " ".join(parts)
