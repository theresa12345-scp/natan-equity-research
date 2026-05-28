// SEC EDGAR fetcher — companyfacts (XBRL) + submissions.
// The playbook §2.1 calls this "the single most valuable free source on
// the internet for US fundamentals." No API key — User-Agent header is
// mandatory ('Name email@domain'); missing/wrong UA returns 403.
// Hard limit: 10 req/s across all EDGAR domains (July 27, 2021 policy).

const UA =
  process.env.SEC_EDGAR_UA ??
  "Meridian Research research@meridian-equity.dev";

const TICKER_MAP_URL = "https://www.sec.gov/files/company_tickers.json";
const SUBMISSIONS = (cik: string): string =>
  `https://data.sec.gov/submissions/CIK${cik.padStart(10, "0")}.json`;
const COMPANY_FACTS = (cik: string): string =>
  `https://data.sec.gov/api/xbrl/companyfacts/CIK${cik.padStart(10, "0")}.json`;

interface SECTickerRow {
  cik_str: number;
  ticker: string;
  title: string;
}

let tickerMapCache: Map<string, { cik: string; name: string }> | null = null;

async function loadTickerMap(): Promise<Map<string, { cik: string; name: string }>> {
  if (tickerMapCache) return tickerMapCache;
  try {
    const res = await fetch(TICKER_MAP_URL, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return new Map();
    const j = (await res.json()) as Record<string, SECTickerRow>;
    const map = new Map<string, { cik: string; name: string }>();
    for (const row of Object.values(j)) {
      map.set(row.ticker.toUpperCase(), {
        cik: String(row.cik_str),
        name: row.title,
      });
    }
    tickerMapCache = map;
    return map;
  } catch {
    return new Map();
  }
}

export async function getCikForTicker(
  ticker: string,
): Promise<{ cik: string; name: string } | null> {
  const map = await loadTickerMap();
  return map.get(ticker.toUpperCase()) ?? null;
}

// XBRL US-GAAP fact unit point.
interface FactUnitPoint {
  start?: string;
  end: string;
  val: number;
  fy: number;
  fp: string;
  form: string;
  filed: string;
  accn: string;
}

interface CompanyFactsRaw {
  cik: number;
  entityName: string;
  facts?: {
    "us-gaap"?: Record<string, { units?: Record<string, FactUnitPoint[]> }>;
    dei?: Record<string, { units?: Record<string, FactUnitPoint[]> }>;
  };
}

export interface EdgarMetric {
  label: string;
  concept: string;
  unit: string;
  value: number;
  filed: string;
  end: string;
  form: string;
  fy: number;
  fp: string;
}

export interface EdgarSnapshot {
  ticker: string;
  cik: string;
  entityName: string;
  asOf: string; // ISO timestamp
  metrics: EdgarMetric[];
  source: "live" | "fallback";
  fetchedAt: string;
  errors?: string[];
}

// Pull latest annual / quarterly value for a list of US-GAAP concepts.
function latest(unit: FactUnitPoint[]): FactUnitPoint | null {
  if (!unit || unit.length === 0) return null;
  return [...unit].sort((a, b) => b.end.localeCompare(a.end))[0];
}

const CONCEPTS: Array<{ key: string; label: string; preferUnits: string[] }> = [
  { key: "Revenues", label: "Revenue", preferUnits: ["USD"] },
  { key: "RevenueFromContractWithCustomerExcludingAssessedTax", label: "Revenue (ASC 606)", preferUnits: ["USD"] },
  { key: "NetIncomeLoss", label: "Net Income", preferUnits: ["USD"] },
  { key: "Assets", label: "Total Assets", preferUnits: ["USD"] },
  { key: "Liabilities", label: "Total Liabilities", preferUnits: ["USD"] },
  { key: "StockholdersEquity", label: "Shareholders' Equity", preferUnits: ["USD"] },
  { key: "EarningsPerShareDiluted", label: "Diluted EPS", preferUnits: ["USD/shares"] },
  { key: "CashAndCashEquivalentsAtCarryingValue", label: "Cash & Equivalents", preferUnits: ["USD"] },
  { key: "CommonStockSharesOutstanding", label: "Shares Outstanding", preferUnits: ["shares"] },
  { key: "GrossProfit", label: "Gross Profit", preferUnits: ["USD"] },
  { key: "OperatingIncomeLoss", label: "Operating Income", preferUnits: ["USD"] },
];

export async function fetchEdgarSnapshot(
  ticker: string,
): Promise<EdgarSnapshot | null> {
  const ref = await getCikForTicker(ticker);
  if (!ref) {
    return {
      ticker,
      cik: "",
      entityName: "",
      asOf: new Date().toISOString(),
      metrics: [],
      source: "fallback",
      fetchedAt: new Date().toISOString(),
      errors: [`ticker ${ticker} not found in SEC company_tickers.json`],
    };
  }
  try {
    const res = await fetch(COMPANY_FACTS(ref.cik), {
      headers: { "User-Agent": UA, Accept: "application/json" },
      next: { revalidate: 21600 }, // 6h cache
    });
    if (!res.ok) {
      return {
        ticker,
        cik: ref.cik,
        entityName: ref.name,
        asOf: new Date().toISOString(),
        metrics: [],
        source: "fallback",
        fetchedAt: new Date().toISOString(),
        errors: [`SEC companyfacts ${res.status}`],
      };
    }
    const j = (await res.json()) as CompanyFactsRaw;
    const usGaap = j.facts?.["us-gaap"] ?? {};
    const dei = j.facts?.dei ?? {};
    const metrics: EdgarMetric[] = [];
    const seenLabels = new Set<string>();

    for (const c of CONCEPTS) {
      const node = usGaap[c.key] ?? dei[c.key];
      if (!node?.units) continue;
      // First preferred unit that has data
      let chosen: { unit: string; point: FactUnitPoint } | null = null;
      for (const u of c.preferUnits) {
        const pts = node.units[u];
        if (pts && pts.length > 0) {
          const p = latest(pts);
          if (p) {
            chosen = { unit: u, point: p };
            break;
          }
        }
      }
      // Fallback to whatever unit exists
      if (!chosen) {
        const firstUnit = Object.keys(node.units)[0];
        if (firstUnit && node.units[firstUnit]) {
          const p = latest(node.units[firstUnit]);
          if (p) chosen = { unit: firstUnit, point: p };
        }
      }
      if (!chosen) continue;
      if (seenLabels.has(c.label)) continue;
      seenLabels.add(c.label);
      metrics.push({
        label: c.label,
        concept: c.key,
        unit: chosen.unit,
        value: chosen.point.val,
        filed: chosen.point.filed,
        end: chosen.point.end,
        form: chosen.point.form,
        fy: chosen.point.fy,
        fp: chosen.point.fp,
      });
    }

    return {
      ticker,
      cik: ref.cik,
      entityName: j.entityName ?? ref.name,
      asOf: new Date().toISOString(),
      metrics,
      source: metrics.length > 0 ? "live" : "fallback",
      fetchedAt: new Date().toISOString(),
    };
  } catch (err) {
    return {
      ticker,
      cik: ref.cik,
      entityName: ref.name,
      asOf: new Date().toISOString(),
      metrics: [],
      source: "fallback",
      fetchedAt: new Date().toISOString(),
      errors: [(err as Error).message],
    };
  }
}

// Lightweight format helpers for UI.
export function fmtEdgarValue(m: EdgarMetric): string {
  const abs = Math.abs(m.value);
  if (m.unit === "USD") {
    if (abs >= 1e12) return `$${(m.value / 1e12).toFixed(2)}T`;
    if (abs >= 1e9) return `$${(m.value / 1e9).toFixed(2)}B`;
    if (abs >= 1e6) return `$${(m.value / 1e6).toFixed(2)}M`;
    return `$${m.value.toFixed(0)}`;
  }
  if (m.unit === "USD/shares") return `$${m.value.toFixed(2)}`;
  if (m.unit === "shares") {
    if (abs >= 1e9) return `${(m.value / 1e9).toFixed(2)}B sh`;
    if (abs >= 1e6) return `${(m.value / 1e6).toFixed(1)}M sh`;
    return `${Math.round(m.value).toLocaleString("en-US")} sh`;
  }
  return String(m.value);
}
