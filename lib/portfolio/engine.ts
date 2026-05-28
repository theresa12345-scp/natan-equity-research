// Model portfolio engine — turns scores into target weights.
//
// Pipeline: universe → composite score → rank → top-N → conviction ×
// inverse-vol → cap → normalize → drift (current vs target).

import { getIDXTickers, type UniverseRow } from "@/lib/universe-loader";
import { buildGenericAggregate } from "@/lib/ticker-renderer";
import {
  applyCaps,
  estimateAnnualVol,
  type PortfolioPolicy,
  type RawWeight,
} from "./policy";

export interface ScoreSheet {
  ticker: string;
  name: string;
  sector: string;
  region: "IDX" | "US";
  price: number;
  beta: number | null;
  ytdReturn: number | null;
  divYld: number | null;
  score: number; // 0–100 composite
  compositeZ: number; // (score − 50) / 20
  annualVol: number; // CAPM proxy
}

export interface ModelHolding {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  beta: number | null;
  score: number;
  compositeZ: number;
  annualVol: number;
  targetWtPct: number; // policy output
  currentWtPct: number; // drifted by trailing return
  driftBps: number; // (current − target) × 10000
  rebalanceSignal: "ADD" | "TRIM" | "HOLD";
  divYld: number | null;
  ytdReturn: number | null;
  contributionToVol: number; // weight × vol — for risk decomposition
  contributionToReturn: number; // weight × score-implied edge
}

export interface SectorAllocation {
  name: string;
  pct: number;
}

export interface ModelPortfolio {
  policy: PortfolioPolicy;
  asOf: string;
  lastRebalance: string;
  nextRebalance: string;
  holdings: ModelHolding[];
  sectorAllocation: SectorAllocation[];
  totalNamesEligible: number; // universe size after minScore filter
  totalNamesHeld: number;
  portfolioVol: number;
  portfolioBeta: number;
  weightedZ: number;
  cashPct: number;
  topAdd: ModelHolding | null;
  topTrim: ModelHolding | null;
}

// ── Score sheet builder ─────────────────────────────────────────
export function buildIdxScoreSheet(): ScoreSheet[] {
  const universe = getIDXTickers(80);
  return universe
    .map((r) => buildScoreRow(r))
    .filter((r): r is ScoreSheet => r != null)
    .sort((a, b) => b.score - a.score);
}

function buildScoreRow(r: UniverseRow): ScoreSheet | null {
  if (!r.price || r.price <= 0) return null;
  const agg = buildGenericAggregate(r);
  return {
    ticker: r.ticker,
    name: r.name,
    sector: r.sector,
    region: r.region,
    price: r.price,
    beta: r.beta,
    ytdReturn: r.ytdReturn,
    divYld: null, // not in universe payload — kept null
    score: agg.score,
    compositeZ: (agg.score - 50) / 20,
    annualVol: estimateAnnualVol(r),
  };
}

