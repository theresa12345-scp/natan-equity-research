import type { TickerFlowDetail, FlowVerdict } from "@/lib/flow/aggregators";
import { PARTY_COLOR } from "@/lib/flow/config";
import type { SmartMoneyGrade } from "@/lib/flow/types";

interface FlowModuleProps {
  detail: TickerFlowDetail;
  meta: {
    congressAsOf: string;
    form4AsOf: string;
    thirteenFAsOf: string;
    thirteenFPeriodEnd: string;
  };
}

function verdictColor(v: FlowVerdict): string {
  if (v === "BULLISH" || v === "MILDLY BULLISH") return "#00d97e";
  if (v === "BEARISH" || v === "MILDLY BEARISH") return "#ff4d4f";
  return "#888";
}

function gradeColor(g: SmartMoneyGrade): string {
  if (g.startsWith("A")) return "#00d97e";
  if (g.startsWith("B")) return "#ff2e88";
  if (g.startsWith("C")) return "#ffa940";
  return "#ff4d4f";
}

function fmtUsd(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "−" : n > 0 ? "+" : "";
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

function fmtAmountBucket(min: number, max: number): string {
  const fmt = (v: number): string => {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
    return `$${v}`;
  };
  return `${fmt(min)}–${fmt(max)}`;
}

function SectionHeader({ title, meta }: { title: string; meta?: string }): JSX.Element {
  return (
    <div
      className="flex items-center"
      style={{
        height: 28,
        padding: "0 14px",
        borderBottom: "1px solid #2a2a2a",
        borderTop: "1px solid #2a2a2a",
        background: "#050505",
        gap: 10,
      }}
    >
      <span
        style={{
          fontSize: 9.5,
          color: "#ff2e88",
          letterSpacing: "0.14em",
          fontWeight: 600,
          textTransform: "uppercase",
        }}
      >
        {title}
      </span>
      {meta ? (
        <span className="num ml-auto" style={{ fontSize: 9.5, color: "#666", letterSpacing: "0.06em" }}>
          {meta}
        </span>
      ) : null}
    </div>
  );
}

function ContributionBar({ z, contribution, label }: { z: number; contribution: number; label: string }): JSX.Element {
  const clamped = Math.max(-2, Math.min(2, z));
  const pctFromCenter = (Math.abs(clamped) / 2) * 50;
  const color = z >= 0 ? "#00d97e" : "#ff4d4f";
  return (
    <div style={{ padding: "8px 14px", borderBottom: "1px solid #111" }}>
      <div className="flex items-baseline" style={{ gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 10, color: "#d8d8d8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {label}
        </span>
        <span className="num ml-auto" style={{ fontSize: 10.5, color, fontWeight: 600 }}>
          {z >= 0 ? "+" : ""}{z.toFixed(2)}z
        </span>
        <span className="num" style={{ fontSize: 9.5, color: "#666" }}>
          contrib {contribution >= 0 ? "+" : ""}{contribution.toFixed(2)}
        </span>
      </div>
      <div style={{ position: "relative", height: 6, background: "#0a0a0a", border: "1px solid #1d1d1d" }}>
        <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "#2a2a2a" }} />
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: z >= 0 ? "50%" : `${50 - pctFromCenter}%`,
            width: `${pctFromCenter}%`,
            background: color,
            opacity: 0.65,
          }}
        />
      </div>
    </div>
  );
}

