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

  // 7. Source classification
  const liveCount = Object.values(sourceDetail).filter((s) => s === "live").length;
  const totalCount = Object.values(sourceDetail).length;
  const source: BriefDocument["source"] =
    liveCount === 0 ? "fallback" : liveCount === totalCount ? "live" : "mixed";

  return {
    date: today,
    generatedAt: nowIso(),
    meta: BRIEF_META,
    chartOfDay,
    overnightWrap,
    ideaOfDay,
    todaysCatalysts,
    watchlistMovers,
    sectorRundown: MOCK_SECTORS,
    macroDrivers: MACRO_DRIVERS,
    sidebarFlows: SIDEBAR_FLOWS,
    source,
    sourceDetail,
  };
}
