"use client";

import { useState } from "react";
import SecurityHeader from "@/components/shell/SecurityHeader";
import ModuleTabs, { type ModuleTab } from "@/components/shell/ModuleTabs";
import GradeModule from "@/components/modules/GradeModule";
import DCFModule from "@/components/modules/DCFModule";
import CompsModule from "@/components/modules/CompsModule";
import AlgoModule from "@/components/modules/AlgoModule";
import NewsModule from "@/components/modules/NewsModule";
import AuditModule from "@/components/modules/AuditModule";

interface SecurityWorkstationProps {
  identity: {
    ticker: string;
    exchange: string;
    name: string;
    sector: string;
    industry: string;
    indices?: ReadonlyArray<string>;
    rups?: string;
    nextEarnings?: string;
    fiscalYearEnd?: string;
  };
  kpis: Array<{ label: string; value: string; sub?: string; subTone?: "pos" | "neg" | "neutral" }>;
  grade: {
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
  };
  pillars: any[];
  drivers: Array<{ label: string; value: string; tone: "pos" | "neg" | "neutral" }>;
  thesis: string;
  gradeHistory: Array<{ month: string; score: number; marker?: string }>;
  dcf: {
    capm: any[];
    terminal: any[];
    output: any;
    projection: any[];
    sensitivity: any;
    currency: "IDR" | "USD";
    unitLabel?: string;
  };
  comps: {
    rows: any[];
    columns: ReadonlyArray<string>;
    peerAvg: Record<string, number>;
    delta: Record<string, number>;
    prose: string;
  };
  factors: {
    factors: any[];
    composite: number;
    overlays: any[];
    backtest: any[];
    equityCurve: any[];
    framework: string;
  };
  news: {
    sentiment: any;
    history: any[];
    sources: any[];
    feed: any[];
  };
  audit: {
    citations: any[];
    biasControls: any[];
    repro: any;
    limitations: string;
    extraNote?: string;
  };
  pxFormatter: (n: number) => string;
  ciLow?: string;
  ciHigh?: string;
  scoreInterpretation: {
    compositeZ: number;
    pValue: string;
    factorTilt: string;
    regimeSensitivity: string;
    peerPercentile: string;
  };
  isGeneric?: boolean;
}

const TABS: ModuleTab[] = [
  { key: "grade", label: "Grade" },
  { key: "dcf", label: "DCF" },
  { key: "comps", label: "Comps" },
  { key: "algo", label: "Algo & Factors" },
  { key: "news", label: "News & Sent" },
  { key: "audit", label: "Audit" },
];

export default function SecurityWorkstation({
  identity,
  kpis,
  grade,
  pillars,
  drivers,
  thesis,
  gradeHistory,
  dcf,
  comps,
  factors,
  news,
  audit,
  pxFormatter,
  ciLow,
  ciHigh,
  scoreInterpretation,
  isGeneric = false,
}: SecurityWorkstationProps): JSX.Element {
  const [active, setActive] = useState<string>("grade");

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
      <SecurityHeader
        ticker={identity.ticker}
        exchange={identity.exchange}
        name={identity.name}
        sector={identity.sector}
        industry={identity.industry}
        indices={identity.indices}
        kpis={kpis}
        grade={{
          letter: grade.letter,
          score: grade.score,
          max: grade.max,
          verdict: grade.verdict,
          verdictTone: grade.verdictTone,
        }}
        meta={[
          ...(identity.rups ? [{ label: "RUPS", value: identity.rups }] : []),
          ...(identity.nextEarnings ? [{ label: "NEXT ER", value: identity.nextEarnings }] : []),
          ...(identity.fiscalYearEnd ? [{ label: "FY END", value: identity.fiscalYearEnd }] : []),
          ...(isGeneric ? [{ label: "RENDER", value: "AUTO" }] : []),
        ]}
      />

      <ModuleTabs tabs={TABS} active={active} onChange={setActive} />

      <div style={{ minHeight: 0, overflow: "auto" }}>
        {active === "grade" && (
          <>
            <GradeModule
              pillars={pillars}
              drivers={drivers}
              aggregate={grade}
              thesis={thesis}
              history={gradeHistory}
              pxFormatter={pxFormatter}
              ticker={identity.ticker}
              name={identity.name}
              ciLow={ciLow}
              ciHigh={ciHigh}
            />
            {/* Score interpretation block — research framing */}
            <div
              style={{
                padding: "14px 16px",
                borderTop: "1px solid #2a2a2a",
                background: "#050505",
              }}
            >
              <div
                style={{
                  fontSize: 9.5,
                  color: "#ff2e88",
                  letterSpacing: "0.14em",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  marginBottom: 10,
                }}
              >
                Score Interpretation · research framing
              </div>
              <div className="grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
                <div className="num" style={{ fontSize: 11, color: "#d8d8d8" }}>
                  <span style={{ color: "#666" }}>Composite Z-Score</span>{" "}
                  <span style={{ color: "#ff2e88", fontWeight: 600 }}>
                    {scoreInterpretation.compositeZ >= 0 ? "+" : ""}
                    {scoreInterpretation.compositeZ.toFixed(2)}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "#d8d8d8" }}>
                  <span style={{ color: "#666" }}>Statistical Significance</span>{" "}
                  <span className="num" style={{ color: "#00d97e" }}>{scoreInterpretation.pValue}</span>{" "}
                  <span style={{ color: "#666", fontSize: 9.5 }}>(Bonferroni-adjusted)</span>
                </div>
                <div style={{ fontSize: 11, color: "#d8d8d8", gridColumn: "1 / -1" }}>
                  <span style={{ color: "#666" }}>Factor Tilt</span>{" "}
                  <span>{scoreInterpretation.factorTilt}</span>
                </div>
                <div style={{ fontSize: 11, color: "#d8d8d8" }}>
                  <span style={{ color: "#666" }}>Regime Sensitivity</span>{" "}
                  <span>{scoreInterpretation.regimeSensitivity}</span>
                </div>
                <div style={{ fontSize: 11, color: "#d8d8d8" }}>
                  <span style={{ color: "#666" }}>Peer Percentile</span>{" "}
                  <span className="num" style={{ color: "#ff2e88", fontWeight: 600 }}>{scoreInterpretation.peerPercentile}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {active === "dcf" && (
          <DCFModule capm={dcf.capm} terminal={dcf.terminal} output={dcf.output}
            projection={dcf.projection} sensitivity={dcf.sensitivity}
            currency={dcf.currency} unitLabel={dcf.unitLabel} />
        )}
        {active === "comps" && (
          <CompsModule rows={comps.rows} peerAvg={comps.peerAvg} delta={comps.delta}
            prose={comps.prose} columns={comps.columns} />
        )}
        {active === "algo" && (
          <AlgoModule factors={factors.factors} composite={factors.composite} overlays={factors.overlays}
            backtest={factors.backtest} equityCurve={factors.equityCurve}
            factorFramework={factors.framework} />
        )}
        {active === "news" && (
          <NewsModule sentiment={news.sentiment} history={news.history}
            sources={news.sources} feed={news.feed} />
        )}
        {active === "audit" && (
          <AuditModule citations={audit.citations} biasControls={audit.biasControls}
            repro={audit.repro} limitations={audit.limitations} extraNote={audit.extraNote} />
        )}
      </div>
    </div>
  );
}
