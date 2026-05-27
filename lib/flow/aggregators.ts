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

// ── Per-ticker flow detail (drives the security-page Flow tab) ──
export type FlowVerdict = "BULLISH" | "MILDLY BULLISH" | "NEUTRAL" | "MILDLY BEARISH" | "BEARISH";

export interface TickerFlowDetail {
  ticker: string;
  hasData: boolean;
  smc: SMCResult | null;
  agg: TickerFlowAgg | null;
  verdict: FlowVerdict;
  synthesis: string;
  congressForTicker: CongressTrade[];
  positionsForTicker: Position13F[];
  form4ForTicker: Form4Txn[];
}

function verdictFromZ(z: number): FlowVerdict {
  if (z >= 0.75) return "BULLISH";
  if (z >= 0.25) return "MILDLY BULLISH";
  if (z >= -0.25) return "NEUTRAL";
  if (z >= -0.75) return "MILDLY BEARISH";
  return "BEARISH";
}

function leanFromAgg(agg: TickerFlowAgg): FlowVerdict {
  // Used when a ticker has no SMC slot (not in computed universe).
  const congressLean = agg.congressNetUsd90d > 0 ? 1 : agg.congressNetUsd90d < 0 ? -1 : 0;
  const instLean = agg.inst13FNetHolderDelta > 0 ? 1 : agg.inst13FNetHolderDelta < 0 ? -1 : 0;
  const insiderLean = agg.form4ClusterSize30d >= 3 ? 1 : agg.form4NetUsd30d < 0 ? -1 : 0;
  const score = congressLean + instLean + insiderLean;
  if (score >= 2) return "BULLISH";
  if (score === 1) return "MILDLY BULLISH";
  if (score === 0) return "NEUTRAL";
  if (score === -1) return "MILDLY BEARISH";
  return "BEARISH";
}

export function flowForTicker(
  ticker: string,
  congress: CongressTrade[],
  positions: Position13F[],
  form4: Form4Txn[],
  smcUniverse?: SMCResult[],
): TickerFlowDetail {
  const congressForTicker = congress
    .filter((c) => c.ticker === ticker)
    .sort((a, b) => b.tradeDate.localeCompare(a.tradeDate));
  const positionsForTicker = positions
    .filter((p) => p.ticker === ticker)
    .sort((a, b) => b.valueUsd - a.valueUsd);
  const form4ForTicker = form4
    .filter((f) => f.ticker === ticker)
    .sort((a, b) => b.transactionDate.localeCompare(a.transactionDate));

  const hasData =
    congressForTicker.length > 0 ||
    positionsForTicker.length > 0 ||
    form4ForTicker.length > 0;

  if (!hasData) {
    return {
      ticker,
      hasData: false,
      smc: null,
      agg: null,
      verdict: "NEUTRAL",
      synthesis: "No tracked smart-money disclosures for this security.",
      congressForTicker,
      positionsForTicker,
      form4ForTicker,
    };
  }

  const agg = aggregateTicker(ticker, congress, positions, form4);
  const smc = smcUniverse?.find((s) => s.ticker === ticker) ?? null;
  const verdict = smc ? verdictFromZ(smc.smcZ) : leanFromAgg(agg);

  const cBuys = congressForTicker.filter(
    (c) => c.transactionType === "Buy" && withinWindow(c.tradeDate, CONGRESS_WINDOW_DAYS),
  ).length;
  const instAdds = agg.inst13FAdds;
  const cluster = agg.form4ClusterSize30d;
  const parts: string[] = [];
  parts.push(`${cBuys} congress buy${cBuys === 1 ? "" : "s"} (90d)`);
  parts.push(`${instAdds} institutional add${instAdds === 1 ? "" : "s"} (latest Q)`);
  if (cluster >= 3) parts.push(`${cluster}-insider cluster (30d)`);
  else if (cluster > 0) parts.push(`${cluster} insider buy${cluster === 1 ? "" : "s"} (30d)`);
  else parts.push("no insider cluster (30d)");

  const synthesis = `Net smart-money read: ${verdict} · ${parts.join(" · ")}`;

  return {
    ticker,
    hasData: true,
    smc,
    agg,
    verdict,
    synthesis,
    congressForTicker,
    positionsForTicker,
    form4ForTicker,
  };
}

// ── Convenience: one-shot Flow workstation prop (detail + meta) ──
import { CONGRESS_STUB } from "./stubs/congress";
import { FORM4_STUB, FORM4_AS_OF } from "./stubs/form4";
import {
  THIRTEEN_F_STUB,
  THIRTEEN_F_AS_OF,
  THIRTEEN_F_PERIOD_END,
} from "./stubs/thirteen-f";

export interface FlowWorkstationProp {
  detail: TickerFlowDetail;
  meta: {
    congressAsOf: string;
    form4AsOf: string;
    thirteenFAsOf: string;
    thirteenFPeriodEnd: string;
  };
}

export function buildFlowForTickerProp(ticker: string): FlowWorkstationProp {
  const tickers = unionTickers(CONGRESS_STUB, THIRTEEN_F_STUB, FORM4_STUB);
  const smc = computeSMC(tickers, CONGRESS_STUB, THIRTEEN_F_STUB, FORM4_STUB);
  const detail = flowForTicker(ticker, CONGRESS_STUB, THIRTEEN_F_STUB, FORM4_STUB, smc);
  return {
    detail,
    meta: {
      congressAsOf: CONGRESS_STUB.reduce(
        (max, c) => (c.filingDate > max ? c.filingDate : max),
        "1900-01-01",
      ),
      form4AsOf: FORM4_AS_OF,
      thirteenFAsOf: THIRTEEN_F_AS_OF,
      thirteenFPeriodEnd: THIRTEEN_F_PERIOD_END,
    },
  };
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
