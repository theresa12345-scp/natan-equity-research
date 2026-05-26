"use client";

import { useState } from "react";
import {
  PERFORMANCE_STATS,
  EQUITY_CURVE,
  ANNOTATIONS,
  CPCV_BARS,
  ISOLATED_FACTORS,
  SAVED_STRATEGIES,
  PILLAR_SLIDERS_IDX,
  PILLAR_SLIDERS_US,
  BACKTEST_AUDIT,
} from "@/lib/mock-backtest";

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

function EquityCurveChart(): JSX.Element {
  const w = 580;
  const h = 240;
  const pad = { l: 42, r: 16, t: 18, b: 28 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const data = EQUITY_CURVE;
  const allVals = data.flatMap((d) => [d.strat, d.bench]);
  const min = Math.min(...allVals);
  const max = Math.max(...allVals);
  const xStep = innerW / (data.length - 1);
  const x = (i: number): number => pad.l + i * xStep;
  const y = (v: number): number => pad.t + innerH - ((v - min) / (max - min)) * innerH;
  const ptsStrat = data.map((d, i) => `${x(i)},${y(d.strat)}`).join(" ");
  const ptsBench = data.map((d, i) => `${x(i)},${y(d.bench)}`).join(" ");
  const ticks = [100, 200, 300, 400, 500].filter((v) => v >= min && v <= max);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" role="img" aria-label="12-year equity curve">
      {ticks.map((v) => (
        <g key={v}>
          <line x1={pad.l} x2={w - pad.r} y1={y(v)} y2={y(v)} stroke="#1a1a1a" strokeDasharray="2 3" />
          <text x={pad.l - 6} y={y(v) + 3} textAnchor="end" style={{ fontSize: 8.5, fill: "#555", fontFamily: "var(--font-jetbrains)" }}>{v}</text>
        </g>
      ))}
      <polyline fill="none" stroke="#7a7a7a" strokeWidth={1} points={ptsBench} />
      <polyline fill="none" stroke="#ff2e88" strokeWidth={1.5} points={ptsStrat} />
      {ANNOTATIONS.map((a, idx) => {
        const i = Math.round((idx + 1) * (data.length / 5));
        return (
          <g key={a.date}>
            <line x1={x(i)} x2={x(i)} y1={pad.t} y2={h - pad.b} stroke="#c4831f" strokeDasharray="2 3" opacity={0.6} />
            <text x={x(i) + 3} y={pad.t + 9} style={{ fontSize: 8, fill: "#c4831f", fontFamily: "var(--font-jetbrains)" }}>{a.label}</text>
          </g>
        );
      })}
      {[2014, 2016, 2018, 2020, 2022, 2024].map((yr, i) => (
        <text key={yr} x={pad.l + ((yr - 2014) / 12) * innerW} y={h - 8} textAnchor="middle" style={{ fontSize: 9, fill: "#666", fontFamily: "var(--font-jetbrains)" }}>{yr}</text>
      ))}
      <g transform={`translate(${pad.l}, ${pad.t + 4})`}>
        <rect x={0} y={0} width={10} height={2} fill="#ff2e88" />
        <text x={14} y={4} style={{ fontSize: 9, fill: "#d8d8d8", fontFamily: "var(--font-geist-sans)" }}>Composite v2.1</text>
        <rect x={110} y={0} width={10} height={2} fill="#7a7a7a" />
        <text x={124} y={4} style={{ fontSize: 9, fill: "#7a7a7a", fontFamily: "var(--font-geist-sans)" }}>IHSG TR</text>
      </g>
    </svg>
  );
}

