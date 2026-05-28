// Daily Brief build pipeline. Orchestrates fetchers + LLM + assembly.
//
// Returns a BriefDocument with provenance tagging on every section
// (live | fallback). Page can render confidently even when keys are
// missing — the user sees the mock content with a small "fallback"
// chip in the meta.

import {
  BRIEF_META,
  BRIEF_CHART_OF_DAY,
  OVERNIGHT_WRAP as MOCK_OVERNIGHT,
  IDEA_OF_DAY as MOCK_IDEA,
  TODAYS_CATALYSTS,
  WATCHLIST_MOVERS as MOCK_MOVERS,
  SECTOR_RUNDOWN as MOCK_SECTORS,
  MACRO_DRIVERS,
  SIDEBAR_FLOWS,
} from "@/lib/mock-brief";
import { fetchOvernightIndices, fetchTickerMovers } from "@/lib/fetchers/yahoo";
import { fetchEarningsCalendar } from "@/lib/fetchers/finnhub";
import {
  generateChartTakeaway,
  generateIdeaBlurb,
  generateSectorRead,
} from "@/lib/brief/llm";
import type { BriefDocument } from "./types";
import { CONGRESS_STUB } from "@/lib/flow/stubs/congress";
import { FORM4_STUB } from "@/lib/flow/stubs/form4";
import { THIRTEEN_F_STUB } from "@/lib/flow/stubs/thirteen-f";
import { computeSMC, unionTickers } from "@/lib/flow/aggregators";
import { buildIdxScoreSheet, buildModelPortfolio } from "@/lib/portfolio/engine";
import { IDX_DEFAULT_POLICY } from "@/lib/portfolio/policy";

const WATCHLIST_SYMBOLS = ["BREN.JK", "AMMN.JK", "PGAS.JK", "BBRI.JK", "ADRO.JK"];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function nowIso(): string {
  return new Date().toISOString();
}

function tone(v: number): "pos" | "neg" | "neutral" {
  if (v > 0.05) return "pos";
  if (v < -0.05) return "neg";
  return "neutral";
}

