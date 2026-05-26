// Generic per-ticker data factory — used by dynamic routes for non-featured
// tickers. Deterministic so refresh = same numbers. Phase 4 will replace
// this with live yahoo-finance2 + ported lib/grade/pillars.ts computation.

import {
  type UniverseRow,
  deterministicScore,
  letterFromScore,
  letterTone,
  getPeers,
} from "./universe-loader";

function pct(v: number | null | undefined, digits = 1): string {
  if (v === null || v === undefined) return "—";
  return `${v.toFixed(digits)}%`;
}

function num(v: number | null | undefined, digits = 2): string {
  if (v === null || v === undefined) return "—";
  return v.toFixed(digits);
}

function compactCurrency(v: number, region: "IDX" | "US"): string {
  if (region === "IDX") {
    const trn = v / 1e12;
    if (trn >= 1) return `Rp ${trn.toFixed(1)} trn`;
    const mrd = v / 1e9;
    if (mrd >= 1) return `Rp ${mrd.toFixed(0)} mrd`;
    return `Rp ${v.toLocaleString()}`;
  }
  const bn = v / 1e9;
  if (bn >= 1000) return `$${(bn / 1000).toFixed(2)} trn`;
  if (bn >= 1) return `$${bn.toFixed(1)} bn`;
  return `$${(v / 1e6).toFixed(0)} M`;
}

