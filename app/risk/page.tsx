import { RISK_METRICS, FACTOR_EXPOSURES, SECTOR_CONCENTRATION, STRESS_SCENARIOS } from "@/lib/mock-risk";

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

export default function RiskPage(): JSX.Element {
  return (
    <div>
      <div className="flex items-baseline" style={{ padding: "14px 14px 8px", borderBottom: "1px solid #2a2a2a", gap: 12 }}>
        <span className="num" style={{ fontSize: 9, color: "#ff2e88", letterSpacing: "0.08em", fontWeight: 600 }}>05</span>
        <h1 style={{ fontSize: 22, color: "#f5f5f5", fontWeight: 500, margin: 0, letterSpacing: "-0.01em" }}>Risk &amp; Macro Exposure</h1>
        <span style={{ fontSize: 11, color: "#7a7a7a", marginLeft: 8 }}>portfolio-level · daily mark</span>
      </div>

      {/* KPI strip */}
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
        {/* Factor exposures */}
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

          <PanelHead title="Stress Scenarios" />
          {STRESS_SCENARIOS.map((s) => (
            <div key={s.name} className="grid items-center" style={{ gridTemplateColumns: "1fr 70px 70px", height: 26, padding: "0 12px", borderBottom: "1px solid #111", gap: 8 }}>
              <span style={{ fontSize: 11, color: "#d8d8d8" }}>{s.name}</span>
              <span className="num" style={{ fontSize: 11, color: tone(s.impact), textAlign: "right" }}>{s.impact >= 0 ? "+" : ""}{s.impact.toFixed(2)}%</span>
              <span style={{ fontSize: 9.5, color: "#666", textAlign: "right", letterSpacing: "0.08em", textTransform: "uppercase" }}>{s.prob}</span>
            </div>
          ))}
        </section>

        {/* Sector concentration */}
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
