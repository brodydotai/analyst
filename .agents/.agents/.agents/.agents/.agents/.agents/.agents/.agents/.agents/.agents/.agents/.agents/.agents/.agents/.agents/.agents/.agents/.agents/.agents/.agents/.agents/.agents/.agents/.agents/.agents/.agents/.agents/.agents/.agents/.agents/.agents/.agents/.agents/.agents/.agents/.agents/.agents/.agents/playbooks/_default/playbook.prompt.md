# Default Equity Research Playbook

Use this playbook when no sector-specific playbook matches the ticker. It provides a general-purpose framework for analyzing any publicly traded company.

## A. Business Overview & Competitive Position

### Required Elements
- Company description: what it does, who it serves, how it makes money
- Revenue model classification (subscription, transactional, project-based, licensing, hybrid)
- Market position and share (leader, challenger, niche, emerging)
- Key competitive advantages (brand, IP, network effects, switching costs, scale, regulatory moat)
- Management quality: founder-led vs. professional management, tenure, insider ownership
- Customer concentration: top 5 customers as % of revenue (>30% = material risk)

### Optional Elements
- TAM/SAM/SOM estimation with methodology
- Competitor mapping (direct and indirect)
- Recent strategic pivots or transformations

## B. Financial Analysis

### Required Elements
- Revenue decomposition by segment/product/geography
- 3-year revenue growth trajectory and drivers
- Gross margin analysis and trend (expanding, stable, compressing)
- Operating leverage: SG&A and R&D as % of revenue, trajectory
- Free cash flow generation and conversion (FCF/Net Income)
- Balance sheet health: net debt, debt/EBITDA, interest coverage, maturity schedule
- Capital allocation: dividends, buybacks, M&A, capex as % of CFO
- Working capital efficiency: DSO, DIO, DPO trends

### Optional Elements
- Unit economics (CAC, LTV, payback period) if applicable
- Cohort analysis for subscription businesses
- Segment-level margin analysis

## C. Valuation

### Required Elements
- Current trading multiples: P/E, EV/EBITDA, EV/Revenue, P/FCF
- Historical multiple range (3-year) and current position within range
- Peer comparison: at least 3 comparable companies with same multiples
- Forward estimates: consensus revenue and EPS for next 2 fiscal years
- Valuation methodology appropriate to business model:
  - High-growth (>20% revenue CAGR): EV/Revenue, PEG ratio
  - Mature/profitable: Forward P/E, EV/EBITDA
  - Asset-heavy: P/B, EV/Invested Capital
  - Pre-profit: EV/Revenue with path-to-profitability analysis

### Optional Elements
- DCF with sensitivity table (growth rate x discount rate x terminal multiple)
- Sum-of-parts if conglomerate or multi-segment
- Precedent M&A transactions

## D. Growth Drivers & Catalysts

### Required Elements
- 3-5 specific near-term catalysts (0-12 months) with expected timing
- Secular tailwinds supporting multi-year growth thesis
- Product roadmap or expansion strategy
- Regulatory or policy catalysts (positive or negative)

### Optional Elements
- TAM expansion opportunities
- International expansion potential
- M&A pipeline or strategic partnership potential

## E. Risk Assessment

### Required Elements
- Top 3-5 material risks, ranked by severity and probability
- Competitive threats: who could displace them and how
- Regulatory/legal risks specific to the company
- Macro sensitivity: interest rate, FX, commodity, demand cycle exposure
- Key-person risk and succession planning
- Thesis invalidation: the specific condition that breaks the investment case

### Optional Elements
- Short interest and short thesis analysis
- Insider selling patterns
- Litigation or IP risk

## F. Pattern Matching & Interesting Data Points

### Required Elements
- Flag any anomalies, divergences, or non-obvious patterns in the data
- Compare to historical analogs if applicable
- Note any discrepancies between narrative and financial reality

### Optional Elements
- Insider transaction analysis
- Options market positioning (put/call skew, unusual activity)
- Institutional ownership changes (13F analysis)

## G. Investigation Tracks

### Required Elements
- Identify 2-3 high-value investigation tracks
- For each: state the hypothesis, explain the alpha rationale, specify data needed
- These should be the questions that, if answered, would most change conviction

## Structural Requirements

- Report must begin with an Executive Summary (3-5 sentences)
- All financial claims must cite sources
- Report must end with `## Opinion` block (YAML) and `## Summary for Perspectives` (400-700 words)
- Minimum 500 words total
- Use markdown headers for all sections
- Include at least one data table or comparison
