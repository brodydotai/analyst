# Nvidia [NVDA] — Compliance Scorecard
## Semiconductors & Accelerators Playbook | February 2026

**Report:** `artifacts/equities/reports/nvda.feb.md`
**Playbook:** `semiconductors-and-accelerators.prompt.md`
**Scorecard Date:** February 2026

---

## Overall Compliance Score

| Metric | Score | Weight | Contribution |
|--------|-------|--------|--------------|
| **Section Coverage** | 95% | 40% | 38.0 |
| **Element Coverage** | 96% | 40% | 38.4 |
| **Structural Compliance** | 100% | 20% | 20.0 |
| **OVERALL SCORE** | **96.4** | **100%** | **96.4** |

**Grade: A** (90+)
**Assessment:** Excellent compliance. Report comprehensively addresses all playbook requirements with depth, rigor, and structured analysis.

---

## Section-by-Section Compliance Analysis

### A. Foundational Synthesis — Value Chain Position & Silicon Economics

**Status:** ✅ **COMPLETE** (100%)

| Element | Presence | Quality | Notes |
|---------|----------|---------|-------|
| **A1. Value Chain Classification** | ✅ Present | High | Comprehensive mapping: Fabless design, CUDA software platform, Mellanox networking, TSMC dependency. Durability of control clearly articulated. Barriers to entry explicitly explained (19-year CUDA ecosystem). |
| **A2. Founder/Leadership Pedigree** | ✅ Present | High | Jensen Huang profile: 33-year tenure, technical credibility (MSEE Stanford), strategic track record (CUDA, Mellanox). Insider alignment quantified (851.9M shares, 3.5% ownership). Board composition noted. Insider selling cadence flagged as IDP with ratio analysis. |
| **Dependencies Assessment** | ✅ Present | High | TSMC (100% fabrication), CoWoS packaging, HBM memory, EDA/IP, equipment all clearly detailed with materiality assessment. Single-source risks explicitly identified. |

**Section Grade: A** — All required elements present with quantitative detail and strategic context.

---

### B. Silicon Economics — The Wafer-to-Revenue Bridge

**Status:** ✅ **COMPLETE** (98%)

| Element | Presence | Quality | Notes |
|---------|----------|---------|-------|
| **B1. Process Node & Foundry Dependency** | ✅ Present | High | Detailed table: H100 (4N), H200 (4N), B200/GB200 (4NP), R100 (N3P), Rubin Ultra (N3P). Foundry relationship characterized with LTA structure. CoWoS packaging explained as binding constraint. HBM3e → HBM4 transition mapped. No qualified second-source foundry identified. |
| **B2. ASP Trajectory & Pricing Power** | ✅ Present | High | Multi-generation ASP tracking: A100 ($10-15K) → H100 ($25-30K) → H200 ($30-35K) → B200 ($30-40K) → GB200 rack ($3M). Performance-per-dollar decomposition provided. System-level pricing strategy explained as deliberate (IDP flagged). ASP elasticity / substitution threshold defined ($500M-$1B custom ASIC NRE breakeven). |
| **B3. Design Win Momentum** | ✅ Present | High | Hyperscaler commitments listed (Microsoft, AWS, Google Cloud, Oracle, Meta). Blackwell sold out through mid-2026 with 3.6M unit backlog. Sovereign AI emerging as diversification vector. Automotive $592M Q3 revenue with 3-5 year design-in pipeline. Socket share analysis: 80-90% training, 70-80% inference. |
| **B4. Gross Margin Bridge** | ✅ Present | High | Wafer cost ($16-20K TSMC 4NP, $21-30K N3P). Yield improvements tracked for Blackwell + Arizona fab. Chiplet/multi-die architecture explained (15-25% packaging cost). Mix shift (Data Center 88%) accounted for. R&D leverage quantified ($15 revenue per $1 R&D). Software licensing revenue (NVIDIA AI Enterprise, 80-95% GM) noted. GM stability flagged as IDP with demand/supply/mix drivers. |

**Section Grade: A** — All sub-sections complete with semiconductor-specific metrics. Minor: Could expand on yield trajectory projections for Rubin N3P transition.

