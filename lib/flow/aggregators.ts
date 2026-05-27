// Per-ticker aggregators + cross-sectional z-scoring + SMC compute.
// Pure functions over the stub data; live impl drops in unchanged.

import type {
  CongressTrade,
  Form4Txn,
  Position13F,
  TickerFlowAgg,
  SMCResult,
  SmartMoneyGrade,
} from "./types";
import {
  CLUSTER_DEFINITION,
  CONGRESS_WINDOW_DAYS,
  FORM4_WINDOW_DAYS,
  SMC_WEIGHTS_CP1,
} from "./config";

// ── Date helpers ─────────────────────────────────────────────────
function daysAgo(dateStr: string, ref: Date = new Date("2026-05-26")): number {
  const d = new Date(dateStr);
  return Math.floor((ref.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

function withinWindow(dateStr: string, days: number, ref?: Date): boolean {
  return daysAgo(dateStr, ref) <= days && daysAgo(dateStr, ref) >= 0;
}

function midUsd(t: CongressTrade): number {
  return (t.amountMin + t.amountMax) / 2;
}

// ── Per-ticker aggregator ────────────────────────────────────────
export function aggregateTicker(
  ticker: string,
  congress: CongressTrade[],
  positions: Position13F[],
  form4: Form4Txn[],
): TickerFlowAgg {
  // Congress 90d
  const cWin = congress.filter(
    (c) => c.ticker === ticker && withinWindow(c.tradeDate, CONGRESS_WINDOW_DAYS),
  );
  const congressBuys = cWin.filter((c) => c.transactionType === "Buy");
  const congressSells = cWin.filter((c) => c.transactionType === "Sale");
  const congressNetUsd =
    congressBuys.reduce((s, c) => s + midUsd(c), 0) -
    congressSells.reduce((s, c) => s + midUsd(c), 0);
  const congressActors = new Set(cWin.map((c) => c.politician)).size;

  // 13F (current Q)
  const posThis = positions.filter((p) => p.ticker === ticker);
  const adds = posThis.filter(
    (p) => p.isNew || (p.sharesChangeQoQ != null && p.sharesChangeQoQ > 0),
  ).length;
  const exits = posThis.filter(
    (p) => p.isExit || (p.sharesChangeQoQ != null && p.sharesChangeQoQ < 0),
  ).length;
  const totalValue = posThis.reduce((s, p) => s + p.valueUsd, 0);

  // Form 4 30d — P-code only, non-10b5-1 for cluster signal
  const f4Win = form4.filter(
    (f) =>
      f.ticker === ticker &&
      withinWindow(f.transactionDate, FORM4_WINDOW_DAYS),
  );
  const buys = f4Win.filter(
    (f) =>
      f.txnCode === "P" &&
      (!CLUSTER_DEFINITION.excludeRule10b51 || !f.is10b51),
  );
  const sells = f4Win.filter((f) => f.txnCode === "S" && !f.is10b51);
  const buyersSet = new Set(buys.map((b) => b.insiderName));
  const buyersCount = buysClusterCount(buys);
  const netUsd =
    buys.reduce((s, f) => s + f.valueUsd, 0) -
    sells.reduce((s, f) => s + f.valueUsd, 0);

  // Most-senior buyer — rank by title
  const titleRank = (title: string): number => {
    const t = title.toLowerCase();
    if (t.includes("chairman") || t.includes("ceo")) return 5;
    if (t.includes("cfo")) return 4;
    if (t.includes("president") || t.includes("coo")) return 4;
    if (t.includes("vp") || t.includes("vice")) return 3;
    if (t.includes("director")) return 2;
    return 1;
  };
  const mostSenior = [...buys].sort(
    (a, b) => titleRank(b.insiderTitle) - titleRank(a.insiderTitle),
  )[0];

  return {
    ticker,
    congressTrades90d: cWin.length,
    congressNetUsd90d: congressNetUsd,
    congressDistinctActors90d: congressActors,
    inst13FAdds: adds,
    inst13FExits: exits,
    inst13FNetHolderDelta: adds - exits,
    inst13FTotalValueUsd: totalValue,
    form4Buyers30d: buyersCount,
    form4NetUsd30d: netUsd,
    form4ClusterSize30d: buyersSet.size,
    form4MostSeniorBuyer: mostSenior
      ? `${mostSenior.insiderName} · ${mostSenior.insiderTitle}`
      : null,
  };
}

function buysClusterCount(buys: Form4Txn[]): number {
  return new Set(buys.map((b) => b.insiderName)).size;
}

// ── Cross-sectional z-score across tickers ──────────────────────
function zScore(values: number[]): (v: number) => number {
  const n = values.length;
  if (n === 0) return () => 0;
  const mean = values.reduce((s, x) => s + x, 0) / n;
  const variance =
    values.reduce((s, x) => s + (x - mean) ** 2, 0) / Math.max(1, n - 1);
  const sd = Math.sqrt(variance);
  if (sd === 0) return () => 0;
  return (v) => (v - mean) / sd;
}

// ── SMC compute ─────────────────────────────────────────────────
export function computeSMC(
  tickers: string[],
  congress: CongressTrade[],
  positions: Position13F[],
  form4: Form4Txn[],
  source: SMCResult["source"] = "stub",
): SMCResult[] {
  const aggs = tickers.map((t) => aggregateTicker(t, congress, positions, form4));

  // Cross-sectional values
  const congressVals = aggs.map((a) => a.congressNetUsd90d);
  const instVals = aggs.map((a) => a.inst13FNetHolderDelta);
  const insiderVals = aggs.map((a) => a.form4ClusterSize30d);

  const zC = zScore(congressVals);
  const zI = zScore(instVals);
  const zF = zScore(insiderVals);

  return aggs.map((a) => {
    const congressZ = zC(a.congressNetUsd90d);
    const instZ = zI(a.inst13FNetHolderDelta);
    const insiderZ = zF(a.form4ClusterSize30d);

    const w = SMC_WEIGHTS_CP1;
    const congressContribution = congressZ * w.congress;
    const instContribution = instZ * w.institutional;
    const insiderContribution = insiderZ * w.insider;
    const smcZ = congressContribution + instContribution + insiderContribution;

    return {
      ticker: a.ticker,
      asOf: new Date().toISOString(),
      smcZ,
      smcGrade: gradeFromZ(smcZ),
      components: {
        congress: { z: congressZ, contribution: congressContribution },
        institutional: { z: instZ, contribution: instContribution },
        insider: { z: insiderZ, contribution: insiderContribution },
        options: null,
      },
      source,
    };
  });
}

function gradeFromZ(z: number): SmartMoneyGrade {
  if (z >= 1.75) return "A+";
  if (z >= 1.25) return "A";
  if (z >= 0.75) return "A-";
  if (z >= 0.25) return "B+";
  if (z >= -0.25) return "B";
  if (z >= -0.75) return "B-";
  if (z >= -1.25) return "C";
  if (z >= -1.75) return "C-";
  if (z >= -2.25) return "D";
  return "F";
}

// ── Universe helper — union of tickers across all three sources ──
export function unionTickers(
  congress: CongressTrade[],
  positions: Position13F[],
  form4: Form4Txn[],
): string[] {
  const s = new Set<string>();
  congress.forEach((c) => s.add(c.ticker));
  positions.forEach((p) => s.add(p.ticker));
  form4.forEach((f) => s.add(f.ticker));
  return Array.from(s).sort();
}
