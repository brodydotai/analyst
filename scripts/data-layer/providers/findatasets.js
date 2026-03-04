// ─── FINDATASETS PROVIDER ──────────────────────────────────────────────────
// Fetches SEC filings, financial statements, financial metrics,
// analyst estimates, earnings snapshots, company facts, and insider trades
// from api.financialdatasets.ai
//
// Auth: X-API-KEY header
// Docs: https://docs.financialdatasets.ai

const BASE = "https://api.financialdatasets.ai";

// ─── Helpers ──────────────────────────────────────────────────────────────

async function apiFetch(path, apiKey, params = {}) {
  const url = new URL(path, BASE);
  for (const [k, v] of Object.entries(params)) {
    if (v != null) url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.toString(), {
    headers: { "X-API-KEY": apiKey },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Findatasets ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

// Wrap every endpoint so failures return { error } instead of throwing
function safe(fn) {
  return async (...args) => {
    try { return await fn(...args); }
    catch (e) { return { error: e.message }; }
  };
}

// ─── Financial Statements ─────────────────────────────────────────────────

const fetchIncomeStatements = safe(async (ticker, apiKey, period = "annual", limit = 2) => {
  const data = await apiFetch("/financials/income-statements", apiKey, { ticker, period, limit });
  return data.income_statements || [];
});

const fetchBalanceSheets = safe(async (ticker, apiKey, period = "annual", limit = 2) => {
  const data = await apiFetch("/financials/balance-sheets", apiKey, { ticker, period, limit });
  return data.balance_sheets || [];
});

const fetchCashFlowStatements = safe(async (ticker, apiKey, period = "annual", limit = 2) => {
  const data = await apiFetch("/financials/cash-flow-statements", apiKey, { ticker, period, limit });
  return data.cash_flow_statements || [];
});

// ─── Financial Metrics ────────────────────────────────────────────────────
// Pre-computed ratios: valuation, profitability, efficiency, liquidity, leverage, growth, per-share

const fetchFinancialMetrics = safe(async (ticker, apiKey, period = "annual", limit = 2) => {
  const data = await apiFetch("/financial-metrics", apiKey, { ticker, period, limit });
  return data.financial_metrics || [];
});

// Also fetch TTM metrics for latest trailing-twelve-month view
const fetchFinancialMetricsTTM = safe(async (ticker, apiKey) => {
  const data = await apiFetch("/financial-metrics", apiKey, { ticker, period: "ttm", limit: 1 });
  return data.financial_metrics?.[0] || null;
});

// ─── Analyst Estimates ────────────────────────────────────────────────────
// EPS and revenue estimates (internal model, tracks consensus <1% deviation)

const fetchAnalystEstimates = safe(async (ticker, apiKey, period = "annual") => {
  const data = await apiFetch("/analyst-estimates", apiKey, { ticker, period });
  return data.analyst_estimates || [];
});

// ─── Earnings (8-K Snapshots) ─────────────────────────────────────────────
// Most recent earnings with beat/miss indicators and key financials

const fetchEarnings = safe(async (ticker, apiKey) => {
  const data = await apiFetch("/earnings", apiKey, { ticker });
  return data.earnings || null;
});

// ─── Company Facts ────────────────────────────────────────────────────────
// Name, CIK, market cap, employees, website, sector, industry

const fetchCompanyFacts = safe(async (ticker, apiKey) => {
  const data = await apiFetch("/company/facts", apiKey, { ticker });
  return data.company_facts || null;
});

// ─── SEC Filings ──────────────────────────────────────────────────────────

const fetchFilings = safe(async (ticker, apiKey, filingType = null, limit = 5) => {
  const params = { ticker, limit };
  if (filingType) params.filing_type = filingType;
  const data = await apiFetch("/filings", apiKey, params);
  return data.filings || [];
});

// ─── Insider Trades ───────────────────────────────────────────────────────

const fetchInsiderTrades = safe(async (ticker, apiKey, limit = 10) => {
  const data = await apiFetch("/insider-trades", apiKey, { ticker, limit });
  return data.insider_trades || [];
});

// ─── Earnings Press Releases ──────────────────────────────────────────────

const fetchPressReleases = safe(async (ticker, apiKey) => {
  const data = await apiFetch("/earnings/press-releases", apiKey, { ticker });
  return data.press_releases || [];
});

// ─── Main Gather Function ─────────────────────────────────────────────────

export async function gatherFindatasetsData(ticker, apiKey) {
  if (!apiKey) {
    return {
      status: "skipped",
      data: {},
      fields_filled: [],
      errors: ["FINDATASETS_API_KEY not set"],
    };
  }

  const errors = [];
  const fieldsMap = {};

  // Parallel fetch all endpoints (10 calls)
  const [
    income, balance, cashflow,
    metrics, metricsTTM,
    estimates, earnings, companyFacts,
    filings, insiders,
  ] = await Promise.all([
    fetchIncomeStatements(ticker, apiKey, "annual", 2),
    fetchBalanceSheets(ticker, apiKey, "annual", 2),
    fetchCashFlowStatements(ticker, apiKey, "annual", 2),
    fetchFinancialMetrics(ticker, apiKey, "annual", 2),
    fetchFinancialMetricsTTM(ticker, apiKey),
    fetchAnalystEstimates(ticker, apiKey, "annual"),
    fetchEarnings(ticker, apiKey),
    fetchCompanyFacts(ticker, apiKey),
    fetchFilings(ticker, apiKey, null, 5),
    fetchInsiderTrades(ticker, apiKey, 10),
  ]);

  // ─── Process income statements ────────────────────────────────────
  const latestIncome = Array.isArray(income) ? income[0] : null;
  const priorIncome = Array.isArray(income) ? income[1] : null;

  if (income?.error) errors.push(`Income statements: ${income.error}`);
  if (latestIncome) {
    if (latestIncome.revenue) fieldsMap.sec_revenue = latestIncome.revenue;
    if (latestIncome.gross_profit) fieldsMap.sec_gross_profit = latestIncome.gross_profit;
    if (latestIncome.operating_income) fieldsMap.sec_operating_income = latestIncome.operating_income;
    if (latestIncome.net_income) fieldsMap.sec_net_income = latestIncome.net_income;
    if (latestIncome.eps_diluted) fieldsMap.sec_eps_diluted = latestIncome.eps_diluted;
    if (latestIncome.research_and_development) fieldsMap.sec_rd_expense = latestIncome.research_and_development;
    if (latestIncome.revenue && latestIncome.gross_profit) {
      fieldsMap.sec_gross_margin = latestIncome.gross_profit / latestIncome.revenue;
    }
    if (latestIncome.revenue && latestIncome.operating_income) {
      fieldsMap.sec_operating_margin = latestIncome.operating_income / latestIncome.revenue;
    }
    if (priorIncome?.revenue && latestIncome.revenue) {
      fieldsMap.sec_revenue_growth_yoy = (latestIncome.revenue - priorIncome.revenue) / Math.abs(priorIncome.revenue);
    }
    fieldsMap.sec_income_period = latestIncome.period_end_date || latestIncome.report_period;
  }

  // ─── Process balance sheet ────────────────────────────────────────
  const latestBalance = Array.isArray(balance) ? balance[0] : null;

  if (balance?.error) errors.push(`Balance sheets: ${balance.error}`);
  if (latestBalance) {
    if (latestBalance.total_assets) fieldsMap.sec_total_assets = latestBalance.total_assets;
    if (latestBalance.total_liabilities) fieldsMap.sec_total_liabilities = latestBalance.total_liabilities;
    if (latestBalance.total_equity) fieldsMap.sec_total_equity = latestBalance.total_equity;
    if (latestBalance.total_debt) fieldsMap.sec_total_debt = latestBalance.total_debt;
    if (latestBalance.cash_and_equivalents) fieldsMap.sec_cash = latestBalance.cash_and_equivalents;
    if (latestBalance.total_debt && latestBalance.total_equity && latestBalance.total_equity !== 0) {
      fieldsMap.sec_debt_to_equity = latestBalance.total_debt / latestBalance.total_equity;
    }
    fieldsMap.sec_balance_period = latestBalance.period_end_date || latestBalance.report_period;
  }

  // ─── Process cash flow ────────────────────────────────────────────
  const latestCashflow = Array.isArray(cashflow) ? cashflow[0] : null;

  if (cashflow?.error) errors.push(`Cash flow: ${cashflow.error}`);
  if (latestCashflow) {
    if (latestCashflow.operating_cash_flow) fieldsMap.sec_operating_cf = latestCashflow.operating_cash_flow;
    if (latestCashflow.free_cash_flow) fieldsMap.sec_free_cash_flow = latestCashflow.free_cash_flow;
    if (latestCashflow.capital_expenditure) fieldsMap.sec_capex = latestCashflow.capital_expenditure;
    if (latestCashflow.dividends_paid) fieldsMap.sec_dividends_paid = latestCashflow.dividends_paid;
    if (latestCashflow.share_repurchase) fieldsMap.sec_buybacks = latestCashflow.share_repurchase;
    fieldsMap.sec_cashflow_period = latestCashflow.period_end_date || latestCashflow.report_period;
  }

  // ─── Process financial metrics (annual) ─────────────────────────────
  const latestMetrics = Array.isArray(metrics) ? metrics[0] : null;

  if (metrics?.error) errors.push(`Financial metrics: ${metrics.error}`);
  if (latestMetrics) {
    // Valuation
    if (latestMetrics.enterprise_value) fieldsMap.sec_ev = latestMetrics.enterprise_value;
    if (latestMetrics.price_to_earnings_ratio) fieldsMap.sec_pe_ratio = latestMetrics.price_to_earnings_ratio;
    if (latestMetrics.price_to_book_ratio) fieldsMap.sec_pb_ratio = latestMetrics.price_to_book_ratio;
    if (latestMetrics.price_to_sales_ratio) fieldsMap.sec_ps_ratio = latestMetrics.price_to_sales_ratio;
    if (latestMetrics.enterprise_value_to_ebitda_ratio) fieldsMap.sec_ev_to_ebitda = latestMetrics.enterprise_value_to_ebitda_ratio;
    if (latestMetrics.enterprise_value_to_revenue_ratio) fieldsMap.sec_ev_to_revenue = latestMetrics.enterprise_value_to_revenue_ratio;
    if (latestMetrics.free_cash_flow_yield) fieldsMap.sec_fcf_yield = latestMetrics.free_cash_flow_yield;
    if (latestMetrics.peg_ratio) fieldsMap.sec_peg_ratio = latestMetrics.peg_ratio;
    // Profitability
    if (latestMetrics.return_on_equity) fieldsMap.sec_roe = latestMetrics.return_on_equity;
    if (latestMetrics.return_on_assets) fieldsMap.sec_roa = latestMetrics.return_on_assets;
    if (latestMetrics.return_on_invested_capital) fieldsMap.sec_roic = latestMetrics.return_on_invested_capital;
    if (latestMetrics.gross_margin) fieldsMap.sec_metrics_gross_margin = latestMetrics.gross_margin;
    if (latestMetrics.operating_margin) fieldsMap.sec_metrics_operating_margin = latestMetrics.operating_margin;
    if (latestMetrics.net_margin) fieldsMap.sec_net_margin = latestMetrics.net_margin;
    // Liquidity & leverage
    if (latestMetrics.current_ratio) fieldsMap.sec_current_ratio = latestMetrics.current_ratio;
    if (latestMetrics.quick_ratio) fieldsMap.sec_quick_ratio = latestMetrics.quick_ratio;
    if (latestMetrics.debt_to_equity) fieldsMap.sec_metrics_debt_to_equity = latestMetrics.debt_to_equity;
    if (latestMetrics.debt_to_assets) fieldsMap.sec_debt_to_assets = latestMetrics.debt_to_assets;
    if (latestMetrics.interest_coverage) fieldsMap.sec_interest_coverage = latestMetrics.interest_coverage;
    // Growth
    if (latestMetrics.revenue_growth) fieldsMap.sec_metrics_revenue_growth = latestMetrics.revenue_growth;
    if (latestMetrics.earnings_growth) fieldsMap.sec_earnings_growth = latestMetrics.earnings_growth;
    if (latestMetrics.free_cash_flow_growth) fieldsMap.sec_fcf_growth = latestMetrics.free_cash_flow_growth;
    if (latestMetrics.ebitda_growth) fieldsMap.sec_ebitda_growth = latestMetrics.ebitda_growth;
    // Per share
    if (latestMetrics.earnings_per_share) fieldsMap.sec_metrics_eps = latestMetrics.earnings_per_share;
    if (latestMetrics.book_value_per_share) fieldsMap.sec_bvps = latestMetrics.book_value_per_share;
    if (latestMetrics.free_cash_flow_per_share) fieldsMap.sec_fcf_per_share = latestMetrics.free_cash_flow_per_share;
    // Efficiency
    if (latestMetrics.asset_turnover) fieldsMap.sec_asset_turnover = latestMetrics.asset_turnover;
    if (latestMetrics.inventory_turnover) fieldsMap.sec_inventory_turnover = latestMetrics.inventory_turnover;
    // Payout
    if (latestMetrics.payout_ratio) fieldsMap.sec_payout_ratio = latestMetrics.payout_ratio;
  }

  // ─── Process TTM metrics (trailing twelve months) ──────────────────
  if (metricsTTM?.error) errors.push(`TTM metrics: ${metricsTTM.error}`);
  const ttm = (metricsTTM && !metricsTTM.error) ? metricsTTM : null;
  if (ttm) {
    // Only add TTM fields that provide a more current view than annual
    if (ttm.enterprise_value) fieldsMap.sec_ev_ttm = ttm.enterprise_value;
    if (ttm.price_to_earnings_ratio) fieldsMap.sec_pe_ttm = ttm.price_to_earnings_ratio;
    if (ttm.return_on_equity) fieldsMap.sec_roe_ttm = ttm.return_on_equity;
    if (ttm.return_on_invested_capital) fieldsMap.sec_roic_ttm = ttm.return_on_invested_capital;
    if (ttm.gross_margin) fieldsMap.sec_gross_margin_ttm = ttm.gross_margin;
    if (ttm.net_margin) fieldsMap.sec_net_margin_ttm = ttm.net_margin;
    if (ttm.free_cash_flow_yield) fieldsMap.sec_fcf_yield_ttm = ttm.free_cash_flow_yield;
    if (ttm.revenue_growth) fieldsMap.sec_revenue_growth_ttm = ttm.revenue_growth;
    if (ttm.earnings_growth) fieldsMap.sec_earnings_growth_ttm = ttm.earnings_growth;
  }

  // ─── Process analyst estimates ──────────────────────────────────────
  if (estimates?.error) errors.push(`Analyst estimates: ${estimates.error}`);
  if (Array.isArray(estimates) && estimates.length > 0) {
    // Find the next future estimate (or most recent)
    const nextEstimate = estimates[0];
    if (nextEstimate.estimated_revenue_avg) fieldsMap.sec_est_revenue = nextEstimate.estimated_revenue_avg;
    if (nextEstimate.estimated_revenue_low) fieldsMap.sec_est_revenue_low = nextEstimate.estimated_revenue_low;
    if (nextEstimate.estimated_revenue_high) fieldsMap.sec_est_revenue_high = nextEstimate.estimated_revenue_high;
    if (nextEstimate.estimated_eps_avg) fieldsMap.sec_est_eps = nextEstimate.estimated_eps_avg;
    if (nextEstimate.estimated_eps_low) fieldsMap.sec_est_eps_low = nextEstimate.estimated_eps_low;
    if (nextEstimate.estimated_eps_high) fieldsMap.sec_est_eps_high = nextEstimate.estimated_eps_high;
    if (nextEstimate.number_of_analysts) fieldsMap.sec_est_analyst_count = nextEstimate.number_of_analysts;
    fieldsMap.sec_est_period = nextEstimate.fiscal_period || nextEstimate.report_period;
  }

  // ─── Process earnings (8-K snapshot) ────────────────────────────────
  if (earnings?.error) errors.push(`Earnings: ${earnings.error}`);
  const earn = (earnings && !earnings.error) ? earnings : null;
  if (earn) {
    // Quarterly earnings (most actionable)
    const q = earn.quarterly;
    if (q) {
      if (q.revenue) fieldsMap.sec_earn_revenue_q = q.revenue;
      if (q.net_income) fieldsMap.sec_earn_net_income_q = q.net_income;
      if (q.earnings_per_share) fieldsMap.sec_earn_eps_q = q.earnings_per_share;
      if (q.free_cash_flow) fieldsMap.sec_earn_fcf_q = q.free_cash_flow;
      if (q.operating_income) fieldsMap.sec_earn_operating_income_q = q.operating_income;
      // Beat/miss signals
      if (q.revenue_surprise) fieldsMap.sec_revenue_surprise = q.revenue_surprise; // BEAT/MISS/MEET
      if (q.eps_surprise) fieldsMap.sec_eps_surprise = q.eps_surprise;
      if (q.estimated_revenue) fieldsMap.sec_earn_est_revenue = q.estimated_revenue;
      if (q.estimated_earnings_per_share) fieldsMap.sec_earn_est_eps = q.estimated_earnings_per_share;
    }
    // Metadata
    if (earn.report_period) fieldsMap.sec_earn_report_period = earn.report_period;
    if (earn.fiscal_period) fieldsMap.sec_earn_fiscal_period = earn.fiscal_period;
  }

  // ─── Process company facts ──────────────────────────────────────────
  if (companyFacts?.error) errors.push(`Company facts: ${companyFacts.error}`);
  const facts = (companyFacts && !companyFacts.error) ? companyFacts : null;
  if (facts) {
    if (facts.name) fieldsMap.sec_company_name = facts.name;
    if (facts.cik) fieldsMap.sec_cik = facts.cik;
    if (facts.market_cap) fieldsMap.sec_company_market_cap = facts.market_cap;
    if (facts.total_employees) fieldsMap.sec_employees = facts.total_employees;
    if (facts.website_url) fieldsMap.sec_website = facts.website_url;
    if (facts.sic_code) fieldsMap.sec_sic_code = facts.sic_code;
    if (facts.sic_description) fieldsMap.sec_sic_description = facts.sic_description;
    if (facts.sector) fieldsMap.sec_sector = facts.sector;
    if (facts.industry) fieldsMap.sec_industry = facts.industry;
  }

  // ─── Process filings metadata ─────────────────────────────────────
  if (filings?.error) errors.push(`Filings: ${filings.error}`);
  if (Array.isArray(filings) && filings.length > 0) {
    fieldsMap.sec_latest_filing_type = filings[0].filing_type || filings[0].type;
    fieldsMap.sec_latest_filing_date = filings[0].filing_date || filings[0].date;
    fieldsMap.sec_filing_count = filings.length;
    fieldsMap.sec_filings_summary = filings.map(f => ({
      type: f.filing_type || f.type,
      date: f.filing_date || f.date,
      url: f.filing_url || f.url,
    }));
  }

  // ─── Process insider trades ───────────────────────────────────────
  if (insiders?.error) errors.push(`Insider trades: ${insiders.error}`);
  if (Array.isArray(insiders) && insiders.length > 0) {
    const buys = insiders.filter(t => t.transaction_type === "purchase" || t.acquisition_or_disposition === "A");
    const sells = insiders.filter(t => t.transaction_type === "sale" || t.acquisition_or_disposition === "D");
    fieldsMap.sec_insider_buy_count = buys.length;
    fieldsMap.sec_insider_sell_count = sells.length;
    fieldsMap.sec_insider_net_sentiment = buys.length > sells.length ? "net_buying" : sells.length > buys.length ? "net_selling" : "neutral";
    fieldsMap.sec_insider_recent = insiders.slice(0, 3).map(t => ({
      name: t.owner_name || t.name,
      type: t.transaction_type,
      shares: t.shares,
      value: t.value,
      date: t.transaction_date || t.date,
    }));
  }

  // ─── Build result ─────────────────────────────────────────────────
  const fields_filled = Object.keys(fieldsMap).filter(k =>
    fieldsMap[k] != null &&
    !k.endsWith("_period") &&
    !k.endsWith("_summary") &&
    !k.endsWith("_recent")
  );

  let status = "ok";
  if (errors.length > 0 && fields_filled.length > 0) status = "partial";
  if (fields_filled.length === 0) status = "error";

  return {
    status,
    data: fieldsMap,
    fields_filled,
    errors,
    raw: {
      income: Array.isArray(income) ? income[0] : null,
      balance: Array.isArray(balance) ? balance[0] : null,
      cashflow: Array.isArray(cashflow) ? cashflow[0] : null,
      metrics: Array.isArray(metrics) ? metrics[0] : null,
      metricsTTM: ttm,
      estimates: Array.isArray(estimates) ? estimates : null,
      earnings: earn,
      companyFacts: facts,
      filings,
      insiders,
    },
  };
}
