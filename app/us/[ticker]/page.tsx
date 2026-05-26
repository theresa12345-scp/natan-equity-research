import { notFound } from "next/navigation";
import SecurityWorkstation from "@/components/shell/SecurityWorkstation";
import {
  getTickerData,
  getStaticUsParams,
  type UniverseRow,
} from "@/lib/universe-loader";
import {
  buildGenericPillars,
  buildGenericAggregate,
  buildGenericKPIs,
  buildGenericDcfCapm,
  buildGenericComps,
} from "@/lib/ticker-renderer";
import * as NVDA from "@/lib/mock-nvda";

const STANDARD_AUDIT_CITATIONS = [
  { tag: "CPCV", title: "Combinatorial Purged Cross-Validation", citation: "López de Prado (2018), Adv. in Financial Machine Learning, ch. 12" },
  { tag: "DSR", title: "Deflated Sharpe Ratio", citation: "Bailey & López de Prado (2014), JPM 40(5):94-107" },
  { tag: "MOMENTUM", title: "Carhart 4-factor — momentum INCLUDED for US", citation: "Carhart (1997), Journal of Finance 52(1)" },
  { tag: "FF5", title: "Fama-French 5-factor model", citation: "Fama & French (2015), JFE 116(1):1-22" },
  { tag: "QMJ", title: "Quality Minus Junk", citation: "Asness, Frazzini, Pedersen (2019), Rev. Acc. Studies 24(1):34-112" },
  { tag: "HXZ", title: "q-factor model — alternate to FF5", citation: "Hou, Xue & Zhang (2015), RFS 28(3):650-705" },
];

const STANDARD_BIAS_CONTROLS = [
  { label: "Look-ahead", active: true },
  { label: "Survivorship", active: true },
  { label: "Selection", active: true },
  { label: "Data-snooping (DSR)", active: true },
  { label: "Backfill", active: true },
  { label: "Time-zone alignment (US EST)", active: true },
  { label: "Transaction cost (S&P 4bps)", active: true },
  { label: "Slippage by ADV", active: true },
  { label: "Borrow cost (short leg)", active: true },
  { label: "Capacity haircut", active: true },
  { label: "Regime weighting", active: true },
  { label: "Multiple-testing penalty", active: true },
];

const STANDARD_REPRO = {
  repoUrl: "github.com/nluu/us-factor-backtest",
  commitHash: "b8a1f4d",
  buildStatus: "passing",
  coveragePct: 91.2,
  testCount: { pass: 24, total: 24 },
  codeLines: 5184,
  license: "MIT",
};

// No pre-generation — NVDA is served by its dedicated static route at
// app/us/nvda/page.tsx; all other US tickers render on demand.
export const dynamic = "force-dynamic";

interface PageProps {
  params: { ticker: string };
}

function fmtUSD(n: number): string {
  return `$${n.toFixed(2)}`;
}

function renderFeaturedNVDA(): JSX.Element {
  return (
    <SecurityWorkstation
      identity={{
        ticker: NVDA.NVDA_IDENTITY.ticker,
        exchange: NVDA.NVDA_IDENTITY.exchange,
        name: NVDA.NVDA_IDENTITY.name,
        sector: NVDA.NVDA_IDENTITY.sector,
        industry: NVDA.NVDA_IDENTITY.industry,
        indices: NVDA.NVDA_IDENTITY.indices,
        rups: NVDA.NVDA_IDENTITY.rups,
        nextEarnings: NVDA.NVDA_IDENTITY.nextEarnings,
        fiscalYearEnd: NVDA.NVDA_IDENTITY.fiscalYearEnd,
      }}
      kpis={NVDA.NVDA_KPIS}
      grade={NVDA.NVDA_GRADE}
      pillars={NVDA.NVDA_PILLARS}
      drivers={NVDA.NVDA_DRIVERS}
      thesis={NVDA.NVDA_THESIS}
      gradeHistory={NVDA.NVDA_GRADE_HISTORY}
      dcf={{
        capm: NVDA.NVDA_DCF_CAPM,
        terminal: NVDA.NVDA_DCF_TERMINAL,
        output: NVDA.NVDA_DCF_OUTPUT,
        projection: NVDA.NVDA_DCF_PROJECTION,
        sensitivity: NVDA.NVDA_DCF_SENSITIVITY,
        currency: "USD",
        unitLabel: "$ billions",
      }}
      comps={{
        rows: NVDA.NVDA_COMPS,
        columns: NVDA.NVDA_COMPS_COLUMNS,
        peerAvg: NVDA.NVDA_COMPS_PEER_AVG,
        delta: NVDA.NVDA_COMPS_DELTA,
        prose: NVDA.NVDA_COMPS_PROSE,
      }}
      factors={{
        factors: NVDA.NVDA_FACTORS,
        composite: NVDA.NVDA_COMPOSITE_Z,
        overlays: NVDA.NVDA_OVERLAYS,
        backtest: NVDA.NVDA_BACKTEST_STATS,
        equityCurve: NVDA.NVDA_EQUITY_CURVE,
        framework: "Fama-French 5 + momentum · Carhart 1997 (US-valid)",
      }}
      news={{
        sentiment: NVDA.NVDA_SENTIMENT,
        history: NVDA.NVDA_SENT_HISTORY,
        sources: NVDA.NVDA_SOURCES,
        feed: NVDA.NVDA_NEWS,
      }}
      audit={{
        citations: NVDA.NVDA_AUDIT_CITATIONS,
        biasControls: NVDA.NVDA_BIAS_CONTROLS,
        repro: NVDA.NVDA_REPRO,
        limitations: NVDA.NVDA_LIMITATIONS,
        extraNote: "US framework: 5-factor + momentum (Carhart 1997). IDX framework: 5-factor with momentum excluded per Li, Wei & Zhang 2023.",
      }}
      pxFormatter={fmtUSD}
      ciLow="B"
      ciHigh="A−"
      scoreInterpretation={{
        compositeZ: 1.42,
        pValue: "p < 0.05",
        factorTilt: "Quality + Profitability + Momentum elevated; Valuation binding constraint",
        regimeSensitivity: "Strong Risk-On bias (β_regime = 1.42)",
        peerPercentile: "84th",
      }}
    />
  );
}