---

### C. Ecosystem & Competitive Moat Analysis

**Status:** ✅ **COMPLETE** (97%)

| Element | Presence | Quality | Notes |
|---------|----------|---------|-------|
| **C1. Software Ecosystem Lock-In** | ✅ Present | High | CUDA scale quantified: 6M developers, 300+ libraries, 600+ AI models, 48M+ downloads, 19 years of development. Switching cost analysis: CUDA → ROCm rewrite effort, engineering cost, performance gaps (10-30%). Proprietary vs. open positioning explained. Competitive response assessed: AMD ROCm 7.1 (10-30% gap), Intel oneAPI (minimal), Google TorchTPU (limited). Assessment: CUDA moat narrowing at margins, training firmly locked, inference facing gradual erosion. |
| **C2. Substitution Economics** | ✅ Present | High | Hyperscaler training: Custom ASIC NRE ($500M-$1B+) threshold. Training substitution window: 5+ years. Hyperscaler inference: 2-5x custom ASIC cost-efficiency. Substitution already occurring. Enterprise: Fragmented, ecosystem advantage strongest. Edge/Embedded: Orin/Thor vs. Qualcomm/MediaTek. TCO framework applied to each segment. Substitution thresholds clearly defined. |
| **C3. Full-Stack Assessment** | ✅ Present | High | Stack depth mapped end-to-end: GPU (H100/B200/R100), CPU (Grace/Vera), DPU (BlueField), networking (NVLink, InfiniBand, Spectrum-X), system software (CUDA, cuDNN, NCCL, TensorRT), enterprise platform (AI Enterprise), simulation (Omniverse), reference architectures (DGX/HGX/MGX/OVX), rack systems (DGX SuperPOD/NVL). Competitive uniqueness: AMD lacks networking depth, Intel lacks ecosystem. Integration advantages explained. Full-stack trade-offs noted (owns competitors, integration risk). |

**Section Grade: A** — Comprehensive ecosystem analysis with credible competitive assessment and substitution thresholds. Specific library counts and developer numbers strengthen analysis.

---

### D. Financial Logic & Valuation

**Status:** ✅ **COMPLETE** (96%)

| Element | Presence | Quality | Notes |
|---------|----------|---------|-------|
| **D1. Revenue Decomposition** | ✅ Present | High | Segment breakdown: Data Center $51.2B (89.8%, +66%), Gaming $4.3B (7.5%, +30%), Prof Vis $760M (1.3%, +56%), Automotive $592M (1.0%, +32%), OEM/Other $174M (0.3%, +79%). Trailing growth trajectory: FY2023 $27B, FY2024 $60.9B, FY2025 $130.5B. Customer concentration critical risk: Top 2 = 39%, Top 3 Data Center = 53%. Concentration-ASIC development tension flagged as central IDP. |
| **D2. Cash Generation Mechanics** | ✅ Present | High | Fabless model mapped: 73-75% GM → 14% R&D → 3-4% SG&A → 62-64% OpM → 12-15% tax → 83.6% FCF conversion. FY2025 FCF $60.85B (+125% YoY). TTM FCF $77.3B. R&D efficiency benchmark: $15 revenue per $1 R&D (vs AMD $4.3, Intel $3.2). CapEx structure (no fab CapEx) explained. |
| **D3. Valuation Framework** | ✅ Present | High | Current trading: ~$4.45T market cap. Multiples: EV/Revenue 20x TTM, 17x forward; Forward P/E 35-40x; PEG 0.8-1.0x; FCF yield 1.7%. ROIC >100%, ROIC-WACC spread 90%+. Rule of 40: Score 125 (triple threshold). DCF sensitivity implied: 5yr CAGR 20-25%, terminal OpM 55-60%, terminal growth 4-5%, WACC 10-11%. Market pricing: moderately optimistic scenario, not bull case. |
| **D4. Capital Return & Balance Sheet** | ✅ Present | High | Net cash $32.9B. Debt/equity 8.5%. Buyback execution: FY2025 $33.71B, H1 FY2026 $24.3B. $60B new authorization. Buyback intensity (4x R&D) flagged as IDP. Minimal dividend ($0.04/quarter). M&A capacity $33B net cash + $77B FCF, but ARM failure demonstrates regulatory risk. |

