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
import {
  MYOR_IDENTITY, MYOR_KPIS, MYOR_GRADE, MYOR_PILLARS, MYOR_DRIVERS, MYOR_THESIS, MYOR_GRADE_HISTORY,
  MYOR_DCF_CAPM, MYOR_DCF_TERMINAL, MYOR_DCF_OUTPUT, MYOR_DCF_PROJECTION, MYOR_DCF_SENSITIVITY,
  MYOR_COMPS, MYOR_COMPS_COLUMNS, MYOR_COMPS_PEER_AVG, MYOR_COMPS_DELTA, MYOR_COMPS_PROSE,
  MYOR_FACTORS, MYOR_COMPOSITE_Z, MYOR_OVERLAYS, MYOR_BACKTEST_STATS, MYOR_EQUITY_CURVE,
  MYOR_SENTIMENT, MYOR_SENT_HISTORY, MYOR_SOURCES, MYOR_NEWS,
  MYOR_AUDIT_CITATIONS, MYOR_BIAS_CONTROLS, MYOR_REPRO, MYOR_LIMITATIONS,
} from "@/lib/mock-myor";

const TABS: ModuleTab[] = [
  { key: "grade", label: "Grade" },
  { key: "dcf", label: "DCF" },
  { key: "comps", label: "Comps" },
  { key: "algo", label: "Algo & Factors" },
  { key: "news", label: "News & Sent" },
  { key: "audit", label: "Audit" },
];

export default function MYORPage(): JSX.Element {
  const [active, setActive] = useState<string>("grade");
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
      <SecurityHeader
        ticker={MYOR_IDENTITY.ticker}
        exchange={MYOR_IDENTITY.exchange}
        name={MYOR_IDENTITY.name}
        sector={MYOR_IDENTITY.sector}
        industry={MYOR_IDENTITY.industry}
        indices={MYOR_IDENTITY.indices}
        kpis={MYOR_KPIS}
        grade={{
          letter: MYOR_GRADE.letter,
          score: MYOR_GRADE.score,
          max: MYOR_GRADE.max,
          verdict: MYOR_GRADE.verdict,
          verdictTone: MYOR_GRADE.verdictTone,
        }}
        meta={[
          { label: "RUPS", value: MYOR_IDENTITY.rups },
          { label: "NEXT ER", value: MYOR_IDENTITY.nextEarnings },
          { label: "FY END", value: MYOR_IDENTITY.fiscalYearEnd },
        ]}
      />
      <ModuleTabs tabs={TABS} active={active} onChange={setActive} />
      <div style={{ minHeight: 0, overflow: "auto" }}>
        {active === "grade" && (
          <GradeModule
            pillars={MYOR_PILLARS}
            drivers={MYOR_DRIVERS}
            aggregate={{
              letter: MYOR_GRADE.letter, score: MYOR_GRADE.score, max: MYOR_GRADE.max,
              verdict: MYOR_GRADE.verdict, verdictTone: MYOR_GRADE.verdictTone,
              horizon: MYOR_GRADE.horizon, targetPx: MYOR_GRADE.targetPx,
              targetUpsidePct: MYOR_GRADE.targetUpsidePct, downsidePx: MYOR_GRADE.downsidePx,
              downsideDeltaPct: MYOR_GRADE.downsideDeltaPct, rrRatio: MYOR_GRADE.rrRatio,
              positionSize: MYOR_GRADE.positionSize,
            }}
            thesis={MYOR_THESIS}
            history={MYOR_GRADE_HISTORY}
            pxFormatter={(n) => `Rp ${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
          />
        )}
        {active === "dcf" && (
          <DCFModule capm={MYOR_DCF_CAPM} terminal={MYOR_DCF_TERMINAL} output={MYOR_DCF_OUTPUT}
            projection={MYOR_DCF_PROJECTION} sensitivity={MYOR_DCF_SENSITIVITY}
            currency="IDR" unitLabel="Rp triliun" />
        )}
        {active === "comps" && (
          <CompsModule rows={MYOR_COMPS} peerAvg={MYOR_COMPS_PEER_AVG} delta={MYOR_COMPS_DELTA}
            prose={MYOR_COMPS_PROSE} columns={MYOR_COMPS_COLUMNS} />
        )}
        {active === "algo" && (
          <AlgoModule factors={MYOR_FACTORS} composite={MYOR_COMPOSITE_Z} overlays={MYOR_OVERLAYS}
            backtest={MYOR_BACKTEST_STATS} equityCurve={MYOR_EQUITY_CURVE}
            factorFramework="Fama-French 5 · momentum excluded · staples calibration" />
        )}
        {active === "news" && (
          <NewsModule sentiment={MYOR_SENTIMENT} history={MYOR_SENT_HISTORY}
            sources={MYOR_SOURCES} feed={MYOR_NEWS} />
        )}
        {active === "audit" && (
          <AuditModule citations={MYOR_AUDIT_CITATIONS} biasControls={MYOR_BIAS_CONTROLS}
            repro={MYOR_REPRO} limitations={MYOR_LIMITATIONS} />
        )}
      </div>
    </div>
  );
}
