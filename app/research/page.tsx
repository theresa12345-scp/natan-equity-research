import { RESEARCH_HYPOTHESIS, CPCV_PATHS, CPCV_NULL_MARKER, CPCV_SINGLE_PATH, CPCV_MEAN, ISOLATED_FACTORS, COMPOSITE_SR } from "@/lib/mock-research";

function PanelHead({ title, meta }: { title: string; meta?: string }): JSX.Element {
  return (
    <div className="flex items-center" style={{ height: 28, padding: "0 12px", borderBottom: "1px solid #1d1d1d", background: "#050505", gap: 10 }}>
      <span style={{ fontSize: 9.5, color: "#ff2e88", letterSpacing: "0.14em", fontWeight: 600, textTransform: "uppercase" }}>{title}</span>
      {meta ? <span style={{ fontSize: 10, color: "#7a7a7a" }}>{meta}</span> : null}
    </div>
  );
}

function CPCVHistogram(): JSX.Element {
  const w = 460;
  const h = 200;
  const pad = { l: 36, r: 12, t: 18, b: 30 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const xMin = -0.2;
  const xMax = 1.2;
  const x = (v: number): number => pad.l + ((v - xMin) / (xMax - xMin)) * innerW;
  const barW = 28;
  const counts: Record<string, number> = {};
  CPCV_PATHS.forEach((p) => { counts[p.sr.toFixed(2)] = (counts[p.sr.toFixed(2)] || 0) + 1; });
  const maxCount = Math.max(...Object.values(counts));
  const yBar = (c: number): number => pad.t + innerH - (c / (maxCount + 1)) * innerH;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%">
      {/* x-axis */}
      <line x1={pad.l} x2={w - pad.r} y1={h - pad.b} y2={h - pad.b} stroke="#2a2a2a" />
      {/* null marker */}
      <line x1={x(CPCV_NULL_MARKER)} x2={x(CPCV_NULL_MARKER)} y1={pad.t} y2={h - pad.b} stroke="#666" strokeDasharray="3 3" />
      <text x={x(CPCV_NULL_MARKER) + 4} y={pad.t + 10} style={{ fontSize: 9, fill: "#666", fontFamily: "var(--font-jetbrains)" }}>null {CPCV_NULL_MARKER.toFixed(3)}</text>
      {/* single path */}
      <line x1={x(CPCV_SINGLE_PATH)} x2={x(CPCV_SINGLE_PATH)} y1={pad.t} y2={h - pad.b} stroke="#7a7a7a" strokeDasharray="2 3" />
      <text x={x(CPCV_SINGLE_PATH) + 4} y={pad.t + 10} style={{ fontSize: 9, fill: "#7a7a7a", fontFamily: "var(--font-jetbrains)" }}>single {CPCV_SINGLE_PATH.toFixed(3)}</text>
      {/* mean line */}
      <line x1={x(CPCV_MEAN)} x2={x(CPCV_MEAN)} y1={pad.t} y2={h - pad.b} stroke="#ff2e88" strokeWidth={1.5} />
      <text x={x(CPCV_MEAN) + 4} y={pad.t - 4} style={{ fontSize: 10, fill: "#ff2e88", fontFamily: "var(--font-jetbrains)", fontWeight: 600 }}>μ = {CPCV_MEAN.toFixed(3)}</text>
      {/* bars */}
      {Object.entries(counts).map(([sr, c]) => (
        <rect
          key={sr}
          x={x(parseFloat(sr)) - barW / 2}
          y={yBar(c)}
          width={barW}
          height={h - pad.b - yBar(c)}
          fill="#ff2e88"
          opacity={0.85}
        />
      ))}
      {/* x-labels */}
      {[0, 0.25, 0.5, 0.75, 1.0].map((v) => (
        <text key={v} x={x(v)} y={h - 8} textAnchor="middle" style={{ fontSize: 9, fill: "#666", fontFamily: "var(--font-jetbrains)" }}>{v.toFixed(2)}</text>
      ))}
      <text x={w / 2} y={h - 2} textAnchor="middle" style={{ fontSize: 9, fill: "#7a7a7a", fontFamily: "var(--font-geist-sans)", letterSpacing: "0.08em" }}>Annualised Sharpe ratio</text>
    </svg>
  );
}

