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
  BBCA_IDENTITY, BBCA_KPIS, BBCA_GRADE, BBCA_PILLARS, BBCA_DRIVERS, BBCA_THESIS, BBCA_GRADE_HISTORY,
  BBCA_DCF_CAPM, BBCA_DCF_TERMINAL, BBCA_DCF_OUTPUT, BBCA_DCF_PROJECTION, BBCA_DCF_SENSITIVITY,
  BBCA_COMPS, BBCA_COMPS_COLUMNS, BBCA_COMPS_PEER_AVG, BBCA_COMPS_DELTA, BBCA_COMPS_PROSE,
  BBCA_FACTORS, BBCA_COMPOSITE_Z, BBCA_OVERLAYS, BBCA_BACKTEST_STATS, BBCA_EQUITY_CURVE,
  BBCA_SENTIMENT, BBCA_SENT_HISTORY, BBCA_SOURCES, BBCA_NEWS,
  BBCA_AUDIT_CITATIONS, BBCA_BIAS_CONTROLS, BBCA_REPRO, BBCA_LIMITATIONS,
} from "@/lib/mock-bbca";

const TABS: ModuleTab[] = [
  { key: "grade", label: "Grade" },
  { key: "dcf", label: "DCF" },
  { key: "comps", label: "Comps" },
  { key: "algo", label: "Algo & Factors" },
  { key: "news", label: "News & Sent" },
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
      <div style={{ fontSize: 9.5, color: "#ff2e88", letterSpacing: "0.14em", fontWeight: 600, textTransform: "uppercase", marginBottom: 10 }}>
        Score Interpretation · research framing
      </div>
      <div className="grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
        <div className="num" style={{ fontSize: 11, color: "#d8d8d8" }}>
          <span style={{ color: "#666" }}>Composite Z-Score</span>{" "}
          <span style={{ color: "#ff2e88", fontWeight: 600 }}>+2.18</span>{" "}
          <span style={{ color: "#666", fontSize: 9.5 }}>(top decile of LQ45 universe)</span>
        </div>
        <div style={{ fontSize: 11, color: "#d8d8d8" }}>
          <span style={{ color: "#666" }}>Statistical Significance</span>{" "}
          <span className="num" style={{ color: "#00d97e" }}>p &lt; 0.01</span>{" "}
          <span style={{ color: "#666", fontSize: 9.5 }}>(Bonferroni-adjusted)</span>
        </div>
        <div style={{ fontSize: 11, color: "#d8d8d8", gridColumn: "1 / -1" }}>
          <span style={{ color: "#666" }}>Factor Tilt</span>{" "}
          Quality + Profitability dominant; Valuation drag; Momentum neutral
        </div>
        <div style={{ fontSize: 11, color: "#d8d8d8" }}>
          <span style={{ color: "#666" }}>Regime Sensitivity</span>{" "}
          Outperforms in Risk-On (β_regime = 0.84)
        </div>
        <div style={{ fontSize: 11, color: "#d8d8d8" }}>
          <span style={{ color: "#666" }}>Peer Percentile</span>{" "}
          <span className="num" style={{ color: "#ff2e88", fontWeight: 600 }}>92nd</span>{" "}
          <span style={{ color: "#666", fontSize: 9.5 }}>within Financials sector</span>
        </div>
      </div>
    </div>
  );
}

export default function BBCAPage(): JSX.Element {
  const [active, setActive] = useState<string>("grade");
  const flowDetail = flowForTicker(BBCA_IDENTITY.ticker, CONGRESS_STUB, THIRTEEN_F_STUB, FORM4_STUB);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
      <SecurityHeader
        ticker={BBCA_IDENTITY.ticker}
        exchange={BBCA_IDENTITY.exchange}
        name={BBCA_IDENTITY.name}
        sector={BBCA_IDENTITY.sector}
        industry={BBCA_IDENTITY.industry}
        indices={BBCA_IDENTITY.indices}
        kpis={BBCA_KPIS}
        grade={{ letter: BBCA_GRADE.letter, score: BBCA_GRADE.score, max: BBCA_GRADE.max, verdict: BBCA_GRADE.verdict, verdictTone: BBCA_GRADE.verdictTone }}
        meta={[{ label: "RUPS", value: BBCA_IDENTITY.rups }, { label: "NEXT ER", value: BBCA_IDENTITY.nextEarnings }, { label: "FY END", value: BBCA_IDENTITY.fiscalYearEnd }]}
      />
      <VerdictCard
        letter={BBCA_GRADE.letter}
        score={BBCA_GRADE.score}
        max={BBCA_GRADE.max}
        compositeZ={2.18}
        pctRankLabel="92nd %ile · LQ45 Financials"
        pillars={BBCA_PILLARS}
        regimeSensitivity="Risk-On lean (β_regime 0.84)"
      />
      <ModuleTabs tabs={TABS} active={active} onChange={setActive} />
      <div key={active} className="mrdn-tab-content" style={{ minHeight: 0, overflow: "auto" }}>
        {active === "grade" && (
          <>
            <GradeModule pillars={BBCA_PILLARS} drivers={BBCA_DRIVERS} aggregate={BBCA_GRADE} thesis={BBCA_THESIS} history={BBCA_GRADE_HISTORY}
              pxFormatter={(n) => `Rp ${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
              ticker={BBCA_IDENTITY.ticker} name={BBCA_IDENTITY.name} ciLow="B+" ciHigh="A" />
            <ScoreInterpretation />
          </>
        )}
        {active === "dcf" && (<DCFModule capm={BBCA_DCF_CAPM} terminal={BBCA_DCF_TERMINAL} output={BBCA_DCF_OUTPUT} projection={BBCA_DCF_PROJECTION} sensitivity={BBCA_DCF_SENSITIVITY} currency="IDR" unitLabel="Rp triliun" />)}
        {active === "comps" && (<CompsModule rows={BBCA_COMPS} peerAvg={BBCA_COMPS_PEER_AVG} delta={BBCA_COMPS_DELTA} prose={BBCA_COMPS_PROSE} columns={BBCA_COMPS_COLUMNS} />)}
        {active === "algo" && (<AlgoModule factors={BBCA_FACTORS} composite={BBCA_COMPOSITE_Z} overlays={BBCA_OVERLAYS} backtest={BBCA_BACKTEST_STATS} equityCurve={BBCA_EQUITY_CURVE} factorFramework="Fama-French 5 · momentum excluded · Li, Wei & Zhang 2023" />)}
        {active === "news" && (<NewsModule sentiment={BBCA_SENTIMENT} history={BBCA_SENT_HISTORY} sources={BBCA_SOURCES} feed={BBCA_NEWS} />)}
        {active === "flow" && (<FlowModule detail={flowDetail} meta={FLOW_META} />)}
        {active === "audit" && (<AuditModule citations={BBCA_AUDIT_CITATIONS} biasControls={BBCA_BIAS_CONTROLS} repro={BBCA_REPRO} limitations={BBCA_LIMITATIONS} />)}
      </div>
    </div>
  );
}