function CPCVHistogram(): JSX.Element {
  const w = 480;
  const h = 220;
  const pad = { l: 40, r: 16, t: 22, b: 36 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const xMin = -0.2;
  const xMax = 1.2;
  const x = (v: number): number => pad.l + ((v - xMin) / (xMax - xMin)) * innerW;
  const maxCount = Math.max(...CPCV_BARS.map((b) => b.count));
  const yBar = (c: number): number => pad.t + innerH - (c / (maxCount + 1)) * innerH;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%">
      <line x1={pad.l} x2={w - pad.r} y1={h - pad.b} y2={h - pad.b} stroke="#2a2a2a" />
      <line x1={x(-0.027)} x2={x(-0.027)} y1={pad.t} y2={h - pad.b} stroke="#666" strokeDasharray="3 3" />
      <text x={x(-0.027) + 4} y={pad.t + 10} style={{ fontSize: 9, fill: "#666", fontFamily: "var(--font-jetbrains)" }}>null −0.027</text>
      <line x1={x(0.953)} x2={x(0.953)} y1={pad.t} y2={h - pad.b} stroke="#5ec4e0" strokeDasharray="2 3" />
      <text x={x(0.953) + 4} y={pad.t + 10} style={{ fontSize: 9, fill: "#5ec4e0", fontFamily: "var(--font-jetbrains)" }}>single 0.953</text>
      <line x1={x(0.904)} x2={x(0.904)} y1={pad.t} y2={h - pad.b} stroke="#ff2e88" strokeWidth={1.5} />
      <text x={x(0.904) + 4} y={pad.t - 4} style={{ fontSize: 10, fill: "#ff2e88", fontFamily: "var(--font-jetbrains)", fontWeight: 600 }}>μ = 0.904</text>
      {CPCV_BARS.map((b) => {
        const barW = 24;
        return (
          <rect key={b.sr} x={x(b.sr) - barW / 2} y={yBar(b.count)} width={barW} height={h - pad.b - yBar(b.count)} fill="#ff2e88" opacity={0.85} />
        );
      })}
      {[0, 0.25, 0.5, 0.75, 1.0].map((v) => (
        <text key={v} x={x(v)} y={h - 14} textAnchor="middle" style={{ fontSize: 9, fill: "#666", fontFamily: "var(--font-jetbrains)" }}>{v.toFixed(2)}</text>
      ))}
      <text x={w / 2} y={h - 4} textAnchor="middle" style={{ fontSize: 9, fill: "#7a7a7a", fontFamily: "var(--font-geist-sans)", letterSpacing: "0.08em" }}>Annualised Sharpe ratio</text>
    </svg>
  );
}

