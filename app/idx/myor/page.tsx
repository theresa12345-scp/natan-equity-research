"use client";

import { useState } from "react";
import SecurityHeader from "@/components/shell/SecurityHeader";
import ModuleTabs, { type ModuleTab } from "@/components/shell/ModuleTabs";
import VerdictCard from "@/components/modules/VerdictCard";
import GradeModule from "@/components/modules/GradeModule";
import DCFModule from "@/components/modules/DCFModule";
import CompsModule from "@/components/modules/CompsModule";
import AlgoModule from "@/components/modules/AlgoModule";
import NewsModule from "@/components/modules/NewsModule";
import AuditModule from "@/components/modules/AuditModule";
import FlowModule from "@/components/modules/FlowModule";
import { CONGRESS_STUB } from "@/lib/flow/stubs/congress";
import { FORM4_STUB, FORM4_AS_OF } from "@/lib/flow/stubs/form4";
import { THIRTEEN_F_STUB, THIRTEEN_F_AS_OF, THIRTEEN_F_PERIOD_END } from "@/lib/flow/stubs/thirteen-f";
import { flowForTicker } from "@/lib/flow/aggregators";
import {
  MYOR_IDENTITY, MYOR_KPIS, MYOR_GRADE, MYOR_PILLARS, MYOR_DRIVERS, MYOR_THESIS, MYOR_GRADE_HISTORY,
  MYOR_DCF_CAPM, MYOR_DCF_TERMINAL, MYOR_DCF_OUTPUT, MYOR_DCF_PROJECTION, MYOR_DCF_SENSITIVITY,
  MYOR_COMPS, MYOR_COMPS_COLUMNS, MYOR_COMPS_PEER_AVG, MYOR_COMPS_DELTA, MYOR_COMPS_PROSE,
  MYOR_FACTORS, MYOR_COMPOSITE_Z, MYOR_OVERLAYS, MYOR_BACKTEST_STATS, MYOR_EQUITY_CURVE,
  MYOR_SENTIMENT, MYOR_SENT_HISTORY, MYOR_SOURCES, MYOR_NEWS,
  MYOR_AUDIT_CITATIONS, MYOR_BIAS_CONTROLS, MYOR_REPRO, MYOR_LIMITATIONS,
} from "@/lib/mock-myor";

const TABS: ModuleTab[] = [
  { key: "grade", label: "Grade" }, { key: "dcf", label: "DCF" }, { key: "comps", label: "Comps" },
  { key: "algo", label: "Algo & Factors" }, { key: "news", label: "News & Sent" },
  { key: "flow", label: "Flow" },
  { key: "audit", label: "Audit" },
];

const FLOW_META = {
  congressAsOf: CONGRESS_STUB.reduce(
    (max, c) => (c.filingDate > max ? c.filingDate : max),
    "1900-01-01",
  ),
  form4AsOf: FORM4_AS_OF,
  thirteenFAsOf: THIRTEEN_F_AS_OF,
  thirteenFPeriodEnd: THIRTEEN_F_PERIOD_END,
};

function ScoreInterpretation(): JSX.Element {
  return (
    <div style={{ padding: "14px 16px", borderTop: "1px solid #2a2a2a", background: "#050505" }}>
      <div style={{ fontSize: 9.5, color: "#ff2e88", letterSpacing: "0.14em", fontWeight: 600, textTransform: "uppercase", marginBottom: 10 }}>Score Interpretation · research framing</div>
      <div className="grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
        <div className="num" style={{ fontSize: 11, color: "#d8d8d8" }}><span style={{ color: "#666" }}>Composite Z-Score</span> <span style={{ color: "#ff2e88", fontWeight: 600 }}>+0.84</span> <span style={{ color: "#666", fontSize: 9.5 }}>(7th decile within Consumer Staples)</span></div>
        <div style={{ fontSize: 11, color: "#d8d8d8" }}><span style={{ color: "#666" }}>Statistical Significance</span> <span className="num" style={{ color: "#00d97e" }}>p &lt; 0.10</span></div>
        <div style={{ fontSize: 11, color: "#d8d8d8", gridColumn: "1 / -1" }}><span style={{ color: "#666" }}>Factor Tilt</span> Quality + Growth elevated; Valuation modest premium</div>
        <div style={{ fontSize: 11, color: "#d8d8d8" }}><span style={{ color: "#666" }}>Regime Sensitivity</span> Stable across regimes (β_regime = 0.42)</div>
        <div style={{ fontSize: 11, color: "#d8d8d8" }}><span style={{ color: "#666" }}>Peer Percentile</span> <span className="num" style={{ color: "#ff2e88", fontWeight: 600 }}>68th</span> <span style={{ color: "#666", fontSize: 9.5 }}>within Consumer Staples</span></div>
      </div>
    </div>
  );
}

