import { useState } from "react";

const PIPELINE = [
  {
    id: "phase-0",
    phase: 0,
    title: "Setup",
    agent: null,
    color: "#8592aa",
    icon: "⚙",
    budget: "< 2K tokens",
    duration: "~5s",
    description: "Validates the ticker, resolves the playbook from index.yaml, sets naming variables, and bootstraps output directories.",
    reads: [
      { file: "playbooks/index.yaml", purpose: "Ticker → playbook mapping" },
    ],
    produces: [
      { file: "artifacts/{asset_class}/", purpose: "Directory scaffold" },
    ],
    details: [
      "Validate ticker via web search (is it a real security?)",
      "Match ticker to sector playbook using index.yaml",
      "Fall back to _default playbook if no match",
      "Set ticker_lower, period, asset_class variables",
    ],
  },
  {
    id: "phase-1",
    phase: 1,
    title: "Equity Research",
    agent: "equity",
    color: "#5ea6ff",
    icon: "📊",
    budget: "28–40K tokens",
    duration: "~90s",
    description: "The core research agent. Reads the playbook, conducts web research using targeted queries, and writes the full structured report with opinion and perspective summary.",
    reads: [
      { file: "research/equity/INSTRUCTIONS.md", purpose: "Agent behavior contract" },
      { file: "playbooks/{name}/playbook.prompt.md", purpose: "Section requirements" },
      { file: "templates/search-queries.md", purpose: "Targeted web search patterns" },
      { file: "templates/report-structure.md", purpose: "Output skeleton" },
      { file: "templates/opinion-block.yaml", purpose: "Opinion schema" },
      { file: "templates/perspective-summary.md", purpose: "Summary template" },
    ],
    produces: [
      { file: "reports/{ticker}.{period}.md", purpose: "Full research report" },
    ],
    details: [
      "Maps ticker to assigned playbook sections",
      "Runs 8-15 targeted web searches per sector template",
      "Writes numbered research sections following playbook exactly",
      "Appends Opinion YAML (rating, confidence, catalysts, risks)",
      "Appends Summary for Perspectives (400-700 word handoff)",
      "Cites every financial claim with source + date",
    ],
  },
  {
    id: "phase-2",
    phase: 2,
    title: "Compliance",
    agent: "compliance",
    color: "#f0c36a",
    icon: "✅",
    budget: "8–15K tokens",
    duration: "~30s",
    description: "Scores the report against its playbook requirements. Produces a weighted scorecard covering section coverage, element coverage, citation quality, data recency, and structural completeness.",
    reads: [
      { file: "research/compliance/INSTRUCTIONS.md", purpose: "Agent contract" },
      { file: "compliance/rules.json", purpose: "Scoring weights & thresholds" },
      { file: "playbooks/{name}/sections.json", purpose: "Required sections checklist" },
      { file: "Phase 1 report", purpose: "The report being scored" },
    ],
    produces: [
      { file: "scorecards/{ticker}.{period}.scorecard.md", purpose: "Compliance scorecard" },
    ],
    details: [
      "Weights: 30% section + 30% element + 15% citation + 10% recency + 15% structural",
      "Grades: A (90+), B (80-89), C (70-79), D (60-69), F (<60)",
      "Lists concrete misses with section IDs",
      "Prefers sections.json over reading full playbook (saves ~5K tokens)",
    ],
  },
  {
    id: "phase-3",
    phase: 3,
    title: "Perspectives",
    agent: "bull / bear / macro",
    color: "#3fd98b",
    icon: "🔮",
    budget: "12–20K tokens",
    duration: "~45s (parallel)",
    description: "Three independent agents read only the compressed Summary for Perspectives and Opinion from the report, then produce structured JSON perspectives from bull, bear, and macro lenses.",
    reads: [
      { file: "## Summary for Perspectives", purpose: "Compressed report handoff" },
      { file: "## Opinion YAML", purpose: "Structured opinion data" },
    ],
    produces: [
      { file: "perspectives/{ticker}.{period}.perspectives.json", purpose: "Bull + Bear + Macro JSON array" },
    ],
    subAgents: [
      { name: "Bull", color: "#3fd98b", role: "Builds strongest case for buying. Rates 1-10 from optimistic lens." },
      { name: "Bear", color: "#ff7f8c", role: "Finds every crack in the thesis. Rates 1-10 from skeptical lens." },
      { name: "Macro", color: "#f0c36a", role: "Assesses macro regime impact: rates, DXY, sector rotation, geopolitics." },
    ],
    details: [
      "Each agent reads ONLY the summary + opinion — not the full report",
      "Bull identifies strongest positive signals and catalyst path",
      "Bear identifies weakest links and highest-severity risks",
      "Macro evaluates monetary policy, liquidity, sector rotation fit",
      "All three produce structured PerspectiveOpinion JSON",
    ],
  },
  {
    id: "phase-4",
    phase: 4,
    title: "Synthesis",
    agent: "synthesis",
    color: "#c084fc",
    icon: "🧬",
    budget: "5–10K tokens",
    duration: "~20s",
    description: "The final decision-maker. Reconciles the equity report opinion, compliance grade, and three perspectives into a single actionable recommendation with position framework and monitoring checklist.",
    reads: [
      { file: "Phase 1 Summary + Opinion", purpose: "Base thesis" },
      { file: "Phase 2 Scorecard (grade only)", purpose: "Research quality check" },
      { file: "Phase 3 Perspectives JSON", purpose: "Bull/Bear/Macro views" },
    ],
    produces: [
      { file: "synthesis/{ticker}.{period}.synthesis.md", purpose: "Final recommendation" },
    ],
    details: [
      "Starts with equity rating as base, adjusts ±1 for perspective spread",
      "Adjusts ±1 for macro context (tailwind/headwind)",
      "Adjusts ±0.5 for compliance grade quality",
      "Outputs: Verdict, Perspective Reconciliation, Catalyst Timeline, Risk Matrix",
      "Includes Position Framework (entry, stop, scale triggers, exit triggers)",
    ],
  },
  {
    id: "phase-5",
    phase: 5,
    title: "Deliver",
    agent: null,
    color: "#8592aa",
    icon: "📦",
    budget: "< 1K tokens",
    duration: "~2s",
    description: "Presents the completed research package to the user with headline, synthesis summary, links to all artifacts, compliance grade, and perspective spread.",
    reads: [],
    produces: [
      { file: "User-facing summary", purpose: "Headline + links + key metrics" },
    ],
    details: [
      "Headline: {TICKER} Research Complete — {Rating}/10 ({Action})",
      "One-paragraph synthesis from Phase 4",
      "Links to report, scorecard, perspectives, synthesis files",
      "Compliance grade badge",
      "Perspective spread visualization",
    ],
  },
];

