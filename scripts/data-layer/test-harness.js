#!/usr/bin/env node
// ─── TEST HARNESS ─────────────────────────────────────────────────────────────
// Runs gather.js against a set of test tickers, validates evidence_bundle
// output against data contracts, and produces a coverage report.
//
// Usage:
//   node test-harness.js                    # run all test cases
//   node test-harness.js --ticker NVDA      # single ticker
//   node test-harness.js --quick            # 3 tickers, fast validation
//   node test-harness.js --verbose          # show full evidence bundles
//
// Requires: FRED_API_KEY env var (or .env file in this directory)

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

// ─── Load .env ────────────────────────────────────────────────────────────────
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

// ─── Test Cases ───────────────────────────────────────────────────────────────
// Each case: { ticker, playbook, expectedSector, minFields }
const TEST_CASES = [
  // Semiconductors — deep playbook (240 lines, 8 sections)
  { ticker: "NVDA", playbook: "semiconductors-and-accelerators", expectedSector: "Technology", minFields: 15 },
  { ticker: "INTC", playbook: "semiconductors-and-accelerators", expectedSector: "Technology", minFields: 15 },

  // Uranium / Energy — sector-specific contract
  { ticker: "UUUU", playbook: "uranium-and-nuclear", expectedSector: "Energy", minFields: 12 },
  { ticker: "CCJ",  playbook: "uranium-and-nuclear", expectedSector: "Energy", minFields: 12 },

  // Precious metals — mining-specific fields
  { ticker: "NEM",  playbook: "precious-metal-miners", expectedSector: "Basic Materials", minFields: 12 },

  // Oil & gas
  { ticker: "XOM",  playbook: "oil-and-gas-majors", expectedSector: "Energy", minFields: 12 },

  // Large cap tech — _default playbook
  { ticker: "AAPL", playbook: "_default", expectedSector: "Technology", minFields: 10 },
  { ticker: "MSFT", playbook: "_default", expectedSector: "Technology", minFields: 10 },

  // Shipping — niche sector
  { ticker: "ZIM",  playbook: "shipping-and-maritime", expectedSector: null, minFields: 10 },

  // Bitcoin mining
  { ticker: "MARA", playbook: "bitcoin-mining", expectedSector: null, minFields: 10 },
];

const QUICK_CASES = ["NVDA", "UUUU", "AAPL"];

// ─── Validation ───────────────────────────────────────────────────────────────