// ── Model builder ───────────────────────────────────────────────
export function buildModelPortfolio(
  scores: ScoreSheet[],
  policy: PortfolioPolicy,
  refDate: string = "2026-05-28",
): ModelPortfolio {
  // 1) Filter to minimum score
  const eligible = scores.filter((s) => s.score >= policy.minScore);

  // 2) Take top N by score
  const picks = eligible.slice(0, policy.topN);

  // 3) Conviction × inverse-vol raw weights
  const sleeveTarget = (100 - policy.cashBufferPct) / 100;
  const raw: RawWeight[] = picks.map((s) => ({
    ticker: s.ticker,
    sector: s.sector,
    weight: Math.max(0, s.score - 40) * (1 / Math.max(0.08, s.annualVol)),
  }));
  const rawTotal = raw.reduce((sum, r) => sum + r.weight, 0);
  for (const r of raw) r.weight = (r.weight / rawTotal) * sleeveTarget;

  // 4) Apply caps (in proportion-of-100 units)
  const nameCapProp = policy.nameCapPct / 100;
  const sectorCapProp = policy.sectorCapPct / 100;
  const capped = applyCaps(raw, nameCapProp, sectorCapProp);

  // 5) Drift current weights from target using trailing return.
  // current_wt = target_wt × (1 + ytd_return × 1/12), renormalized.
  const driftRaw = capped.map((c) => {
    const s = picks.find((p) => p.ticker === c.ticker)!;
    const monthly = (s.ytdReturn ?? 0) / 12 / 100; // assume one-month drift
    return { ticker: c.ticker, weight: c.weight * (1 + monthly) };
  });
  const driftSum = driftRaw.reduce((sum, r) => sum + r.weight, 0);
  for (const d of driftRaw) d.weight = (d.weight / driftSum) * sleeveTarget;

  // 6) Compose holdings
  const holdings: ModelHolding[] = capped.map((c) => {
    const s = picks.find((p) => p.ticker === c.ticker)!;
    const current = driftRaw.find((d) => d.ticker === c.ticker)!;
    const targetPct = c.weight * 100;
    const currentPct = current.weight * 100;
    const driftBps = Math.round((currentPct - targetPct) * 100);
    const signal: ModelHolding["rebalanceSignal"] =
      driftBps > 200 ? "TRIM" : driftBps < -200 ? "ADD" : "HOLD";

    return {
      ticker: s.ticker,
      name: s.name,
      sector: s.sector,
      price: s.price,
      beta: s.beta,
      score: s.score,
      compositeZ: s.compositeZ,
      annualVol: s.annualVol,
      targetWtPct: targetPct,
      currentWtPct: currentPct,
      driftBps,
      rebalanceSignal: signal,
      divYld: s.divYld,
      ytdReturn: s.ytdReturn,
      contributionToVol: targetPct * s.annualVol,
      contributionToReturn: targetPct * s.compositeZ,
    };
  });
  holdings.sort((a, b) => b.targetWtPct - a.targetWtPct);

  // 7) Sector allocation (rolled-up)
  const sectorMap = new Map<string, number>();
  for (const h of holdings) {
    sectorMap.set(h.sector, (sectorMap.get(h.sector) ?? 0) + h.targetWtPct);
  }
  const sectorAllocation: SectorAllocation[] = Array.from(sectorMap.entries())
    .map(([name, pct]) => ({ name, pct }))
    .sort((a, b) => b.pct - a.pct);

  // 8) Aggregate stats
  const portfolioVol = Math.sqrt(
    holdings.reduce((s, h) => s + Math.pow((h.targetWtPct / 100) * h.annualVol, 2), 0),
  ) * Math.sqrt(holdings.length / Math.max(1, holdings.length - 1)); // mild correlation lift
  const portfolioBeta = holdings.reduce(
    (s, h) => s + (h.targetWtPct / 100) * (h.beta ?? 1.0),
    0,
  );
  const weightedZ = holdings.reduce(
    (s, h) => s + (h.targetWtPct / 100) * h.compositeZ,
    0,
  );

  // 9) Top add / trim by drift
  const sortedByDrift = [...holdings].sort((a, b) => b.driftBps - a.driftBps);
  const topTrim = sortedByDrift.length > 0 && sortedByDrift[0].driftBps > 0
    ? sortedByDrift[0] : null;
  const topAdd = sortedByDrift.length > 0 &&
    sortedByDrift[sortedByDrift.length - 1].driftBps < 0
    ? sortedByDrift[sortedByDrift.length - 1] : null;

  return {
    policy,
    asOf: refDate,
    lastRebalance: monthStart(refDate),
    nextRebalance: nextMonthStart(refDate),
    holdings,
    sectorAllocation,
    totalNamesEligible: scores.length,
    totalNamesHeld: holdings.length,
    portfolioVol,
    portfolioBeta,
    weightedZ,
    cashPct: policy.cashBufferPct,
    topAdd,
    topTrim,
  };
}

function monthStart(iso: string): string {
  return `${iso.slice(0, 7)}-01`;
}

function nextMonthStart(iso: string): string {
  const [y, m] = iso.split("-").map(Number);
  const nm = m === 12 ? 1 : m + 1;
  const ny = m === 12 ? y + 1 : y;
  return `${ny.toString().padStart(4, "0")}-${nm.toString().padStart(2, "0")}-01`;
}
