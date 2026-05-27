import Link from "next/link";
import { QUOTE_WATCH, ALERTS, SAVED_SCREENS } from "@/lib/mock-data";
import TickerLink from "@/components/primitives/TickerLink";
import { CONGRESS_STUB } from "@/lib/flow/stubs/congress";
import { FORM4_STUB } from "@/lib/flow/stubs/form4";
import { THIRTEEN_F_STUB } from "@/lib/flow/stubs/thirteen-f";
import { computeSMC, unionTickers } from "@/lib/flow/aggregators";
import { PARTY_COLOR } from "@/lib/flow/config";

function deltaColor(pct: number): string {
  if (pct > 0) return "#00d97e";
  if (pct < 0) return "#ff4d4f";
  return "#888";
}

function fmtUsdShort(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "−" : n > 0 ? "+" : "";
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

interface FlowSignal {
  kind: "CONGRESS" | "13F" | "INSIDER" | "SMC";
  ticker: string;
  primary: string;
  secondary: string;
  toneColor: string;
  href: string;
}

function buildFlowSignals(): FlowSignal[] {
  const out: FlowSignal[] = [];

  // 1) Most recent congress trade (any side)
  const topCongress = [...CONGRESS_STUB].sort((a, b) =>
    b.tradeDate.localeCompare(a.tradeDate),
  )[0];
  if (topCongress) {
    const side = topCongress.transactionType;
    const sideColor = side === "Buy" ? "#00d97e" : side === "Sale" ? "#ff4d4f" : "#888";
    out.push({
      kind: "CONGRESS",
      ticker: topCongress.ticker,
      primary: `${topCongress.politician} · ${side.toUpperCase()}`,
      secondary: `${topCongress.tradeDate} · ${PARTY_COLOR[topCongress.party] === PARTY_COLOR.R ? "R" : topCongress.party}-${topCongress.chamber.slice(0, 1)}`,
      toneColor: sideColor,
      href: `/flow`,
    });
  }

  // 2) Largest 13F add (highest QoQ shares change)
  const topAdd = [...THIRTEEN_F_STUB]
    .filter((p) => p.isNew || (p.sharesChangeQoQ != null && p.sharesChangeQoQ > 0))
    .sort((a, b) => (b.valueUsd ?? 0) - (a.valueUsd ?? 0))[0];
  if (topAdd) {
    out.push({
      kind: "13F",
      ticker: topAdd.ticker,
      primary: `${topAdd.managerName} ${topAdd.isNew ? "NEW" : "ADD"}`,
      secondary: `${fmtUsdShort(topAdd.valueUsd)} · ${topAdd.period}`,
      toneColor: "#00d97e",
      href: `/flow`,
    });
  }

  // 3) Top insider cluster (most distinct P-code buyers, 30d)
  const clusters = new Map<string, Set<string>>();
  FORM4_STUB.forEach((f) => {
    if (f.txnCode !== "P" || f.is10b51) return;
    if (!clusters.has(f.ticker)) clusters.set(f.ticker, new Set());
    clusters.get(f.ticker)!.add(f.insiderName);
  });
  const topCluster = Array.from(clusters.entries())
    .filter(([, s]) => s.size >= 2)
    .sort((a, b) => b[1].size - a[1].size)[0];
  if (topCluster) {
    out.push({
      kind: "INSIDER",
      ticker: topCluster[0],
      primary: `${topCluster[1].size}-insider cluster`,
      secondary: `P-code · ex-10b5-1 · 30d`,
      toneColor: topCluster[1].size >= 3 ? "#00d97e" : "#888",
      href: `/flow`,
    });
  }

  // 4) SMC leader (highest z across universe)
  const tickers = unionTickers(CONGRESS_STUB, THIRTEEN_F_STUB, FORM4_STUB);
  const smc = computeSMC(tickers, CONGRESS_STUB, THIRTEEN_F_STUB, FORM4_STUB);
  const smcLeader = [...smc].sort((a, b) => b.smcZ - a.smcZ)[0];
  if (smcLeader) {
    out.push({
      kind: "SMC",
      ticker: smcLeader.ticker,
      primary: `SMC ${smcLeader.smcGrade} · ${smcLeader.smcZ >= 0 ? "+" : ""}${smcLeader.smcZ.toFixed(2)}z`,
      secondary: `composite leader · 33/33/34`,
      toneColor: "#ff2e88",
      href: `/flow`,
    });
  }

  return out;
}

function SectionHeader({
  abbr,
  title,
  meta,
}: {
  abbr: string;
  title: string;
  meta?: string;
}): JSX.Element {
  return (
    <div
      className="flex items-center"
      style={{
        height: 22,
        padding: "0 10px",
        background: "#050505",
        borderBottom: "1px solid #1d1d1d",
        borderTop: "1px solid #2a2a2a",
        gap: 8,
      }}
    >
      <span
        className="num"
        style={{
          fontSize: 9.5,
          color: "#ff2e88",
          letterSpacing: "0.08em",
          fontWeight: 600,
        }}
      >
        {abbr}
      </span>
      <span
        style={{
          fontSize: 10,
          color: "#d8d8d8",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {title}
      </span>
      {meta ? (
        <span
          className="num ml-auto"
          style={{
            fontSize: 9,
            color: "#666",
            letterSpacing: "0.06em",
          }}
        >
          {meta}
        </span>
      ) : null}
    </div>
  );
}

export default function RightRail(): JSX.Element {
  const flowSignals = buildFlowSignals();
  return (
    <aside
      className="flex flex-col overflow-hidden"
      style={{
        background: "#000",
        borderLeft: "1px solid #2a2a2a",
      }}
    >
      {/* QW Quote Watch */}
      <SectionHeader abbr="QW" title="Quote Watch" meta="14:23 WIB" />
      <div>
        {QUOTE_WATCH.map((q) => {
          const tone = deltaColor(q.changePct);
          return (
            <div
              key={q.symbol}
              className="grid items-center hover:bg-[#0a0a0a]"
              style={{
                gridTemplateColumns: "70px 1fr auto",
                height: 22,
                padding: "0 10px",
                borderBottom: "1px solid #111",
                gap: 8,
              }}
            >
              <TickerLink ticker={q.symbol} market="IDX" size="sm" />
              <span
                className="num text-right"
                style={{ fontSize: 10.5, color: "#d8d8d8" }}
              >
                {q.price}
              </span>
              <span
                className="num text-right"
                style={{ fontSize: 10, color: tone, minWidth: 56 }}
              >
                {q.changePct > 0 ? "+" : ""}
                {q.changePct.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>

      {/* FL Flow Signals — placed above SG so smart-money surface is always visible */}
      <SectionHeader abbr="FL" title="Flow Signals" meta={`${flowSignals.length} live`} />
      <div>
        {flowSignals.map((s) => (
          <Link
            key={s.kind + s.ticker}
            href={s.href}
            className="hover:bg-[#0a0a0a]"
            style={{
              display: "block",
              padding: "8px 10px",
              borderBottom: "1px solid #111",
              textDecoration: "none",
              color: "inherit",
              borderLeft: `2px solid ${s.toneColor}`,
            }}
          >
            <div className="flex items-baseline" style={{ gap: 6 }}>
              <span
                className="num"
                style={{
                  fontSize: 9,
                  color: "#666",
                  letterSpacing: "0.08em",
                  fontWeight: 600,
                }}
              >
                {s.kind}
              </span>
              <TickerLink ticker={s.ticker} market="US" size="xs" />
            </div>
            <div
              style={{
                fontSize: 10.5,
                color: "#d8d8d8",
                marginTop: 3,
                lineHeight: 1.35,
              }}
            >
              {s.primary}
            </div>
            <div
              className="num"
              style={{
                fontSize: 9.5,
                color: "#7a7a7a",
                marginTop: 2,
                letterSpacing: "0.04em",
              }}
            >
              {s.secondary}
            </div>
          </Link>
        ))}
      </div>

      {/* SG Signals · 7D */}
      <SectionHeader
        abbr="SG"
        title="Signals · 7D"
        meta={`${ALERTS.length} active`}
      />
      <div>
        {ALERTS.map((a) => (
          <div
            key={a.ts + a.ticker}
            style={{
              padding: "8px 10px",
              borderBottom: "1px solid #111",
            }}
          >
            <div className="flex items-baseline" style={{ gap: 6 }}>
              <span
                className="num"
                style={{
                  fontSize: 9.5,
                  color: "#666",
                  letterSpacing: "0.04em",
                }}
              >
                {a.ts}
              </span>
              <TickerLink ticker={a.ticker} market="IDX" size="xs" />
            </div>
            <div
              style={{
                fontSize: 10.5,
                color: "#d8d8d8",
                lineHeight: 1.45,
                marginTop: 3,
              }}
            >
              {a.body}
            </div>
          </div>
        ))}
      </div>

      {/* SV Saved Screens */}
      <SectionHeader abbr="SV" title="Saved Screens" />
      <div>
        {SAVED_SCREENS.map((s) => (
          <Link
            key={s.name}
            href={s.slug ? `/screener?screen=${s.slug}` : "/screener"}
            className="grid items-center hover:bg-[#0a0a0a]"
            style={{
              gridTemplateColumns: "1fr auto",
              height: 22,
              padding: "0 10px",
              borderBottom: "1px solid #111",
              gap: 8,
              borderLeft: s.active
                ? "2px solid #ff2e88"
                : "2px solid transparent",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <span
              style={{
                fontSize: 10.5,
                color: s.active ? "#f5f5f5" : "#d8d8d8",
                letterSpacing: "0.02em",
              }}
            >
              {s.name}
            </span>
            <span
              className="num"
              style={{
                fontSize: 10,
                color: s.active ? "#ff2e88" : "#666",
              }}
            >
              {s.count}
            </span>
          </Link>
        ))}
      </div>

      {/* Disclaimer footer */}
      <div
        style={{
          marginTop: "auto",
          padding: "8px 10px",
          borderTop: "1px solid #2a2a2a",
          background: "#050505",
        }}
      >
        <div
          className="num"
          style={{
            fontSize: 9,
            color: "#ff2e88",
            letterSpacing: "0.08em",
            marginBottom: 4,
            fontWeight: 600,
          }}
        >
          DISC
        </div>
        <div style={{ fontSize: 10, color: "#888", lineHeight: 1.5 }}>
          backtest 2014–25 paper · live SR est 0.55–0.65 ·{" "}
          <span className="num" style={{ color: "#d8d8d8" }}>
            github.com/nluu/idx-factor-backtest
          </span>
        </div>
      </div>
    </aside>
  );
}