function validateBundle(bundle, testCase) {
  const issues = [];
  const warnings = [];

  // 1. Structure checks
  if (!bundle.ticker) issues.push("Missing ticker");
  if (bundle.ticker !== testCase.ticker) issues.push(`Ticker mismatch: got ${bundle.ticker}, expected ${testCase.ticker}`);
  if (!bundle.gathered_at) issues.push("Missing gathered_at timestamp");
  if (!bundle.structured_data) issues.push("Missing structured_data");
  if (!bundle.data_quality) issues.push("Missing data_quality");

  // 2. Price data checks
  const price = bundle.structured_data?.price;
  if (!price?.current) issues.push("Missing current price");
  else if (price.current <= 0) issues.push(`Invalid price: ${price.current}`);

  if (!price?.market_cap) warnings.push("Missing market cap");
  else if (price.market_cap < 1e6) warnings.push(`Suspiciously low market cap: ${price.market_cap}`);

  if (!price?.high_52w || !price?.low_52w) warnings.push("Missing 52w range");
  else if (price.high_52w < price.low_52w) issues.push("52w high < 52w low");

  // 3. Fundamental data checks
  const fund = bundle.structured_data?.fundamentals;
  if (!fund?.revenue_ttm && !fund?.gross_margin) warnings.push("No fundamental data at all");
  if (fund?.gross_margin && (fund.gross_margin < -1 || fund.gross_margin > 1)) {
    warnings.push(`Gross margin looks wrong (${fund.gross_margin}) — expected decimal 0-1`);
  }

  // 4. Macro data checks
  const macro = bundle.structured_data?.macro;
  const macroFields = Object.entries(macro || {}).filter(([, v]) => v != null);
  if (macroFields.length === 0) issues.push("No macro data at all (FRED may be down)");
  if (macroFields.length < 3) warnings.push(`Only ${macroFields.length} macro fields filled`);

  // 4b. SEC filing data checks (Findatasets)
  const secFin = bundle.structured_data?.sec_financials;
  const secBal = bundle.structured_data?.sec_balance_sheet;
  if (!secFin?.revenue && !secFin?.net_income) warnings.push("No SEC financial statement data (Findatasets may be down or key missing)");
  if (secFin?.revenue && secFin?.net_income && secFin.net_income > secFin.revenue) {
    warnings.push("SEC net_income > revenue — unusual, check data");
  }
  if (!secBal?.total_assets && !secBal?.total_debt) warnings.push("No SEC balance sheet data");

  // 4c. Analyst estimates check
  const secEst = bundle.structured_data?.sec_estimates;
  if (!secEst?.revenue && !secEst?.eps) warnings.push("No analyst estimate data");

  // 4d. Earnings beat/miss check
  const secEarn = bundle.structured_data?.sec_earnings;
  if (!secEarn?.revenue_q && !secEarn?.eps_q) warnings.push("No quarterly earnings data (8-K)");
  if (secEarn?.revenue_surprise && !["BEAT", "MISS", "MEET"].includes(secEarn.revenue_surprise)) {
    warnings.push(`Unexpected revenue_surprise value: ${secEarn.revenue_surprise}`);
  }

  // 4e. Company facts check
  const secCo = bundle.structured_data?.sec_company;
  if (!secCo?.name) warnings.push("No company facts data");

  // 4f. Insider trades check
  const secInsider = bundle.structured_data?.sec_insider;
  if (!secInsider?.net_sentiment) warnings.push("No insider trading data");

  // 5. Data confidence check
  const confidence = bundle.data_quality?.data_confidence;
  if (confidence == null) issues.push("Missing data_confidence score");
  else if (confidence < 0.3) issues.push(`Very low data confidence: ${confidence}`);
  else if (confidence < 0.5) warnings.push(`Low data confidence: ${confidence}`);

  // 6. Field count check
  const totalFields = bundle.data_quality?.total_fields_filled || 0;
  if (totalFields < testCase.minFields) {
    issues.push(`Only ${totalFields} fields filled, expected at least ${testCase.minFields}`);
  }

  // 7. Coverage gap check
  const coverage = bundle.data_quality?.coverage;
  if (coverage?.base_missing?.length > 2) {
    warnings.push(`${coverage.base_missing.length} base fields missing: ${coverage.base_missing.join(", ")}`);
  }
  if (coverage?.macro_missing?.length > 2) {
    warnings.push(`${coverage.macro_missing.length} macro fields missing: ${coverage.macro_missing.join(", ")}`);
  }

  // 8. Provider status check
  const providers = bundle.data_quality?.providers;
  if (providers?.fred?.status === "error") issues.push(`FRED provider error: ${providers.fred.errors?.[0]}`);
  if (providers?.yahoo?.status === "error") issues.push(`Yahoo provider error: ${providers.yahoo.errors?.[0]}`);

  return { issues, warnings };
}

// ─── Report Formatting ───────────────────────────────────────────────────────