export default function BacktestPage(): JSX.Element {
  const [universe, setUniverse] = useState<string>("LQ45");
  const [weights, setWeights] = useState(PILLAR_SLIDERS_IDX);
  const [region, setRegion] = useState<"IDX" | "US">("IDX");

  function switchRegion(r: "IDX" | "US"): void {
    setRegion(r);
    setWeights(r === "IDX" ? PILLAR_SLIDERS_IDX : PILLAR_SLIDERS_US);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-baseline" style={{ padding: "14px 14px 8px", borderBottom: "1px solid #2a2a2a", gap: 12, flexWrap: "wrap" }}>
        <span className="num" style={{ fontSize: 9, color: "#ff2e88", letterSpacing: "0.08em", fontWeight: 600 }}>06</span>
        <h1 style={{ fontSize: 22, color: "#f5f5f5", fontWeight: 500, margin: 0, letterSpacing: "-0.01em" }}>Backtest Workbench</h1>
        <span style={{ fontSize: 11, color: "#7a7a7a", marginLeft: 8 }}>Multi-Factor Composite · CPCV-Validated · DSR-Corrected</span>
        <div className="ml-auto flex items-center" style={{ gap: 8 }}>
          <select
            defaultValue="Multi-Factor v2.1"
            className="num"
            style={{
              height: 26, background: "#050505", border: "1px solid #2a2a2a",
              color: "#d8d8d8", padding: "0 8px", fontSize: 11, outline: "none",
            }}
          >
            <option>Multi-Factor v2.1</option>
            <option>Quality-Only IDX</option>
            <option>Value-Only IDX</option>
            <option>S&P 500 Multi-Factor</option>
          </select>
          <button
            type="button"
            className="hover:brightness-110"
            style={{
              height: 26, padding: "0 12px", background: "#ff2e88", color: "#000",
              border: "1px solid #ff2e88", fontSize: 10, letterSpacing: "0.1em",
              fontWeight: 700, textTransform: "uppercase", cursor: "pointer",
            }}
          >
            RUN BACKTEST
          </button>
        </div>
      </div>

      {/* Strategy builder */}
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", borderBottom: "1px solid #2a2a2a" }}>
        {/* Universe */}
        <section style={{ borderRight: "1px solid #2a2a2a" }}>
          <PanelHead title="Universe" meta="point-in-time" />
          <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
            <div className="flex flex-wrap" style={{ gap: 4 }}>
              {(["LQ45", "IDX30", "IDX80", "S&P 500", "S&P 100", "Custom"] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUniverse(u)}
                  style={{
                    height: 22, padding: "0 8px", background: "transparent",
                    border: `1px solid ${universe === u ? "#ff2e88" : "#2a2a2a"}`,
                    color: universe === u ? "#ff2e88" : "#7a7a7a",
                    fontSize: 10, letterSpacing: "0.06em", cursor: "pointer",
                  }}
                >
                  {u}
                </button>
              ))}
            </div>
            <div style={{ marginTop: 6 }}>
              <div style={{ fontSize: 8.5, color: "#666", letterSpacing: "0.08em", marginBottom: 4, textTransform: "uppercase" }}>Date range</div>
              <div className="flex" style={{ gap: 4 }}>
                <input type="text" defaultValue="2014-01-01" className="num" style={{ flex: 1, height: 24, background: "#050505", border: "1px solid #2a2a2a", color: "#f5f5f5", padding: "0 8px", fontSize: 11, outline: "none" }} />
                <input type="text" defaultValue="2025-12-31" className="num" style={{ flex: 1, height: 24, background: "#050505", border: "1px solid #2a2a2a", color: "#f5f5f5", padding: "0 8px", fontSize: 11, outline: "none" }} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 8.5, color: "#666", letterSpacing: "0.08em", marginBottom: 4, textTransform: "uppercase" }}>Min ADTV</div>
              <input type="text" defaultValue={region === "IDX" ? "Rp 10 mrd" : "$1M"} className="num" style={{ width: "100%", height: 24, background: "#050505", border: "1px solid #2a2a2a", color: "#f5f5f5", padding: "0 8px", fontSize: 11, outline: "none" }} />
            </div>
          </div>
        </section>

        {/* Factor weights */}
        <section style={{ borderRight: "1px solid #2a2a2a" }}>
          <PanelHead title={`Factor Weights · ${region}`} meta="composite" />
          <div className="flex" style={{ gap: 4, padding: "8px 14px 6px", borderBottom: "1px solid #111" }}>
            {(["IDX", "US"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => switchRegion(r)}
                style={{
                  height: 20, padding: "0 8px", background: "transparent",
                  border: `1px solid ${region === r ? "#ff2e88" : "#2a2a2a"}`,
                  color: region === r ? "#ff2e88" : "#7a7a7a",
                  fontSize: 9.5, letterSpacing: "0.08em", cursor: "pointer",
                }}
              >
                {r} weights
              </button>
            ))}
          </div>
          <div style={{ padding: "8px 14px" }}>
            {weights.map((w) => (
              <div key={w.name} className="grid items-center" style={{ gridTemplateColumns: "110px 1fr 30px", gap: 6, height: 20 }}>
                <span style={{ fontSize: 10, color: "#d8d8d8" }}>{w.name}</span>
                <div style={{ height: 5, background: "#1a1a1a", position: "relative" }}>
                  <div style={{ position: "absolute", inset: 0, width: `${w.weight * 4}%`, background: "#ff2e88", opacity: 0.8 }} />
                </div>
                <span className="num" style={{ fontSize: 10, color: "#d8d8d8", textAlign: "right" }}>{w.weight}%</span>
              </div>
            ))}
          </div>
        </section>

        {/* Constraints */}
        <section>
          <PanelHead title="Rebalance & Constraints" />
          <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
            <div>
              <div style={{ fontSize: 8.5, color: "#666", letterSpacing: "0.08em", marginBottom: 4, textTransform: "uppercase" }}>Rebalance frequency</div>
              <div className="flex" style={{ gap: 4 }}>
                {["Monthly", "Quarterly", "Semi-Annual"].map((f) => (
                  <button key={f} type="button" style={{ flex: 1, height: 22, background: "transparent", border: `1px solid ${f === "Quarterly" ? "#ff2e88" : "#2a2a2a"}`, color: f === "Quarterly" ? "#ff2e88" : "#7a7a7a", fontSize: 10, letterSpacing: "0.06em", cursor: "pointer" }}>{f}</button>
                ))}
              </div>
            </div>
            <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              <div>
                <div style={{ fontSize: 8.5, color: "#666", letterSpacing: "0.08em", marginBottom: 4, textTransform: "uppercase" }}>Position cap</div>
                <input type="text" defaultValue="8%" className="num" style={{ width: "100%", height: 24, background: "#050505", border: "1px solid #2a2a2a", color: "#f5f5f5", padding: "0 8px", fontSize: 11, outline: "none" }} />
              </div>
              <div>
                <div style={{ fontSize: 8.5, color: "#666", letterSpacing: "0.08em", marginBottom: 4, textTransform: "uppercase" }}>Sector cap</div>
                <input type="text" defaultValue="25%" className="num" style={{ width: "100%", height: 24, background: "#050505", border: "1px solid #2a2a2a", color: "#f5f5f5", padding: "0 8px", fontSize: 11, outline: "none" }} />
              </div>
            </div>
            <div style={{ marginTop: 4 }}>
              <div style={{ fontSize: 8.5, color: "#666", letterSpacing: "0.08em", marginBottom: 4, textTransform: "uppercase" }}>Transaction costs (read-only)</div>
              <div className="num" style={{ fontSize: 10.5, color: "#b8b8b8", lineHeight: 1.5 }}>
                {region === "IDX" ? "IDX 18bps + 0.1% PPh sales tax" : "US 5bps"}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Results 2x2 */}
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <section style={{ borderRight: "1px solid #2a2a2a", borderBottom: "1px solid #2a2a2a" }}>
          <PanelHead title="Equity Curve · 12 years" meta="Composite v2.1 vs IHSG TR" />
          <div style={{ padding: "12px 14px" }}>
            <EquityCurveChart />
          </div>
        </section>
        <section style={{ borderBottom: "1px solid #2a2a2a" }}>
          <PanelHead title="CPCV Path Sharpe Distribution" meta="n=9 paths" />
          <div style={{ padding: "12px 14px" }}>
            <CPCVHistogram />
            <p style={{ fontSize: 10.5, color: "#888", marginTop: 8, fontStyle: "italic", lineHeight: 1.5 }}>
              μ = 0.904 ± 0.040 · σ/μ = 4.4% · 100% paths &gt; 0 · Strategy robust, not path-dependent.
            </p>
          </div>
        </section>

        <section style={{ borderRight: "1px solid #2a2a2a", borderBottom: "1px solid #2a2a2a" }}>
          <PanelHead title="Performance Statistics" />
          <div>
            {PERFORMANCE_STATS.map((s, i) => (
              <div key={s.label} className="grid items-baseline" style={{ gridTemplateColumns: "180px 100px 1fr", padding: "0 14px", height: 24, borderBottom: i < PERFORMANCE_STATS.length - 1 ? "1px solid #111" : "none", gap: 10 }}>
                <span style={{ fontSize: 11, color: "#d8d8d8" }}>{s.label}</span>
                <span className="num" style={{ fontSize: 11.5, color: s.tone === "pos" ? "#00d97e" : s.tone === "neg" ? "#ff4d4f" : "#f5f5f5", fontWeight: 600 }}>{s.value}</span>
                <span className="num" style={{ fontSize: 10, color: "#7a7a7a" }}>{s.sub}</span>
              </div>
            ))}
          </div>
        </section>

        <section style={{ borderBottom: "1px solid #2a2a2a" }}>
          <PanelHead title="Factor Attribution · Isolated Long-Decile" />
          <div>
            {ISOLATED_FACTORS.map((f) => (
              <div key={f.factor} className="grid items-center" style={{ gridTemplateColumns: "180px 1fr 50px", height: 28, padding: "0 14px", borderBottom: "1px solid #111", gap: 8 }}>
                <span style={{ fontSize: 11, color: f.excluded ? "#666" : "#d8d8d8", fontStyle: f.excluded ? "italic" : "normal" }}>{f.factor}</span>
                <div style={{ height: 8, background: "#0a0a0a", position: "relative" }}>
                  <div style={{ position: "absolute", inset: 0, width: `${f.sr * 100}%`, background: f.excluded ? "#666" : "#00d97e", opacity: f.excluded ? 0.3 : 0.8 }} />
                </div>
                <span className="num" style={{ fontSize: 11, color: f.excluded ? "#666" : "#00d97e", textAlign: "right" }}>+{f.sr.toFixed(2)}</span>
              </div>
            ))}
            <div className="grid items-center" style={{ gridTemplateColumns: "180px 1fr 50px", height: 32, padding: "0 14px", borderTop: "2px solid #ff2e88", background: "rgba(255,46,136,0.05)", gap: 8 }}>
              <span style={{ fontSize: 11, color: "#ff2e88", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Composite (CPCV)</span>
              <div style={{ height: 10, background: "#0a0a0a", position: "relative" }}>
                <div style={{ position: "absolute", inset: 0, width: "90%", background: "#ff2e88" }} />
              </div>
              <span className="num" style={{ fontSize: 12, color: "#ff2e88", textAlign: "right", fontWeight: 700 }}>+0.90</span>
            </div>
            <p style={{ padding: "10px 14px", fontSize: 10.5, color: "#888", fontStyle: "italic", margin: 0, lineHeight: 1.5 }}>
              Single-factor SR appears positive for Momentum but DSR vs K=8 trials shows insignificant — Li, Wei & Zhang (2023, PBFJ 82:102175) confirms IDX momentum factor is not statistically distinguishable from null.
            </p>
          </div>
        </section>
      </div>

      {/* Saved strategies */}
      <section style={{ borderBottom: "1px solid #2a2a2a" }}>
        <PanelHead title="Saved Strategies" meta="click to load" />
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
          <thead>
            <tr style={{ background: "#050505" }}>
              {["#", "NAME", "UNIVERSE", "SHARPE", "DSR", "MAX DD", "CAGR", "SAVED"].map((h, i) => (
                <th key={h} style={{ padding: "6px 12px", textAlign: i < 3 ? "left" : "right", fontSize: 9, color: "#555", letterSpacing: "0.1em", fontWeight: 500, borderBottom: "1px solid #1d1d1d" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SAVED_STRATEGIES.map((s, i) => (
              <tr key={i} className="hover:bg-[#0a0a0a]" style={{ height: 24, background: i % 2 === 0 ? "#0d0d0d" : "#0a0a0a", cursor: "pointer" }}>
                <td className="num" style={{ padding: "0 12px", color: "#666", fontSize: 10 }}>{String(i + 1).padStart(2, "0")}</td>
                <td style={{ padding: "0 12px", color: i === 0 ? "#ff2e88" : "#d8d8d8", fontWeight: i === 0 ? 600 : 400 }}>{s.name}</td>
                <td style={{ padding: "0 12px", color: "#888", fontSize: 10.5 }}>{s.universe}</td>
                <td className="num" style={{ padding: "0 12px", textAlign: "right", color: "#f5f5f5" }}>{s.sharpe.toFixed(2)}</td>
                <td className="num" style={{ padding: "0 12px", textAlign: "right", color: s.dsr >= 0.95 ? "#00d97e" : "#c4831f" }}>{s.dsr.toFixed(2)}</td>
                <td className="num" style={{ padding: "0 12px", textAlign: "right", color: "#ff4d4f" }}>{s.mdd.toFixed(1)}%</td>
                <td className="num" style={{ padding: "0 12px", textAlign: "right", color: "#00d97e" }}>+{s.cagr.toFixed(1)}%</td>
                <td className="num" style={{ padding: "0 12px", textAlign: "right", color: "#7a7a7a", fontSize: 10 }}>{s.saved}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Audit */}
      <details>
        <summary style={{ padding: "10px 14px", borderBottom: "1px solid #2a2a2a", cursor: "pointer", listStyle: "none" }}>
          <span style={{ fontSize: 9.5, color: "#ff2e88", letterSpacing: "0.14em", fontWeight: 600, textTransform: "uppercase" }}>Audit · Methodology · Reproducibility</span>
        </summary>
        <div>
          {BACKTEST_AUDIT.map((a) => (
            <div key={a.tag} style={{ padding: "10px 14px", borderBottom: "1px solid #111", display: "grid", gridTemplateColumns: "100px 1fr 1fr", gap: 14 }}>
              <span style={{ fontSize: 9.5, color: "#ff2e88", letterSpacing: "0.14em", fontWeight: 600, border: "1px solid #ff2e88", padding: "1px 5px", background: "rgba(255,46,136,0.05)", alignSelf: "start", justifySelf: "start" }}>{a.tag}</span>
              <span style={{ fontSize: 11, color: "#d8d8d8" }}>{a.desc}</span>
              <span className="num" style={{ fontSize: 10, color: "#7a7a7a", fontStyle: "italic" }}>{a.cite}</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
