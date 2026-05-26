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
  BBCA_IDENTITY,
  BBCA_KPIS,
  BBCA_GRADE,
  BBCA_PILLARS,
  BBCA_DRIVERS,
  BBCA_THESIS,
  BBCA_GRADE_HISTORY,
  BBCA_DCF_CAPM,
  BBCA_DCF_TERMINAL,
  BBCA_DCF_OUTPUT,
  BBCA_DCF_PROJECTION,
  BBCA_DCF_SENSITIVITY,
  BBCA_COMPS,
  BBCA_COMPS_COLUMNS,
  BBCA_COMPS_PEER_AVG,
  BBCA_COMPS_DELTA,
  BBCA_COMPS_PROSE,
  BBCA_FACTORS,
  BBCA_COMPOSITE_Z,
  BBCA_OVERLAYS,
  BBCA_BACKTEST_STATS,
  BBCA_EQUITY_CURVE,
  BBCA_SENTIMENT,
  BBCA_SENT_HISTORY,
  BBCA_SOURCES,
  BBCA_NEWS,
  BBCA_AUDIT_CITATIONS,
  BBCA_BIAS_CONTROLS,
  BBCA_REPRO,
  BBCA_LIMITATIONS,
} from "@/lib/mock-bbca";

const TABS: ModuleTab[] = [
  { key: "grade", label: "Grade" },
  { key: "dcf", label: "DCF" },
  { key: "comps", label: "Comps" },
  { key: "algo", label: "Algo & Factors" },
  { key: "news", label: "News & Sent" },
  { key: "audit", label: "Audit" },
];

export default function BBCAPage(): JSX.Element {
  const [active, setActive] = useState<string>("grade");

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
        grade={{
          letter: BBCA_GRADE.letter,
          score: BBCA_GRADE.score,
          max: BBCA_GRADE.max,
          verdict: BBCA_GRADE.verdict,
          verdictTone: BBCA_GRADE.verdictTone,
        }}
        meta={[
          { label: "RUPS", value: BBCA_IDENTITY.rups },
          { label: "NEXT ER", value: BBCA_IDENTITY.nextEarnings },
          { label: "FY END", value: BBCA_IDENTITY.fiscalYearEnd },
        ]}
      />

      <ModuleTabs tabs={TABS} active={active} onChange={setActive} />

      <div style={{ minHeight: 0, overflow: "auto" }}>
        {active === "grade" ? (
          <GradeModule
            pillars={BBCA_PILLARS}
            drivers={BBCA_DRIVERS}
            aggregate={{
              letter: BBCA_GRADE.letter,
              score: BBCA_GRADE.score,
              max: BBCA_GRADE.max,
              verdict: BBCA_GRADE.verdict,
              verdictTone: BBCA_GRADE.verdictTone,
              horizon: BBCA_GRADE.horizon,
              targetPx: BBCA_GRADE.targetPx,
              targetUpsidePct: BBCA_GRADE.targetUpsidePct,
              downsidePx: BBCA_GRADE.downsidePx,
              downsideDeltaPct: BBCA_GRADE.downsideDeltaPct,
              rrRatio: BBCA_GRADE.rrRatio,
              positionSize: BBCA_GRADE.positionSize,
            }}
            thesis={BBCA_THESIS}
            history={BBCA_GRADE_HISTORY}
            pxFormatter={(n) =>
              `Rp ${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
            }
            ticker={BBCA_IDENTITY.ticker}
            name={BBCA_IDENTITY.name}
            ciLow="B+"
            ciHigh="A"
          />
        ) : null}

        {active === "dcf" ? (
          <DCFModule
            capm={BBCA_DCF_CAPM}
            terminal={BBCA_DCF_TERMINAL}
            output={BBCA_DCF_OUTPUT}
            projection={BBCA_DCF_PROJECTION}
            sensitivity={BBCA_DCF_SENSITIVITY}
            currency="IDR"
            unitLabel="Rp triliun"
          />
        ) : null}

        {active === "comps" ? (
          <CompsModule
            rows={BBCA_COMPS}
            peerAvg={BBCA_COMPS_PEER_AVG}
            delta={BBCA_COMPS_DELTA}
            prose={BBCA_COMPS_PROSE}
            columns={BBCA_COMPS_COLUMNS}
          />
        ) : null}

        {active === "algo" ? (
          <AlgoModule
            factors={BBCA_FACTORS}
            composite={BBCA_COMPOSITE_Z}
            overlays={BBCA_OVERLAYS}
            backtest={BBCA_BACKTEST_STATS}
            equityCurve={BBCA_EQUITY_CURVE}
            factorFramework="Fama-French 5 · momentum excluded · Wirjanto et al. 2023"
          />
        ) : null}

        {active === "news" ? (
          <NewsModule
            sentiment={BBCA_SENTIMENT}
            history={BBCA_SENT_HISTORY}
            sources={BBCA_SOURCES}
            feed={BBCA_NEWS}
          />
        ) : null}

        {active === "audit" ? (
          <AuditModule
            citations={BBCA_AUDIT_CITATIONS}
            biasControls={BBCA_BIAS_CONTROLS}
            repro={BBCA_REPRO}
            limitations={BBCA_LIMITATIONS}
          />
        ) : null}
      </div>
    </div>
  );
}
