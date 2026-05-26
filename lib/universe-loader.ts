// Universe loader — reads bulk security data from public/static JSON
// at build time (Node fs) for static generation. No runtime fetch.
//
// TODO Phase 4: switch to yahoo-finance2 calls keyed by ticker for
// live fundamentals. Until then this is point-in-time snapshot data.

import fs from "node:fs";
import path from "node:path";

export interface UniverseRow {
  ticker: string;
  name: string;
  sector: string;
  industryGroup: string;
  region: "IDX" | "US";
  marketCap: number;
  price: number;
  pe: number | null;
  pb: number | null;
  roe: number | null;
  de: number | null;
  beta: number | null;
  alpha: number | null;
  ytdReturn: number | null;
  revenue: number | null;
  revenueGrowth: number | null;
  netIncome: number | null;
  epsGrowth: number | null;
  netIncomeGrowth: number | null;
  fcf: number | null;
  ebitda: number | null;
  fcfConversion: number | null;
  grossMargin: number | null;
  ebitdaMargin: number | null;
  curRatio: number | null;
  quickRatio: number | null;
  weight: number | null;
  gicsSector?: string;
  gicsIndustryGroup?: string;
}

interface RawRow {
  Ticker: string;
  Name: string;
  "Industry Sector": string;
  "Industry Group": string;
  Region: string;
  "Market Cap": number;
  Price: number;
  PE: number | null;
  PB: number | null;
  ROE: number | null;
  DE: number | null;
  Beta: number | null;
  Alpha: number | null;
  "Company YTD Return": number | null;
  Revenue: number | null;
  "Revenue Growth": number | null;
  "Net Income": number | null;
  "EPS Growth": number | null;
  "Net Income Growth": number | null;
  FCF: number | null;
  EBITDA: number | null;
  "FCF Conversion": number | null;
  "Gross Margin": number | null;
  "EBITDA Margin": number | null;
  "Cur Ratio": number | null;
  "Quick Ratio": number | null;
  Weight: number | null;
  "GICS Sector"?: string;
  "GICS Industry Group"?: string;
}

let cache: UniverseRow[] | null = null;

function normalize(r: RawRow): UniverseRow {
  return {
    ticker: r.Ticker,
    name: r.Name,
    sector: r["Industry Sector"],
    industryGroup: r["Industry Group"],
    region: r.Region === "Indonesia" ? "IDX" : "US",
    marketCap: r["Market Cap"],
    price: r.Price,
    pe: r.PE,
    pb: r.PB,
    roe: r.ROE,
    de: r.DE,
    beta: r.Beta,
    alpha: r.Alpha,
    ytdReturn: r["Company YTD Return"],
    revenue: r.Revenue,
    revenueGrowth: r["Revenue Growth"],
    netIncome: r["Net Income"],
    epsGrowth: r["EPS Growth"],
    netIncomeGrowth: r["Net Income Growth"],
    fcf: r.FCF,
    ebitda: r.EBITDA,
    fcfConversion: r["FCF Conversion"],
    grossMargin: r["Gross Margin"],
    ebitdaMargin: r["EBITDA Margin"],
    curRatio: r["Cur Ratio"],
    quickRatio: r["Quick Ratio"],
    weight: r.Weight,
    gicsSector: r["GICS Sector"],
    gicsIndustryGroup: r["GICS Industry Group"],
  };
}

export function loadUniverse(): UniverseRow[] {
  if (cache) return cache;
  const filePath = path.join(
    process.cwd(),
    "public",
    "static",
    "global_companies_full.json",
  );
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw) as RawRow[];
    cache = parsed.map(normalize);
  } catch {
    cache = [];
  }
  return cache;
}

export function getTickerData(
  ticker: string,
  region?: "IDX" | "US",
): UniverseRow | undefined {
  const upper = ticker.toUpperCase();
  const all = loadUniverse();
  return all.find(
    (r) => r.ticker.toUpperCase() === upper && (!region || r.region === region),
  );
}

export function getIDXTickers(limit: number = 80): UniverseRow[] {
  return loadUniverse()
    .filter((r) => r.region === "IDX" && (r.marketCap ?? 0) > 0)
    .sort((a, b) => (b.marketCap ?? 0) - (a.marketCap ?? 0))
    .slice(0, limit);
}

export function getUSTickers(limit: number = 500): UniverseRow[] {
  return loadUniverse()
    .filter((r) => r.region === "US" && (r.marketCap ?? 0) > 0)
    .sort((a, b) => (b.marketCap ?? 0) - (a.marketCap ?? 0))
    .slice(0, limit);
}

export function getAllTrackedTickers(): UniverseRow[] {
  return [...getIDXTickers(80), ...getUSTickers(500)];
}

// Static params for generateStaticParams — pre-generate ONLY the featured
// tickers. Everything else falls back to runtime rendering via
// dynamicParams = true. This keeps the build worker under its 60s
// timeout while still letting the full universe be reachable at runtime.
export function getStaticIdxParams(): { ticker: string }[] {
  return [{ ticker: "bbca" }, { ticker: "myor" }];
}

export function getStaticUsParams(): { ticker: string }[] {
  return [{ ticker: "nvda" }];
}

// Deterministic pseudo-score for generic rendering — same ticker always
// yields the same number, so refresh shows stable values. Range 30..95.
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function deterministicScore(ticker: string, salt: string, min = 30, max = 95): number {
  const seed = hash(ticker + ":" + salt);
  return min + (seed % (max - min));
}

export function letterFromScore(score: number): string {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "A−";
  if (score >= 60) return "B+";
  if (score >= 50) return "B";
  if (score >= 40) return "B−";
  if (score >= 30) return "C";
  return "D";
}

export function letterTone(score: number): "pos" | "mag" | "amber" | "neg" {
  if (score >= 80) return "pos";
  if (score >= 60) return "mag";
  if (score >= 40) return "amber";
  return "neg";
}

export function getPeers(subject: UniverseRow, limit: number = 5): UniverseRow[] {
  const all = loadUniverse();
  return all
    .filter(
      (r) =>
        r.ticker !== subject.ticker &&
        r.region === subject.region &&
        r.industryGroup === subject.industryGroup &&
        (r.marketCap ?? 0) > 0,
    )
    .sort((a, b) => (b.marketCap ?? 0) - (a.marketCap ?? 0))
    .slice(0, limit);
}
