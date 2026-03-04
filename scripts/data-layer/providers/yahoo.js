// ─── YAHOO FINANCE PROVIDER ─────────────────────────────────────────────────
// Fetches pricing, fundamentals, and analyst data via yahoo-finance2.
// No API key required. Rate limits apply (~2000 requests/hour).
//
// Maps Yahoo's field names to our evidence_bundle contract fields.

import yahooFinance from "yahoo-finance2";

const FIELD_MAP = {
  // Price
  currentPrice:          "current_price",
  regularMarketPrice:    "current_price",
  fiftyTwoWeekHigh:      "52w_high",
  fiftyTwoWeekLow:       "52w_low",
  regularMarketVolume:   "avg_volume",

  // Fundamentals
  marketCap:             "market_cap",
  trailingPE:            "pe_ratio",
  trailingEps:           "eps",
  beta:                  "beta",
  totalRevenue:          "revenue_ttm",
  grossMargins:          "gross_margin",
  operatingMargins:      "operating_margin",
  freeCashflow:          "free_cash_flow",
  debtToEquity:          "debt_to_equity",
  dividendYield:         "dividend_yield",
  shortPercentOfFloat:   "short_percent_of_float",

  // Classification
  sector:                "sector",
  industry:              "industry",

  // Analyst
  targetMeanPrice:       "analyst_target_mean",
  recommendationKey:     "analyst_recommendation",

  // Financial health
  totalCash:             "cash_position",
  totalDebt:             "total_debt",
  revenueGrowth:         "revenue_growth_yoy",
  earningsGrowth:        "earnings_growth_yoy",
  returnOnEquity:        "roe",
  currentRatio:          "current_ratio",
};

export async function gatherYahooData(ticker) {
  const results = {};
  const errors = [];

  try {
    // quoteSummary gives us the richest data set
    const quote = await yahooFinance.quoteSummary(ticker, {
      modules: [
        "price",
        "summaryDetail",
        "defaultKeyStatistics",
        "financialData",
        "earningsTrend",
        "recommendationTrend",
      ],
    });

    // Flatten all modules into a single object
    const flat = {};
    for (const mod of Object.values(quote)) {
      if (mod && typeof mod === "object") {
        Object.assign(flat, mod);
      }
    }

    // Map Yahoo fields → our contract fields
    for (const [yahooKey, contractKey] of Object.entries(FIELD_MAP)) {
      const val = flat[yahooKey];
      if (val !== undefined && val !== null) {
        results[contractKey] = val;
      }
    }

    // Compute some derived fields
    if (results.revenue_ttm && results.free_cash_flow) {
      results.fcf_conversion = Math.round((results.free_cash_flow / results.revenue_ttm) * 100) / 100;
    }

  } catch (e) {
    errors.push(`quoteSummary: ${e.message}`);
  }

  // Also grab historical price for context
  try {
    const hist = await yahooFinance.chart(ticker, {
      period1: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      interval: "1wk",
    });
    if (hist?.quotes?.length > 0) {
      const closes = hist.quotes.map(q => q.close).filter(Boolean);
      results.price_52w_data_points = closes.length;
      results.price_52w_min = Math.min(...closes);
      results.price_52w_max = Math.max(...closes);
    }
  } catch (e) {
    errors.push(`chart: ${e.message}`);
  }

  return {
    source: "yahoo",
    status: errors.length === 0 ? "ok" : Object.keys(results).length > 5 ? "partial" : "failed",
    data: results,
    errors,
    fields_filled: Object.keys(results),
  };
}
