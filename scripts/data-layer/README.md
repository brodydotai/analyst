# Analyst Data Layer — Test Harness

Standalone test harness for validating the data gathering pipeline before integrating with the full Analyst framework. Runs locally (outside Cowork VM) against live APIs.

## Setup

```bash
cd scripts/data-layer
cp .env.example .env
# Edit .env — add your FRED API key
npm install
```

## Usage

### Single ticker
```bash
node gather.js NVDA                          # formatted output
node gather.js NVDA --json                   # raw JSON to stdout
node gather.js NVDA --playbook=semiconductors-and-accelerators
node gather.js NVDA --tier=overview
```

### Test harness (validates data contracts)
```bash
node test-harness.js                         # all 10 test tickers
node test-harness.js --quick                 # 3 tickers (NVDA, UUUU, AAPL)
node test-harness.js --ticker=NVDA           # single ticker
node test-harness.js --verbose               # show full evidence bundles
```

## What it tests

The test harness runs `gather.js` logic against each ticker and validates:

1. **Structure** — evidence_bundle has all required top-level keys
2. **Price data** — current price exists and is positive, 52w range is valid
3. **Fundamentals** — revenue/margins present, values in expected ranges
4. **Macro data** — FRED returned data (rates, CPI, yields)
5. **Data confidence** — computed score meets minimum threshold
6. **Field count** — meets per-playbook minimum (varies by sector depth)
7. **Coverage gaps** — flags missing required fields from data contracts
8. **Provider health** — FRED and Yahoo both responding

## Data contracts

Defined in `data-contracts.js`. Three layers:

- **BASE_CONTRACT** — every ticker needs: price, market_cap, 52w range
- **MACRO_CONTRACT** — every ticker needs: fed_funds_rate, treasury_10y, treasury_2y, cpi_yoy
- **SECTOR_CONTRACTS** — per-playbook requirements (e.g., semiconductors need gross_margin, R&D data)

## Providers

| Provider | File | Data | Auth |
|----------|------|------|------|
| FRED | `providers/fred.js` | Rates, CPI, DXY, yields, commodities | API key (free) |
| Yahoo | `providers/yahoo.js` | Price, fundamentals, analyst estimates | None (yahoo-finance2) |

## Output

`gather.js` outputs:
- **stderr**: Human-readable status (ticker, playbook, provider health, key data points)
- **stdout**: Full `evidence_bundle` JSON (pipe to file or downstream tools)

`test-harness.js` outputs:
- Per-ticker pass/warn/fail status with specific issues
- Field coverage matrix across all tickers
- Overall pass/fail verdict

## evidence_bundle shape

```json
{
  "ticker": "NVDA",
  "playbook": "semiconductors-and-accelerators",
  "tier": "financial",
  "gathered_at": "2026-03-03T...",
  "structured_data": {
    "price": { "current", "market_cap", "pe", "eps", "high_52w", "low_52w", "beta", "volume" },
    "fundamentals": { "revenue_ttm", "gross_margin", "operating_margin", "free_cash_flow", ... },
    "macro": { "fed_funds_rate", "treasury_10y", "cpi_yoy", "unemployment", "dxy", ... },
    "analyst": { "target_mean", "recommendation", "short_pct_float" },
    "classification": { "sector", "industry" }
  },
  "data_quality": {
    "data_confidence": 0.85,
    "providers": { "fred": { "status", "fields", "errors" }, "yahoo": { ... } },
    "total_fields_filled": 28,
    "coverage": { "base_required", "base_missing", "macro_required", "macro_missing", ... }
  }
}
```
