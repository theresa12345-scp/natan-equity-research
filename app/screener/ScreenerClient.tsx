"use client";

import Link from "next/link";
import StarButton from "@/components/primitives/StarButton";
import type { PickRow } from "@/lib/picks-data";
import type { ScreenWithCount } from "@/lib/saved-screens";

interface ScreenerClientProps {
  screens: ScreenWithCount[];
  active: string;
  rows: PickRow[];
  totalUniverse: number;
}

function compositeColor(composite: number): string {
  if (composite >= 80) return "#00d97e";
  if (composite >= 70) return "#5cc97a";
  if (composite >= 60) return "#ff2e88";
  if (composite >= 50) return "#c4831f";
  if (composite >= 40) return "#9a4040";
  return "#ff4d4f";
}

function compositeBg(composite: number): string {
  if (composite >= 80) return "rgba(0,217,126,0.18)";
  if (composite >= 70) return "rgba(0,217,126,0.10)";
  if (composite >= 60) return "rgba(255,46,136,0.10)";
  if (composite >= 50) return "rgba(196,131,31,0.08)";
  if (composite >= 40) return "rgba(154,64,64,0.10)";
  return "rgba(255,77,79,0.10)";
}

function pillarColor(score: number): string {
  if (score >= 80) return "#00d97e";
  if (score >= 60) return "#d8d8d8";
  if (score >= 40) return "#c4831f";
  return "#ff4d4f";
}

function fmtMcap(mcap: number, region: "IDX" | "US"): string {
  if (region === "IDX") {
    const trn = mcap / 1e12;
    if (trn >= 1) return `${trn.toFixed(0)} trn`;
    const mrd = mcap / 1e9;
    return `${mrd.toFixed(0)} mrd`;
  }
  const bn = mcap / 1e9;
  if (bn >= 1000) return `$${(bn / 1000).toFixed(2)}T`;
  if (bn >= 1) return `$${bn.toFixed(1)}B`;
  return `$${(mcap / 1e6).toFixed(0)}M`;
}

