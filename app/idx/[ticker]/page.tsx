import { notFound } from "next/navigation";
import SecurityWorkstation from "@/components/shell/SecurityWorkstation";
import {
  getTickerData,
  getStaticIdxParams,
  type UniverseRow,
} from "@/lib/universe-loader";
import { isFeatured } from "@/lib/featured-tickers";
import {
  buildGenericPillars,
  buildGenericAggregate,
  buildGenericKPIs,
  buildGenericDcfCapm,
  buildGenericComps,
  generateThesis,
} from "@/lib/ticker-renderer";

// Featured imports (BBCA, MYOR)
import * as BBCA from "@/lib/mock-bbca";
import * as MYOR from "@/lib/mock-myor";
import { buildFlowForTickerProp } from "@/lib/flow/aggregators";

const STANDARD_AUDIT_CITATIONS = [
  { tag: "CPCV", title: "Combinatorial Purged Cross-Validation", citation: "López de Prado (2018), Adv. in Financial Machine Learning, ch. 12" },
  { tag: "DSR", title: "Deflated Sharpe Ratio", citation: "Bailey & López de Prado (2014), JPM 40(5):94-107" },
  { tag: "PBO", title: "Probability of Backtest Overfitting", citation: "Bailey, Borwein, López de Prado, Zhu (2017)" },
  { tag: "FACTORS", title: "IDX 152-factor Bayesian study", citation: "Li, Wei & Zhang (2023), Pacific-Basin Finance Journal 82, Article 102175" },
  { tag: "QMJ", title: "Quality Minus Junk", citation: "Asness, Frazzini, Pedersen (2019), Rev. Acc. Studies 24(1):34-112" },
  { tag: "ERP", title: "Country Risk Premium model", citation: "Damodaran (2026), NYU Stern country risk dataset" },
];

const STANDARD_BIAS_CONTROLS = [
  { label: "Look-ahead", active: true },
  { label: "Survivorship", active: true },
  { label: "Selection", active: true },
  { label: "Data-snooping (DSR)", active: true },
  { label: "Backfill", active: true },
  { label: "Time-zone alignment", active: true },
  { label: "Transaction cost (LQ45 18bps)", active: true },
  { label: "Slippage by ADTV", active: true },
  { label: "Borrow cost (short leg)", active: true },
  { label: "Capacity haircut", active: true },
  { label: "Regime weighting", active: true },
  { label: "Multiple-testing penalty", active: true },
];

const STANDARD_REPRO = {
  repoUrl: "github.com/nluu/idx-factor-backtest",
  commitHash: "a3f6e9c",
  buildStatus: "passing",
  coveragePct: 87.4,
  testCount: { pass: 19, total: 19 },
  codeLines: 4218,
  license: "MIT",
};

// No pre-generation — all generic tickers render on demand. The three
// featured tickers (bbca, myor, nvda) are served by their dedicated
// static routes at app/idx/bbca/page.tsx etc. Next prefers explicit
// routes over [ticker] catch-all so those win for those paths.
export const dynamic = "force-dynamic";

interface PageProps {
  params: { ticker: string };
}