function printSummary(results) {
  const passed = results.filter(r => r.status === "pass").length;
  const warned = results.filter(r => r.status === "warn").length;
  const failed = results.filter(r => r.status === "fail").length;
  const errored = results.filter(r => r.status === "error").length;

  console.log("\n" + "═".repeat(70));
  console.log("  DATA LAYER TEST RESULTS");
  console.log("═".repeat(70));
  console.log(`  Total:   ${results.length}`);
  console.log(`  Passed:  ${passed}  ✓`);
  console.log(`  Warned:  ${warned}  ~`);
  console.log(`  Failed:  ${failed}  ✗`);
  console.log(`  Errored: ${errored}  !`);
  console.log("═".repeat(70));

  // Per-ticker detail
  for (const r of results) {
    const icon = r.status === "pass" ? "✓" : r.status === "warn" ? "~" : r.status === "fail" ? "✗" : "!";
    const fields = r.bundle ? r.bundle.data_quality?.total_fields_filled : 0;
    const conf = r.bundle ? r.bundle.data_quality?.data_confidence : "N/A";
    console.log(`\n  ${icon} ${r.ticker.padEnd(6)} │ playbook: ${r.playbook.padEnd(35)} │ fields: ${String(fields).padEnd(3)} │ confidence: ${conf}`);

    if (r.error) {
      console.log(`    ! Error: ${r.error}`);
    }
    for (const issue of (r.issues || [])) {
      console.log(`    ✗ ${issue}`);
    }
    for (const warn of (r.warnings || [])) {
      console.log(`    ~ ${warn}`);
    }
  }

  // Coverage matrix
  console.log("\n" + "─".repeat(70));
  console.log("  FIELD COVERAGE MATRIX");
  console.log("─".repeat(70));

  const allFields = new Set();
  for (const r of results) {
    if (!r.bundle) continue;
    const sd = r.bundle.structured_data;
    for (const category of Object.values(sd || {})) {
      if (typeof category === "object" && category !== null) {
        for (const [k, v] of Object.entries(category)) {
          if (v != null) allFields.add(k);
        }
      }
    }
  }

  const tickers = results.map(r => r.ticker);
  const header = "  Field".padEnd(28) + tickers.map(t => t.padStart(7)).join("");
  console.log(header);
  console.log("  " + "─".repeat(header.length - 2));

  for (const field of [...allFields].sort()) {
    let row = `  ${field}`.padEnd(28);
    for (const r of results) {
      if (!r.bundle) { row += "   —  "; continue; }
      const sd = r.bundle.structured_data;
      let found = false;
      for (const category of Object.values(sd || {})) {
        if (typeof category === "object" && category !== null && category[field] != null) {
          found = true;
          break;
        }
      }
      row += found ? "     ✓ " : "     · ";
    }
    console.log(row);
  }

  console.log("\n" + "═".repeat(70));

  // Exit code
  if (failed > 0 || errored > 0) {
    console.log("  RESULT: FAIL — some tickers did not meet minimum data contracts\n");
    return 1;
  } else if (warned > 0) {
    console.log("  RESULT: PASS WITH WARNINGS — all minimums met but coverage gaps exist\n");
    return 0;
  } else {
    console.log("  RESULT: PASS — all data contracts satisfied\n");
    return 0;
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  loadEnv();

  const args = process.argv.slice(2);
  const singleTicker = args.find(a => a.startsWith("--ticker="))?.split("=")[1]?.toUpperCase();
  const quick = args.includes("--quick");
  const verbose = args.includes("--verbose");

  // Check API keys
  if (!process.env.FRED_API_KEY) {
    console.error("⚠ FRED_API_KEY not set — macro data will be empty.");
    console.error("  Set it in .env or export FRED_API_KEY=your_key\n");
  }
  if (!process.env.FINDATASETS_API_KEY) {
    console.error("⚠ FINDATASETS_API_KEY not set — SEC filing data will be empty.");
    console.error("  Set it in .env or export FINDATASETS_API_KEY=your_key\n");
  }

  // Select test cases
  let cases = TEST_CASES;
  if (singleTicker) {
    cases = TEST_CASES.filter(c => c.ticker === singleTicker);
    if (cases.length === 0) {
      // Ad-hoc ticker with _default playbook
      cases = [{ ticker: singleTicker, playbook: "_default", expectedSector: null, minFields: 8 }];
    }
  } else if (quick) {
    cases = TEST_CASES.filter(c => QUICK_CASES.includes(c.ticker));
  }

  console.log(`\n  Running ${cases.length} test case(s)...\n`);

  // Fetch FRED data once (shared across all tickers)
  console.log("  Fetching macro data from FRED...");
  const fredResult = await gatherFredData(process.env.FRED_API_KEY);
  const fredIcon = fredResult.status === "ok" ? "✓" : fredResult.status === "partial" ? "~" : "✗";
  console.log(`  ${fredIcon} FRED: ${fredResult.status} (${fredResult.fields_filled.length} fields)\n`);

  // Run per-ticker tests sequentially (rate limit friendly)
  const results = [];

  for (const testCase of cases) {
    console.log(`  Testing ${testCase.ticker} (${testCase.playbook})...`);

    try {
      const [yahooResult, findatasetsResult] = await Promise.all([
        gatherYahooData(testCase.ticker),
        gatherFindatasetsData(testCase.ticker, process.env.FINDATASETS_API_KEY),
      ]);
      const yahooIcon = yahooResult.status === "ok" ? "✓" : yahooResult.status === "partial" ? "~" : "✗";
      const fdIcon = findatasetsResult.status === "ok" ? "✓" : findatasetsResult.status === "partial" ? "~" : findatasetsResult.status === "skipped" ? "—" : "✗";
      console.log(`    ${yahooIcon} Yahoo: ${yahooResult.status} (${yahooResult.fields_filled.length} fields)`);
      console.log(`    ${fdIcon} Findatasets: ${findatasetsResult.status} (${findatasetsResult.fields_filled.length} fields)`);

      // Build evidence bundle (same logic as gather.js)
      const sectorContract = SECTOR_CONTRACTS[testCase.playbook] || SECTOR_CONTRACTS["_default"];
      const allFilledFields = new Set([
        ...fredResult.fields_filled,
        ...yahooResult.fields_filled,
        ...findatasetsResult.fields_filled,
      ]);

      const dataConfidence = computeDataConfidence(allFilledFields, BASE_CONTRACT, sectorContract);

      const bundle = {
        ticker: testCase.ticker,
        playbook: testCase.playbook,
        tier: "financial",
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
            net_income: findatasetsResult.data.sec_net_income,
            gross_margin: findatasetsResult.data.sec_gross_margin,
            operating_margin: findatasetsResult.data.sec_operating_margin,
            eps_diluted: findatasetsResult.data.sec_eps_diluted,
            rd_expense: findatasetsResult.data.sec_rd_expense,
            revenue_growth_yoy: findatasetsResult.data.sec_revenue_growth_yoy,
          },
          sec_balance_sheet: {
            total_assets: findatasetsResult.data.sec_total_assets,
            total_debt: findatasetsResult.data.sec_total_debt,
            cash: findatasetsResult.data.sec_cash,
            debt_to_equity: findatasetsResult.data.sec_debt_to_equity,
          },
          sec_metrics: {
            roe: findatasetsResult.data.sec_roe,
            roic: findatasetsResult.data.sec_roic,
            ev_to_ebitda: findatasetsResult.data.sec_ev_to_ebitda,
            fcf_yield: findatasetsResult.data.sec_fcf_yield,
            peg_ratio: findatasetsResult.data.sec_peg_ratio,
            interest_coverage: findatasetsResult.data.sec_interest_coverage,
          },
          sec_estimates: {
            revenue: findatasetsResult.data.sec_est_revenue,
            eps: findatasetsResult.data.sec_est_eps,
            analyst_count: findatasetsResult.data.sec_est_analyst_count,
          },
          sec_earnings: {
            revenue_q: findatasetsResult.data.sec_earn_revenue_q,
            eps_q: findatasetsResult.data.sec_earn_eps_q,
            revenue_surprise: findatasetsResult.data.sec_revenue_surprise,
            eps_surprise: findatasetsResult.data.sec_eps_surprise,
            fiscal_period: findatasetsResult.data.sec_earn_fiscal_period,
          },
          sec_company: {
            name: findatasetsResult.data.sec_company_name,
            employees: findatasetsResult.data.sec_employees,
            sector: findatasetsResult.data.sec_sector,
          },
          sec_insider: {
            net_sentiment: findatasetsResult.data.sec_insider_net_sentiment,
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
      };

      // Validate
      const { issues, warnings } = validateBundle(bundle, testCase);

      let status = "pass";
      if (issues.length > 0) status = "fail";
      else if (warnings.length > 0) status = "warn";

      if (verbose) {
        console.log(JSON.stringify(bundle, null, 2));
      }

      results.push({ ...testCase, status, bundle, issues, warnings });

    } catch (err) {
      console.log(`    ! Error: ${err.message}`);
      results.push({ ...testCase, status: "error", error: err.message, bundle: null, issues: [], warnings: [] });
    }

    // Small delay between tickers to be polite to Yahoo
    if (cases.indexOf(testCase) < cases.length - 1) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  const exitCode = printSummary(results);
  process.exit(exitCode);
}

main().catch(e => {
  console.error(`Fatal: ${e.message}`);
  process.exit(1);
});