export default function ScreenerClient({
  screens,
  active,
  rows,
  totalUniverse,
}: ScreenerClientProps): JSX.Element {
  const activeScreen = screens.find((s) => s.slug === active) ?? screens[0];

  return (
    <div>
      {/* Header */}
      <div
        className="flex items-baseline"
        style={{ padding: "14px 14px 8px", borderBottom: "1px solid #2a2a2a", gap: 12, flexWrap: "wrap" }}
      >
        <span className="num" style={{ fontSize: 9, color: "#ff2e88", letterSpacing: "0.08em", fontWeight: 600 }}>03</span>
        <h1 style={{ fontSize: 22, color: "#f5f5f5", fontWeight: 500, margin: 0, letterSpacing: "-0.01em" }}>
          Saved Screens
        </h1>
        <span style={{ fontSize: 11, color: "#7a7a7a", marginLeft: 8 }}>
          {screens.length} curated strategy presets · universe {totalUniverse} tickers
        </span>
        <Link
          href="/picks"
          className="ml-auto num hover:brightness-125"
          style={{
            fontSize: 10,
            color: "#7a7a7a",
            letterSpacing: "0.08em",
            border: "1px solid #2a2a2a",
            padding: "3px 8px",
            textDecoration: "none",
          }}
        >
          FREE-FORM LEADERBOARD →
        </Link>
      </div>

      {/* Chip strip */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
          padding: "10px 14px",
          borderBottom: "1px solid #2a2a2a",
          background: "#050505",
        }}
      >
        {screens.map((s) => {
          const isActive = s.slug === active;
          return (
            <Link
              key={s.slug}
              href={`/screener?screen=${s.slug}`}
              className="hover:brightness-125"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                height: 28,
                padding: "0 12px",
                background: isActive ? "rgba(255,46,136,0.10)" : "transparent",
                border: `1px solid ${isActive ? "#ff2e88" : "#2a2a2a"}`,
                color: isActive ? "#f5f5f5" : "#d8d8d8",
                fontSize: 11,
                cursor: "pointer",
                textDecoration: "none",
              }}
            >
              <span
                style={{
                  color: isActive ? "#ff2e88" : "#7a7a7a",
                  letterSpacing: "0.02em",
                  fontWeight: isActive ? 600 : 500,
                }}
              >
                {s.name}
              </span>
              <span
                className="num"
                style={{
                  fontSize: 9.5,
                  color: isActive ? "#ff2e88" : "#666",
                  borderLeft: `1px solid ${isActive ? "#ff2e88" : "#2a2a2a"}`,
                  paddingLeft: 8,
                }}
              >
                {s.count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Active screen description */}
      <div
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid #2a2a2a",
          background: "linear-gradient(180deg, rgba(255,46,136,0.04) 0%, transparent 70%)",
        }}
      >
        <div className="flex items-baseline" style={{ gap: 10, flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: 9,
              color: "#ff2e88",
              letterSpacing: "0.14em",
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            Strategy
          </span>
          <h2
            style={{
              fontSize: 16,
              color: "#f5f5f5",
              fontWeight: 500,
              letterSpacing: "-0.01em",
              margin: 0,
            }}
          >
            {activeScreen.name}
          </h2>
          <span style={{ fontSize: 11, color: "#888" }}>· {activeScreen.short}</span>
          <span
            className="num ml-auto"
            style={{ fontSize: 11, color: "#ff2e88", fontWeight: 600, letterSpacing: "0.02em" }}
          >
            {rows.length} matches
          </span>
        </div>
        <p
          style={{
            fontSize: 11.5,
            color: "#d8d8d8",
            lineHeight: 1.65,
            margin: "10px 0 0",
            maxWidth: "78ch",
          }}
        >
          {activeScreen.thesis}
        </p>
        {activeScreen.citation ? (
          <p
            className="num"
            style={{
              fontSize: 10,
              color: "#7a7a7a",
              fontStyle: "italic",
              marginTop: 6,
              marginBottom: 0,
            }}
          >
            citation · {activeScreen.citation}
          </p>
        ) : null}
      </div>

      {/* Leaderboard — filtered to active screen */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, minWidth: 1100 }}>
          <thead>
            <tr style={{ background: "#050505" }}>
              {[
                { label: "#", w: "36px", align: "right" as const },
                { label: "★", w: "32px", align: "center" as const },
                { label: "TKR", w: "62px", align: "left" as const },
                { label: "EMITEN", align: "left" as const },
                { label: "SECT", w: "120px", align: "left" as const },
                { label: "REG", w: "44px", align: "center" as const },
                { label: "COMPOSITE Z", w: "100px", align: "right" as const },
                { label: "GRADE", w: "62px", align: "center" as const },
                { label: "VAL", w: "44px", align: "right" as const },
                { label: "QUAL", w: "44px", align: "right" as const },
                { label: "PROF", w: "44px", align: "right" as const },
                { label: "LVOL", w: "44px", align: "right" as const },
                { label: "MOM", w: "44px", align: "right" as const },
                { label: "ROE", w: "56px", align: "right" as const },
                { label: "P/E", w: "56px", align: "right" as const },
                { label: "MCAP", w: "78px", align: "right" as const },
              ].map((c) => (
                <th
                  key={c.label}
                  style={{
                    padding: "6px 8px", textAlign: c.align,
                    fontSize: 8.5, color: "#555", letterSpacing: "0.1em",
                    fontWeight: 500, borderBottom: "1px solid #1d1d1d",
                    width: c.w, whiteSpace: "nowrap",
                  }}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((p, i) => (
              <tr
                key={p.ticker}
                className="hover:bg-[#1a1a1a]"
                style={{
                  height: 22,
                  background: i % 2 === 0 ? "#0d0d0d" : "#0a0a0a",
                  borderLeft: p.featured ? "2px solid #ff2e88" : "2px solid transparent",
                }}
              >
                <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#666", fontSize: 10 }}>{String(i + 1).padStart(3, "0")}</td>
                <td style={{ padding: 0, textAlign: "center" }}><StarButton ticker={p.ticker} region={p.region} /></td>
                <td style={{ padding: "0 8px" }}>
                  <Link
                    href={`/${p.region.toLowerCase()}/${p.ticker.toLowerCase()}`}
                    className="num hover:underline"
                    style={{
                      color: "#ff2e88", fontWeight: 500, fontSize: 11,
                      textDecorationColor: "#ff2e88", textUnderlineOffset: 2,
                      letterSpacing: "0.02em",
                    }}
                  >
                    {p.ticker}
                  </Link>
                </td>
                <td style={{
                  padding: "0 8px", color: "#d8d8d8",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 0,
                }}>
                  {p.name}
                </td>
                <td style={{ padding: "0 8px", color: "#888", fontSize: 10.5 }}>{p.sector}</td>
                <td className="num" style={{ padding: "0 8px", textAlign: "center", color: p.region === "IDX" ? "#ff2e88" : "#5ec4e0", fontSize: 9.5, letterSpacing: "0.08em", fontWeight: 600 }}>{p.region}</td>
                <td
                  className="num"
                  style={{
                    padding: "0 8px", textAlign: "right",
                    color: compositeColor(p.composite),
                    fontWeight: 700,
                    background: compositeBg(p.composite),
                    fontSize: 12,
                  }}
                >
                  {p.z >= 0 ? "+" : ""}{p.z.toFixed(2)}σ
                </td>
                <td
                  className="num"
                  style={{
                    padding: "0 8px", textAlign: "center",
                    color: compositeColor(p.composite),
                    fontWeight: 700,
                  }}
                >
                  {p.letter}
                </td>
                <td className="num" style={{ padding: "0 8px", textAlign: "right", color: pillarColor(p.pillars.valuation), fontSize: 10.5 }}>{p.pillars.valuation}</td>
                <td className="num" style={{ padding: "0 8px", textAlign: "right", color: pillarColor(p.pillars.quality), fontSize: 10.5 }}>{p.pillars.quality}</td>
                <td className="num" style={{ padding: "0 8px", textAlign: "right", color: pillarColor(p.pillars.profitability), fontSize: 10.5 }}>{p.pillars.profitability}</td>
                <td className="num" style={{ padding: "0 8px", textAlign: "right", color: pillarColor(p.pillars.lowVol), fontSize: 10.5 }}>{p.pillars.lowVol}</td>
                <td className="num" style={{ padding: "0 8px", textAlign: "right", color: pillarColor(p.pillars.momentum), fontSize: 10.5 }}>{p.pillars.momentum}</td>
                <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#b8b8b8" }}>{p.roe != null ? `${p.roe.toFixed(1)}` : "—"}</td>
                <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#b8b8b8" }}>{p.pe != null ? `${p.pe.toFixed(1)}×` : "—"}</td>
                <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#b8b8b8" }}>{fmtMcap(p.marketCap, p.region)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? (
          <div style={{ padding: "30px 14px", textAlign: "center", color: "#7a7a7a", fontSize: 12 }}>
            No tickers match this preset. Adjust the filter in lib/saved-screens.ts.
          </div>
        ) : null}
      </div>

      {/* Legend */}
      <div
        className="flex items-center"
        style={{
          padding: "10px 14px",
          borderTop: "1px solid #2a2a2a",
          fontSize: 9.5,
          color: "#666",
          letterSpacing: "0.06em",
          gap: 14,
          flexWrap: "wrap",
        }}
      >
        <span style={{ textTransform: "uppercase" }}>Composite scale</span>
        {[
          { range: "≥ 80", color: "#00d97e", label: "Top decile" },
          { range: "70–79", color: "#5cc97a", label: "Above median" },
          { range: "60–69", color: "#ff2e88", label: "Mid" },
          { range: "50–59", color: "#c4831f", label: "Below median" },
          { range: "< 50", color: "#ff4d4f", label: "Bottom" },
        ].map((b) => (
          <span key={b.range} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 12, height: 12, background: b.color, display: "inline-block" }} aria-hidden="true" />
            <span className="num">{b.range}</span>
            <span style={{ color: "#7a7a7a" }}>{b.label}</span>
          </span>
        ))}
        <span style={{ marginLeft: "auto", color: "#7a7a7a", fontSize: 9.5 }}>
          chip top right = match count · click ticker for full workstation · ★ adds to watchlist
        </span>
      </div>
    </div>
  );
}
