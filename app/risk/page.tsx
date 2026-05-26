"use client";

import { useState } from "react";
import {
  RISK_METRICS,
  FACTOR_EXPOSURES,
  SECTOR_CONCENTRATION,
  STRESS_SCENARIOS,
  brinsonFachler,
  type StressScenario,
} from "@/lib/mock-risk";
import TickerLink from "@/components/primitives/TickerLink";

function tone(v: number): string {
  if (v > 0) return "#00d97e";
  if (v < 0) return "#ff4d4f";
  return "#7a7a7a";
}

function PanelHead({ title, meta }: { title: string; meta?: string }): JSX.Element {
  return (
    <div className="flex items-center" style={{ height: 28, padding: "0 12px", borderBottom: "1px solid #1d1d1d", background: "#050505", gap: 10 }}>
      <span style={{ fontSize: 9.5, color: "#ff2e88", letterSpacing: "0.14em", fontWeight: 600, textTransform: "uppercase" }}>{title}</span>
      {meta ? <span style={{ fontSize: 10, color: "#7a7a7a" }}>{meta}</span> : null}
    </div>
  );
}

function StressRow({ s }: { s: StressScenario }): JSX.Element {
  const [open, setOpen] = useState<boolean>(false);
  const rows = brinsonFachler(s);
  const totals = rows.reduce(
    (a, r) => ({
      alloc: a.alloc + r.allocEffect,
      sel: a.sel + r.selectionEffect,
      total: a.total + r.total,
    }),
    { alloc: 0, sel: 0, total: 0 },
  );

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="grid items-center hover:bg-[#0a0a0a]"
        style={{
          gridTemplateColumns: "20px 1fr 70px 70px",
          height: 28,
          padding: "0 12px",
          borderBottom: "1px solid #111",
          gap: 8,
          background: "transparent",
          border: "none",
          borderLeft: open ? "2px solid #ff2e88" : "2px solid transparent",
          color: "inherit",
          width: "100%",
          textAlign: "left",
          cursor: "pointer",
        }}
        aria-expanded={open}
      >
        <span style={{ color: open ? "#ff2e88" : "#666", fontSize: 11, fontWeight: 600 }}>
          {open ? "▾" : "▸"}
        </span>
        <span style={{ fontSize: 11, color: "#d8d8d8" }}>{s.name}</span>
        <span className="num" style={{ fontSize: 11, color: tone(s.impact), textAlign: "right" }}>
          {s.impact >= 0 ? "+" : ""}{s.impact.toFixed(2)}%
        </span>
        <span style={{ fontSize: 9.5, color: "#666", textAlign: "right", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {s.prob}
        </span>
      </button>

      {open ? (
        <div
          style={{
            borderLeft: "2px solid #ff2e88",
            background: "#050505",
            borderBottom: "1px solid #2a2a2a",
          }}
        >
          <div
            className="flex items-center"
            style={{
              height: 22,
              padding: "0 14px",
              gap: 10,
            }}
          >
            <span
              style={{
                fontSize: 9,
                color: "#666",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              Brinson-Fachler attribution · per-holding impact
            </span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10.5 }}>
            <thead>
              <tr style={{ background: "#0a0a0a" }}>
                {["TICKER", "WT %", "SCENARIO RET %", "ALLOC", "SELECTION", "TOTAL P&L"].map(
                  (h, i) => (
                    <th
                      key={h}
                      style={{
                        padding: "5px 10px",
                        textAlign: i === 0 ? "left" : "right",
                        fontSize: 9,
                        color: "#555",
                        letterSpacing: "0.1em",
                        fontWeight: 500,
                        borderBottom: "1px solid #1d1d1d",
                      }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={r.ticker}
                  style={{ height: 20, background: i % 2 === 0 ? "#0a0a0a" : "#0d0d0d" }}
                >
                  <td style={{ padding: "0 10px" }}>
                    <TickerLink ticker={r.ticker} market="IDX" size="xs" />
                  </td>
                  <td className="num" style={{ padding: "0 10px", textAlign: "right", color: "#d8d8d8" }}>
                    {r.weight.toFixed(2)}
                  </td>
                  <td className="num" style={{ padding: "0 10px", textAlign: "right", color: tone(r.scenarioReturn) }}>
                    {r.scenarioReturn >= 0 ? "+" : ""}{r.scenarioReturn.toFixed(2)}
                  </td>
                  <td className="num" style={{ padding: "0 10px", textAlign: "right", color: tone(r.allocEffect) }}>
                    {r.allocEffect >= 0 ? "+" : ""}{r.allocEffect.toFixed(3)}
                  </td>
                  <td className="num" style={{ padding: "0 10px", textAlign: "right", color: tone(r.selectionEffect) }}>
                    {r.selectionEffect >= 0 ? "+" : ""}{r.selectionEffect.toFixed(3)}
                  </td>
                  <td className="num" style={{ padding: "0 10px", textAlign: "right", color: tone(r.total), fontWeight: 600 }}>
                    {r.total >= 0 ? "+" : ""}{r.total.toFixed(3)}
                  </td>
                </tr>
              ))}
              {/* Totals */}
              <tr style={{ height: 22, borderTop: "1px solid #2a2a2a", background: "rgba(255,46,136,0.04)" }}>
                <td
                  style={{
                    padding: "0 10px",
                    color: "#ff2e88",
                    fontSize: 10,
                    letterSpacing: "0.08em",
                    fontWeight: 600,
                  }}
                >
                  TOTAL
                </td>
                <td />
                <td />
                <td className="num" style={{ padding: "0 10px", textAlign: "right", color: "#ff2e88", fontWeight: 600 }}>
                  {totals.alloc >= 0 ? "+" : ""}{totals.alloc.toFixed(3)}
                </td>
                <td className="num" style={{ padding: "0 10px", textAlign: "right", color: "#ff2e88", fontWeight: 600 }}>
                  {totals.sel >= 0 ? "+" : ""}{totals.sel.toFixed(3)}
                </td>
                <td className="num" style={{ padding: "0 10px", textAlign: "right", color: "#ff2e88", fontWeight: 700 }}>
                  {totals.total >= 0 ? "+" : ""}{totals.total.toFixed(3)}
                </td>
              </tr>
            </tbody>
          </table>
          <p
            style={{
              fontSize: 9.5,
              color: "#666",
              fontStyle: "italic",
              padding: "8px 14px 12px",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Allocation Effect = Σᵢ(wpᵢ − wbᵢ) · Rbᵢ; Selection Effect = Σᵢ wbᵢ · (Rpᵢ − Rbᵢ). Interaction folded into Selection per Brinson &amp; Fachler (1985), JPM Spring:73–76.
          </p>
        </div>
      ) : null}
    </div>
  );
}

export default function RiskPage(): JSX.Element {
  return (
    <div>
      <div className="flex items-baseline" style={{ padding: "14px 14px 8px", borderBottom: "1px solid #2a2a2a", gap: 12 }}>
        <span className="num" style={{ fontSize: 9, color: "#ff2e88", letterSpacing: "0.08em", fontWeight: 600 }}>05</span>
        <h1 style={{ fontSize: 22, color: "#f5f5f5", fontWeight: 500, margin: 0, letterSpacing: "-0.01em" }}>Risk &amp; Macro Exposure</h1>
        <span style={{ fontSize: 11, color: "#7a7a7a", marginLeft: 8 }}>portfolio-level · daily mark</span>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))", borderBottom: "1px solid #2a2a2a" }}>
        {RISK_METRICS.map((m, i) => (
          <div key={m.label} style={{ padding: "12px 14px", borderRight: i % 4 === 3 ? "none" : "1px solid #1d1d1d", borderBottom: i < 4 ? "1px solid #1d1d1d" : "none" }}>
            <div style={{ fontSize: 8.5, color: "#666", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>{m.label}</div>
            <div className="num" style={{ fontSize: 20, color: m.tone === "pos" ? "#00d97e" : m.tone === "neg" ? "#ff4d4f" : "#f5f5f5", fontWeight: 500, letterSpacing: "-0.01em" }}>{m.value}</div>
            <div className="num" style={{ fontSize: 10, color: "#888", marginTop: 4 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <section style={{ borderRight: "1px solid #2a2a2a" }}>
          <PanelHead title="Factor Exposures · portfolio z" />
          {FACTOR_EXPOSURES.map((f) => {
            const half = 50;
            const widthPct = (Math.abs(f.z) / 3) * half;
            const offsetPct = f.z >= 0 ? half : half - widthPct;
            return (
              <div key={f.factor} className="grid items-center" style={{ gridTemplateColumns: "140px 1fr 50px", height: 26, padding: "0 12px", borderBottom: "1px solid #111", gap: 8 }}>
                <span style={{ fontSize: 11, color: "#d8d8d8" }}>{f.factor}</span>
                <div style={{ position: "relative", height: 8, background: "#0a0a0a" }}>
                  <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "#2a2a2a" }} />
                  <div style={{ position: "absolute", left: `${offsetPct}%`, top: 0, bottom: 0, width: `${widthPct}%`, background: tone(f.z), opacity: 0.85 }} />
                </div>
                <span className="num" style={{ fontSize: 11, color: tone(f.z), textAlign: "right" }}>{f.z >= 0 ? "+" : ""}{f.z.toFixed(2)}</span>
              </div>
            );
          })}

          <PanelHead title="Stress Scenarios · click to expand" meta="Brinson-Fachler attribution" />
          {STRESS_SCENARIOS.map((s) => (
            <StressRow key={s.id} s={s} />
          ))}
        </section>

        <section>
          <PanelHead title="Sector · Portfolio vs Benchmark" meta="IHSG TR · IDX-IC" />
          <div style={{ padding: "0 12px" }}>
            <div className="grid" style={{ gridTemplateColumns: "120px 1fr 1fr 60px", padding: "8px 0 4px", borderBottom: "1px solid #2a2a2a", fontSize: 8.5, color: "#666", letterSpacing: "0.1em" }}>
              <span>SECTOR</span><span style={{ textAlign: "center" }}>PORT</span><span style={{ textAlign: "center" }}>BENCH</span><span style={{ textAlign: "right" }}>Δ</span>
            </div>
            {SECTOR_CONCENTRATION.map((s) => (
              <div key={s.sector} className="grid items-center" style={{ gridTemplateColumns: "120px 1fr 1fr 60px", height: 26, gap: 8, borderBottom: "1px solid #111" }}>
                <span style={{ fontSize: 10.5, color: "#d8d8d8" }}>{s.sector}</span>
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 6 }}>
                  <div style={{ flex: 1, height: 6, background: "#1a1a1a", position: "relative" }}>
                    <div style={{ position: "absolute", inset: 0, width: `${(s.port / 35) * 100}%`, background: "#ff2e88", opacity: 0.75 }} />
                  </div>
                  <span className="num" style={{ fontSize: 10, color: "#f5f5f5", minWidth: 36, textAlign: "right" }}>{s.port.toFixed(1)}%</span>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 6 }}>
                  <div style={{ flex: 1, height: 6, background: "#1a1a1a", position: "relative" }}>
                    <div style={{ position: "absolute", inset: 0, width: `${(s.bench / 35) * 100}%`, background: "#7a7a7a", opacity: 0.75 }} />
                  </div>
                  <span className="num" style={{ fontSize: 10, color: "#b8b8b8", minWidth: 36, textAlign: "right" }}>{s.bench.toFixed(1)}%</span>
                </div>
                <span className="num" style={{ fontSize: 11, color: tone(s.delta), textAlign: "right" }}>{s.delta >= 0 ? "+" : ""}{s.delta.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