export default function FlowModule({ detail, meta }: FlowModuleProps): JSX.Element {
  const v = detail.verdict;
  const c = verdictColor(v);

  if (!detail.hasData) {
    return (
      <div style={{ padding: 16 }}>
        <div
          style={{
            border: "1px solid #2a2a2a",
            padding: "14px 16px",
            background: "#050505",
          }}
        >
          <div style={{ fontSize: 10, color: "#ff2e88", letterSpacing: "0.14em", fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>
            Smart-Money Flow · no tracked disclosures
          </div>
          <div style={{ fontSize: 11.5, color: "#d8d8d8", lineHeight: 1.5 }}>
            This security is not in the US disclosure regime tracked by /flow (Quiver Congress, SEC 13F-HR, SEC Form 4).
            IDX equivalents — IDX Net Foreign Flow, OJK insider filings, KSEI block trades — are not integrated yet.
          </div>
          <div className="num" style={{ fontSize: 9.5, color: "#666", marginTop: 8, letterSpacing: "0.06em" }}>
            See /flow for the cross-sectional surface.
          </div>
        </div>
      </div>
    );
  }

  const { agg, smc } = detail;
  return (
    <div>
      {/* Synthesis / verdict header */}
      <div style={{ padding: "14px 16px", borderBottom: "1px solid #2a2a2a", background: "#050505" }}>
        <div style={{ fontSize: 9.5, color: "#ff2e88", letterSpacing: "0.14em", fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>
          Smart-Money Composite · per-ticker verdict
        </div>
        <div className="flex items-baseline" style={{ gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 18, color: c, fontWeight: 600, letterSpacing: "-0.01em" }}>
            {v}
          </span>
          {smc ? (
            <>
              <span
                className="num"
                style={{
                  fontSize: 13,
                  color: gradeColor(smc.smcGrade),
                  border: `1px solid ${gradeColor(smc.smcGrade)}`,
                  padding: "1px 8px",
                  fontWeight: 600,
                }}
              >
                {smc.smcGrade}
              </span>
              <span className="num" style={{ fontSize: 12, color: "#d8d8d8" }}>
                SMC {smc.smcZ >= 0 ? "+" : ""}{smc.smcZ.toFixed(2)}z
              </span>
            </>
          ) : (
            <span className="num" style={{ fontSize: 11, color: "#888" }}>
              insufficient cross-sectional sample for SMC grade
            </span>
          )}
        </div>
        <div style={{ fontSize: 12, color: "#d8d8d8", marginTop: 8, lineHeight: 1.5 }}>
          {detail.synthesis}
        </div>
      </div>

      {/* KPI strip — 6 cells */}
      <div className="grid" style={{ gridTemplateColumns: "repeat(6, minmax(0, 1fr))" }}>
        {[
          { label: "CONGRESS · 90D", val: `${agg!.congressTrades90d}`, sub: fmtUsd(agg!.congressNetUsd90d), subTone: agg!.congressNetUsd90d > 0 ? "pos" : agg!.congressNetUsd90d < 0 ? "neg" : "n" },
          { label: "ACTORS · 90D", val: `${agg!.congressDistinctActors90d}`, sub: "distinct", subTone: "n" },
          { label: "INST ADDS · Q", val: `${agg!.inst13FAdds}`, sub: fmtUsd(agg!.inst13FTotalValueUsd), subTone: "n" },
          { label: "INST EXITS · Q", val: `${agg!.inst13FExits}`, sub: `Δ ${agg!.inst13FNetHolderDelta >= 0 ? "+" : ""}${agg!.inst13FNetHolderDelta}`, subTone: agg!.inst13FNetHolderDelta > 0 ? "pos" : agg!.inst13FNetHolderDelta < 0 ? "neg" : "n" },
          { label: "INSIDER CLUSTER · 30D", val: `${agg!.form4ClusterSize30d}`, sub: agg!.form4ClusterSize30d >= 3 ? "qualifies" : "below threshold", subTone: agg!.form4ClusterSize30d >= 3 ? "pos" : "n" },
          { label: "INSIDER NET · 30D", val: fmtUsd(agg!.form4NetUsd30d), sub: "P-code ex-10b5-1", subTone: agg!.form4NetUsd30d > 0 ? "pos" : agg!.form4NetUsd30d < 0 ? "neg" : "n" },
        ].map((k, i) => {
          const subColor = k.subTone === "pos" ? "#00d97e" : k.subTone === "neg" ? "#ff4d4f" : "#7a7a7a";
          return (
            <div
              key={k.label}
              style={{
                padding: "12px 14px",
                borderRight: i < 5 ? "1px solid #1d1d1d" : "none",
                borderBottom: "1px solid #2a2a2a",
                minHeight: 72,
              }}
            >
              <div className="num" style={{ fontSize: 9, color: "#666", letterSpacing: "0.08em", marginBottom: 6 }}>
                {k.label}
              </div>
              <div className="num" style={{ fontSize: 15, color: "#f5f5f5", fontWeight: 500, letterSpacing: "-0.01em" }}>
                {k.val}
              </div>
              <div className="num" style={{ fontSize: 9.5, color: subColor, marginTop: 4 }}>
                {k.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* SMC component breakdown */}
      {smc ? (
        <>
          <SectionHeader title="SMC Component Breakdown · cross-sectional z" meta={`as of ${smc.asOf.slice(0, 10)}`} />
          <ContributionBar z={smc.components.congress.z} contribution={smc.components.congress.contribution} label="Congress · 33% weight" />
          <ContributionBar z={smc.components.institutional.z} contribution={smc.components.institutional.contribution} label="Institutional · 33% weight" />
          <ContributionBar z={smc.components.insider.z} contribution={smc.components.insider.contribution} label="Insider · 34% weight" />
        </>
      ) : null}

      {/* Congress trades for this ticker */}
      <SectionHeader title="Congress Trades · this ticker" meta={`${detail.congressForTicker.length} · STOCK Act as of ${meta.congressAsOf}`} />
      {detail.congressForTicker.length === 0 ? (
        <div style={{ padding: "10px 14px", fontSize: 11, color: "#666" }}>No tracked congressional trades.</div>
      ) : (
        <div>
          <div
            className="grid items-center"
            style={{
              gridTemplateColumns: "100px 80px 60px 60px 110px 90px auto",
              height: 24,
              padding: "0 14px",
              borderBottom: "1px solid #2a2a2a",
              background: "#050505",
              fontSize: 9,
              color: "#666",
              letterSpacing: "0.08em",
              gap: 8,
              textTransform: "uppercase",
            }}
          >
            <span>Date</span>
            <span>Politician</span>
            <span>Party</span>
            <span>Side</span>
            <span className="text-right">Amount</span>
            <span className="text-right">Filing lag</span>
            <span>State / chamber</span>
          </div>
          {detail.congressForTicker.slice(0, 12).map((t) => {
            const sideColor = t.transactionType === "Buy" ? "#00d97e" : t.transactionType === "Sale" ? "#ff4d4f" : "#888";
            const partyColor = PARTY_COLOR[t.party];
            return (
              <div
                key={t.id}
                className="grid items-center"
                style={{
                  gridTemplateColumns: "100px 80px 60px 60px 110px 90px auto",
                  height: 26,
                  padding: "0 14px",
                  borderBottom: "1px solid #111",
                  fontSize: 10.5,
                  gap: 8,
                }}
              >
                <span className="num" style={{ color: "#d8d8d8" }}>{t.tradeDate}</span>
                <span style={{ color: "#d8d8d8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.politician}</span>
                <span className="num" style={{ color: partyColor, fontWeight: 600 }}>{t.party}</span>
                <span className="num" style={{ color: sideColor, fontWeight: 600 }}>{t.transactionType}</span>
                <span className="num text-right" style={{ color: "#d8d8d8" }}>{fmtAmountBucket(t.amountMin, t.amountMax)}</span>
                <span className="num text-right" style={{ color: t.filingLagDays > 45 ? "#ff4d4f" : "#888" }}>{t.filingLagDays}d</span>
                <span className="num" style={{ color: "#7a7a7a", fontSize: 9.5, letterSpacing: "0.06em" }}>
                  {t.state} · {t.chamber}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* 13F holders for this ticker */}
      <SectionHeader title="13F Holders · tracked institutions" meta={`Q ending ${meta.thirteenFPeriodEnd} · filed by ${meta.thirteenFAsOf}`} />
      {detail.positionsForTicker.length === 0 ? (
        <div style={{ padding: "10px 14px", fontSize: 11, color: "#666" }}>No tracked-institution position in the current quarter.</div>
      ) : (
        <div>
          <div
            className="grid items-center"
            style={{
              gridTemplateColumns: "1fr 90px 90px 80px 90px 60px",
              height: 24,
              padding: "0 14px",
              borderBottom: "1px solid #2a2a2a",
              background: "#050505",
              fontSize: 9,
              color: "#666",
              letterSpacing: "0.08em",
              gap: 8,
              textTransform: "uppercase",
            }}
          >
            <span>Manager</span>
            <span className="text-right">Value</span>
            <span className="text-right">Δ shares Q/Q</span>
            <span className="text-right">% Portfolio</span>
            <span className="text-right">Period</span>
            <span className="text-right">Flag</span>
          </div>
          {detail.positionsForTicker.map((p) => {
            const flag = p.isNew ? "NEW" : p.isExit ? "EXIT" : null;
            const flagColor = p.isNew ? "#00d97e" : p.isExit ? "#ff4d4f" : "#666";
            const deltaColor = p.sharesChangeQoQ == null ? "#888" : p.sharesChangeQoQ > 0 ? "#00d97e" : p.sharesChangeQoQ < 0 ? "#ff4d4f" : "#888";
            return (
              <div
                key={`${p.managerCik}-${p.period}`}
                className="grid items-center"
                style={{
                  gridTemplateColumns: "1fr 90px 90px 80px 90px 60px",
                  height: 26,
                  padding: "0 14px",
                  borderBottom: "1px solid #111",
                  fontSize: 10.5,
                  gap: 8,
                }}
              >
                <span style={{ color: "#d8d8d8" }}>{p.managerName}</span>
                <span className="num text-right" style={{ color: "#d8d8d8" }}>{fmtUsd(p.valueUsd)}</span>
                <span className="num text-right" style={{ color: deltaColor }}>
                  {p.sharesChangeQoQ == null ? "—" : `${p.sharesChangeQoQ > 0 ? "+" : ""}${(p.sharesChangeQoQ / 1000).toFixed(0)}K`}
                </span>
                <span className="num text-right" style={{ color: "#888" }}>{p.pctPortfolio.toFixed(2)}%</span>
                <span className="num text-right" style={{ color: "#7a7a7a", fontSize: 9.5 }}>{p.period}</span>
                <span className="num text-right" style={{ color: flagColor, fontWeight: 600, fontSize: 9.5 }}>{flag ?? "—"}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Form 4 insider transactions for this ticker */}
      <SectionHeader title="Form 4 Insider · 60-day window" meta={`SEC EDGAR as of ${meta.form4AsOf}`} />
      {detail.form4ForTicker.length === 0 ? (
        <div style={{ padding: "10px 14px", fontSize: 11, color: "#666" }}>No tracked Form 4 transactions.</div>
      ) : (
        <div>
          <div
            className="grid items-center"
            style={{
              gridTemplateColumns: "90px 1fr 110px 50px 80px 90px 60px",
              height: 24,
              padding: "0 14px",
              borderBottom: "1px solid #2a2a2a",
              background: "#050505",
              fontSize: 9,
              color: "#666",
              letterSpacing: "0.08em",
              gap: 8,
              textTransform: "uppercase",
            }}
          >
            <span>Date</span>
            <span>Insider · title</span>
            <span className="text-right">Shares</span>
            <span className="text-right">Code</span>
            <span className="text-right">Price</span>
            <span className="text-right">Value</span>
            <span className="text-right">Flag</span>
          </div>
          {detail.form4ForTicker.map((f) => {
            const codeColor =
              f.txnCode === "P" ? "#00d97e" :
              f.txnCode === "S" ? "#ff4d4f" :
              "#888";
            const flag = f.is10b51 ? "10b5-1" : null;
            return (
              <div
                key={f.id}
                className="grid items-center"
                style={{
                  gridTemplateColumns: "90px 1fr 110px 50px 80px 90px 60px",
                  height: 26,
                  padding: "0 14px",
                  borderBottom: "1px solid #111",
                  fontSize: 10.5,
                  gap: 8,
                }}
              >
                <span className="num" style={{ color: "#d8d8d8" }}>{f.transactionDate}</span>
                <span style={{ color: "#d8d8d8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {f.insiderName}
                  <span style={{ color: "#666", marginLeft: 6, fontSize: 9.5 }}>· {f.insiderTitle}</span>
                </span>
                <span className="num text-right" style={{ color: "#d8d8d8" }}>{f.shares.toLocaleString("en-US")}</span>
                <span className="num text-right" style={{ color: codeColor, fontWeight: 600 }}>{f.txnCode}</span>
                <span className="num text-right" style={{ color: "#888" }}>${f.pricePerShare.toFixed(2)}</span>
                <span className="num text-right" style={{ color: "#d8d8d8" }}>{fmtUsd(f.valueUsd)}</span>
                <span className="num text-right" style={{ color: flag ? "#ffa940" : "#666", fontSize: 9, fontWeight: 600 }}>
                  {flag ?? "—"}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Methodology footer */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid #2a2a2a", background: "#050505" }}>
        <div className="num" style={{ fontSize: 9, color: "#666", letterSpacing: "0.08em", marginBottom: 6, textTransform: "uppercase" }}>
          Methodology
        </div>
        <div style={{ fontSize: 10.5, color: "#888", lineHeight: 1.55 }}>
          Cluster = ≥3 distinct P-code (open-market) buyers in a 30d window, excluding Rule 10b5-1 prearranged plans.
          Congress window 90d (STOCK Act 45d max filing lag). 13F filed within 45d of quarter-end. Cross-sectional z computed across the full SMC universe ({smc ? "in-universe" : "ex-universe"}); contributions weighted 33% / 33% / 34% (Checkpoint-1; options 0% pending Unusual Whales integration).
        </div>
      </div>
    </div>
  );
}