export default function ResearchPage(): JSX.Element {
  return (
    <div>
      <div className="flex items-baseline" style={{ padding: "14px 14px 8px", borderBottom: "1px solid #2a2a2a", gap: 12 }}>
        <span className="num" style={{ fontSize: 9, color: "#ff2e88", letterSpacing: "0.08em", fontWeight: 600 }}>04</span>
        <h1 style={{ fontSize: 22, color: "#f5f5f5", fontWeight: 500, margin: 0, letterSpacing: "-0.01em" }}>Quantitative Research</h1>
        <span style={{ fontSize: 11, color: "#7a7a7a", marginLeft: 8 }}>composite v2.1 · CPCV 10×2 · DSR vs K=8 trials</span>
      </div>

      {/* Hypothesis */}
      <section style={{ borderBottom: "1px solid #2a2a2a" }}>
        <PanelHead title="Strategy Hypothesis" meta="QRES · 04.0 · narrative" />
        <p style={{ padding: "14px 16px", fontSize: 11.5, color: "#d8d8d8", lineHeight: 1.65, maxWidth: "80ch", margin: 0 }}>{RESEARCH_HYPOTHESIS}</p>
      </section>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <section style={{ borderRight: "1px solid #2a2a2a" }}>
          <PanelHead title="CPCV Path Sharpe Distribution" meta="n=9 paths" />
          <div style={{ padding: 12 }}>
            <CPCVHistogram />
            <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", marginTop: 12, gap: 16, fontSize: 10 }}>
              <div><div style={{ fontSize: 8.5, color: "#666", letterSpacing: "0.08em" }}>μ / σ</div><div className="num" style={{ fontSize: 12, color: "#f5f5f5", marginTop: 3 }}>0.904 / 0.040</div></div>
              <div><div style={{ fontSize: 8.5, color: "#666", letterSpacing: "0.08em" }}>σ / μ</div><div className="num" style={{ fontSize: 12, color: "#f5f5f5", marginTop: 3 }}>4.4%</div></div>
              <div><div style={{ fontSize: 8.5, color: "#666", letterSpacing: "0.08em" }}>% &gt; 0</div><div className="num" style={{ fontSize: 12, color: "#00d97e", marginTop: 3 }}>100% (9/9)</div></div>
            </div>
            <p style={{ fontSize: 10.5, color: "#888", lineHeight: 1.55, marginTop: 12, fontStyle: "italic" }}>
              Tight distribution (σ/μ &lt; 5%) → strategy is robust, not path-dependent. All 9 paths positive.
            </p>
          </div>
        </section>

        <section>
          <PanelHead title="Single-Factor Attribution · Isolated Long-Decile" meta="2014–2025 net" />
          <div>
            {ISOLATED_FACTORS.map((f) => {
              const widthPct = (f.sr / 1.0) * 100;
              return (
                <div key={f.factor} className="grid items-center" style={{ gridTemplateColumns: "160px 1fr 50px", height: 28, padding: "0 12px", borderBottom: "1px solid #111", gap: 8 }}>
                  <span style={{ fontSize: 11, color: f.excluded ? "#666" : "#d8d8d8", fontStyle: f.excluded ? "italic" : "normal" }}>{f.factor}{f.excluded ? " · excluded" : ""}</span>
                  <div style={{ height: 8, background: "#0a0a0a", position: "relative" }}>
                    <div style={{ position: "absolute", inset: 0, width: `${widthPct}%`, background: f.excluded ? "#666" : "#00d97e", opacity: f.excluded ? 0.3 : 0.8, border: f.excluded ? "1px dashed #9a4040" : "none" }} />
                  </div>
                  <span className="num" style={{ fontSize: 11, color: f.excluded ? "#666" : "#00d97e", textAlign: "right" }}>{f.sr >= 0 ? "+" : ""}{f.sr.toFixed(2)}</span>
                </div>
              );
            })}
            <div className="grid items-center" style={{ gridTemplateColumns: "160px 1fr 50px", height: 32, padding: "0 12px", borderTop: "2px solid #ff2e88", background: "rgba(255,46,136,0.05)", gap: 8 }}>
              <span style={{ fontSize: 11, color: "#ff2e88", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Composite (CPCV)</span>
              <div style={{ height: 10, background: "#0a0a0a", position: "relative" }}>
                <div style={{ position: "absolute", inset: 0, width: `${COMPOSITE_SR * 100}%`, background: "#ff2e88" }} />
              </div>
              <span className="num" style={{ fontSize: 12, color: "#ff2e88", textAlign: "right", fontWeight: 700 }}>+{COMPOSITE_SR.toFixed(2)}</span>
            </div>
            <p style={{ padding: "12px 12px", fontSize: 10.5, color: "#888", fontStyle: "italic", lineHeight: 1.5, margin: 0 }}>
              Momentum standalone SR appears positive but DSR vs K=8 trials shows insignificant — Wirjanto et al. (2023) confirms IDX momentum factor is not statistically distinguishable from the null at conventional thresholds.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
