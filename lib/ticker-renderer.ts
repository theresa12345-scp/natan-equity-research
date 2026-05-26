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
