#!/usr/bin/env node
// ─── DATA GATHERING ─────────────────────────────────────────────────────────
// Produces an evidence_bundle for a given ticker.
//
// Usage:
//   node gather.js NVDA                          # uses default playbook resolution
//   node gather.js NVDA --playbook semiconductors-and-accelerators
//   node gather.js NVDA --tier overview           # limits query depth
//   node gather.js NVDA --json                    # output raw JSON
//
// Requires:
//   FRED_API_KEY env var (or .env file in this directory)
//
// Output: evidence_bundle JSON to stdout (or formatted report to stderr)

import { gatherFredData } from "./providers/fred.js";
import { gatherYahooData } from "./providers/yahoo.js";
import { gatherFindatasetsData } from "./providers/findatasets.js";
import {
  BASE_CONTRACT, MACRO_CONTRACT, SECTOR_CONTRACTS,
  computeDataConfidence,
} from "./data-contracts.js";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Load .env if present ───────────────────────────────────────────────────
function loadEnv() {
  const envPath = resolve(__dirname, ".env");
  if (existsSync(envPath)) {
    const lines = readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const match = line.match(/^([A-Z_]+)=(.+)$/);
      if (match) process.env[match[1]] = match[2].trim();
    }
  }
}

// ─── Resolve playbook from index.yaml ───────────────────────────────────────
function resolvePlaybook(ticker) {
  const indexPath = resolve(__dirname, "../../.agents/playbooks/index.yaml");
  if (!existsSync(indexPath)) return "_default";

  const content = readFileSync(indexPath, "utf-8");
  // Simple YAML parsing — find ticker in tickers arrays
  const lines = content.split("\n");
  let currentPlaybook = "_default";

  for (let i = 0; i < lines.length; i++) {
    const playbookMatch = lines[i].match(/playbook:\s*(.+?)\/playbook\.prompt\.md/);
    if (playbookMatch) currentPlaybook = playbookMatch[1];

    const tickerMatch = lines[i].match(/tickers:\s*\[(.+)\]/);
    if (tickerMatch) {
      const tickers = tickerMatch[1].split(",").map(t => t.trim());
      if (tickers.includes(ticker.toUpperCase())) return currentPlaybook;
    }
  }
  return "_default";
}

