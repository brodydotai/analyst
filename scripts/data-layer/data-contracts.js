// ─── DATA CONTRACTS ────────────────────────────────────────────────────────
// Defines the minimum data each playbook needs before the equity agent writes.
// If a field is missing, the report can still generate — but data_confidence drops.
//
// Structure:
//   required:  must-have fields. Each miss drops data_confidence by ~0.05
//   preferred: nice-to-have fields. Each miss drops data_confidence by ~0.02
//   macro:     always-needed macro context (shared across all playbooks)

export const MACRO_CONTRACT = {
  required: [
    "fed_funds_rate",       // FRED: DFF
    "treasury_10y",         // FRED: DGS10
    "treasury_2y",          // FRED: DGS2
    "cpi_yoy",              // FRED: CPIAUCSL (compute YoY)
  ],
  preferred: [
    "yield_curve_spread",   // FRED: T10Y2Y
    "unemployment",         // FRED: UNRATE
    "dxy",                  // FRED: DTWEXBGS
    "m2_money_supply",      // FRED: M2SL
    "wti_crude",            // FRED: DCOILWTICO
    "gold_price",           // FRED: GOLDAMGBD228NLBM
  ],
};

// Base contract — every ticker needs these regardless of playbook
export const BASE_CONTRACT = {
  required: [
    "current_price",
    "market_cap",
    "52w_high",
    "52w_low",
  ],
  preferred: [
    "pe_ratio",
    "eps",
    "beta",
    "avg_volume",
    "revenue_ttm",
    "gross_margin",
    "operating_margin",
    "free_cash_flow",
    "debt_to_equity",
    "dividend_yield",
    "sector",
    "industry",
    "short_percent_of_float",
    "analyst_target_mean",
    "analyst_recommendation",
  ],
};

// Sector-specific overrides — these fields become required for their playbook
export const SECTOR_CONTRACTS = {
  "semiconductors-and-accelerators": {
    required: [
      "revenue_by_segment",
      "gross_margin",
      "rd_expense",
      "customer_concentration",
    ],
    preferred: [
      "capex",
      "inventory_levels",
      "deferred_revenue",
    ],
  },
  "uranium-and-nuclear-fuel": {
    required: [
      "production_volume",
      "uranium_spot_price",
      "cash_position",
    ],
    preferred: [
      "contracted_sales",
      "reserve_estimates",
      "rare_earth_revenue",
    ],
  },
  "precious-metal-miners": {
    required: [
      "production_volume",
      "aisc_per_oz",
      "commodity_spot_price",
    ],
    preferred: [
      "reserve_life",
      "mine_count",
      "exploration_budget",
    ],
  },
  "oil-and-gas": {
    required: [
      "production_boed",
      "revenue_by_segment",
      "wti_crude",
    ],
    preferred: [
      "proved_reserves",
      "breakeven_price",
      "hedging_coverage",
    ],
  },
  "bitcoin-mining-and-crypto-infrastructure": {
    required: [
      "hashrate",
      "btc_production_cost",
      "power_capacity_mw",
    ],
    preferred: [
      "btc_holdings",
      "fleet_efficiency_jth",
      "power_cost_kwh",
    ],
  },
  "shipping-and-maritime": {
    required: [
      "fleet_size",
      "tce_day_rate",
      "charter_coverage",
    ],
    preferred: [
      "orderbook_pct",
      "fleet_age",
      "nav_per_share",
    ],
  },
  // All other playbooks use BASE_CONTRACT only
  // The base is robust enough for generalist coverage
  "_default": {
    required: [],
    preferred: [
      "revenue_growth_3y",
      "fcf_conversion",
      "insider_ownership",
    ],
  },
};

// Compute data_confidence from coverage
export function computeDataConfidence(filledFields, contract, sectorContract) {
  let score = 1.0;

  const allRequired = [
    ...MACRO_CONTRACT.required,
    ...BASE_CONTRACT.required,
    ...(sectorContract?.required || []),
    ...(contract?.required || []),
  ];
  const allPreferred = [
    ...MACRO_CONTRACT.preferred,
    ...BASE_CONTRACT.preferred,
    ...(sectorContract?.preferred || []),
    ...(contract?.preferred || []),
  ];

  for (const field of allRequired) {
    if (!filledFields.has(field)) score -= 0.05;
  }
  for (const field of allPreferred) {
    if (!filledFields.has(field)) score -= 0.02;
  }

  return Math.max(0, Math.min(1, Math.round(score * 100) / 100));
}