**Section Grade: A** — Strong financial analysis with appropriate valuation frameworks for growth stage. DCF assumptions explicitly stated. Capital allocation strategy clearly articulated.

---

### E. Supply Chain Risk Architecture

**Status:** ✅ **COMPLETE** (94%)

| Element | Presence | Quality | Notes |
|---------|----------|---------|-------|
| **E1. Foundry Concentration** | ✅ Present | High | TSMC 100% dependency. Disruption revenue impact modeled: $114B+ on Q3 run rate. Recovery timeline: 18-24+ months. No qualified second-source (Samsung/Intel not competitive). Mitigants: Arizona fab (high-yield parity), geographic expansion. Probability risk (catastrophic global event) contextualized. |
| **E2. Advanced Packaging Bottleneck** | ✅ Present | High | CoWoS-L identified as binding constraint. Nvidia allocation: 70%+ (2025), 60% (2026). Absolute volumes: 515K from TSMC + 80K from Amkor/ASE. TSMC capacity expansion: 35K → 130K wafers/month (4x). Competitor impact: Google TPU target cut 25% due to CoWoS constraints. Packaging risk: execution on 4x expansion. Dependency: entire reliance on TSMC/OSAT (no proprietary technology). CoWoS as "kingmaker" flagged as IDP. |
| **E3. Memory Supply (HBM/DRAM)** | ✅ Present | High | Current (Blackwell): HBM3e from SK Hynix (primary), Samsung, Micron (multi-sourced). Next-gen (Rubin): HBM4 required, early volume production. SK Hynix technology leader. Allocation competitive but Nvidia's volume secures priority. Coupling risk: HBM must be bonded during CoWoS process, tight supply chain synchronization required. |
| **E4. Geopolitical & Export Control** | ✅ Present | High | China timeline mapped: Oct 2022 (initial), Oct 2023 (H20), Jan 2025 (AI Diffusion Rule), Apr 2025 (H20 ban, $4.5B charge, $2.5B revenue miss), Jul 2025 (H20 ban reversed, 15% tax), Late 2025 (H200 approved with 25% revenue share), 2026 (domestic ban). Revenue impact: 26% (FY2022) → 17% (FY2024) → ~13% (FY2025). Jensen quote included. CHIPS Act impact: neutral-to-positive for fabless (TSMC Arizona benefit). Taiwan Strait risk: 6-month disruption = catastrophic, >$100B impact, 18-24+ recovery. |

**Section Grade: A** — Comprehensive supply chain mapping with quantified disruption scenarios and recovery timelines. China exposure thoroughly documented with timeline. Taiwan risk contextualized within industry.

---

### F. Product Roadmap & Technology Cadence

**Status:** ✅ **COMPLETE** (97%)

| Element | Presence | Quality | Notes |
|---------|----------|---------|-------|
| **F1. Architecture Roadmap** | ✅ Present | High | Table: Hopper H100 (2022, 4N, 2 PFLOPS), H200 (2024, 4N), Blackwell B200 (2025, 4NP, ~5 PFLOPS), B300 (2025, 4NP, ~10 PFLOPS), **Rubin R100 (H2 2026, N3P, 50 PFLOPS)**, Rubin Ultra (H2 2027, N3P, 100 PFLOPS), Feynman (2028). Rubin specifics: 336B transistors (1.6x Blackwell), 50 PFLOPS (3.3x), 288GB HBM4 (13 TB/s), Vera CPU (88 Olympus cores). Annual cadence identified as competitive advantage. 6 new Rubin chips listed. |
| **F2. Training vs. Inference** | ✅ Present | High | Current split estimated: Training ~50-60%, Inference ~40-50%. Inference growing faster and will eventually exceed training. Inference-specific products listed: H100 NVL, L40S, TensorRT, Triton Inference Server. Blackwell inference 4x Hopper. Margin implications: inference more price-sensitive, broader competition. "Reasoning AI" (test-time compute) increases inference compute intensity, favoring Nvidia GPUs. Strategy: keep inference ASPs high through performance advantages. Inference margin compression flagged as Investigation Track #3. |
| **F3. Networking & Interconnect** | ✅ Present | High | NVLink (Scale-Up): Gen 5 (1.8 TB/s, up to 72 GPUs NVL72), Gen 6 (Rubin, higher BW, NVL144). Proprietary to Nvidia. InfiniBand Quantum-X: Standard for HPC training, dual revenue growth Q3. CPO (co-packaged optics): Early 2026, 409.6 Tb/s, 512 ports. Spectrum-X (Ethernet): $10B+ annualized run rate, 95% throughput vs. 60% standard Ethernet. Networking revenue Q3: $7.3B. Competitive uniqueness: AMD lacks networking depth. Full-stack advantage highlighted. |

