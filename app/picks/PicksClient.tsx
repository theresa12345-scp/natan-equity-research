"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import StarButton from "@/components/primitives/StarButton";
import Select from "@/components/primitives/Select";
import type { PickRow } from "@/lib/picks-data";

interface PicksClientProps {
  initialPicks: PickRow[];
  sectors: string[];
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

export default function PicksClient({
  initialPicks,
  sectors,
  totalUniverse,
}: PicksClientProps): JSX.Element {
  const [region, setRegion] = useState<"all" | "IDX" | "US">("all");
  const [sector, setSector] = useState<string>("all");
  const [minComposite, setMinComposite] = useState<number>(0);
  const [maxPE, setMaxPE] = useState<number>(999);
  const [minROE, setMinROE] = useState<number>(-100);
  const [limit, setLimit] = useState<number>(50);

  const filtered = useMemo(() => {
    return initialPicks
      .filter((p) => {
        if (region !== "all" && p.region !== region) return false;
        if (sector !== "all" && p.sector !== sector) return false;
        if (p.composite < minComposite) return false;
        if (p.pe != null && p.pe > maxPE) return false;
        if (p.roe != null && p.roe < minROE) return false;
        return true;
      })
      .slice(0, limit);
  }, [initialPicks, region, sector, minComposite, maxPE, minROE, limit]);

  const sectorOptions = [
    { value: "all", label: "All sectors" },
    ...sectors.map((s) => ({ value: s, label: s })),
  ];

  return (
    <div>
      {/* Header */}
      <div
        className="flex items-baseline"
        style={{ padding: "14px 14px 8px", borderBottom: "1px solid #2a2a2a", gap: 12, flexWrap: "wrap" }}
      >
        <span className="num" style={{ fontSize: 9, color: "#ff2e88", letterSpacing: "0.08em", fontWeight: 600 }}>08</span>
        <h1 style={{ fontSize: 22, color: "#f5f5f5", fontWeight: 500, margin: 0, letterSpacing: "-0.01em" }}>
          Top Picks · Leaderboard
        </h1>
        <span style={{ fontSize: 11, color: "#7a7a7a", marginLeft: 8 }}>
          {filtered.length} of {initialPicks.length} shown · universe {totalUniverse} · composite z-score ranked
        </span>
      </div>

      {/* Filter row */}
      <div
        className="grid items-end"
        style={{
          gridTemplateColumns: "auto 180px 200px 140px 140px 100px",
          gap: 14,
          padding: "12px 14px",
          borderBottom: "1px solid #2a2a2a",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontSize: 8.5, color: "#666", letterSpacing: "0.08em", marginBottom: 4, textTransform: "uppercase" }}>Region</div>
          <div className="flex" style={{ gap: 4 }}>
            {(["all", "IDX", "US"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRegion(r)}
                className="hover:brightness-125"
                style={{
                  height: 26,
                  padding: "0 10px",
                  background: "transparent",
                  border: `1px solid ${region === r ? "#ff2e88" : "#2a2a2a"}`,
                  color: region === r ? "#ff2e88" : "#7a7a7a",
                  fontSize: 10.5,
                  letterSpacing: "0.08em",
                  cursor: "pointer",
                  textTransform: "uppercase",
                }}
              >
                {r === "all" ? "Global" : r}
              </button>
            ))}
          </div>
        </div>

        <Select
          label="Sector"
          value={sector}
          onChange={setSector}
          options={sectorOptions}
          width={180}
        />

        <div>
          <div style={{ fontSize: 8.5, color: "#666", letterSpacing: "0.08em", marginBottom: 4, textTransform: "uppercase" }}>
            Min composite · {minComposite}
          </div>
          <input
            type="range"
            min={0}
            max={95}
            step={5}
            value={minComposite}
            onChange={(e) => setMinComposite(parseInt(e.target.value, 10))}
            style={{ width: "100%", accentColor: "#ff2e88" }}
          />
        </div>

        <div>
          <div style={{ fontSize: 8.5, color: "#666", letterSpacing: "0.08em", marginBottom: 4, textTransform: "uppercase" }}>Max P/E</div>
          <input
            type="number"
            value={maxPE === 999 ? "" : maxPE}
            placeholder="any"
            onChange={(e) => setMaxPE(e.target.value === "" ? 999 : parseFloat(e.target.value))}
            className="num"
            style={{
              width: "100%", height: 26, background: "#050505", border: "1px solid #2a2a2a",
              color: "#f5f5f5", padding: "0 8px", fontSize: 11, outline: "none",
            }}
          />
        </div>

        <div>
          <div style={{ fontSize: 8.5, color: "#666", letterSpacing: "0.08em", marginBottom: 4, textTransform: "uppercase" }}>Min ROE %</div>
          <input
            type="number"
            value={minROE === -100 ? "" : minROE}
            placeholder="any"
            onChange={(e) => setMinROE(e.target.value === "" ? -100 : parseFloat(e.target.value))}
            className="num"
            style={{
              width: "100%", height: 26, background: "#050505", border: "1px solid #2a2a2a",
              color: "#f5f5f5", padding: "0 8px", fontSize: 11, outline: "none",
            }}
          />
        </div>

        <div>
          <div style={{ fontSize: 8.5, color: "#666", letterSpacing: "0.08em", marginBottom: 4, textTransform: "uppercase" }}>Show top</div>
          <div className="flex" style={{ gap: 4 }}>
            {([25, 50, 100, 200] as const).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setLimit(n)}
                style={{
                  flex: 1, height: 26, padding: "0 6px",
                  background: "transparent",
                  border: `1px solid ${limit === n ? "#ff2e88" : "#2a2a2a"}`,
                  color: limit === n ? "#ff2e88" : "#7a7a7a",
                  fontSize: 9.5, letterSpacing: "0.06em", cursor: "pointer",
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboard */}
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
            {filtered.map((p, i) => (
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
        {filtered.length === 0 ? (
          <div style={{ padding: "30px 14px", textAlign: "center", color: "#7a7a7a", fontSize: 12 }}>
            No tickers match the current filters. Loosen min composite or change region.
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
          ★ adds to watchlist · click ticker for full 6-module workstation · featured tickers (BBCA, MYOR, NVDA) carry magenta left-border
        </span>
      </div>
    </div>
  );
}