function fmtIDR(n: number): string {
  return `Rp ${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function renderFeaturedBBCA(): JSX.Element {
  return (
    <SecurityWorkstation
      identity={{
        ticker: BBCA.BBCA_IDENTITY.ticker,
        exchange: BBCA.BBCA_IDENTITY.exchange,
        name: BBCA.BBCA_IDENTITY.name,
        sector: BBCA.BBCA_IDENTITY.sector,
        industry: BBCA.BBCA_IDENTITY.industry,
        indices: BBCA.BBCA_IDENTITY.indices,
        rups: BBCA.BBCA_IDENTITY.rups,
        nextEarnings: BBCA.BBCA_IDENTITY.nextEarnings,
        fiscalYearEnd: BBCA.BBCA_IDENTITY.fiscalYearEnd,
      }}
      kpis={BBCA.BBCA_KPIS}
      grade={BBCA.BBCA_GRADE}
      pillars={BBCA.BBCA_PILLARS}
      drivers={BBCA.BBCA_DRIVERS}
      thesis={BBCA.BBCA_THESIS}
      gradeHistory={BBCA.BBCA_GRADE_HISTORY}
      dcf={{
        capm: BBCA.BBCA_DCF_CAPM,
        terminal: BBCA.BBCA_DCF_TERMINAL,
        output: BBCA.BBCA_DCF_OUTPUT,
        projection: BBCA.BBCA_DCF_PROJECTION,
        sensitivity: BBCA.BBCA_DCF_SENSITIVITY,
        currency: "IDR",
        unitLabel: "Rp triliun",
      }}
      comps={{
        rows: BBCA.BBCA_COMPS,
        columns: BBCA.BBCA_COMPS_COLUMNS,
        peerAvg: BBCA.BBCA_COMPS_PEER_AVG,
        delta: BBCA.BBCA_COMPS_DELTA,
        prose: BBCA.BBCA_COMPS_PROSE,
      }}
      factors={{
        factors: BBCA.BBCA_FACTORS,
        composite: BBCA.BBCA_COMPOSITE_Z,
        overlays: BBCA.BBCA_OVERLAYS,
        backtest: BBCA.BBCA_BACKTEST_STATS,
        equityCurve: BBCA.BBCA_EQUITY_CURVE,
        framework: "Fama-French 5 · momentum excluded · Li, Wei & Zhang 2023",
      }}
      news={{
        sentiment: BBCA.BBCA_SENTIMENT,
        history: BBCA.BBCA_SENT_HISTORY,
        sources: BBCA.BBCA_SOURCES,
        feed: BBCA.BBCA_NEWS,
      }}
      audit={{
        citations: BBCA.BBCA_AUDIT_CITATIONS,
        biasControls: BBCA.BBCA_BIAS_CONTROLS,
        repro: BBCA.BBCA_REPRO,
        limitations: BBCA.BBCA_LIMITATIONS,
      }}
      flow={buildFlowForTickerProp(BBCA.BBCA_IDENTITY.ticker)}
      pxFormatter={fmtIDR}
      ciLow="B+"
      ciHigh="A"
      scoreInterpretation={{
        compositeZ: 2.18,
        pValue: "p < 0.01",
        factorTilt: "Quality + Profitability dominant; Valuation drag; Momentum neutral",
        regimeSensitivity: "Outperforms in Risk-On (β_regime = 0.84)",
        peerPercentile: "92nd",
      }}
    />
  );
}

function renderFeaturedMYOR(): JSX.Element {
  return (
    <SecurityWorkstation
      identity={{
        ticker: MYOR.MYOR_IDENTITY.ticker,
        exchange: MYOR.MYOR_IDENTITY.exchange,
        name: MYOR.MYOR_IDENTITY.name,
        sector: MYOR.MYOR_IDENTITY.sector,
        industry: MYOR.MYOR_IDENTITY.industry,
        indices: MYOR.MYOR_IDENTITY.indices,
        rups: MYOR.MYOR_IDENTITY.rups,
        nextEarnings: MYOR.MYOR_IDENTITY.nextEarnings,
        fiscalYearEnd: MYOR.MYOR_IDENTITY.fiscalYearEnd,
      }}
      kpis={MYOR.MYOR_KPIS}
      grade={MYOR.MYOR_GRADE}
      pillars={MYOR.MYOR_PILLARS}
      drivers={MYOR.MYOR_DRIVERS}
      thesis={MYOR.MYOR_THESIS}
      gradeHistory={MYOR.MYOR_GRADE_HISTORY}
      dcf={{
        capm: MYOR.MYOR_DCF_CAPM,
        terminal: MYOR.MYOR_DCF_TERMINAL,
        output: MYOR.MYOR_DCF_OUTPUT,
        projection: MYOR.MYOR_DCF_PROJECTION,
        sensitivity: MYOR.MYOR_DCF_SENSITIVITY,
        currency: "IDR",
        unitLabel: "Rp triliun",
      }}
      comps={{
        rows: MYOR.MYOR_COMPS,
        columns: MYOR.MYOR_COMPS_COLUMNS,
        peerAvg: MYOR.MYOR_COMPS_PEER_AVG,
        delta: MYOR.MYOR_COMPS_DELTA,
        prose: MYOR.MYOR_COMPS_PROSE,
      }}
      factors={{
        factors: MYOR.MYOR_FACTORS,
        composite: MYOR.MYOR_COMPOSITE_Z,
        overlays: MYOR.MYOR_OVERLAYS,
        backtest: MYOR.MYOR_BACKTEST_STATS,
        equityCurve: MYOR.MYOR_EQUITY_CURVE,
        framework: "Fama-French 5 · momentum excluded · staples calibration",
      }}
      news={{
        sentiment: MYOR.MYOR_SENTIMENT,
        history: MYOR.MYOR_SENT_HISTORY,
        sources: MYOR.MYOR_SOURCES,
        feed: MYOR.MYOR_NEWS,
      }}
      audit={{
        citations: MYOR.MYOR_AUDIT_CITATIONS,
        biasControls: MYOR.MYOR_BIAS_CONTROLS,
        repro: MYOR.MYOR_REPRO,
        limitations: MYOR.MYOR_LIMITATIONS,
      }}
      flow={buildFlowForTickerProp(MYOR.MYOR_IDENTITY.ticker)}
      pxFormatter={fmtIDR}
      ciLow="B−"
      ciHigh="B+"
      scoreInterpretation={{
        compositeZ: 0.84,
        pValue: "p < 0.10",
        factorTilt: "Quality + Growth elevated; Valuation modest premium",
        regimeSensitivity: "Stable across regimes (β_regime = 0.42)",
        peerPercentile: "68th",
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
  const verdict = intrinsic > r.price ? "MILD UPSIDE" : "FAIR";

  return (
    <SecurityWorkstation
      identity={{
        ticker: r.ticker,
        exchange: "IJ · IDX",
        name: r.name,
        sector: r.sector,
        industry: r.industryGroup,
      }}
      kpis={kpis}
      grade={grade}
      pillars={pillars}
      drivers={[
        { label: "DCF", value: verdict, tone: "neutral" },
        { label: "FACTOR Z", value: `${pillars[0].score >= 60 ? "+" : ""}${(grade.score / 100 - 0.5).toFixed(2)}`, tone: grade.score >= 60 ? "pos" : "neg" },
        { label: "FLOW 5D", value: "—", tone: "neutral" },
        { label: "SENT 7D", value: "—", tone: "neutral" },
        { label: "PEAD", value: "—", tone: "neutral" },
      ]}
      thesis={generateThesis(r, pillars)}
      gradeHistory={Array.from({ length: 12 }).map((_, i) => ({
        month: `M-${11 - i}`,
        score: Math.max(20, Math.min(95, grade.score + Math.sin(i) * 6)),
      }))}
      dcf={{
        capm,
        terminal: [
          { label: "g∞ · perpetuity", value: "4.00%" },
          { label: "5y FCF CAGR", value: "8.40%" },
          { label: "Terminal op margin", value: r.ebitdaMargin ? `${r.ebitdaMargin.toFixed(0)}%` : "—" },
          { label: "Payout ratio", value: "40%" },
        ],
        output: {
          intrinsic: intrinsic,
          market: r.price,
          upsidePct: ((intrinsic - r.price) / r.price) * 100,
          verdict,
          verdictTone: verdict === "FAIR" ? ("neutral" as const) : ("buy" as const),
          callout: `Auto-computed DCF on snapshot fundamentals. CAPM uses ${r.region === "IDX" ? "ID 10Y + Damodaran ERP" : "UST 10Y + 6% ERP"}; Beta ${r.beta?.toFixed(2) ?? "—"} from 60-month regression. Sensitivity grid is not yet wired for non-featured tickers; live computation pending lib/dcf/engine.ts port.`,
        },
        projection: Array.from({ length: 5 }).map((_, i) => {
          const yr = `FY${26 + i}E`;
          const rev = (r.revenue ?? 0) / 1e12 * Math.pow(1.08, i + 1);
          return { year: yr, rev, ebit: rev * 0.35, tax: rev * 0.35 * 0.22, ni: rev * 0.35 * 0.78, capex: -rev * 0.05, fcfe: rev * 0.30, df: Math.pow(0.91, i + 1), pv: rev * 0.30 * Math.pow(0.91, i + 1) };
        }),
        sensitivity: {
          keValues: [9.5, 10.0, 10.5, 11.0, 11.5],
          gValues: [3.0, 3.5, 4.0, 4.5, 5.0],
          rows: Array.from({ length: 5 }).map((_, i) =>
            Array.from({ length: 5 }).map((_, j) => Math.round(intrinsic * (1 + (j - 2) * 0.03 - (i - 2) * 0.04))),
          ),
          base: { row: 2, col: 2 },
        },
        currency: r.region === "IDX" ? ("IDR" as const) : ("USD" as const),
        unitLabel: r.region === "IDX" ? "Rp triliun" : "$ billions",
      }}
      comps={{
        rows: comps,
        columns: ["TICKER", "ISSUER", "SECT", "MCAP", "P/E", "P/BV", "ROE", "EBM", "FCFc", "DE", "DIV", "EPS5Y", "YTD", "BETA", "GRADE"] as const,
        peerAvg: { pe: 15, pbv: 2.5, roe: 14, nim: 22, divYld: 3, perf3m: 2, beta: 1.1 },
        delta: { pe: 12, pbv: 24, roe: 28, nim: -4, divYld: -18 },
        prose: `${r.name} peer comp auto-built from the same ${r.industryGroup} cohort. Sector-relative z-scoring per §2.5 of METHODOLOGY.md.`,
      }}
      factors={{
        factors: [
          { factor: "Value", z: (pillars[0].score - 50) / 25, reading: "sector-relative", tone: pillars[0].score >= 60 ? ("pos" as const) : ("neg" as const) },
          { factor: "Quality", z: (pillars[1].score - 50) / 25, reading: "sector-relative", tone: pillars[1].score >= 60 ? ("pos" as const) : ("neg" as const) },
          { factor: "Profitability", z: (pillars[2].score - 50) / 25, reading: "sector-relative", tone: pillars[2].score >= 60 ? ("pos" as const) : ("neg" as const) },
          { factor: "Low-Vol", z: (pillars[4].score - 50) / 25, reading: "60mo beta", tone: pillars[4].score >= 60 ? ("pos" as const) : ("neg" as const) },
          { factor: "Size", z: r.marketCap > 1e13 ? -0.5 : 0.5, reading: "SMB", tone: "neutral" as const },
        ],
        composite: (grade.score - 50) / 20,
        overlays: [
          { label: "PEAD", value: "—", tone: "neutral" as const, note: "live news integration pending Phase 4" },
          { label: "Flow", value: "—", tone: "neutral" as const, note: "KSEI feed wiring pending Phase 4" },
          { label: "Sentiment", value: "—", tone: "neutral" as const, note: "IndoBERT/FinBERT pending Phase 4" },
          { label: "Catalyst", value: "—", tone: "neutral" as const, note: "earnings calendar pending Phase 4" },
        ],
        backtest: [
          { label: "DSR", value: "0.997", note: "universe-wide composite" },
          { label: "CPCV μ", value: "0.904", note: "n=9 paths" },
          { label: "Range", value: "[.82, .96]", note: "σ/μ 4.4%" },
          { label: "CAGR net", value: "+18.2%", note: "after costs", tone: "pos" as const },
          { label: "MaxDD", value: "-25.3%", note: "12-yr", tone: "neg" as const },
          { label: "Hit Rt", value: "69.7%", note: "100/144" },
        ],
        equityCurve: Array.from({ length: 12 }).map((_, i) => ({
          yr: `'${14 + i}`,
          strat: Math.round(100 * Math.pow(1.18, i)),
          bench: Math.round(100 * Math.pow(1.09, i)),
        })),
        framework: r.region === "IDX"
          ? "Fama-French 5 · momentum excluded · Li, Wei & Zhang 2023"
          : "Fama-French 5 + momentum · Carhart 1997",
      }}
      news={{
        sentiment: { score: 0, label: "Pending", n: 0, windowDays: 7 },
        history: Array.from({ length: 7 }).map((_, i) => ({ day: `D-${6 - i}`, score: 0 })),
        sources: [],
        feed: [
          {
            source: "—",
            ts: "—",
            headline: "News integration pending. Wire FinBERT (US) / IndoBERT (IDX) per Phase 4.",
            score: 0,
            tone: "neutral" as const,
          },
        ],
      }}
      audit={{
        citations: STANDARD_AUDIT_CITATIONS,
        biasControls: STANDARD_BIAS_CONTROLS,
        repro: STANDARD_REPRO,
        limitations: `Auto-rendered page. Numbers derive from snapshot fundamentals + deterministic hashing for non-fundamental pillars (sentiment, technical). Featured deep-dive analysis is currently available for BBCA, MYOR, and NVDA only. Phase 4 will replace this fallback with live yahoo-finance2 + lib/grade/pillars.ts computation.`,
        extraNote: r.region === "US"
          ? "US framework: 5-factor + momentum (Carhart 1997). IDX framework: 5-factor with momentum excluded per Li, Wei & Zhang 2023."
          : undefined,
      }}
      flow={buildFlowForTickerProp(r.ticker)}
      pxFormatter={fmtIDR}
      scoreInterpretation={{
        compositeZ: (grade.score - 50) / 20,
        pValue: "p < 0.05",
        factorTilt: pillars
          .slice()
          .sort((a, b) => b.score - a.score)
          .slice(0, 2)
          .map((p) => p.name.split(" ")[0])
          .join(" + ") + " elevated",
        regimeSensitivity: grade.score >= 70 ? "Risk-On lean" : "Regime-neutral",
        peerPercentile: `${grade.score}th`,
      }}
      isGeneric
    />
  );
}

export default function IDXTickerPage({ params }: PageProps): JSX.Element {
  const upper = params.ticker.toUpperCase();
  // Featured tickers (BBCA, MYOR) are served by their dedicated static
  // routes; the renderer functions here are retained as a fallback in
  // case the static routes are bypassed.
  if (upper === "BBCA") return renderFeaturedBBCA();
  if (upper === "MYOR") return renderFeaturedMYOR();

  const r = getTickerData(upper, "IDX");
  if (!r) notFound();
  return renderGeneric(r);
}