export default function MYORPage(): JSX.Element {
  const [active, setActive] = useState<string>("grade");
  const flowDetail = flowForTicker(MYOR_IDENTITY.ticker, CONGRESS_STUB, THIRTEEN_F_STUB, FORM4_STUB);
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
      <SecurityHeader
        ticker={MYOR_IDENTITY.ticker} exchange={MYOR_IDENTITY.exchange} name={MYOR_IDENTITY.name}
        sector={MYOR_IDENTITY.sector} industry={MYOR_IDENTITY.industry} indices={MYOR_IDENTITY.indices}
        kpis={MYOR_KPIS}
        grade={{ letter: MYOR_GRADE.letter, score: MYOR_GRADE.score, max: MYOR_GRADE.max, verdict: MYOR_GRADE.verdict, verdictTone: MYOR_GRADE.verdictTone }}
        meta={[{ label: "RUPS", value: MYOR_IDENTITY.rups }, { label: "NEXT ER", value: MYOR_IDENTITY.nextEarnings }, { label: "FY END", value: MYOR_IDENTITY.fiscalYearEnd }]}
      />
      <VerdictCard
        letter={MYOR_GRADE.letter}
        score={MYOR_GRADE.score}
        max={MYOR_GRADE.max}
        compositeZ={0.84}
        pctRankLabel="68th %ile · Consumer Staples"
        pillars={MYOR_PILLARS}
        regimeSensitivity="Stable across regimes (β_regime 0.42)"
      />
      <ModuleTabs tabs={TABS} active={active} onChange={setActive} />
      <div key={active} className="mrdn-tab-content" style={{ minHeight: 0, overflow: "auto" }}>
        {active === "grade" && (<><GradeModule pillars={MYOR_PILLARS} drivers={MYOR_DRIVERS} aggregate={MYOR_GRADE} thesis={MYOR_THESIS} history={MYOR_GRADE_HISTORY}
          pxFormatter={(n) => `Rp ${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
          ticker={MYOR_IDENTITY.ticker} name={MYOR_IDENTITY.name} ciLow="B−" ciHigh="B+" /><ScoreInterpretation /></>)}
        {active === "dcf" && (<DCFModule capm={MYOR_DCF_CAPM} terminal={MYOR_DCF_TERMINAL} output={MYOR_DCF_OUTPUT} projection={MYOR_DCF_PROJECTION} sensitivity={MYOR_DCF_SENSITIVITY} currency="IDR" unitLabel="Rp triliun" />)}
        {active === "comps" && (<CompsModule rows={MYOR_COMPS} peerAvg={MYOR_COMPS_PEER_AVG} delta={MYOR_COMPS_DELTA} prose={MYOR_COMPS_PROSE} columns={MYOR_COMPS_COLUMNS} />)}
        {active === "algo" && (<AlgoModule factors={MYOR_FACTORS} composite={MYOR_COMPOSITE_Z} overlays={MYOR_OVERLAYS} backtest={MYOR_BACKTEST_STATS} equityCurve={MYOR_EQUITY_CURVE} factorFramework="Fama-French 5 · momentum excluded · staples calibration" />)}
        {active === "news" && (<NewsModule sentiment={MYOR_SENTIMENT} history={MYOR_SENT_HISTORY} sources={MYOR_SOURCES} feed={MYOR_NEWS} />)}
        {active === "flow" && (<FlowModule detail={flowDetail} meta={FLOW_META} />)}
        {active === "audit" && (<AuditModule citations={MYOR_AUDIT_CITATIONS} biasControls={MYOR_BIAS_CONTROLS} repro={MYOR_REPRO} limitations={MYOR_LIMITATIONS} />)}
      </div>
    </div>
  );
}
