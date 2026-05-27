"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import TickerLink from "@/components/primitives/TickerLink";
import type {
  CongressTrade,
  Form4Txn,
  Position13F,
  SMCResult,
  TrackedInstitution,
} from "@/lib/flow/types";
import { PARTY_COLOR } from "@/lib/flow/config";
import { aggregateTicker } from "@/lib/flow/aggregators";

interface PoliticianLeaderRow {
  politician: string;
  party: "R" | "D" | "I";
  chamber: "House" | "Senate";
  trades12m: number;
  winRate: number;
  est12mReturn: number;
}

interface FlowClientProps {
  smc: SMCResult[];
  congress: CongressTrade[];
  thirteenF: Position13F[];
  notableExits: Position13F[];
  form4: Form4Txn[];
  institutions: TrackedInstitution[];
  politicianLeaderboard: PoliticianLeaderRow[];
  kpis: {
    congressTrades7d: number;
    congressNetUsd7d: number;
    instAdds: number;
    instExits: number;
    clusters30d: number;
    insiderNetUsd7d: number;
  };
  meta: {
    congressAsOf: string;
    form4AsOf: string;
    thirteenFAsOf: string;
    thirteenFPeriodEnd: string;
  };
}

// ── formatting helpers ──
function fmtUsdM(n: number): string {
  const sign = n >= 0 ? "+" : "−";
  const abs = Math.abs(n);
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(0)}k`;
  return `${sign}$${abs.toFixed(0)}`;
}

function fmtBucket(min: number, max: number): string {
  const fmt = (n: number) =>
    n >= 1e6 ? `${(n / 1e6).toFixed(0)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(0)}k` : `${n}`;
  return `$${fmt(min)}–${fmt(max)}`;
}

function smcColor(z: number): string {
  if (z >= 1.5) return "#00d97e";
  if (z >= 0.5) return "#5cc97a";
  if (z >= -0.5) return "#ff2e88";
  if (z >= -1.5) return "#c4831f";
  return "#ff4d4f";
}

function smcBg(z: number): string {
  if (z >= 1.5) return "rgba(0,217,126,0.18)";
  if (z >= 0.5) return "rgba(0,217,126,0.10)";
  if (z >= -0.5) return "rgba(255,46,136,0.10)";
  if (z >= -1.5) return "rgba(196,131,31,0.08)";
  return "rgba(255,77,79,0.10)";
}

function gradeColor(g: string): string {
  if (g === "A+" || g === "A") return "#00d97e";
  if (g === "A-" || g === "B+") return "#5cc97a";
  if (g === "B" || g === "B-") return "#ff2e88";
  if (g === "C" || g === "C-") return "#c4831f";
  return "#ff4d4f";
}

function PartyChip({ party }: { party: "R" | "D" | "I" }): JSX.Element {
  return (
    <span
      style={{
        display: "inline-block",
        width: 16,
        height: 16,
        background: PARTY_COLOR[party],
        color: "#000",
        fontSize: 9,
        fontWeight: 700,
        textAlign: "center",
        lineHeight: "16px",
        letterSpacing: "0",
        fontFamily: "var(--font-jetbrains)",
      }}
      aria-label={party === "R" ? "Republican" : party === "D" ? "Democrat" : "Independent"}
    >
      {party}
    </span>
  );
}

function PanelHead({
  title,
  meta,
  asOf,
}: {
  title: string;
  meta?: string;
  asOf?: string;
}): JSX.Element {
  return (
    <div
      className="flex items-center"
      style={{
        height: 24,
        padding: "0 10px",
        borderBottom: "1px solid #1d1d1d",
        background: "#050505",
        gap: 8,
      }}
    >
      <span
        style={{
          fontSize: 9,
          color: "#ff2e88",
          letterSpacing: "0.14em",
          fontWeight: 600,
          textTransform: "uppercase",
        }}
      >
        {title}
      </span>
      {meta ? (
        <span style={{ fontSize: 9.5, color: "#7a7a7a" }}>{meta}</span>
      ) : null}
      {asOf ? (
        <span
          className="num ml-auto"
          style={{
            fontSize: 9,
            color: "#666",
            letterSpacing: "0.06em",
          }}
        >
          AS OF {asOf}
        </span>
      ) : null}
    </div>
  );
}

// ── KPI strip ────────────────────────────────────────────────────
function KPIStrip({
  k,
  meta,
}: {
  k: FlowClientProps["kpis"];
  meta: FlowClientProps["meta"];
}): JSX.Element {
  const cells: Array<{ label: string; value: string; sub?: string; tone?: "pos" | "neg" | "neutral"; disabled?: boolean }> = [
    { label: "CONGRESS · 7D", value: String(k.congressTrades7d), sub: "trades disclosed" },
    { label: "CONGRESS NET $ · 7D", value: fmtUsdM(k.congressNetUsd7d), tone: k.congressNetUsd7d > 0 ? "pos" : "neg", sub: "buys − sales" },
    { label: "INST. ADDS · Q", value: String(k.instAdds), sub: "13F adds + new" },
    { label: "INST. EXITS · Q", value: String(k.instExits), sub: "trims + closes" },
    { label: "FORM 4 CLUSTERS · 30D", value: String(k.clusters30d), sub: "≥3 P-buyers" },
    { label: "INSIDER NET $ · 7D", value: fmtUsdM(k.insiderNetUsd7d), tone: k.insiderNetUsd7d > 0 ? "pos" : "neg", sub: "P − S, ex-10b5-1" },
    { label: "UNUSUAL OPTIONS · 24H", value: "—", sub: "Checkpoint 3", disabled: true },
    { label: "DARK POOL · 24H", value: "—", sub: "Checkpoint 3", disabled: true },
  ];
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))`,
        borderBottom: "1px solid #2a2a2a",
      }}
    >
      {cells.map((c, i) => (
        <div
          key={c.label}
          style={{
            padding: "10px 12px",
            borderRight: i < cells.length - 1 ? "1px solid #1d1d1d" : "none",
            opacity: c.disabled ? 0.45 : 1,
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontSize: 8.5,
              color: "#666",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 5,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {c.label}
          </div>
          <div
            className="num"
            style={{
              fontSize: 16,
              color: c.tone === "pos" ? "#00d97e" : c.tone === "neg" ? "#ff4d4f" : "#f5f5f5",
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            {c.value}
          </div>
          {c.sub ? (
            <div
              className="num"
              style={{ fontSize: 9, color: "#7a7a7a", marginTop: 3 }}
            >
              {c.sub}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

// ── /flow main page ─────────────────────────────────────────────
export default function FlowClient(props: FlowClientProps): JSX.Element {
  const [region, setRegion] = useState<"US" | "IDX">("US");
  const isUS = region === "US";

  // 30d congress
  const ref = new Date("2026-05-26");
  const within = (d: string, days: number): boolean => {
    const t = new Date(d).getTime();
    const r = ref.getTime();
    const diff = Math.floor((r - t) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= days;
  };
  const congress30d = useMemo(
    () =>
      props.congress
        .filter((c) => within(c.tradeDate, 30))
        .sort((a, b) => b.filingDate.localeCompare(a.filingDate)),
    [props.congress],
  );

  // 13F heatmap tickers — top 20 by total tracked-institution holding value
  const topTickers = useMemo(() => {
    const m = new Map<string, number>();
    props.thirteenF.forEach((p) =>
      m.set(p.ticker, (m.get(p.ticker) ?? 0) + p.valueUsd),
    );
    return Array.from(m.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([t]) => t);
  }, [props.thirteenF]);

  // Cluster buys (≥3 distinct P-code buyers, 30d)
  const clusterRows = useMemo(() => {
    const m = new Map<string, { buyers: Set<string>; aggUsd: number; mostSenior: Form4Txn | null }>();
    props.form4
      .filter((f) => f.txnCode === "P" && !f.is10b51 && within(f.transactionDate, 30))
      .forEach((f) => {
        if (!m.has(f.ticker)) m.set(f.ticker, { buyers: new Set(), aggUsd: 0, mostSenior: null });
        const e = m.get(f.ticker)!;
        e.buyers.add(f.insiderName);
        e.aggUsd += f.valueUsd;
        if (!e.mostSenior || titleRank(f.insiderTitle) > titleRank(e.mostSenior.insiderTitle)) {
          e.mostSenior = f;
        }
      });
    return Array.from(m.entries())
      .filter(([, e]) => e.buyers.size >= 3)
      .map(([t, e]) => ({
        ticker: t,
        clusterSize: e.buyers.size,
        aggUsd: e.aggUsd,
        mostSenior: e.mostSenior,
      }))
      .sort((a, b) => b.clusterSize - a.clusterSize || b.aggUsd - a.aggUsd);
  }, [props.form4]);

  // New conviction positions >$500M
  const bigNew = useMemo(
    () =>
      props.thirteenF
        .filter((p) => p.isNew && p.valueUsd >= 500_000_000)
        .sort((a, b) => b.valueUsd - a.valueUsd)
        .slice(0, 6),
    [props.thirteenF],
  );
  const bigExits = useMemo(
    () =>
      props.notableExits
        .sort((a, b) => b.valueUsd - a.valueUsd)
        .slice(0, 6),
    [props.notableExits],
  );

  // ── IDX graceful-degrade ──
  if (!isUS) {
    return (
      <div>
        <Header region={region} setRegion={setRegion} meta={props.meta} />
        <div style={{ padding: "40px 24px", maxWidth: 720 }}>
          <h2
            style={{
              fontSize: 14,
              color: "#ff2e88",
              fontStyle: "italic",
              letterSpacing: "0.04em",
              fontWeight: 500,
              margin: "0 0 14px",
            }}
          >
            US-only disclosure regime — IDX equivalent not available
          </h2>
          <p style={{ fontSize: 12, color: "#d8d8d8", lineHeight: 1.7, maxWidth: "62ch" }}>
            Indonesia does not operate an SEC-equivalent disclosure regime for
            insider Form 4 filings, 13F quarterly institutional holdings, or
            STOCK Act congressional trades. OJK insider-disclosure rules under
            <span className="num" style={{ color: "#ff2e88" }}> POJK 11/2017</span> apply
            only at the 5% beneficial-ownership threshold and surface in the IDX
            iXBRL feed at a much lower frequency.
          </p>
          <p style={{ fontSize: 12, color: "#d8d8d8", lineHeight: 1.7, marginTop: 14, maxWidth: "62ch" }}>
            The closest analog for IDX equity flow is the KSEI{" "}
            <span className="num" style={{ color: "#ff2e88" }}>Komposisi Kepemilikan Efek</span>{" "}
            (Holding Composition Report) — monthly Local vs Foreign + investor-
            type breakdown — surfaced on the{" "}
            <Link href="/markets" className="hover:underline" style={{ color: "#ff2e88" }}>
              Markets page
            </Link>{" "}
            as the foreign-flow panel.
          </p>
          <p style={{ fontSize: 10.5, color: "#7a7a7a", marginTop: 18, fontStyle: "italic" }}>
            Smart Money Composite is US-only by design. No fabricated IDX equivalent.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header region={region} setRegion={setRegion} meta={props.meta} />

      <KPIStrip k={props.kpis} meta={props.meta} />

      {/* ── Row 2 · Congress 30d + Politician Leaderboard ── */}
      <div
        className="grid"
        style={{ gridTemplateColumns: "60% 40%", borderBottom: "1px solid #2a2a2a" }}
      >
        <section style={{ borderRight: "1px solid #2a2a2a", minWidth: 0 }}>
          <PanelHead title="Congress Trades · 30D" meta="STOCK Act · amount buckets" asOf={props.meta.congressAsOf} />
          <div style={{ maxHeight: 320, overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10.5 }}>
              <thead>
                <tr style={{ background: "#050505" }}>
                  {["POL", "P", "CH", "ST", "TKR", "TYPE", "AMOUNT", "TRADE", "FILED", "LAG"].map((h, i) => (
                    <th
                      key={h}
                      style={{
                        padding: "5px 8px",
                        textAlign: i < 2 || i === 4 ? "left" : i === 5 ? "center" : "right",
                        fontSize: 8.5,
                        color: "#555",
                        letterSpacing: "0.1em",
                        fontWeight: 500,
                        borderBottom: "1px solid #1d1d1d",
                        whiteSpace: "nowrap",
                        position: "sticky",
                        top: 0,
                        background: "#050505",
                        zIndex: 1,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {congress30d.map((c, i) => (
                  <tr
                    key={c.id}
                    className="hover:bg-[#1a1a1a]"
                    style={{
                      height: 22,
                      background: i % 2 === 0 ? "#0d0d0d" : "#0a0a0a",
                    }}
                  >
                    <td style={{ padding: "0 8px", color: "#d8d8d8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 0 }}>
                      {c.politician}
                    </td>
                    <td style={{ padding: "0 8px" }}><PartyChip party={c.party} /></td>
                    <td className="num" style={{ padding: "0 8px", color: "#888", fontSize: 9.5 }}>
                      {c.chamber === "House" ? "H" : "S"}
                    </td>
                    <td className="num" style={{ padding: "0 8px", color: "#7a7a7a", fontSize: 9.5 }}>
                      {c.state}
                    </td>
                    <td style={{ padding: "0 8px" }}>
                      <TickerLink ticker={c.ticker} market="US" size="sm" />
                    </td>
                    <td
                      style={{
                        padding: "0 8px",
                        textAlign: "center",
                        color: c.transactionType === "Buy" ? "#00d97e" : c.transactionType === "Sale" ? "#ff4d4f" : "#888",
                        fontSize: 9.5,
                        fontWeight: 600,
                        letterSpacing: "0.06em",
                      }}
                    >
                      {c.transactionType === "Buy" ? "BUY" : c.transactionType === "Sale" ? "SELL" : "EXCH"}
                    </td>
                    <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#d8d8d8" }}>
                      {fmtBucket(c.amountMin, c.amountMax)}
                    </td>
                    <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#888", fontSize: 9.5 }}>
                      {c.tradeDate.slice(5)}
                    </td>
                    <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#7a7a7a", fontSize: 9.5 }}>
                      {c.filingDate.slice(5)}
                    </td>
                    <td className="num" style={{ padding: "0 8px", textAlign: "right", color: c.filingLagDays > 30 ? "#c4831f" : "#7a7a7a", fontSize: 9.5 }}>
                      {c.filingLagDays}d
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ minWidth: 0 }}>
          <PanelHead
            title="Politician Leaderboard · 12M"
            meta="hold-until-inverse · disclosed trades"
            asOf={props.meta.congressAsOf}
          />
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10.5 }}>
            <thead>
              <tr style={{ background: "#050505" }}>
                {["#", "POL", "P", "CH", "TRD", "WIN %", "EST RTN"].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      padding: "5px 8px",
                      textAlign: i === 0 || i === 1 ? "left" : "right",
                      fontSize: 8.5,
                      color: "#555",
                      letterSpacing: "0.1em",
                      fontWeight: 500,
                      borderBottom: "1px solid #1d1d1d",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {props.politicianLeaderboard.map((p, i) => (
                <tr
                  key={p.politician}
                  style={{
                    height: 24,
                    background: i % 2 === 0 ? "#0d0d0d" : "#0a0a0a",
                  }}
                >
                  <td className="num" style={{ padding: "0 8px", color: "#666", fontSize: 10 }}>
                    {String(i + 1).padStart(2, "0")}
                  </td>
                  <td style={{ padding: "0 8px", color: "#d8d8d8" }}>
                    <div className="flex items-center" style={{ gap: 6 }}>
                      <PartyChip party={p.party} />
                      <span>{p.politician}</span>
                    </div>
                  </td>
                  <td style={{ padding: "0 8px" }} />
                  <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#888", fontSize: 9.5 }}>
                    {p.chamber === "House" ? "H" : "S"}
                  </td>
                  <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#b8b8b8" }}>
                    {p.trades12m}
                  </td>
                  <td className="num" style={{ padding: "0 8px", textAlign: "right", color: p.winRate >= 0.65 ? "#00d97e" : "#d8d8d8" }}>
                    {Math.round(p.winRate * 100)}%
                  </td>
                  <td className="num" style={{ padding: "0 8px", textAlign: "right", color: p.est12mReturn >= 20 ? "#00d97e" : p.est12mReturn >= 10 ? "#5cc97a" : "#c4831f", fontWeight: 600 }}>
                    {p.est12mReturn >= 0 ? "+" : ""}{p.est12mReturn.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      {/* ── Row 3 · 13F Heatmap + Conviction Moves ── */}
      <div
        className="grid"
        style={{ gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid #2a2a2a" }}
      >
        <section style={{ borderRight: "1px solid #2a2a2a", minWidth: 0, overflow: "hidden" }}>
          <PanelHead
            title="13F Heatmap · Latest Quarter"
            meta="20 tracked institutions × 12 most-held tickers"
            asOf={`${props.meta.thirteenFPeriodEnd} · Q1`}
          />
          <div style={{ overflowX: "auto" }}>
            <Heatmap13F
              institutions={props.institutions}
              positions={props.thirteenF}
              tickers={topTickers}
            />
          </div>
        </section>

        <section style={{ minWidth: 0 }}>
          <PanelHead title="Top Conviction Moves" meta="latest Q · ≥$500M" asOf={props.meta.thirteenFAsOf} />
          <div>
            <div
              style={{
                padding: "6px 12px",
                background: "#050505",
                borderBottom: "1px solid #1d1d1d",
                fontSize: 9,
                color: "#00d97e",
                letterSpacing: "0.14em",
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              Biggest new positions
            </div>
            {bigNew.length === 0 ? (
              <div style={{ padding: 10, fontSize: 10.5, color: "#7a7a7a", fontStyle: "italic" }}>
                None ≥ $500M in latest quarter
              </div>
            ) : (
              bigNew.map((p, i) => (
                <div
                  key={`${p.managerCik}-${p.ticker}`}
                  className="grid items-center"
                  style={{
                    gridTemplateColumns: "1fr 60px 90px 60px",
                    height: 26,
                    padding: "0 12px",
                    borderBottom: "1px solid #111",
                    background: i % 2 === 0 ? "#0d0d0d" : "#0a0a0a",
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 11, color: "#d8d8d8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {p.managerName}
                  </span>
                  <TickerLink ticker={p.ticker} market="US" size="sm" />
                  <span className="num" style={{ fontSize: 11, color: "#00d97e", fontWeight: 600, textAlign: "right" }}>
                    {fmtUsdM(p.valueUsd)}
                  </span>
                  <span className="num" style={{ fontSize: 10, color: "#888", textAlign: "right" }}>
                    {p.pctPortfolio.toFixed(1)}%
                  </span>
                </div>
              ))
            )}

            <div
              style={{
                padding: "6px 12px",
                background: "#050505",
                borderBottom: "1px solid #1d1d1d",
                borderTop: "1px solid #2a2a2a",
                fontSize: 9,
                color: "#ff4d4f",
                letterSpacing: "0.14em",
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              Biggest exits
            </div>
            {bigExits.map((p, i) => (
              <div
                key={`exit-${p.managerCik}-${p.ticker}`}
                className="grid items-center"
                style={{
                  gridTemplateColumns: "1fr 60px 90px",
                  height: 26,
                  padding: "0 12px",
                  borderBottom: "1px solid #111",
                  background: i % 2 === 0 ? "#0d0d0d" : "#0a0a0a",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 11, color: "#d8d8d8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {p.managerName}
                </span>
                <TickerLink ticker={p.ticker} market="US" size="sm" />
                <span className="num" style={{ fontSize: 11, color: "#ff4d4f", fontWeight: 600, textAlign: "right" }}>
                  {fmtUsdM(p.valueUsd)}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── Row 4 · Form 4 Cluster + Options/Dark Pool placeholders ── */}
      <div
        className="grid"
        style={{ gridTemplateColumns: "1fr 1fr 1fr", borderBottom: "1px solid #2a2a2a" }}
      >
        <section style={{ borderRight: "1px solid #2a2a2a", minWidth: 0 }}>
          <PanelHead
            title="Form 4 Cluster Buys · 30D"
            meta="≥3 distinct P-code · ex-10b5-1"
            asOf={props.meta.form4AsOf}
          />
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10.5 }}>
            <thead>
              <tr style={{ background: "#050505" }}>
                {["TKR", "BUYERS", "AGG $", "MOST SENIOR"].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      padding: "5px 10px",
                      textAlign: i < 2 ? "left" : i === 2 ? "right" : "left",
                      fontSize: 8.5,
                      color: "#555",
                      letterSpacing: "0.1em",
                      fontWeight: 500,
                      borderBottom: "1px solid #1d1d1d",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clusterRows.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: 12, fontSize: 10.5, color: "#7a7a7a", fontStyle: "italic", textAlign: "center" }}>
                  No qualifying clusters · 30D window
                </td></tr>
              ) : (
                clusterRows.map((c, i) => (
                  <tr
                    key={c.ticker}
                    style={{ height: 26, background: i % 2 === 0 ? "#0d0d0d" : "#0a0a0a" }}
                  >
                    <td style={{ padding: "0 10px" }}>
                      <TickerLink ticker={c.ticker} market="US" size="sm" bold />
                    </td>
                    <td className="num" style={{ padding: "0 10px", color: "#ff2e88", fontWeight: 700 }}>
                      {c.clusterSize}
                    </td>
                    <td className="num" style={{ padding: "0 10px", textAlign: "right", color: "#00d97e", fontWeight: 600 }}>
                      {fmtUsdM(c.aggUsd)}
                    </td>
                    <td style={{ padding: "0 10px", color: "#b8b8b8", fontSize: 10, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 0 }}>
                      {c.mostSenior?.insiderName} · {c.mostSenior?.insiderTitle}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        <Placeholder title="Unusual Options Flow · 24H" body="Awaiting Unusual Whales connector · Checkpoint 3" />
        <Placeholder title="Dark Pool Prints · 24H" body="Awaiting Unusual Whales connector · Checkpoint 3" last />
      </div>

      {/* ── Row 5 · Smart Money Composite Leaderboard ── */}
      <section style={{ borderBottom: "1px solid #2a2a2a" }}>
        <PanelHead
          title="Smart Money Composite · top 25"
          meta="(congress 33% + institutional 33% + insider 34%) cross-sectional z"
          asOf={props.meta.form4AsOf}
        />
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr style={{ background: "#050505" }}>
                {[
                  { label: "#", w: "36px", align: "right" as const },
                  { label: "TKR", w: "62px", align: "left" as const },
                  { label: "SMC Z", w: "90px", align: "right" as const },
                  { label: "GRADE", w: "62px", align: "center" as const },
                  { label: "CONGRESS Z", w: "100px", align: "right" as const },
                  { label: "INST Z", w: "80px", align: "right" as const },
                  { label: "INSIDER Z", w: "90px", align: "right" as const },
                  { label: "BREAKDOWN", align: "left" as const },
                ].map((c) => (
                  <th
                    key={c.label}
                    style={{
                      padding: "6px 10px",
                      textAlign: c.align,
                      fontSize: 8.5,
                      color: "#555",
                      letterSpacing: "0.1em",
                      fontWeight: 500,
                      borderBottom: "1px solid #1d1d1d",
                      width: c.w,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {props.smc.map((s, i) => {
                const agg = aggregateTicker(s.ticker, props.congress, props.thirteenF, props.form4);
                return (
                  <tr
                    key={s.ticker}
                    className="hover:bg-[#1a1a1a]"
                    style={{ height: 24, background: i % 2 === 0 ? "#0d0d0d" : "#0a0a0a" }}
                  >
                    <td className="num" style={{ padding: "0 10px", textAlign: "right", color: "#666", fontSize: 10 }}>
                      {String(i + 1).padStart(2, "0")}
                    </td>
                    <td style={{ padding: "0 10px" }}>
                      <TickerLink ticker={s.ticker} market="US" size="sm" bold />
                    </td>
                    <td
                      className="num"
                      style={{
                        padding: "0 10px",
                        textAlign: "right",
                        color: smcColor(s.smcZ),
                        background: smcBg(s.smcZ),
                        fontWeight: 700,
                        fontSize: 12,
                      }}
                    >
                      {s.smcZ >= 0 ? "+" : ""}{s.smcZ.toFixed(2)}σ
                    </td>
                    <td className="num" style={{ padding: "0 10px", textAlign: "center", color: gradeColor(s.smcGrade), fontWeight: 700 }}>
                      {s.smcGrade}
                    </td>
                    <td className="num" style={{ padding: "0 10px", textAlign: "right", color: s.components.congress.z >= 0 ? "#00d97e" : "#ff4d4f" }}>
                      {s.components.congress.z >= 0 ? "+" : ""}{s.components.congress.z.toFixed(2)}
                    </td>
                    <td className="num" style={{ padding: "0 10px", textAlign: "right", color: s.components.institutional.z >= 0 ? "#00d97e" : "#ff4d4f" }}>
                      {s.components.institutional.z >= 0 ? "+" : ""}{s.components.institutional.z.toFixed(2)}
                    </td>
                    <td className="num" style={{ padding: "0 10px", textAlign: "right", color: s.components.insider.z >= 0 ? "#00d97e" : "#ff4d4f" }}>
                      {s.components.insider.z >= 0 ? "+" : ""}{s.components.insider.z.toFixed(2)}
                    </td>
                    <td style={{ padding: "0 10px", color: "#888", fontSize: 9.5, fontStyle: "italic", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 0 }}>
                      {agg.congressTrades90d}c · {agg.inst13FAdds}i · {agg.form4ClusterSize30d}f · {fmtUsdM(agg.inst13FTotalValueUsd)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer · methodology */}
      <section>
        <PanelHead title="Methodology · data sources" />
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", padding: "10px 14px", gap: 16, fontSize: 10.5, color: "#888", lineHeight: 1.55 }}>
          <div>
            <div style={{ color: "#ff2e88", fontSize: 9.5, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>
              Congress · STOCK Act
            </div>
            Quiver Quantitative (live, when keyed) · House + Senate Disclosure Office (fallback). Amount disclosed in buckets, not exact. 30-day filing window; lag &gt; 30d flagged amber.
          </div>
          <div>
            <div style={{ color: "#ff2e88", fontSize: 9.5, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>
              13F-HR · institutional
            </div>
            SEC EDGAR full-text. Quarter-end snapshot, 45-day filing lag. Doesn&rsquo;t disclose shorts, non-US securities, derivatives, or cash. 20 institutions tracked.
          </div>
          <div>
            <div style={{ color: "#ff2e88", fontSize: 9.5, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>
              Form 4 · insider
            </div>
            SEC EDGAR · T+2 disclosure. Cluster definition: ≥3 distinct buyers, open-market P-code only, 10b5-1 plan trades excluded.
          </div>
        </div>
      </section>
    </div>
  );
}

// ── 13F Heatmap ──
function Heatmap13F({
  institutions,
  positions,
  tickers,
}: {
  institutions: TrackedInstitution[];
  positions: Position13F[];
  tickers: string[];
}): JSX.Element {
  const lookup = (cik: string, ticker: string): Position13F | undefined =>
    positions.find((p) => p.managerCik === cik && p.ticker === ticker);

  const maxValue = Math.max(...positions.map((p) => p.valueUsd), 1);

  function cellBg(v: number): string {
    if (v === 0) return "#0a0a0a";
    const ratio = v / maxValue;
    if (ratio > 0.5) return "rgba(255,46,136,0.55)";
    if (ratio > 0.25) return "rgba(255,46,136,0.35)";
    if (ratio > 0.1) return "rgba(255,46,136,0.22)";
    if (ratio > 0.03) return "rgba(255,46,136,0.12)";
    return "rgba(255,46,136,0.05)";
  }

  return (
    <table style={{ borderCollapse: "collapse", fontSize: 10, minWidth: "100%" }}>
      <thead>
        <tr style={{ background: "#050505" }}>
          <th
            style={{
              padding: "5px 8px",
              textAlign: "left",
              fontSize: 8.5,
              color: "#555",
              letterSpacing: "0.1em",
              fontWeight: 500,
              borderBottom: "1px solid #1d1d1d",
              minWidth: 160,
              position: "sticky",
              left: 0,
              background: "#050505",
              zIndex: 2,
            }}
          >
            MANAGER
          </th>
          {tickers.map((t) => (
            <th
              key={t}
              style={{
                padding: "5px 6px",
                textAlign: "center",
                fontSize: 8.5,
                color: "#555",
                letterSpacing: "0.06em",
                fontWeight: 500,
                borderBottom: "1px solid #1d1d1d",
                whiteSpace: "nowrap",
                fontFamily: "var(--font-jetbrains)",
              }}
            >
              {t}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {institutions.map((inst, i) => (
          <tr key={inst.cik} style={{ background: i % 2 === 0 ? "#0d0d0d" : "#0a0a0a" }}>
            <td
              style={{
                padding: "0 8px",
                color: "#d8d8d8",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 160,
                fontSize: 10,
                height: 22,
                position: "sticky",
                left: 0,
                background: i % 2 === 0 ? "#0d0d0d" : "#0a0a0a",
                zIndex: 1,
              }}
            >
              {inst.name}
            </td>
            {tickers.map((t) => {
              const p = lookup(inst.cik, t);
              const v = p?.valueUsd ?? 0;
              const change = p?.sharesChangeQoQ ?? 0;
              const glyph = p?.isNew ? "▲" : p?.isExit ? "▼" : change > 0 ? "▴" : change < 0 ? "▾" : v > 0 ? "=" : "";
              const gColor =
                p?.isNew ? "#00d97e"
                  : p?.isExit ? "#ff4d4f"
                    : change > 0 ? "#00d97e"
                      : change < 0 ? "#ff4d4f"
                        : "#666";
              return (
                <td
                  key={t}
                  title={p ? `${inst.name} · ${t} · ${fmtUsdM(v)} · ${p.isNew ? "NEW" : p.isExit ? "EXIT" : change >= 0 ? `+${(change / 1e6).toFixed(0)}M sh` : `${(change / 1e6).toFixed(0)}M sh`}` : `${inst.name} · ${t} · no position`}
                  style={{
                    padding: 0,
                    background: cellBg(v),
                    textAlign: "center",
                    height: 22,
                    fontFamily: "var(--font-jetbrains)",
                    fontSize: 9.5,
                    color: gColor,
                    border: "1px solid #000",
                  }}
                >
                  {glyph}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Placeholder ──
function Placeholder({ title, body, last }: { title: string; body: string; last?: boolean }): JSX.Element {
  return (
    <section style={{ borderRight: last ? "none" : "1px solid #2a2a2a", opacity: 0.55 }}>
      <PanelHead title={title} meta="placeholder" />
      <div style={{ padding: "30px 14px", textAlign: "center" }}>
        <div
          style={{
            fontSize: 11,
            color: "#7a7a7a",
            fontStyle: "italic",
            letterSpacing: "0.04em",
            lineHeight: 1.55,
          }}
        >
          {body}
        </div>
      </div>
    </section>
  );
}

// ── Header ──
function Header({
  region,
  setRegion,
  meta,
}: {
  region: "US" | "IDX";
  setRegion: (r: "US" | "IDX") => void;
  meta: FlowClientProps["meta"];
}): JSX.Element {
  return (
    <div
      className="flex items-baseline"
      style={{
        padding: "14px 14px 8px",
        borderBottom: "1px solid #2a2a2a",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <span
        className="num"
        style={{ fontSize: 9, color: "#ff2e88", letterSpacing: "0.08em", fontWeight: 600 }}
      >
        09
      </span>
      <h1
        style={{
          fontSize: 22,
          color: "#f5f5f5",
          fontWeight: 500,
          fontStyle: "italic",
          margin: 0,
          letterSpacing: "-0.01em",
        }}
      >
        Flow
      </h1>
      <span style={{ fontSize: 11, color: "#7a7a7a", marginLeft: 8 }}>
        Smart-money surface · Congress · 13F · Insider · (Options / Dark Pool · CP3)
      </span>
      <div className="ml-auto flex items-center" style={{ gap: 6 }}>
        {(["US", "IDX"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRegion(r)}
            className="hover:brightness-125"
            style={{
              height: 24,
              padding: "0 10px",
              background: "transparent",
              border: `1px solid ${region === r ? "#ff2e88" : "#2a2a2a"}`,
              color: region === r ? "#ff2e88" : "#7a7a7a",
              fontSize: 10,
              letterSpacing: "0.1em",
              cursor: "pointer",
              fontFamily: "var(--font-jetbrains)",
            }}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}

function titleRank(title: string): number {
  const t = title.toLowerCase();
  if (t.includes("chairman") || t.includes("ceo")) return 5;
  if (t.includes("cfo")) return 4;
  if (t.includes("president") || t.includes("coo")) return 4;
  if (t.includes("vp") || t.includes("vice")) return 3;
  if (t.includes("director")) return 2;
  return 1;
}