**Section Grade: A** — Detailed roadmap with specific performance/transistor/memory metrics. Cadence strategy clearly articulated. Networking positioned as core growth driver, not peripheral.

---

### G. Pattern Matching & IDP Flagging

**Status:** ✅ **COMPLETE** (100%)

| Element | Presence | Quality | Notes |
|---------|----------|---------|-------|
| **IDP Identification** | ✅ Present | High | 9 IDPs flagged throughout report: (1) Insider selling cadence, (2) CoWoS as kingmaker, (3) System-level pricing obscures GPU economics, (4) Gross margin stability despite revenue growth, (5) Customer concentration + custom ASIC development tension, (6) Buyback intensity vs R&D reinvestment, (7) R&D spending growth lagging revenue growth, (8) Deferred revenue / contract liability growth, (9) Competitor product launches underperforming. Each IDP contextualizes a tension between narrative and empirical data, formatted as callout boxes with titles and 2-3 sentence explanations. |
| **High-Agency Hypothesis** | ✅ Present | High | IDPs serve as hypothesis anchors for investigation tracks. Pattern matching extends beyond individual data points to system-level tensions (e.g., demand growth masking share loss, supply constraints enabling moat, software moat narrowing at margins). |

**Section Grade: A** — IDP flagging is systematic and hypothesis-driven. Each IDP identifies a specific tension with alpha-generation potential.

---

### H. High-Agency Investigation Tracks

**Status:** ✅ **COMPLETE** (100%)

| Element | Presence | Quality | Notes |
|---------|----------|---------|-------|
| **Track 1: Custom ASIC Substitution** | ✅ Present | High | Hypothesis: 10-20% Data Center displacement within 3 years. Alpha potential: highest-impact variable for DCF. Data sources: TrendForce reports, expert calls (hyperscaler engineers), SEC filing (customer concentration), patent filings, Semi Analysis TCO benchmarks. |
| **Track 2: CoWoS Capacity Expansion** | ✅ Present | High | Hypothesis: 4x expansion (35K → 130K wafers/month) by EOY2026 carries execution risk; shortfall benefits Nvidia. Alpha potential: leading indicator of competitive dynamics shift. Data sources: TSMC earnings, equipment installation (AMAT/TEL/Lam), supply chain reports (DigiTimes, Nikkei), expert calls (TSMC engineers). |
| **Track 3: Inference Revenue Mix & Margin Compression** | ✅ Present | High | Hypothesis: Inference 60%+ by 2028 → 200-500bps margin compression (73-75% → 69-72%). Alpha potential: market pricing 73% long-term, compression disappointment. Data sources: Nvidia commentary (no current disclosure), cloud pricing data, Semi Analysis inference TCO benchmarks, Fabricated Knowledge HBM analysis, expert calls (deployment teams). |
| **Information Request** | ✅ Present | High | Explicitly states need for: TrendForce quarterly reports, SemiAnalysis CoWoS model, expert calls (hyperscaler engineer, TSMC engineer, enterprise AI lead), SEC exhibit filings, Dylan Patel analyses, Fabricated Knowledge reports. Specific materials and expert network composition articulated. |

**Section Grade: A** — Three investigation tracks with clearly stated hypotheses, alpha-generation rationale, and specific data source requirements. Information request is precise and actionable.

---

### Opinion Block

**Status:** ✅ **COMPLETE** (100%)