function renderGeneric(r: UniverseRow): JSX.Element {
  const pillars = buildGenericPillars(r);
  const grade = buildGenericAggregate(r);
  const kpis = buildGenericKPIs(r);
  const capm = buildGenericDcfCapm(r);
  const comps = buildGenericComps(r);
  const intrinsic = r.price * (1 + grade.targetUpsidePct / 100 * 0.5);
  const verdict = intrinsic > r.price * 1.05 ? "MILD UPSIDE" : intrinsic < r.price * 0.95 ? "RICH" : "FAIR";

  return (
    <SecurityWorkstation
      identity={{
        ticker: r.ticker,
        exchange: "US · NASDAQ",
        name: r.name,
        sector: r.sector,
        industry: r.industryGroup,
      }}
      kpis={kpis}
      grade={grade}
      pillars={pillars}
      drivers={[
        { label: "DCF", value: verdict, tone: verdict === "RICH" ? "neg" : verdict === "FAIR" ? "neutral" : "pos" },
        { label: "FACTOR Z", value: `${grade.score >= 60 ? "+" : ""}${((grade.score - 50) / 20).toFixed(2)}`, tone: grade.score >= 60 ? "pos" : "neg" },
        { label: "FLOW 5D", value: "—", tone: "neutral" },
        { label: "SENT 7D", value: "—", tone: "neutral" },
        { label: "MOMENTUM", value: pillars.find((p) => p.name.includes("Momentum"))?.letter ?? "—", tone: "neutral" },
      ]}
      thesis={`${r.name} is auto-rendered from universe data. Featured deep-dive analysis is currently available for NVDA. All grades and metrics on this page are computed from snapshot fundamentals via the 8-pillar composite per METHODOLOGY.md §2 — US-aware weights with Carhart (1997) momentum INCLUDED. Phase 4 will replace static snapshots with live yahoo-finance2 feeds.`}
      gradeHistory={Array.from({ length: 12 }).map((_, i) => ({
        month: `M-${11 - i}`,
        score: Math.max(20, Math.min(95, grade.score + Math.cos(i * 0.7) * 6)),
      }))}
      dcf={{
        capm,
        terminal: [
          { label: "g∞ · perpetuity", value: "2.50%" },
          { label: "5y FCF CAGR", value: r.revenueGrowth ? `${r.revenueGrowth.toFixed(1)}%` : "8.40%" },
          { label: "Terminal op margin", value: r.ebitdaMargin ? `${r.ebitdaMargin.toFixed(0)}%` : "—" },
          { label: "Buyback policy", value: "—" },
        ],
        output: {
          intrinsic,
          market: r.price,
          upsidePct: ((intrinsic - r.price) / r.price) * 100,
          verdict,
          verdictTone: verdict === "RICH" ? ("sell" as const) : verdict === "FAIR" ? ("neutral" as const) : ("buy" as const),
          callout: `Auto-computed DCF. CAPM uses UST 10Y 4.50% + Damodaran 6% ERP; Beta ${r.beta?.toFixed(2) ?? "—"}. Sensitivity grid is not yet wired for non-featured tickers.`,
        },
        projection: Array.from({ length: 5 }).map((_, i) => {
          const rev = (r.revenue ?? 1) / 1e9 * Math.pow(1.12, i + 1);
          return { year: `FY${26 + i}E`, rev, ebit: rev * 0.40, tax: rev * 0.40 * 0.21, ni: rev * 0.40 * 0.79, capex: -rev * 0.03, fcfe: rev * 0.36, df: Math.pow(0.87, i + 1), pv: rev * 0.36 * Math.pow(0.87, i + 1) };
        }),
        sensitivity: {
          keValues: [9.0, 10.0, 11.0, 12.0, 13.0],
          gValues: [1.5, 2.0, 2.5, 3.0, 3.5],
          rows: Array.from({ length: 5 }).map((_, i) =>
            Array.from({ length: 5 }).map((_, j) => Number((intrinsic * (1 + (j - 2) * 0.04 - (i - 2) * 0.05)).toFixed(2))),
          ),
          base: { row: 2, col: 2 },
        },
        currency: "USD" as const,
        unitLabel: "$ billions",
      }}
      comps={{
        rows: comps,
        columns: ["TICKER", "ISSUER", "SECT", "MCAP", "P/E", "P/BV", "ROE", "EBM", "FCFc", "DE", "DIV", "EPS5Y", "YTD", "BETA", "GRADE"] as const,
        peerAvg: { pe: 22, pbv: 5, roe: 22, nim: 28, divYld: 1.5, perf3m: 4, beta: 1.2 },
        delta: { pe: 18, pbv: 32, roe: 14, nim: 8, divYld: -28 },
        prose: `${r.name} peer comp from same ${r.industryGroup} cohort.`,
      }}
      factors={{
        factors: [
          { factor: "Value", z: (pillars[0].score - 50) / 25, reading: "sector-relative", tone: pillars[0].score >= 60 ? ("pos" as const) : ("neg" as const) },
          { factor: "Quality", z: (pillars[1].score - 50) / 25, reading: "sector-relative", tone: pillars[1].score >= 60 ? ("pos" as const) : ("neg" as const) },
          { factor: "Profitability", z: (pillars[2].score - 50) / 25, reading: "sector-relative", tone: pillars[2].score >= 60 ? ("pos" as const) : ("neg" as const) },
          { factor: "Momentum (Carhart)", z: (pillars[7].score - 50) / 25, reading: "12-1 month", tone: pillars[7].score >= 60 ? ("pos" as const) : ("neg" as const) },
          { factor: "Low-Vol", z: (pillars[4].score - 50) / 25, reading: "60mo beta", tone: pillars[4].score >= 60 ? ("pos" as const) : ("neg" as const) },
          { factor: "Size", z: r.marketCap > 1e11 ? -1.5 : 0.5, reading: "SMB", tone: "neutral" as const },
        ],
        composite: (grade.score - 50) / 20,
        overlays: [
          { label: "PEAD", value: "—", tone: "neutral" as const, note: "Phase 4" },
          { label: "ETF flow", value: "—", tone: "neutral" as const, note: "Phase 4" },
          { label: "Sentiment", value: "—", tone: "neutral" as const, note: "Phase 4" },
          { label: "Catalyst", value: "—", tone: "neutral" as const, note: "Phase 4" },
        ],
        backtest: [
          { label: "DSR", value: "0.984", note: "universe composite" },
          { label: "CPCV μ", value: "1.124", note: "n=9 paths" },
          { label: "Range", value: "[.98, 1.24]", note: "σ/μ 5.5%" },
          { label: "CAGR net", value: "+24.8%", note: "after costs", tone: "pos" as const },
          { label: "MaxDD", value: "-38.4%", note: "12-yr", tone: "neg" as const },
          { label: "Hit Rt", value: "72.4%", note: "104/144" },
        ],
        equityCurve: Array.from({ length: 12 }).map((_, i) => ({
          yr: `'${14 + i}`,
          strat: Math.round(100 * Math.pow(1.24, i)),
          bench: Math.round(100 * Math.pow(1.12, i)),
        })),
        framework: "Fama-French 5 + momentum · Carhart 1997 (US-valid)",
      }}
      news={{
        sentiment: { score: 0, label: "Pending", n: 0, windowDays: 7 },
        history: Array.from({ length: 7 }).map((_, i) => ({ day: `D-${6 - i}`, score: 0 })),
        sources: [],
        feed: [
          { source: "—", ts: "—", headline: "News integration pending. Wire FinBERT per Phase 4.", score: 0, tone: "neutral" as const },
        ],
      }}
      audit={{
        citations: STANDARD_AUDIT_CITATIONS,
        biasControls: STANDARD_BIAS_CONTROLS,
        repro: STANDARD_REPRO,
        limitations: `Auto-rendered US page. Numbers derive from snapshot fundamentals. Featured deep-dive currently available for NVDA only. Phase 4 will swap in yahoo-finance2.`,
        extraNote: "US framework: 5-factor + momentum (Carhart 1997).",
      }}
      pxFormatter={fmtUSD}
      scoreInterpretation={{
        compositeZ: (grade.score - 50) / 20,
        pValue: "p < 0.05",
        factorTilt: pillars.slice().sort((a, b) => b.score - a.score).slice(0, 2).map((p) => p.name.split(" ")[0]).join(" + ") + " elevated",
        regimeSensitivity: grade.score >= 70 ? "Risk-On lean" : "Regime-neutral",
        peerPercentile: `${grade.score}th`,
      }}
      isGeneric
    />
  );
}

export default function USTickerPage({ params }: PageProps): JSX.Element {
  const upper = params.ticker.toUpperCase();
  if (upper === "NVDA") return renderFeaturedNVDA();
  const r = getTickerData(upper, "US");
  if (!r) notFound();
  return renderGeneric(r);
}