function PhaseNode({ phase, isExpanded, onToggle, isLast }) {
  const hasSubAgents = phase.subAgents && phase.subAgents.length > 0;

  return (
    <div className="wf-phase-wrapper">
      <button
        type="button"
        className={`wf-phase-card ${isExpanded ? "expanded" : ""}`}
        onClick={onToggle}
        style={{ "--phase-color": phase.color }}
      >
        <div className="wf-phase-header">
          <div className="wf-phase-icon" style={{ background: `${phase.color}22`, borderColor: `${phase.color}55` }}>
            <span>{phase.icon}</span>
          </div>
          <div className="wf-phase-title-block">
            <div className="wf-phase-label">Phase {phase.phase}</div>
            <div className="wf-phase-title">{phase.title}</div>
            {phase.agent && <div className="wf-phase-agent">Agent: {phase.agent}</div>}
          </div>
          <div className="wf-phase-stats">
            <span className="wf-stat-pill">{phase.budget}</span>
            <span className="wf-stat-pill">{phase.duration}</span>
          </div>
          <div className={`wf-chevron ${isExpanded ? "open" : ""}`}>▾</div>
        </div>

        <p className="wf-phase-desc">{phase.description}</p>
      </button>

      {isExpanded && (
        <div className="wf-phase-detail fade-in">
          {hasSubAgents && (
            <div className="wf-sub-agents">
              <div className="wf-detail-label">Sub-Agents</div>
              <div className="wf-sub-agent-row">
                {phase.subAgents.map((sa) => (
                  <div key={sa.name} className="wf-sub-agent-card" style={{ borderColor: `${sa.color}55` }}>
                    <div className="wf-sub-agent-name" style={{ color: sa.color }}>{sa.name}</div>
                    <div className="wf-sub-agent-role">{sa.role}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="wf-io-grid">
            {phase.reads.length > 0 && (
              <div className="wf-io-col">
                <div className="wf-detail-label">Reads</div>
                {phase.reads.map((r, i) => (
                  <div key={i} className="wf-io-item read">
                    <span className="wf-io-file">{r.file}</span>
                    <span className="wf-io-purpose">{r.purpose}</span>
                  </div>
                ))}
              </div>
            )}
            {phase.produces.length > 0 && (
              <div className="wf-io-col">
                <div className="wf-detail-label">Produces</div>
                {phase.produces.map((p, i) => (
                  <div key={i} className="wf-io-item write">
                    <span className="wf-io-file">{p.file}</span>
                    <span className="wf-io-purpose">{p.purpose}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {phase.details.length > 0 && (
            <div className="wf-details-list">
              <div className="wf-detail-label">How It Works</div>
              {phase.details.map((d, i) => (
                <div key={i} className="wf-detail-item">
                  <span className="wf-detail-num">{i + 1}</span>
                  <span>{d}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!isLast && (
        <div className="wf-connector">
          <div className="wf-connector-line" />
          <div className="wf-connector-arrow">↓</div>
        </div>
      )}
    </div>
  );
}

export default function WorkflowPage() {
  const [expandedPhases, setExpandedPhases] = useState(new Set([1]));

  function togglePhase(phaseId) {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phaseId)) {
        next.delete(phaseId);
      } else {
        next.add(phaseId);
      }
      return next;
    });
  }

  const totalMin = 55;
  const totalMax = 87;

  return (
    <div className="wf-page">
      <div className="wf-page-inner">
        <div className="wf-hero">
          <h1>Agent Pipeline</h1>
          <p>Multi-agent research orchestration — from ticker to investment recommendation.</p>
          <div className="wf-hero-stats">
            <div className="wf-hero-stat">
              <span className="wf-hero-stat-value">6</span>
              <span className="wf-hero-stat-label">Phases</span>
            </div>
            <div className="wf-hero-stat">
              <span className="wf-hero-stat-value">6</span>
              <span className="wf-hero-stat-label">Agents</span>
            </div>
            <div className="wf-hero-stat">
              <span className="wf-hero-stat-value">{totalMin}–{totalMax}K</span>
              <span className="wf-hero-stat-label">Token Budget</span>
            </div>
            <div className="wf-hero-stat">
              <span className="wf-hero-stat-value">31</span>
              <span className="wf-hero-stat-label">Playbooks</span>
            </div>
          </div>
        </div>

        <div className="wf-token-bar">
          <div className="wf-detail-label" style={{ marginBottom: 10 }}>Token Distribution</div>
          <div className="wf-token-track">
            {PIPELINE.filter(p => p.budget !== "< 1K tokens").map((p) => {
              const match = p.budget.match(/(\d+)/);
              const val = match ? parseInt(match[1]) : 2;
              const pct = Math.round((val / totalMax) * 100);
              return (
                <div
                  key={p.id}
                  className="wf-token-segment"
                  style={{ width: `${Math.max(pct, 4)}%`, background: p.color }}
                  title={`${p.title}: ${p.budget}`}
                >
                  <span className="wf-token-seg-label">{p.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="wf-pipeline">
          {PIPELINE.map((phase, i) => (
            <PhaseNode
              key={phase.id}
              phase={phase}
              isExpanded={expandedPhases.has(phase.phase)}
              onToggle={() => togglePhase(phase.phase)}
              isLast={i === PIPELINE.length - 1}
            />
          ))}
        </div>

        <footer className="footer" style={{ maxWidth: 860, margin: "0 auto" }}>
          <span>Analyst Research Framework</span>
          <span>Generated by Claude</span>
        </footer>
      </div>
    </div>
  );
}
