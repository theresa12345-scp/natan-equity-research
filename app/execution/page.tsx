"use client";

import { useState } from "react";
import { FILLS, EXEC_STATS, type Fill } from "@/lib/mock-execution";

function tone(side: Fill["side"]): string {
  return side === "BUY" ? "#00d97e" : "#ff4d4f";
}

function statusColor(s: Fill["status"]): string {
  if (s === "FILLED") return "#00d97e";
  if (s === "PARTIAL") return "#c4831f";
  return "#ff2e88";
}

function PanelHead({ title, meta }: { title: string; meta?: string }): JSX.Element {
  return (
    <div className="flex items-center" style={{ height: 28, padding: "0 12px", borderBottom: "1px solid #1d1d1d", background: "#050505", gap: 10 }}>
      <span style={{ fontSize: 9.5, color: "#ff2e88", letterSpacing: "0.14em", fontWeight: 600, textTransform: "uppercase" }}>{title}</span>
      {meta ? <span style={{ fontSize: 10, color: "#7a7a7a" }}>{meta}</span> : null}
    </div>
  );
}

export default function ExecutionPage(): JSX.Element {
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [tif, setTif] = useState<"DAY" | "IOC" | "GTC">("DAY");

  return (
    <div>
      <div className="flex items-baseline" style={{ padding: "14px 14px 8px", borderBottom: "1px solid #2a2a2a", gap: 12 }}>
        <span className="num" style={{ fontSize: 9, color: "#ff2e88", letterSpacing: "0.08em", fontWeight: 600 }}>06</span>
        <h1 style={{ fontSize: 22, color: "#f5f5f5", fontWeight: 500, margin: 0, letterSpacing: "-0.01em" }}>Execution Blotter</h1>
        <span style={{ fontSize: 11, color: "#7a7a7a", marginLeft: 8 }}>JKT · BEI session II · stub UI</span>
      </div>

      {/* KPI strip */}
      <div className="grid" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))", borderBottom: "1px solid #2a2a2a" }}>
        {EXEC_STATS.map((s, i) => (
          <div key={s.label} style={{ padding: "12px 14px", borderRight: i % 4 === 3 ? "none" : "1px solid #1d1d1d" }}>
            <div style={{ fontSize: 8.5, color: "#666", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>{s.label}</div>
            <div className="num" style={{ fontSize: 20, color: s.tone === "pos" ? "#00d97e" : s.tone === "neg" ? "#ff4d4f" : "#f5f5f5", letterSpacing: "-0.01em" }}>{s.value}</div>
            <div className="num" style={{ fontSize: 10, color: "#888", marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 300px" }}>
        {/* Fills table */}
        <section style={{ borderRight: "1px solid #2a2a2a" }}>
          <PanelHead title="Fills · today" meta="all venues · gross" />
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr style={{ background: "#050505" }}>
                {["TS", "TICKER", "SIDE", "QTY", "PX", "NOTIONAL · jt", "VENUE", "STATUS"].map((c, i) => (
                  <th key={c} style={{ padding: "6px 10px", textAlign: i < 3 ? "left" : "right", fontSize: 9, color: "#555", letterSpacing: "0.1em", fontWeight: 500, borderBottom: "1px solid #1d1d1d" }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FILLS.map((f, i) => (
                <tr key={i} style={{ height: 22, background: i % 2 === 0 ? "#0d0d0d" : "#0a0a0a" }}>
                  <td className="num" style={{ padding: "0 10px", color: "#7a7a7a" }}>{f.ts}</td>
                  <td className="num" style={{ padding: "0 10px", color: "#ff2e88", fontWeight: 500 }}>{f.ticker}</td>
                  <td style={{ padding: "0 10px", color: tone(f.side), fontWeight: 600, letterSpacing: "0.08em" }}>{f.side}</td>
                  <td className="num" style={{ padding: "0 10px", textAlign: "right", color: "#d8d8d8" }}>{f.qty.toLocaleString()}</td>
                  <td className="num" style={{ padding: "0 10px", textAlign: "right", color: "#f5f5f5" }}>{f.px.toLocaleString()}</td>
                  <td className="num" style={{ padding: "0 10px", textAlign: "right", color: "#d8d8d8" }}>{f.notional.toFixed(2)}</td>
                  <td className="num" style={{ padding: "0 10px", textAlign: "right", color: "#888" }}>{f.venue}</td>
                  <td className="num" style={{ padding: "0 10px", textAlign: "right", color: statusColor(f.status), fontWeight: 600, fontSize: 10, letterSpacing: "0.08em" }}>{f.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Order entry stub */}
        <section>
          <PanelHead title="Order Entry · stub" />
          <div style={{ padding: "14px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="flex items-stretch" style={{ height: 28 }}>
              {(["BUY", "SELL"] as const).map((s) => (
                <button key={s} type="button" onClick={() => setSide(s)} style={{ flex: 1, background: side === s ? (s === "BUY" ? "#00d97e" : "#ff4d4f") : "transparent", color: side === s ? "#000" : "#7a7a7a", border: `1px solid ${side === s ? (s === "BUY" ? "#00d97e" : "#ff4d4f") : "#2a2a2a"}`, fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", cursor: "pointer", marginLeft: s === "SELL" ? -1 : 0 }}>{s}</button>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 8.5, color: "#666", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Ticker</div>
              <input type="text" placeholder="BBCA IJ" className="num placeholder:text-[#555]" style={{ width: "100%", height: 28, background: "#050505", border: "1px solid #2a2a2a", color: "#f5f5f5", padding: "0 10px", fontSize: 12, outline: "none" }} />
            </div>
            <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <div style={{ fontSize: 8.5, color: "#666", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Qty · lot</div>
                <input type="text" placeholder="0" className="num placeholder:text-[#555]" style={{ width: "100%", height: 28, background: "#050505", border: "1px solid #2a2a2a", color: "#f5f5f5", padding: "0 10px", fontSize: 12, outline: "none" }} />
              </div>
              <div>
                <div style={{ fontSize: 8.5, color: "#666", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Limit px</div>
                <input type="text" placeholder="0" className="num placeholder:text-[#555]" style={{ width: "100%", height: 28, background: "#050505", border: "1px solid #2a2a2a", color: "#f5f5f5", padding: "0 10px", fontSize: 12, outline: "none" }} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 8.5, color: "#666", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Time in force</div>
              <div className="flex">
                {(["DAY", "IOC", "GTC"] as const).map((t, i) => (
                  <button key={t} type="button" onClick={() => setTif(t)} style={{ flex: 1, height: 26, background: "transparent", color: tif === t ? "#ff2e88" : "#7a7a7a", border: `1px solid ${tif === t ? "#ff2e88" : "#2a2a2a"}`, fontSize: 10.5, letterSpacing: "0.08em", cursor: "pointer", marginLeft: i === 0 ? 0 : -1 }}>{t}</button>
                ))}
              </div>
            </div>
            <button type="button" disabled style={{ height: 32, background: "transparent", border: "1px solid #444", color: "#666", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", marginTop: 4, cursor: "not-allowed" }}>SUBMIT · disabled (V1 stub)</button>
          </div>
        </section>
      </div>
    </div>
  );
}
