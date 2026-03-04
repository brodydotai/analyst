// ─── FRED PROVIDER ──────────────────────────────────────────────────────────
// Fetches macro data from the Federal Reserve Economic Data API.
// Docs: https://fred.stlouisfed.org/docs/api/fred/
//
// Returns the latest observation for each series.
// All series are fetched in parallel for speed.

const FRED_BASE = "https://api.stlouisfed.org/fred/series/observations";

const SERIES_MAP = {
  fed_funds_rate:     "DFF",
  treasury_10y:       "DGS10",
  treasury_2y:        "DGS2",
  yield_curve_spread: "T10Y2Y",
  cpi_index:          "CPIAUCSL",
  unemployment:       "UNRATE",
  dxy:                "DTWEXBGS",
  m2_money_supply:    "M2SL",
  wti_crude:          "DCOILWTICO",
  gold_price:         "GOLDAMGBD228NLBM",
  gdp:                "GDP",
};

async function fetchSeries(seriesId, apiKey) {
  const url = `${FRED_BASE}?series_id=${seriesId}&api_key=${apiKey}&file_type=json&limit=5&sort_order=desc`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`FRED ${seriesId}: HTTP ${res.status}`);
  const data = await res.json();
  const obs = data.observations?.find(o => o.value !== ".");
  if (!obs) return null;
  return { value: parseFloat(obs.value), date: obs.date };
}

// Compute CPI YoY from last 13 monthly observations
async function fetchCpiYoy(apiKey) {
  const url = `${FRED_BASE}?series_id=CPIAUCSL&api_key=${apiKey}&file_type=json&limit=13&sort_order=desc`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const obs = data.observations?.filter(o => o.value !== ".");
  if (!obs || obs.length < 13) return null;
  const latest = parseFloat(obs[0].value);
  const yearAgo = parseFloat(obs[12].value);
  return {
    value: Math.round(((latest - yearAgo) / yearAgo) * 10000) / 100,
    date: obs[0].date,
    label: "CPI YoY %",
  };
}

export async function gatherFredData(apiKey) {
  if (!apiKey) {
    console.warn("[FRED] No API key provided, skipping");
    return { source: "fred", status: "skipped", data: {}, errors: ["No API key"] };
  }

  const results = {};
  const errors = [];

  // Fetch all series in parallel
  const entries = Object.entries(SERIES_MAP);
  const promises = entries.map(async ([key, seriesId]) => {
    try {
      const result = await fetchSeries(seriesId, apiKey);
      if (result) results[key] = result;
      else errors.push(`${key}: no data`);
    } catch (e) {
      errors.push(`${key}: ${e.message}`);
    }
  });

  // Also fetch CPI YoY
  promises.push(
    fetchCpiYoy(apiKey).then(r => {
      if (r) results.cpi_yoy = r;
      else errors.push("cpi_yoy: computation failed");
    }).catch(e => errors.push(`cpi_yoy: ${e.message}`))
  );

  await Promise.all(promises);

  return {
    source: "fred",
    status: errors.length === 0 ? "ok" : errors.length < 5 ? "partial" : "failed",
    data: results,
    errors,
    fields_filled: Object.keys(results),
  };
}
