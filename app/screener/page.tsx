import { SCREENER_ROWS, SCREENER_WEIGHTS, SCREENER_OVERLAY_WEIGHTS } from "@/lib/mock-screener";
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

function Sparkline({ value }: { value: number }): JSX.Element {
  // Tiny synthetic sparkline from the perf value
  const seed = Math.abs(value);
  const points = Array.from({ length: 12 }, (_, i) => {
    const noise = Math.sin(i * (seed + 1)) * 4;
    return 10 - (value / 20) * i - noise;
  });
  const min = Math.min(...points);
  const max = Math.max(...points);
  const norm = points.map((p) => ((p - min) / (max - min || 1)) * 14 + 2);
  const path = norm
    .map((y, i) => `${i === 0 ? "M" : "L"}${(i * 36) / 11},${y}`)
    .join(" ");
  return (
    <svg viewBox="0 0 36 18" width={40} height={18} style={{ overflow: "visible" }}>
      <path d={path} fill="none" stroke={tone(value)} strokeWidth={1.2} />
    </svg>
  );
}

const COL_HEADERS = [
  { label: "#", align: "right" as const, w: "32px" },
  { label: "TKR", align: "left" as const, w: "60px" },
  { label: "EMITEN", align: "left" as const },
  { label: "SECT", align: "left" as const, w: "50px" },
  { label: "COMP Z", align: "right" as const, w: "70px" },
  { label: "VAL", align: "right" as const, w: "60px" },
  { label: "QUAL", align: "right" as const, w: "60px" },
  { label: "PROF", align: "right" as const, w: "60px" },
  { label: "LVOL", align: "right" as const, w: "60px" },
  { label: "PEAD", align: "right" as const, w: "60px" },
  { label: "FLOW", align: "right" as const, w: "60px" },
  { label: "SENT", align: "right" as const, w: "60px" },
  { label: "CAT", align: "right" as const, w: "60px" },
  { label: "3M", align: "right" as const, w: "60px" },
  { label: "MCAP trn", align: "right" as const, w: "72px" },
];

export default function ScreenerPage(): JSX.Element {
  return (
    <div>
      <div className="flex items-baseline" style={{ padding: "14px 14px 8px", borderBottom: "1px solid #2a2a2a", gap: 12 }}>
        <span className="num" style={{ fontSize: 9, color: "#ff2e88", letterSpacing: "0.08em", fontWeight: 600 }}>03</span>
        <h1 style={{ fontSize: 22, color: "#f5f5f5", fontWeight: 500, margin: 0, letterSpacing: "-0.01em" }}>Quant Screener · IDX Multi-Factor</h1>
        <span style={{ fontSize: 11, color: "#7a7a7a", marginLeft: 8 }}>research-grade · CPCV-validated · DSR-corrected · Wirjanto et al. (2023) calibration</span>
      </div>

      {/* Factor weights bar */}
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid #2a2a2a" }}>
        <section style={{ borderRight: "1px solid #2a2a2a" }}>
          <PanelHead title="Composite Weights" meta="MF v2.1 — 5 active + 1 disabled" />
          <div>
            {SCREENER_WEIGHTS.map((w) => (
              <div key={w.factor} className="grid items-center" style={{ gridTemplateColumns: "120px 1fr 60px", height: 22, padding: "0 12px", borderBottom: "1px solid #111", gap: 10 }}>
                <span style={{ fontSize: 11, color: w.off ? "#555" : "#d8d8d8", textDecoration: w.off ? "line-through" : "none" }}>{w.factor}</span>
                <div style={{ height: 6, background: "#1a1a1a", position: "relative" }}>
                  <div style={{ position: "absolute", inset: 0, width: `${w.wt * 100}%`, background: w.off ? "#444" : "#ff2e88", opacity: 0.85 }} />
                </div>
                <span className="num" style={{ fontSize: 10.5, color: w.off ? "#555" : "#d8d8d8", textAlign: "right" }}>{w.off ? "OFF" : w.wt.toFixed(3)}</span>
              </div>
            ))}
          </div>
        </section>
        <section>
          <PanelHead title="Overlay Weights" meta="post-composite tilt" />
          <div>
            {SCREENER_OVERLAY_WEIGHTS.map((w) => (
              <div key={w.factor} className="grid items-center" style={{ gridTemplateColumns: "160px 1fr 60px", height: 22, padding: "0 12px", borderBottom: "1px solid #111", gap: 10 }}>
                <span style={{ fontSize: 11, color: "#d8d8d8" }}>{w.factor}</span>
                <div style={{ height: 6, background: "#1a1a1a", position: "relative" }}>
                  <div style={{ position: "absolute", inset: 0, width: `${w.wt * 100}%`, background: "#5ec4e0", opacity: 0.85 }} />
                </div>
                <span className="num" style={{ fontSize: 10.5, color: "#d8d8d8", textAlign: "right" }}>{w.wt.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Ranking table */}
      <section>
        <PanelHead title={`Current Ranking · Top 24 of 184 eligible`} meta="sorted by COMP Z ▾ · z-score normalized" />
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10.5 }}>
            <colgroup>
              {COL_HEADERS.map((c, i) => (<col key={i} style={c.w ? { width: c.w } : undefined} />))}
            </colgroup>
            <thead>
              <tr style={{ background: "#050505" }}>
                {COL_HEADERS.map((c) => (
                  <th key={c.label} style={{ padding: "6px 8px", textAlign: c.align, fontSize: 8.5, color: "#555", letterSpacing: "0.1em", fontWeight: 500, borderBottom: "1px solid #1d1d1d", whiteSpace: "nowrap" }}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SCREENER_ROWS.map((r, i) => {
                const isAlt = r.ticker === "BBRI" && r.emiten.includes("alt");
                return (
                  <tr key={r.ticker + r.rank} style={{ height: 22, background: isAlt ? "rgba(255,46,136,0.04)" : i % 2 === 0 ? "#0d0d0d" : "#0a0a0a", borderLeft: isAlt ? "2px solid #ff2e88" : "2px solid transparent" }}>
                    <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#666", fontSize: 10 }}>{String(r.rank).padStart(3, "0")}</td>
                    <td style={{ padding: "0 8px" }}><TickerLink ticker={r.ticker} market="IDX" size="sm" /></td>
                    <td style={{ padding: "0 8px", color: "#d8d8d8", whiteSpace: "nowrap" }}>{r.emiten}</td>
                    <td style={{ padding: "0 8px", color: "#7a7a7a", fontSize: 10 }}>{r.sect}</td>
                    <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#ff2e88", fontWeight: 600 }}>{r.compZ >= 0 ? "+" : ""}{r.compZ.toFixed(2)}</td>
                    {([r.val, r.qual, r.prof, r.lvol, r.pead, r.flow, r.sent, r.cat] as number[]).map((v, idx) => (
                      <td key={idx} className="num" style={{ padding: "0 8px", textAlign: "right", color: tone(v) }}>{v >= 0 ? "+" : ""}{v.toFixed(2)}</td>
                    ))}
                    <td style={{ padding: "0 4px", textAlign: "right" }}><Sparkline value={r.perf3m} /></td>
                    <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#b8b8b8" }}>{r.mcap >= 100 ? r.mcap.toFixed(0) : r.mcap.toFixed(1)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