export async function buildBrief(): Promise<BriefDocument> {
  const sourceDetail: Record<string, "live" | "fallback"> = {};

  // 1. Overnight wrap — Yahoo
  const indexes = await fetchOvernightIndices();
  const overnightLive = indexes.filter((i) => i.price != null).length > 0;
  sourceDetail.overnightWrap = overnightLive ? "live" : "fallback";

  const overnightWrap = overnightLive
    ? indexes.map((i) => ({
        label: i.label,
        value: i.fmt ?? "—",
        delta: i.deltaFmt ?? "—",
        tone: tone(i.changePct ?? 0),
      }))
    : MOCK_OVERNIGHT;

  // 2. Watchlist movers — Yahoo for .JK suffix
  const moverData = await fetchTickerMovers(WATCHLIST_SYMBOLS);
  const moversLive = moverData.length > 0;
  sourceDetail.watchlistMovers = moversLive ? "live" : "fallback";

  const watchlistMovers = moversLive
    ? moverData
        .map((m) => ({
          ticker: m.symbol.replace(".JK", ""),
          name: m.name,
          change: m.changePct,
          region: "IDX" as const,
          note: m.changePct > 1
            ? "intraday strength"
            : m.changePct < -1
              ? "selling pressure"
              : "consolidating",
        }))
        .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
        .slice(0, 5)
    : MOCK_MOVERS;

  // 3. Today's catalysts — finnhub earnings calendar merged with hand-curated macro
  const today = todayIso();
  const earnings = await fetchEarningsCalendar(today, today);
  const earningsLive = earnings.length > 0;
  sourceDetail.todaysCatalysts = earningsLive ? "live" : "fallback";

  const earningsCatalysts: BriefDocument["todaysCatalysts"] = earnings
    .slice(0, 6)
    .map((e) => ({
      time: e.hour === "bmo" ? "BMO" : e.hour === "amc" ? "AMC" : "DMH",
      region: "US",
      event: `${e.symbol} ${e.year}Q${e.quarter} earnings`,
      impact: "medium",
      note: e.epsEstimate != null
        ? `consensus EPS $${e.epsEstimate.toFixed(2)}`
        : "consensus tracked",
    }));
  const todaysCatalysts: BriefDocument["todaysCatalysts"] = earningsCatalysts.length > 0
    ? [
        ...(TODAYS_CATALYSTS as BriefDocument["todaysCatalysts"])
          .filter((c) => c.region !== "US")
          .slice(0, 2),
        ...earningsCatalysts,
      ]
    : (TODAYS_CATALYSTS as BriefDocument["todaysCatalysts"]);

  // 4. Chart of the Day — keep the JPM-EOTM hardcoded headline + data,
  // regenerate just the takeaway prose via LLM if available
  const llmTakeaway = await generateChartTakeaway(
    BRIEF_CHART_OF_DAY.headline,
    { series: BRIEF_CHART_OF_DAY.series, sourceLabel: BRIEF_CHART_OF_DAY.sourceLabel },
  );
  sourceDetail.chartOfDay = llmTakeaway ? "live" : "fallback";

  const chartOfDay = {
    headline: BRIEF_CHART_OF_DAY.headline,
    takeaway: llmTakeaway ?? BRIEF_CHART_OF_DAY.takeaway,
    sourceLabel: BRIEF_CHART_OF_DAY.sourceLabel,
    series: BRIEF_CHART_OF_DAY.series.slice(),
  };

  // 5. Idea of the Day — use the screener-derived idea, regenerate prose
  const llmIdea = await generateIdeaBlurb(
    MOCK_IDEA.ticker,
    MOCK_IDEA.composite,
    MOCK_IDEA.pillars,
    "BBCA · IDX Big-4 banks · CASA 81.4% · BI-Rate dovish-pivot trajectory · regime sensitivity neutral",
  );
  sourceDetail.ideaOfDay = llmIdea ? "live" : "fallback";

  const ideaOfDay = {
    ticker: MOCK_IDEA.ticker,
    exchange: MOCK_IDEA.exchange,
    title: MOCK_IDEA.title,
    composite: MOCK_IDEA.composite,
    prose: llmIdea ?? MOCK_IDEA.prose,
    pillars: MOCK_IDEA.pillars.slice(),
  };

  // 6. Sector rundown — keep numbers, regenerate prose per-sector via LLM
  // (Skipped per-sector LLM calls in v1 to save tokens; the rundown copy
  // is already terse. Wire when usage justifies it.)
  sourceDetail.sectorRundown = "fallback";

  // 7. Yesterday's call vs outcome — static for v1; Phase 5 will persist
  // each day's IDEA_OF_DAY and look up the realized 1d move via Yahoo.
  sourceDetail.yesterdaysCall = "fallback";
  const yesterdaysCall: BriefDocument["yesterdaysCall"] = {
    ticker: "BBCA",
    exchange: "IDX",
    claim: "BUY conviction · composite +2.18σ · BI dovish-pivot beneficiary",
    actualMovePct: 1.32,
    benchmarkMovePct: 0.84,
    alphaPct: 0.48,
    hit: true,
    prose:
      "Yesterday's call closed +1.32% vs IHSG +0.84% — +48bps of intra-day alpha. CASA franchise re-priced as OIS curve steepened on the dovish BI commentary; thesis still intact, conviction unchanged at +2.18σ.",
  };

  // 8. Today's binary question — explicit call with model probability.
  sourceDetail.todaysQuestion = "fallback";
  const todaysQuestion: BriefDocument["todaysQuestion"] = {
    question: "Does USD/IDR close below 17,800 today?",
    probability: 35,
    basis:
      "rate-differential model + DXY 30d momentum + Asia FX vol regime; carry-trade flows positioning short IDR with risk-off carry hedges.",
    watchTrigger: "BI sterilisation flow at 14:00 WIB; ID 10Y above 6.90% caps reversal probability.",
    refTicker: "PGAS",
    refExchange: "IDX",
  };

  // 9. Smart-money 24h digest — pulled from /flow stubs (same source as the
  // /flow surface). Top congress trade + top 13F add + top insider cluster
  // + SMC composite leader.
  sourceDetail.smartMoneyDigest = "fallback";
  const topCongress = [...CONGRESS_STUB].sort((a, b) =>
    b.tradeDate.localeCompare(a.tradeDate),
  )[0];
  const topAdd13F = [...THIRTEEN_F_STUB]
    .filter((p) => p.isNew || (p.sharesChangeQoQ != null && p.sharesChangeQoQ > 0))
    .sort((a, b) => (b.valueUsd ?? 0) - (a.valueUsd ?? 0))[0];
  const clusters = new Map<string, Set<string>>();
  FORM4_STUB.forEach((f) => {
    if (f.txnCode !== "P" || f.is10b51) return;
    if (!clusters.has(f.ticker)) clusters.set(f.ticker, new Set());
    clusters.get(f.ticker)!.add(f.insiderName);
  });
  const topCluster = Array.from(clusters.entries())
    .sort((a, b) => b[1].size - a[1].size)[0];
  const smcUniverse = unionTickers(CONGRESS_STUB, THIRTEEN_F_STUB, FORM4_STUB);
  const smcResults = computeSMC(smcUniverse, CONGRESS_STUB, THIRTEEN_F_STUB, FORM4_STUB);
  const smcLeader = [...smcResults].sort((a, b) => b.smcZ - a.smcZ)[0];

  const smartMoneyDigest: BriefDocument["smartMoneyDigest"] = {
    items: [
      ...(topCongress
        ? [{
            kind: "CONGRESS" as const,
            ticker: topCongress.ticker,
            exchange: "US" as const,
            primary: `${topCongress.politician} · ${topCongress.transactionType.toUpperCase()}`,
            secondary: `${topCongress.tradeDate} · ${topCongress.party}-${topCongress.chamber.slice(0, 1)} · $${(topCongress.amountMin / 1000).toFixed(0)}–${(topCongress.amountMax / 1000).toFixed(0)}K`,
            tone: (topCongress.transactionType === "Buy" ? "pos" : topCongress.transactionType === "Sale" ? "neg" : "neutral") as "pos" | "neg" | "neutral",
          }]
        : []),
      ...(topAdd13F
        ? [{
            kind: "13F" as const,
            ticker: topAdd13F.ticker,
            exchange: "US" as const,
            primary: `${topAdd13F.managerName} ${topAdd13F.isNew ? "NEW" : "ADD"}`,
            secondary: `$${(topAdd13F.valueUsd / 1_000_000_000).toFixed(2)}B · ${topAdd13F.period} · ${topAdd13F.pctPortfolio.toFixed(1)}% of portfolio`,
            tone: "pos" as const,
          }]
        : []),
      ...(topCluster && topCluster[1].size >= 2
        ? [{
            kind: "INSIDER" as const,
            ticker: topCluster[0],
            exchange: "US" as const,
            primary: `${topCluster[1].size}-insider P-code cluster`,
            secondary: `last 30d · ex-10b5-1 · qualifies as Form 4 cluster signal`,
            tone: topCluster[1].size >= 3 ? ("pos" as const) : ("neutral" as const),
          }]
        : []),
      ...(smcLeader
        ? [{
            kind: "SMC" as const,
            ticker: smcLeader.ticker,
            exchange: "US" as const,
            primary: `SMC ${smcLeader.smcGrade} · ${smcLeader.smcZ >= 0 ? "+" : ""}${smcLeader.smcZ.toFixed(2)}z`,
            secondary: `composite leader · weights 33/33/34 (congress/inst/insider)`,
            tone: smcLeader.smcZ >= 0 ? ("pos" as const) : ("neg" as const),
          }]
        : []),
    ],
  };

  // 10. Model portfolio update — top ADD / TRIM signals from the engine.
  sourceDetail.modelPortfolioUpdate = "live"; // derived from real scores
  const scores = buildIdxScoreSheet();
  const model = buildModelPortfolio(scores, IDX_DEFAULT_POLICY);
  const adds = model.holdings
    .filter((h) => h.rebalanceSignal === "ADD")
    .sort((a, b) => a.driftBps - b.driftBps)
    .slice(0, 3)
    .map((h) => ({
      ticker: h.ticker,
      name: h.name,
      fromPct: h.currentWtPct,
      toPct: h.targetWtPct,
      driftBps: h.driftBps,
    }));
  const trims = model.holdings
    .filter((h) => h.rebalanceSignal === "TRIM")
    .sort((a, b) => b.driftBps - a.driftBps)
    .slice(0, 3)
    .map((h) => ({
      ticker: h.ticker,
      name: h.name,
      fromPct: h.currentWtPct,
      toPct: h.targetWtPct,
      driftBps: h.driftBps,
    }));
  const modelPortfolioUpdate: BriefDocument["modelPortfolioUpdate"] = {
    weightedZ: model.weightedZ,
    portfolioBeta: model.portfolioBeta,
    portfolioVol: model.portfolioVol,
    adds,
    trims,
    note:
      adds.length + trims.length === 0
        ? `${model.policy.name}: no drift exceeds ±200bps band. Portfolio in policy compliance.`
        : `${model.policy.name}: ${adds.length + trims.length} name(s) outside ±200bps drift band. Next rebalance ${model.nextRebalance}.`,
  };

  // 11. Source classification
  const liveCount = Object.values(sourceDetail).filter((s) => s === "live").length;
  const totalCount = Object.values(sourceDetail).length;
  const source: BriefDocument["source"] =
    liveCount === 0 ? "fallback" : liveCount === totalCount ? "live" : "mixed";

  return {
    date: today,
    generatedAt: nowIso(),
    meta: BRIEF_META,
    yesterdaysCall,
    todaysQuestion,
    chartOfDay,
    overnightWrap,
    ideaOfDay,
    smartMoneyDigest,
    modelPortfolioUpdate,
    todaysCatalysts,
    watchlistMovers,
    sectorRundown: MOCK_SECTORS,
    macroDrivers: MACRO_DRIVERS,
    sidebarFlows: SIDEBAR_FLOWS,
    source,
    sourceDetail,
  };
}