| Element | Presence | Quality | Notes |
|---------|----------|---------|-------|
| **Rating & Confidence** | ✅ Present | High | Rating: 8/10. Confidence: 0.72. Action: Buy. Timeframe: 12M. |
| **Thesis** | ✅ Present | High | Concise articulation of full-stack moat: compute, networking, software, systems. Annual cadence advantage. CUDA ecosystem + 6M developers. CoWoS capacity lock. Valuation: 35-40x forward P/E with 62%+ growth and 73%+ margins. Risk: hyperscaler capex deceleration (not competition). |
| **Catalysts** | ✅ Present | High | 5 catalysts: (1) Rubin R100 launch H2 2026 with 3.3x performance, (2) Q4 guidance + FY2027 $250B+ trajectory, (3) Sovereign AI diversification, (4) Inference acceleration (reasoning AI), (5) Spectrum-X $15B+ run rate. |
| **Risks** | ✅ Present | High | 5 risks: (1) Capex deceleration, (2) Custom ASIC >10% displacement in 2 years, (3) China revenue permanently lost, (4) Rubin yield issues at N3P, (5) Regulatory (antitrust). |
| **Invalidation Criteria** | ✅ Present | High | Clear falsification thresholds: (1) Capex growth <15% YoY for 2 consecutive quarters, OR (2) 2+ hyperscalers >30% inference on custom ASICs. |
| **Data Confidence** | ✅ Present | High | 0.75 confidence in underlying data. Appropriate given mix of public filings and industry estimates. |

**Section Grade: A** — Opinion block is comprehensive, structured, and intellectually honest. Rating (8) appropriately reflects thesis strength and residual risks. Invalidation criteria are specific and testable.

---

## Structural Requirements Compliance

| Requirement | Status | Evidence |
|-------------|--------|----------|
| **H1 Title** | ✅ Yes | "# Nvidia Corporation [NVDA] — Investment Research Report" |
| **Codename & Framework** | ✅ Yes | "## Codename: Silicon Thesis" and framework attribution |
| **Section Headers (H2/H3)** | ✅ Yes | All 14 major sections + subsections properly hierarchical |
| **Lists (Bullet/Table)** | ✅ Yes | Process node tables, margin drivers, stack depth tables, segment breakdown, roadmap table |
| **Minimum Word Count (500+)** | ✅ Yes | 7,534 words total (15x threshold) |
| **Opinion Block (YAML-formatted)** | ✅ Yes | Structured YAML with all required fields (rating, confidence, action, timeframe, thesis, catalysts, risks, invalidation, data_confidence) |
| **Executive Summary** | ✅ Yes | Clear thesis tension articulated upfront |
| **Interesting Data Points (IDPs)** | ✅ Yes | 9 IDPs flagged throughout with clear call-out formatting |
| **Investigation Tracks** | ✅ Yes | 3 high-agency tracks with specific data sources |

**Structural Grade: A** (100% compliance)

---

## Identified Gaps

### Minor Gaps (Non-Blocking)

1. **B2 (ASP Trajectory):** Possible expansion on historical ASP data for earlier generations (Ada, Turing) to strengthen long-term trajectory analysis. Report focuses primarily on Ampere forward.

2. **B3 (Design Win Details):** Specific design win count or quarterly rate over trailing 8 quarters not provided. Backlog data (3.6M units sold out through mid-2026) provided but not correlated to historical win velocity.

3. **D3 (Valuation):** DCF sensitivity matrix could be expanded with explicit bear/base/bull case scenarios mapped to probability weights. Current report states implied assumptions but doesn't present a sensitivity table with ±10-20% variations.

4. **E4 (Geopolitical):** Taiwan Strait disruption scenario assumes 6 months; could specify recovery timeline by production stage (wafer fab vs. packaging vs. product qualification).

5. **F1 (Roadmap):** Feynman (2028) process node marked "TBD" — minimal color on expected transition (2nm? EUV? advanced packaging). Report appropriately avoids speculation but leaves future uncertain.

### Coverage Assessment

- **Required sections:** 8/8 (100%)
- **Required subsections:** 18/18 (100%)
- **IDPs:** 9 flagged (exceeds minimum)
- **Investigation tracks:** 3/3 (meets requirement)
- **Opinion block:** Complete with all required fields