// ─── Main ───────────────────────────────────────────────────────────────────
async function main() {
  loadEnv();

  const args = process.argv.slice(2);
  const ticker = args.find(a => !a.startsWith("--"))?.toUpperCase();
  const playbook = args.find(a => a.startsWith("--playbook="))?.split("=")[1];
  const tier = args.find(a => a.startsWith("--tier="))?.split("=")[1] || "financial";
  const jsonMode = args.includes("--json");

  if (!ticker) {
    console.error("Usage: node gather.js TICKER [--playbook=name] [--tier=overview|financial|thesis] [--json]");
    process.exit(1);
  }

  const resolvedPlaybook = playbook || resolvePlaybook(ticker);
  const sectorContract = SECTOR_CONTRACTS[resolvedPlaybook] || SECTOR_CONTRACTS["_default"];

  console.error(`\n  Ticker:   ${ticker}`);
  console.error(`  Playbook: ${resolvedPlaybook}`);
  console.error(`  Tier:     ${tier}\n`);

  // ── Gather from all providers in parallel ──
  console.error("  Gathering data...\n");

  const fredKey = process.env.FRED_API_KEY;
  const findatasetsKey = process.env.FINDATASETS_API_KEY;
  const [fredResult, yahooResult, findatasetsResult] = await Promise.all([
    gatherFredData(fredKey),
    gatherYahooData(ticker),
    gatherFindatasetsData(ticker, findatasetsKey),
  ]);

  // ── Build evidence bundle ──
  const allFilledFields = new Set([
    ...fredResult.fields_filled,
    ...yahooResult.fields_filled,
    ...findatasetsResult.fields_filled,
  ]);

  const dataConfidence = computeDataConfidence(
    allFilledFields,
    BASE_CONTRACT,
    sectorContract,
  );

  const evidenceBundle = {
    ticker,
    playbook: resolvedPlaybook,
    tier,
    gathered_at: new Date().toISOString(),
    structured_data: {
      price: {
        current: yahooResult.data.current_price,
        market_cap: yahooResult.data.market_cap,
        pe: yahooResult.data.pe_ratio,
        eps: yahooResult.data.eps,
        high_52w: yahooResult.data["52w_high"],
        low_52w: yahooResult.data["52w_low"],
        beta: yahooResult.data.beta,
        volume: yahooResult.data.avg_volume,
      },
      fundamentals: {
        revenue_ttm: yahooResult.data.revenue_ttm,
        gross_margin: yahooResult.data.gross_margin,
        operating_margin: yahooResult.data.operating_margin,
        free_cash_flow: yahooResult.data.free_cash_flow,
        fcf_conversion: yahooResult.data.fcf_conversion,
        debt_to_equity: yahooResult.data.debt_to_equity,
        roe: yahooResult.data.roe,
        revenue_growth_yoy: yahooResult.data.revenue_growth_yoy,
        dividend_yield: yahooResult.data.dividend_yield,
      },
      macro: {
        fed_funds_rate: fredResult.data.fed_funds_rate?.value,
        treasury_10y: fredResult.data.treasury_10y?.value,
        treasury_2y: fredResult.data.treasury_2y?.value,
        yield_curve: fredResult.data.yield_curve_spread?.value,
        cpi_yoy: fredResult.data.cpi_yoy?.value,
        unemployment: fredResult.data.unemployment?.value,
        dxy: fredResult.data.dxy?.value,
        wti_crude: fredResult.data.wti_crude?.value,
        gold_price: fredResult.data.gold_price?.value,
      },
      analyst: {
        target_mean: yahooResult.data.analyst_target_mean,
        recommendation: yahooResult.data.analyst_recommendation,
        short_pct_float: yahooResult.data.short_percent_of_float,
      },
      classification: {
        sector: yahooResult.data.sector,
        industry: yahooResult.data.industry,
      },
      sec_financials: {
        revenue: findatasetsResult.data.sec_revenue,
        gross_profit: findatasetsResult.data.sec_gross_profit,
        operating_income: findatasetsResult.data.sec_operating_income,
        net_income: findatasetsResult.data.sec_net_income,
        eps_diluted: findatasetsResult.data.sec_eps_diluted,
        rd_expense: findatasetsResult.data.sec_rd_expense,
        gross_margin: findatasetsResult.data.sec_gross_margin,
        operating_margin: findatasetsResult.data.sec_operating_margin,
        revenue_growth_yoy: findatasetsResult.data.sec_revenue_growth_yoy,
        period: findatasetsResult.data.sec_income_period,
      },
      sec_balance_sheet: {
        total_assets: findatasetsResult.data.sec_total_assets,
        total_liabilities: findatasetsResult.data.sec_total_liabilities,
        total_equity: findatasetsResult.data.sec_total_equity,
        total_debt: findatasetsResult.data.sec_total_debt,
        cash: findatasetsResult.data.sec_cash,
        debt_to_equity: findatasetsResult.data.sec_debt_to_equity,
        period: findatasetsResult.data.sec_balance_period,
      },
      sec_cash_flow: {
        operating_cf: findatasetsResult.data.sec_operating_cf,
        free_cash_flow: findatasetsResult.data.sec_free_cash_flow,
        capex: findatasetsResult.data.sec_capex,
        dividends_paid: findatasetsResult.data.sec_dividends_paid,
        buybacks: findatasetsResult.data.sec_buybacks,
        period: findatasetsResult.data.sec_cashflow_period,
      },
      sec_metrics: {
        // Valuation
        ev: findatasetsResult.data.sec_ev,
        pe_ratio: findatasetsResult.data.sec_pe_ratio,
        pb_ratio: findatasetsResult.data.sec_pb_ratio,
        ps_ratio: findatasetsResult.data.sec_ps_ratio,
        ev_to_ebitda: findatasetsResult.data.sec_ev_to_ebitda,
        ev_to_revenue: findatasetsResult.data.sec_ev_to_revenue,
        fcf_yield: findatasetsResult.data.sec_fcf_yield,
        peg_ratio: findatasetsResult.data.sec_peg_ratio,
        // Profitability
        roe: findatasetsResult.data.sec_roe,
        roa: findatasetsResult.data.sec_roa,
        roic: findatasetsResult.data.sec_roic,
        net_margin: findatasetsResult.data.sec_net_margin,
        // Liquidity & leverage
        current_ratio: findatasetsResult.data.sec_current_ratio,
        quick_ratio: findatasetsResult.data.sec_quick_ratio,
        debt_to_assets: findatasetsResult.data.sec_debt_to_assets,
        interest_coverage: findatasetsResult.data.sec_interest_coverage,
        // Growth
        revenue_growth: findatasetsResult.data.sec_metrics_revenue_growth,
        earnings_growth: findatasetsResult.data.sec_earnings_growth,
        fcf_growth: findatasetsResult.data.sec_fcf_growth,
        ebitda_growth: findatasetsResult.data.sec_ebitda_growth,
        // Per share
        bvps: findatasetsResult.data.sec_bvps,
        fcf_per_share: findatasetsResult.data.sec_fcf_per_share,
        // Efficiency
        asset_turnover: findatasetsResult.data.sec_asset_turnover,
        inventory_turnover: findatasetsResult.data.sec_inventory_turnover,
        payout_ratio: findatasetsResult.data.sec_payout_ratio,
      },
      sec_metrics_ttm: {
        ev: findatasetsResult.data.sec_ev_ttm,
        pe: findatasetsResult.data.sec_pe_ttm,
        roe: findatasetsResult.data.sec_roe_ttm,
        roic: findatasetsResult.data.sec_roic_ttm,
        gross_margin: findatasetsResult.data.sec_gross_margin_ttm,
        net_margin: findatasetsResult.data.sec_net_margin_ttm,
        fcf_yield: findatasetsResult.data.sec_fcf_yield_ttm,
        revenue_growth: findatasetsResult.data.sec_revenue_growth_ttm,
        earnings_growth: findatasetsResult.data.sec_earnings_growth_ttm,
      },
      sec_estimates: {
        revenue: findatasetsResult.data.sec_est_revenue,
        revenue_low: findatasetsResult.data.sec_est_revenue_low,
        revenue_high: findatasetsResult.data.sec_est_revenue_high,
        eps: findatasetsResult.data.sec_est_eps,
        eps_low: findatasetsResult.data.sec_est_eps_low,
        eps_high: findatasetsResult.data.sec_est_eps_high,
        analyst_count: findatasetsResult.data.sec_est_analyst_count,
        period: findatasetsResult.data.sec_est_period,
      },
      sec_earnings: {
        revenue_q: findatasetsResult.data.sec_earn_revenue_q,
        net_income_q: findatasetsResult.data.sec_earn_net_income_q,
        eps_q: findatasetsResult.data.sec_earn_eps_q,
        fcf_q: findatasetsResult.data.sec_earn_fcf_q,
        revenue_surprise: findatasetsResult.data.sec_revenue_surprise,
        eps_surprise: findatasetsResult.data.sec_eps_surprise,
        est_revenue: findatasetsResult.data.sec_earn_est_revenue,
        est_eps: findatasetsResult.data.sec_earn_est_eps,
        report_period: findatasetsResult.data.sec_earn_report_period,
        fiscal_period: findatasetsResult.data.sec_earn_fiscal_period,
      },
      sec_company: {
        name: findatasetsResult.data.sec_company_name,
        cik: findatasetsResult.data.sec_cik,
        market_cap: findatasetsResult.data.sec_company_market_cap,
        employees: findatasetsResult.data.sec_employees,
        website: findatasetsResult.data.sec_website,
        sic_code: findatasetsResult.data.sec_sic_code,
        sic_description: findatasetsResult.data.sec_sic_description,
        sector: findatasetsResult.data.sec_sector,
        industry: findatasetsResult.data.sec_industry,
      },
      sec_filings: {
        latest_type: findatasetsResult.data.sec_latest_filing_type,
        latest_date: findatasetsResult.data.sec_latest_filing_date,
        count: findatasetsResult.data.sec_filing_count,
        filings: findatasetsResult.data.sec_filings_summary,
      },
      sec_insider: {
        buy_count: findatasetsResult.data.sec_insider_buy_count,
        sell_count: findatasetsResult.data.sec_insider_sell_count,
        net_sentiment: findatasetsResult.data.sec_insider_net_sentiment,
        recent_trades: findatasetsResult.data.sec_insider_recent,
      },
    },
    data_quality: {
      data_confidence: dataConfidence,
      providers: {
        fred: { status: fredResult.status, fields: fredResult.fields_filled.length, errors: fredResult.errors },
        yahoo: { status: yahooResult.status, fields: yahooResult.fields_filled.length, errors: yahooResult.errors },
        findatasets: { status: findatasetsResult.status, fields: findatasetsResult.fields_filled.length, errors: findatasetsResult.errors },
      },
      total_fields_filled: allFilledFields.size,
      coverage: {
        macro_required: MACRO_CONTRACT.required.filter(f => allFilledFields.has(f)),
        macro_missing: MACRO_CONTRACT.required.filter(f => !allFilledFields.has(f)),
        base_required: BASE_CONTRACT.required.filter(f => allFilledFields.has(f)),
        base_missing: BASE_CONTRACT.required.filter(f => !allFilledFields.has(f)),
        sector_required: (sectorContract?.required || []).filter(f => allFilledFields.has(f)),
        sector_missing: (sectorContract?.required || []).filter(f => !allFilledFields.has(f)),
      },
    },
    source_urls: [],
    web_results: [], // populated by web search step (not in this harness)
  };

  if (jsonMode) {
    console.log(JSON.stringify(evidenceBundle, null, 2));
  } else {
    // Formatted output for human review
    console.error("  ─── RESULTS ───\n");
    console.error(`  Data Confidence: ${dataConfidence}`);
    console.error(`  Fields Filled:   ${allFilledFields.size}`);
    console.error("");

    // Provider status
    for (const [name, result] of [["FRED", fredResult], ["Yahoo", yahooResult], ["Findatasets", findatasetsResult]]) {
      const icon = result.status === "ok" ? "✓" : result.status === "partial" ? "~" : "✗";
      console.error(`  ${icon} ${name}: ${result.status} (${result.fields_filled.length} fields)`);
      if (result.errors.length > 0) {
        for (const e of result.errors.slice(0, 3)) console.error(`    └─ ${e}`);
        if (result.errors.length > 3) console.error(`    └─ ...and ${result.errors.length - 3} more`);
      }
    }

    // Coverage gaps
    const gaps = evidenceBundle.data_quality.coverage;
    if (gaps.base_missing.length > 0) {
      console.error(`\n  ⚠ Missing base fields: ${gaps.base_missing.join(", ")}`);
    }
    if (gaps.macro_missing.length > 0) {
      console.error(`  ⚠ Missing macro fields: ${gaps.macro_missing.join(", ")}`);
    }
    if (gaps.sector_missing.length > 0) {
      console.error(`  ⚠ Missing sector fields (${resolvedPlaybook}): ${gaps.sector_missing.join(", ")}`);
    }

    // Key data points
    const p = evidenceBundle.structured_data;
    console.error("\n  ─── KEY DATA ───\n");
    if (p.price.current) console.error(`  Price:      $${p.price.current}`);
    if (p.price.market_cap) console.error(`  Market Cap: $${(p.price.market_cap / 1e9).toFixed(1)}B`);
    if (p.fundamentals.gross_margin) console.error(`  Gross Margin: ${(p.fundamentals.gross_margin * 100).toFixed(1)}%`);
    if (p.fundamentals.revenue_ttm) console.error(`  Revenue TTM:  $${(p.fundamentals.revenue_ttm / 1e9).toFixed(1)}B`);
    if (p.macro.fed_funds_rate) console.error(`  Fed Rate:     ${p.macro.fed_funds_rate}%`);
    if (p.macro.cpi_yoy) console.error(`  CPI YoY:      ${p.macro.cpi_yoy}%`);
    if (p.macro.treasury_10y) console.error(`  10Y Yield:    ${p.macro.treasury_10y}%`);

    // SEC filing data
    const sec = p.sec_financials;
    if (sec?.revenue) console.error(`  SEC Revenue:    $${(sec.revenue / 1e9).toFixed(1)}B`);
    if (sec?.net_income) console.error(`  SEC Net Income: $${(sec.net_income / 1e9).toFixed(1)}B`);
    if (sec?.revenue_growth_yoy != null) console.error(`  SEC Rev Growth: ${(sec.revenue_growth_yoy * 100).toFixed(1)}%`);

    // Earnings beat/miss
    const earn = p.sec_earnings;
    if (earn?.revenue_surprise) console.error(`  Revenue Surprise: ${earn.revenue_surprise}`);
    if (earn?.eps_surprise) console.error(`  EPS Surprise:     ${earn.eps_surprise}`);
    if (earn?.fiscal_period) console.error(`  Earnings Period:  ${earn.fiscal_period}`);

    // Estimates
    const est = p.sec_estimates;
    if (est?.revenue) console.error(`  Est Revenue:  $${(est.revenue / 1e9).toFixed(1)}B (${est.analyst_count || "?"} analysts)`);
    if (est?.eps) console.error(`  Est EPS:      $${est.eps.toFixed(2)}`);

    // Company facts
    if (p.sec_company?.employees) console.error(`  Employees:    ${p.sec_company.employees.toLocaleString()}`);

    // Filings & insider
    if (p.sec_filings?.latest_type) console.error(`  Latest Filing:  ${p.sec_filings.latest_type} (${p.sec_filings.latest_date})`);
    if (p.sec_insider?.net_sentiment) console.error(`  Insider Signal: ${p.sec_insider.net_sentiment}`);

    console.error("\n  (use --json for full evidence_bundle output)\n");

    // Still output JSON to stdout for piping
    console.log(JSON.stringify(evidenceBundle, null, 2));
  }
}

main().catch(e => {
  console.error(`Fatal: ${e.message}`);
  process.exit(1);
});
