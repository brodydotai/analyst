# Framework Comparison: Analyst vs. Panza Sancho Investment Agent Framework

## Summary

Both systems use AI agents to produce investment research. The architectures diverge sharply in philosophy: Panza Sancho runs multiple agents in parallel on the *same* asset to get diverse analytical perspectives, then synthesizes them into a single rating. Analyst runs a single deep-dive agent per asset, guided by an industry-specific playbook, and scores the output for compliance against that playbook.

Different problems, different designs.

---

## Core Architectural Difference

| Dimension | Analyst | Panza Sancho |
|-----------|---------|--------------|
| **Model** | Single-agent, deep playbook execution | Multi-agent council, parallel perspectives |
| **Agent count per asset** | 1 (equity research agent) | 5 (fundamental, technical, macro, sentiment, synthesizer) |
| **Depth vs. breadth** | Deep — one 4000+ word report per asset | Broad — five short opinions synthesized into one rating |
| **Output** | Long-form markdown report + compliance scorecard | Structured rating (1-10) + confidence score + thesis paragraph |
| **Quality control** | Prompt compliance verification engine (section/element scoring) | Confidence-weighted synthesis with deference rules |

---

## Agent Design

### Panza Sancho: Perspective-based agents
Each agent represents a *lens* — fundamental, technical, macro, sentiment. They all look at the same data but through different methodologies. The thesis writer synthesizes. Every agent produces a standardized opinion schema: rating (1-10), confidence (0-1), timeframe, catalysts, risks, invalidation triggers.

This is a **voting model**. Agents are jurors.

### Analyst: Task-based agents
Each agent has a *job* — generate a report, verify compliance, build backend code. The equity research agent is a single analyst that executes an entire industry-specific playbook end-to-end. It doesn't get a second opinion; it gets a scorecard that measures how thoroughly it followed the framework.

This is a **craftsman model**. The agent is an analyst; the scorecard is the editor.

---

## What Panza Sancho Has That We Don't

1. **Multi-perspective synthesis** — Running fundamental, technical, macro, and sentiment in parallel gives a naturally diversified view. Our single-agent approach risks tunnel vision from whichever playbook is assigned.

2. **Confidence weighting + deference** — Their system quantifies how sure each agent is and applies domain-relevance multipliers. If the macro agent is more relevant to the current market regime, its opinion weighs more. We have no equivalent — our reports don't carry confidence metadata.

3. **Standardized opinion schema** — Every agent outputs the same structured format (rating, confidence, timeframe, action). This makes cross-asset comparison trivial. Our reports are free-form markdown following playbook sections — rich but harder to compare programmatically.

4. **Operating modes** — Council, Comparison, Quick, Deep Dive, Focused. Users can choose depth vs. speed. We have one mode: full playbook execution.

5. **Automated reanalysis triggers** — Price moves >15%, revenue changes >25%, Fed meetings, weekly scheduled reviews. We have no event-driven pipeline yet.

6. **Conflict resolution as signal** — When agents disagree, that disagreement itself becomes useful information (reduced confidence, wider stops). Our system treats gaps as failures, not signals.

---

## What We Have That They Don't

1. **Industry-specific analytical depth** — 18 playbooks covering semiconductors, SaaS, oil & gas, pharma, quantum, defense, space, precious metals, etc. Each playbook is a 2000+ word analytical framework tailored to that industry's economics. Their agents use generic methodologies applied to any asset. Our Intel report covers wafer-level economics, process node transitions, and foundry capacity dynamics — domain knowledge their framework can't replicate without custom prompting per asset.

2. **Prompt compliance verification** — A scoring engine that measures report quality against the playbook specification. Section coverage, element coverage, structural requirements, weighted into a grade. They have no equivalent QA system — their quality metric is just the confidence score each agent self-reports.

3. **Long-form research artifacts** — Our reports are 4000+ word institutional-grade documents with sourced data, investigation tracks, and IDP flagging. Their output is a rating + short thesis. Different use cases, but ours produces something a portfolio manager can actually read and act on.

4. **Playbook extensibility** — Adding a new industry means writing a new prompt file. The analytical framework is encoded in markdown, not in code. Their extensibility is agent-based — adding a new *perspective* (e.g., ESG analyst) rather than a new *domain*.

5. **Report persistence and search** — Supabase-backed storage with metadata, search, and API access. Their framework appears to be execution-focused without a structured artifact store.

---

## What We Should Steal

### 1. Multi-agent perspective layer
Not replacing our playbook model, but augmenting it. After the equity agent generates the deep report, run a lightweight "council" of 3-4 perspective agents that each read the report and produce a structured opinion:

- **Bull agent** — strongest case for the investment, catalysts, upside targets
- **Bear agent** — strongest case against, risks, downside scenarios
- **Macro overlay** — how current macro regime affects this specific thesis

These don't need to be heavy. Short structured outputs that attach to the report as supplementary perspectives.

### 2. Standardized opinion schema
Add a structured metadata block to every report:

```
rating: 7
confidence: 0.72
timeframe: 6M
action: accumulate
catalysts: [18A yield improvement, Panther Lake launch]
risks: [foundry customer acquisition, margin compression]
invalidation: 18A yields fail to reach 75% by Q4 2026
```

This makes reports comparable and filterable. Right now our reports are narrative-only.

### 3. Confidence scoring
Have the equity agent self-assess data quality and analytical confidence per section. Low data availability on a section = low confidence flag. This feeds into the scorecard and helps the user know where the analysis is strong vs. speculative.

### 4. Reanalysis triggers
Event-driven report refresh: earnings releases, significant price moves, major macro events. Flag existing reports as potentially stale when trigger conditions are met.

---

## What They Should Steal From Us

1. Industry-specific frameworks (their generic agents would produce much better output with domain playbooks)
2. Compliance verification (QA on AI output quality, not just self-reported confidence)
3. Long-form artifact storage (their ratings are ephemeral; ours persist and compound)

---

## Recommendation

The two frameworks are complementary, not competitive. The ideal system uses our playbook-driven deep analysis as the foundation, then layers Panza Sancho's multi-perspective synthesis on top. Phase 2-3 of our roadmap is the right place to introduce perspective agents and structured opinion schemas.