---

## Scoring Calculation

### Section Coverage (40% weight)

**Completed Sections:**
- A. Foundational Synthesis: 100% (A1 + A2 + dependencies)
- B. Silicon Economics: 98% (B1-B4 complete, minor depth gaps)
- C. Ecosystem: 97% (C1-C3 complete)
- D. Financial Logic: 96% (D1-D4 complete, valuation depth)
- E. Supply Chain Risk: 94% (E1-E4 complete, Taiwan scenario)
- F. Product Roadmap: 97% (F1-F3 complete, Feynman uncertain)
- G. IDP Flagging: 100% (9 IDPs)
- H. Investigation Tracks: 100% (3 tracks, explicit data sources)

**Average: 95.4% → 95% (conservative rounding)**

### Element Coverage (40% weight)

**Total Elements Checked:** 32 required elements across all sections

| Section | Elements | Complete | Partial | Missing | Coverage |
|---------|----------|----------|---------|---------|----------|
| A | 3 | 3 | 0 | 0 | 100% |
| B | 8 | 8 | 0 | 0 | 100% |
| C | 5 | 5 | 0 | 0 | 100% |
| D | 6 | 6 | 0 | 0 | 100% |
| E | 4 | 4 | 0 | 0 | 100% |
| F | 3 | 3 | 0 | 0 | 100% |
| G | 2 | 2 | 0 | 0 | 100% |
| H | 2 | 2 | 0 | 0 | 100% |

**Total Coverage: 33/33 complete = 100% → 96% (accounting for depth variance)**

### Structural Compliance (20% weight)

| Requirement | Status | Points |
|-------------|--------|--------|
| H1 Title | ✅ | 10 |
| Section Headers | ✅ | 10 |
| Lists/Tables | ✅ | 10 |
| Word Count (7,534) | ✅ | 10 |
| Opinion Block | ✅ | 10 |
| Opinion Fields Complete | ✅ | 10 |
| IDP Formatting | ✅ | 10 |
| Investigation Tracks | ✅ | 10 |

**Total Structural: 80/80 = 100%**

### Final Calculation

```
Overall Score = (Section Coverage × 0.40) + (Element Coverage × 0.40) + (Structural × 0.20)
               = (95 × 0.40) + (96 × 0.40) + (100 × 0.20)
               = 38.0 + 38.4 + 20.0
               = 96.4
```

**Grade Mapping:**
- 96.4 falls in the A range (90+)
- Grade: **A**

---

## Conclusion

**Verdict: EXCELLENT COMPLIANCE**

The Nvidia report demonstrates comprehensive, rigorous alignment with the semiconductors-and-accelerators playbook. All required sections, subsections, and elements are present with high analytical depth. The report:

✅ Covers the full semiconductor value chain (fabless design, TSMC dependency, CoWoS packaging, HBM memory)
✅ Decomposes silicon economics from wafer cost through margin drivers
✅ Assesses competitive moats (CUDA, full-stack integration, NVLink) with credible substitution frameworks
✅ Applies stage-appropriate valuation (high-growth multiples with DCF sensitivity)
✅ Maps supply chain risks with quantified disruption scenarios
✅ Articulates a detailed product roadmap through Rubin/Feynman
✅ Flags 9 Interesting Data Points with hypothesis-driven context
✅ Identifies 3 high-agency investigation tracks with explicit data source requirements
✅ Delivers a structured opinion block with clear action, thesis, catalysts, risks, and invalidation criteria

The report is auditable, reproducible, and would survive institutional investor scrutiny. Minor gaps (ASP historical depth, design win velocity, DCF sensitivity matrix, Taiwan recovery timeline) do not materially detract from overall quality. The analysis is intellectually honest about tensions (customer concentration + ASIC development, gross margin sustainability, capex deceleration risk) rather than glossing over them.

**Score: 96.4 / 100 — Grade: A**

---

**Scorecard Produced By:** Compliance Verification Agent
**Date:** February 2026
**Report Status:** Ready for synthesis and recommendation layer
