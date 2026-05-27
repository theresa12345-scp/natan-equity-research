"use client";

import { useMemo, useState } from "react";
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
import { computeSMC, flowForTicker, unionTickers } from "@/lib/flow/aggregators";
import {
  NVDA_IDENTITY, NVDA_KPIS, NVDA_GRADE, NVDA_PILLARS, NVDA_DRIVERS, NVDA_THESIS, NVDA_GRADE_HISTORY,
  NVDA_DCF_CAPM, NVDA_DCF_TERMINAL, NVDA_DCF_OUTPUT, NVDA_DCF_PROJECTION, NVDA_DCF_SENSITIVITY,
  NVDA_COMPS, NVDA_COMPS_COLUMNS, NVDA_COMPS_PEER_AVG, NVDA_COMPS_DELTA, NVDA_COMPS_PROSE,
  NVDA_FACTORS, NVDA_COMPOSITE_Z, NVDA_OVERLAYS, NVDA_BACKTEST_STATS, NVDA_EQUITY_CURVE,
  NVDA_SENTIMENT, NVDA_SENT_HISTORY, NVDA_SOURCES, NVDA_NEWS,
  NVDA_AUDIT_CITATIONS, NVDA_BIAS_CONTROLS, NVDA_REPRO, NVDA_LIMITATIONS,
} from "@/lib/mock-nvda";

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
        <div className="num" style={{ fontSize: 11, color: "#d8d8d8" }}><span style={{ color: "#666" }}>Composite Z-Score</span> <span style={{ color: "#ff2e88", fontWeight: 600 }}>+1.42</span> <span style={{ color: "#666", fontSize: 9.5 }}>(top quartile of S&P 500)</span></div>
        <div style={{ fontSize: 11, color: "#d8d8d8" }}><span style={{ color: "#666" }}>Statistical Significance</span> <span className="num" style={{ color: "#00d97e" }}>p &lt; 0.05</span></div>
        <div style={{ fontSize: 11, color: "#d8d8d8", gridColumn: "1 / -1" }}><span style={{ color: "#666" }}>Factor Tilt</span> Quality + Profitability + Momentum elevated; Valuation binding constraint</div>
        <div style={{ fontSize: 11, color: "#d8d8d8" }}><span style={{ color: "#666" }}>Regime Sensitivity</span> Strong Risk-On bias (β_regime = 1.42)</div>
        <div style={{ fontSize: 11, color: "#d8d8d8" }}><span style={{ color: "#666" }}>Peer Percentile</span> <span className="num" style={{ color: "#ff2e88", fontWeight: 600 }}>84th</span> <span style={{ color: "#666", fontSize: 9.5 }}>within Semiconductors</span></div>
      </div>
    </div>
  );
}

export default function NVDAPage(): JSX.Element {
  const [active, setActive] = useState<string>("grade");
  const flowDetail = useMemo(() => {
    const tickers = unionTickers(CONGRESS_STUB, THIRTEEN_F_STUB, FORM4_STUB);
    const smc = computeSMC(tickers, CONGRESS_STUB, THIRTEEN_F_STUB, FORM4_STUB);
    return flowForTicker(NVDA_IDENTITY.ticker, CONGRESS_STUB, THIRTEEN_F_STUB, FORM4_STUB, smc);
  }, []);
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
      <SecurityHeader
        ticker={NVDA_IDENTITY.ticker} exchange={NVDA_IDENTITY.exchange} name={NVDA_IDENTITY.name}
        sector={NVDA_IDENTITY.sector} industry={NVDA_IDENTITY.industry} indices={NVDA_IDENTITY.indices}
        kpis={NVDA_KPIS}
        grade={{ letter: NVDA_GRADE.letter, score: NVDA_GRADE.score, max: NVDA_GRADE.max, verdict: NVDA_GRADE.verdict, verdictTone: NVDA_GRADE.verdictTone }}
        meta={[{ label: "RUPS", value: NVDA_IDENTITY.rups }, { label: "NEXT ER", value: NVDA_IDENTITY.nextEarnings }, { label: "FY END", value: NVDA_IDENTITY.fiscalYearEnd }]}
      />
      <VerdictCard
        letter={NVDA_GRADE.letter}
        score={NVDA_GRADE.score}
        max={NVDA_GRADE.max}
        compositeZ={1.42}
        pctRankLabel="84th %ile · S&P 500 Semis"
        pillars={NVDA_PILLARS}
        regimeSensitivity="Strong Risk-On bias (β_regime 1.42)"
      />
      <ModuleTabs tabs={TABS} active={active} onChange={setActive} />
      <div style={{ minHeight: 0, overflow: "auto" }}>
        {active === "grade" && (<><GradeModule pillars={NVDA_PILLARS} drivers={NVDA_DRIVERS} aggregate={NVDA_GRADE} thesis={NVDA_THESIS} history={NVDA_GRADE_HISTORY}
          pxFormatter={(n) => `$${n.toFixed(2)}`} ticker={NVDA_IDENTITY.ticker} name={NVDA_IDENTITY.name} ciLow="B" ciHigh="A−" /><ScoreInterpretation /></>)}
        {active === "dcf" && (<DCFModule capm={NVDA_DCF_CAPM} terminal={NVDA_DCF_TERMINAL} output={NVDA_DCF_OUTPUT} projection={NVDA_DCF_PROJECTION} sensitivity={NVDA_DCF_SENSITIVITY} currency="USD" unitLabel="$ billions" />)}
        {active === "comps" && (<CompsModule rows={NVDA_COMPS} peerAvg={NVDA_COMPS_PEER_AVG} delta={NVDA_COMPS_DELTA} prose={NVDA_COMPS_PROSE} columns={NVDA_COMPS_COLUMNS} />)}
        {active === "algo" && (<AlgoModule factors={NVDA_FACTORS} composite={NVDA_COMPOSITE_Z} overlays={NVDA_OVERLAYS} backtest={NVDA_BACKTEST_STATS} equityCurve={NVDA_EQUITY_CURVE} factorFramework="Fama-French 5 + momentum · Carhart 1997 (US-valid)" />)}
        {active === "news" && (<NewsModule sentiment={NVDA_SENTIMENT} history={NVDA_SENT_HISTORY} sources={NVDA_SOURCES} feed={NVDA_NEWS} />)}
        {active === "flow" && (<FlowModule detail={flowDetail} meta={FLOW_META} />)}
        {active === "audit" && (<AuditModule citations={NVDA_AUDIT_CITATIONS} biasControls={NVDA_BIAS_CONTROLS} repro={NVDA_REPRO} limitations={NVDA_LIMITATIONS}
          extraNote="US framework: 5-factor + momentum (Carhart 1997). IDX framework: 5-factor with momentum excluded per Li, Wei & Zhang 2023." />)}
      </div>
    </div>
  );
}