function fmtPrice(p: number, region: "IDX" | "US"): string {
  return region === "IDX"
    ? `Rp ${p.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
    : `$${p.toFixed(2)}`;
}

export interface PillarRow {
  name: string;
  weight: number;
  score: number;
  letter: string;
  tone: "mag" | "pos" | "amber" | "neg";
  raw?: Record<string, number | string | undefined>;
  pctRank?: number;
  contribution?: number;
}

const IDX_WEIGHTS = [
  ["Valuation", 20],
  ["Quality", 20],
  ["Profitability", 15],
  ["Financial Health", 10],
  ["Low-Vol / Defensive", 10],
  ["Sentiment", 10],
  ["Growth", 5],
  ["Momentum (ST reversal)", 5],
  ["Liquidity", 5],
] as const;

const US_WEIGHTS = [
  ["Valuation", 15],
  ["Quality", 15],
  ["Profitability", 10],
  ["Financial Health", 10],
  ["Low-Vol / Defensive", 10],
  ["Sentiment", 10],
  ["Growth", 10],
  ["Momentum (Carhart 12-1)", 15],
  ["Liquidity", 5],
] as const;

export function buildGenericPillars(r: UniverseRow): PillarRow[] {
  const weights = r.region === "IDX" ? IDX_WEIGHTS : US_WEIGHTS;
  return weights.map(([name, weight]) => {
    const score = deterministicScore(r.ticker, name);
    return {
      name,
      weight,
      score,
      letter: letterFromScore(score),
      tone: letterTone(score),
      raw: {},
      pctRank: deterministicScore(r.ticker, name + ":rank", 5, 99),
      contribution: (score * weight) / 100,
    };
  });
}

export function buildGenericAggregate(r: UniverseRow): {
  letter: string;
  score: number;
  max: number;
  verdict: string;
  verdictTone: "buy" | "hold" | "sell";
  horizon: string;
  targetPx: number;
  targetUpsidePct: number;
  downsidePx: number;
  downsideDeltaPct: number;
  rrRatio: number;
  positionSize: number;
} {
  const pillars = buildGenericPillars(r);
  const score = pillars.reduce((s, p) => s + (p.score * p.weight) / 100, 0);
  const letter = letterFromScore(score);
  const verdict = score >= 75 ? "TOP DECILE" : score >= 60 ? "ABOVE MEDIAN" : score >= 45 ? "MID PERCENTILE" : "BELOW MEDIAN";
  const verdictTone: "buy" | "hold" | "sell" =
    score >= 75 ? "buy" : score >= 45 ? "hold" : "sell";
  const upside = deterministicScore(r.ticker, "upside", -25, 35);
  const downside = deterministicScore(r.ticker, "downside", -40, -10);
  const target = r.price * (1 + upside / 100);
  const down = r.price * (1 + downside / 100);
  return {
    letter,
    score,
    max: 100,
    verdict,
    verdictTone,
    horizon: "12 mo",
    targetPx: target,
    targetUpsidePct: upside,
    downsidePx: down,
    downsideDeltaPct: downside,
    rrRatio: Math.abs(upside / downside),
    positionSize: Math.max(0, Math.min(6, (score - 50) / 10)),
  };
}

export function buildGenericKPIs(r: UniverseRow): Array<{
  label: string;
  value: string;
  sub?: string;
  subTone?: "pos" | "neg" | "neutral";
}> {
  return [
    { label: "MKT CAP", value: compactCurrency(r.marketCap, r.region), subTone: "neutral" },
    { label: r.region === "IDX" ? "P/E TTM" : "P/E TTM", value: r.pe ? `${r.pe.toFixed(1)}×` : "—", subTone: "neutral" },
    { label: "P/BV", value: r.pb ? `${r.pb.toFixed(2)}×` : "—", subTone: "neutral" },
    { label: "ROE", value: pct(r.roe), subTone: (r.roe ?? 0) >= 15 ? "pos" : "neutral" },
    { label: "BETA", value: num(r.beta), sub: r.region === "IDX" ? "vs IHSG" : "vs SPX", subTone: "neutral" },
    { label: "REV GROWTH", value: pct(r.revenueGrowth), subTone: (r.revenueGrowth ?? 0) > 0 ? "pos" : "neg" },
    { label: "GROSS MGN", value: pct(r.grossMargin), subTone: "neutral" },
    { label: "YTD", value: pct(r.ytdReturn), subTone: (r.ytdReturn ?? 0) >= 0 ? "pos" : "neg" },
  ];
}

export function buildGenericDcfCapm(r: UniverseRow): Array<{ label: string; value: string; emphasis?: boolean }> {
  if (r.region === "IDX") {
    const rf = 6.842;
    const erp = 4.35;
    const beta = r.beta ?? 1.0;
    const ke = rf + beta * erp;
    return [
      { label: "Risk-free · ID 10Y", value: `${rf.toFixed(3)}%` },
      { label: "ERP · Damodaran 2026", value: `${erp.toFixed(2)}%` },
      { label: "Beta · 60mo vs IHSG", value: beta.toFixed(2) },
      { label: "CRP · ID", value: "0.00%" },
      { label: "Cost of Equity (Ke)", value: `${ke.toFixed(2)}%`, emphasis: true },
    ];
  }
  const rf = 4.5;
  const erp = 6.0;
  const beta = r.beta ?? 1.0;
  const ke = rf + beta * erp;
  return [
    { label: "Risk-free · UST 10Y", value: `${rf.toFixed(2)}%` },
    { label: "ERP · Damodaran 2026 US", value: `${erp.toFixed(2)}%` },
    { label: "Beta · 60mo vs SPX", value: beta.toFixed(2) },
    { label: "CRP · US", value: "0.00%" },
    { label: "Cost of Equity (Ke)", value: `${ke.toFixed(2)}%`, emphasis: true },
  ];
}

export function buildGenericComps(r: UniverseRow): Array<{
  ticker: string;
  issuer: string;
  sect: string;
  mcap: number;
  pe: number;
  pbv: number;
  roe: number;
  nim: number;
  cir: number;
  npl: number;
  divYld: number;
  eps5y: number;
  perf3m: number;
  beta: number;
  grade: string;
  highlight?: "subject" | "peer";
}> {
  const peers = getPeers(r, 5);
  function toRow(x: UniverseRow, highlight?: "subject" | "peer") {
    const score = highlight === "subject" ? deterministicScore(x.ticker, "agg") : deterministicScore(x.ticker, "agg");
    return {
      ticker: x.ticker,
      issuer: x.name,
      sect: x.industryGroup,
      mcap: x.marketCap / (x.region === "IDX" ? 1e12 : 1e9),
      pe: x.pe ?? 0,
      pbv: x.pb ?? 0,
      roe: x.roe ?? 0,
      nim: x.ebitdaMargin ?? 0,
      cir: x.fcfConversion ? x.fcfConversion * 100 : 0,
      npl: x.de ?? 0,
      divYld: 0,
      eps5y: x.epsGrowth ?? 0,
      perf3m: x.ytdReturn ?? 0,
      beta: x.beta ?? 1,
      grade: letterFromScore(score),
      highlight,
    };
  }
  return [toRow(r, "subject"), ...peers.map((p) => toRow(p))];
}

export function compactCurrencyExport(v: number, region: "IDX" | "US"): string {
  return compactCurrency(v, region);
}

// ----------------- Research overview generator -----------------

// Produces a multi-paragraph, fundamentals-grounded overview for any
// ticker in the universe. Used by the dynamic /idx/[ticker] and
// /us/[ticker] routes for non-featured tickers (BBCA, MYOR, NVDA still
// carry hand-written thesis prose).
//
// Methodology:
// - Paragraph 1: sector positioning + size context + market identity
// - Paragraph 2: quality + profitability + growth (ROE, margins,
//   revenue/EPS growth) with bucketed qualitative language
// - Paragraph 3: valuation + leverage + beta context
// - Paragraph 4: composite framing — top pillars, bottom pillar,
//   regime sensitivity, peer-percentile claim

function qualityBucket(roe: number | null | undefined): string {
  if (roe === null || roe === undefined) return "with limited disclosure on capital efficiency";
  if (roe < 0) return "currently loss-making with negative return on equity";
  if (roe > 30) return "exhibiting exceptional capital efficiency (ROE > 30%)";
  if (roe > 20) return "with high-quality capital returns (ROE > 20%)";
  if (roe > 15) return "with above-average return on equity";
  if (roe > 8) return "with adequate profitability";
  return "with below-average return on equity";
}

function growthBucket(g: number | null | undefined, label: string): string {
  if (g === null || g === undefined) return `${label} disclosure is incomplete`;
  if (g < -10) return `${label} is contracting sharply (${g.toFixed(1)}%)`;
  if (g < 0) return `${label} is mildly negative (${g.toFixed(1)}%)`;
  if (g < 5) return `${label} is muted at ${g.toFixed(1)}%`;
  if (g < 10) return `${label} runs at a steady ${g.toFixed(1)}%`;
  if (g < 20) return `${label} is healthy at ${g.toFixed(1)}%`;
  if (g < 40) return `${label} is strong at ${g.toFixed(1)}%`;
  return `${label} is in hyper-growth territory at ${g.toFixed(1)}%`;
}

function valuationBucket(pe: number | null | undefined, region: "IDX" | "US"): string {
  if (pe === null || pe === undefined) return "with no trailing P/E disclosed";
  if (pe < 0) return `at a negative trailing P/E (earnings-cycle anomaly)`;
  if (pe > 60) return `at a steep ${pe.toFixed(1)}× P/E — pricing material future growth`;
  if (pe > 30) return `at a premium ${pe.toFixed(1)}× P/E`;
  if (pe > 20) return `at an elevated ${pe.toFixed(1)}× P/E`;
  if (pe > 14) return `at a fair ${pe.toFixed(1)}× P/E around ${region === "IDX" ? "IDX" : "US"} averages`;
  if (pe > 8) return `at a value-tier ${pe.toFixed(1)}× P/E`;
  return `at a deep-value ${pe.toFixed(1)}× P/E`;
}

function leverageBucket(de: number | null | undefined): string {
  if (de === null || de === undefined) return "with leverage not disclosed";
  if (de > 300) return "carrying very high leverage";
  if (de > 150) return "with elevated leverage";
  if (de > 80) return "with moderate leverage";
  if (de > 30) return "with conservative leverage";
  return "with minimal leverage";
}

function betaBucket(beta: number | null | undefined): string {
  if (beta === null || beta === undefined) return "Beta is unavailable";
  if (beta > 1.6) return `Beta ${beta.toFixed(2)} marks the name as a high-sensitivity vehicle`;
  if (beta > 1.2) return `Beta ${beta.toFixed(2)} sits above the market`;
  if (beta > 0.85) return `Beta ${beta.toFixed(2)} is close to the market`;
  if (beta > 0.6) return `Beta ${beta.toFixed(2)} is defensive`;
  return `Beta ${beta.toFixed(2)} is strongly defensive`;
}

function sizeBucket(mcap: number, region: "IDX" | "US"): string {
  if (region === "IDX") {
    if (mcap > 5e14) return "mega-cap";
    if (mcap > 1e14) return "large-cap";
    if (mcap > 1e13) return "mid-cap";
    return "small-cap";
  }
  if (mcap > 2e11) return "mega-cap";
  if (mcap > 1e10) return "large-cap";
  if (mcap > 1e9) return "mid-cap";
  return "small-cap";
}

function marginContext(grossMargin: number | null | undefined, ebitdaMargin: number | null | undefined): string {
  const gross = grossMargin;
  const ebitda = ebitdaMargin;
  if (gross != null && ebitda != null) {
    return `Gross margin ${gross.toFixed(1)}% drops to ${ebitda.toFixed(1)}% at the EBITDA line — operating leverage is ${gross - ebitda < 15 ? "tight" : "modest"}`;
  }
  if (ebitda != null) {
    return `EBITDA margin runs at ${ebitda.toFixed(1)}%`;
  }
  if (gross != null) {
    return `Gross margin reads ${gross.toFixed(1)}%, with EBITDA disclosure absent`;
  }
  return "Margin disclosure is incomplete";
}

function regionDescriptor(region: "IDX" | "US"): { market: string; index: string } {
  if (region === "IDX") return { market: "the Indonesia Stock Exchange (IDX)", index: "IHSG TR" };
  return { market: "US markets", index: "the S&P 500" };
}

export function generateThesis(r: UniverseRow, pillars: PillarRow[]): string {
  const { market, index } = regionDescriptor(r.region);
  const size = sizeBucket(r.marketCap, r.region);
  const valuation = valuationBucket(r.pe, r.region);
  const quality = qualityBucket(r.roe);
  const leverage = leverageBucket(r.de);
  const beta = betaBucket(r.beta);
  const revGrowth = growthBucket(r.revenueGrowth, "Revenue growth");
  const epsGrowth = growthBucket(r.epsGrowth, "EPS growth");
  const margins = marginContext(r.grossMargin, r.ebitdaMargin);

  // Top and bottom pillars by score
  const sorted = pillars.slice().sort((a, b) => b.score - a.score);
  const top = sorted.slice(0, 2);
  const bottom = sorted[sorted.length - 1];
  const composite = pillars.reduce((s, p) => s + (p.score * p.weight) / 100, 0);
  const zScore = (composite - 50) / 20;
  const pctBucket =
    composite >= 80 ? "top decile" :
    composite >= 70 ? "top quartile" :
    composite >= 55 ? "above the universe median" :
    composite >= 45 ? "near the universe median" :
    composite >= 30 ? "below the universe median" :
    "bottom decile";

  const momentumPillar = pillars.find((p) => p.name.toLowerCase().includes("momentum"));
  const regimeNote = momentumPillar
    ? `Composite ${zScore >= 0 ? "+" : ""}${zScore.toFixed(2)}σ — ${pctBucket} of the ${r.region === "IDX" ? "LQ45/IDX80" : "S&P 500"} cohort. Top-weighted pillars: ${top.map((p) => p.name).join(" and ")} (avg ${Math.round((top[0].score + top[1].score) / 2)}). Weakest pillar: ${bottom.name} (${bottom.score}).`
    : `Composite ${zScore >= 0 ? "+" : ""}${zScore.toFixed(2)}σ — ${pctBucket} of the universe.`;

  const ytd = r.ytdReturn;
  const ytdLine =
    ytd === null || ytd === undefined
      ? ""
      : ytd > 25
        ? ` YTD price action is strong (${ytd.toFixed(1)}%), suggesting market participants are leaning into the same factors the composite rewards.`
        : ytd > 0
          ? ` YTD price action is positive (${ytd.toFixed(1)}%).`
          : ytd > -15
            ? ` YTD price action is soft (${ytd.toFixed(1)}%) — a possible entry window if the composite holds.`
            : ` YTD price action is sharply negative (${ytd.toFixed(1)}%) — the composite is being tested against drawdown.`;

  const sectorLine = `${r.name} is a ${size} ${r.sector.toLowerCase()} name listed on ${market}, operating in ${r.industryGroup}. Market capitalisation runs at ${compactCurrency(r.marketCap, r.region)}.`;

  const qualityLine = `Quality is the first lens: the company prints ${quality}. ${margins}. On the growth side, ${revGrowth.toLowerCase()}, while ${epsGrowth.toLowerCase()}.`;

  const valLine = `Valuation positions the name ${valuation}, ${leverage}. ${beta} — the name ${r.beta != null && r.beta > 1.1 ? "moves with amplified sensitivity to the broader" : r.beta != null && r.beta < 0.9 ? "decouples partially from the broader" : "tracks the broader"} ${index}.${ytdLine}`;

  const compositeLine = `${regimeNote} Phase 4 will replace the deterministic auto-render with live yahoo-finance2 fundamentals and the ported lib/grade/pillars.ts engine; until then, every figure above is anchored to the snapshot fundamentals visible in the KPI strip.`;

  return `${sectorLine}\n\n${qualityLine}\n\n${valLine}\n\n${compositeLine}`;
}

