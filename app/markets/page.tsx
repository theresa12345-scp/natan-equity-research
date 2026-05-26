import {
  IHSG_COMPONENTS,
  SECTOR_HEATMAP,
  MACRO_PANEL,
  FOREIGN_FLOW,
} from "@/lib/mock-markets";

function tone(v: number): string {
  if (v > 0) return "#00d97e";
  if (v < 0) return "#ff4d4f";
  return "#b8b8b8";
}

function heatBg(v: number): string {
  if (v > 3) return "#005a30";
  if (v > 1) return "#0f3d20";
  if (v > 0) return "#0a2818";
  if (v > -1) return "#2a1313";
  if (v > -3) return "#4a1818";
  return "#6a1a1a";
}

function SectionHeader({ num, title, meta }: { num: string; title: string; meta?: string }): JSX.Element {
  return (
    <div className="flex items-baseline" style={{ padding: "14px 14px 8px", borderBottom: "1px solid #2a2a2a", gap: 12 }}>
      <span className="num" style={{ fontSize: 9, color: "#ff2e88", letterSpacing: "0.08em", fontWeight: 600 }}>{num}</span>
      <h1 style={{ fontSize: 22, color: "#f5f5f5", fontWeight: 500, margin: 0, letterSpacing: "-0.01em" }}>{title}</h1>
      {meta ? <span style={{ fontSize: 11, color: "#7a7a7a", marginLeft: 8 }}>{meta}</span> : null}
    </div>
  );
}

function PanelHead({ title, meta }: { title: string; meta?: string }): JSX.Element {
  return (
    <div className="flex items-center" style={{ height: 28, padding: "0 12px", borderBottom: "1px solid #1d1d1d", background: "#050505", gap: 10 }}>
      <span style={{ fontSize: 9.5, color: "#ff2e88", letterSpacing: "0.14em", fontWeight: 600, textTransform: "uppercase" }}>{title}</span>
      {meta ? <span style={{ fontSize: 10, color: "#7a7a7a" }}>{meta}</span> : null}
    </div>
  );
}

export default function MarketsPage(): JSX.Element {
  return (
    <div>
      <SectionHeader num="01" title="Markets · IDX Overview" meta="JKT · session II · 14:23 WIB" />

      {/* 2x2 panels */}
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gridTemplateRows: "auto auto", borderBottom: "1px solid #2a2a2a" }}>
        {/* IHSG components */}
        <section style={{ borderRight: "1px solid #2a2a2a", borderBottom: "1px solid #2a2a2a" }}>
          <PanelHead title="IHSG Composition · Top 10" meta="weighted by market cap" />
          <div>
            {IHSG_COMPONENTS.map((c, i) => (
              <div key={c.ticker} className="grid items-center" style={{ gridTemplateColumns: "80px 1fr 70px 70px", height: 22, padding: "0 12px", borderBottom: "1px solid #111", background: i % 2 ? "#0a0a0a" : "#0d0d0d", gap: 8 }}>
                <span className="num" style={{ fontSize: 11, color: "#f5f5f5", fontWeight: 500 }}>{c.ticker}</span>
                <div style={{ height: 6, background: "#1a1a1a", position: "relative" }}>
                  <div style={{ position: "absolute", inset: 0, width: `${(c.wt / 10) * 100}%`, background: "#ff2e88", opacity: 0.7 }} />
                </div>
                <span className="num" style={{ fontSize: 10.5, color: "#d8d8d8", textAlign: "right" }}>{c.wt.toFixed(2)}%</span>
                <span className="num" style={{ fontSize: 10.5, color: tone(c.perf5d), textAlign: "right" }}>{c.perf5d >= 0 ? "+" : ""}{c.perf5d.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </section>

        {/* Sector heatmap */}
        <section style={{ borderBottom: "1px solid #2a2a2a" }}>
          <PanelHead title="Sector Heatmap · 5d return" meta="IDX-IC" />
          <div className="grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", padding: 12, gap: 4 }}>
            {SECTOR_HEATMAP.map((s) => (
              <div key={s.sector} style={{ background: heatBg(s.perf5d), padding: "10px 12px", border: "1px solid #000" }}>
                <div style={{ fontSize: 10, color: "#d8d8d8", letterSpacing: "0.04em" }}>{s.sector}</div>
                <div className="num" style={{ fontSize: 16, color: "#f5f5f5", marginTop: 4, fontWeight: 500 }}>{s.perf5d >= 0 ? "+" : ""}{s.perf5d.toFixed(2)}%</div>
                <div className="num" style={{ fontSize: 9, color: "#888", marginTop: 2 }}>wt {s.wt.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </section>

        {/* Macro */}
        <section style={{ borderRight: "1px solid #2a2a2a" }}>
          <PanelHead title="ID Macro · current state" meta="real-time" />
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
            {MACRO_PANEL.map((m, i) => (
              <div key={m.label} style={{ padding: "10px 12px", borderBottom: "1px solid #111", borderRight: i % 2 === 0 ? "1px solid #111" : "none" }}>
                <div style={{ fontSize: 8.5, color: "#666", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>{m.label}</div>
                <div className="num" style={{ fontSize: 14, color: "#f5f5f5", letterSpacing: "-0.01em" }}>{m.value}</div>
                <div className="num" style={{ fontSize: 9.5, color: tone(m.tone === "pos" ? 1 : m.tone === "neg" ? -1 : 0), marginTop: 2 }}>{m.delta}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Foreign flow */}
        <section>
          <PanelHead title="Foreign Flow · LQ45" meta="IDR miliar · settled" />
          <div style={{ padding: 12 }}>
            <div className="grid" style={{ gridTemplateColumns: "60px 1fr 60px 60px 70px", padding: "4px 0", borderBottom: "1px solid #2a2a2a", fontSize: 9, color: "#666", letterSpacing: "0.08em" }}>
              <span>DAY</span><span /><span style={{ textAlign: "right" }}>BUY</span><span style={{ textAlign: "right" }}>SELL</span><span style={{ textAlign: "right" }}>NET</span>
            </div>
            {FOREIGN_FLOW.map((f) => {
              const max = 2000;
              const buyPct = (f.buy / max) * 50;
              const sellPct = (f.sell / max) * 50;
              return (
                <div key={f.day} className="grid items-center" style={{ gridTemplateColumns: "60px 1fr 60px 60px 70px", height: 24, gap: 8, borderBottom: "1px solid #111" }}>
                  <span className="num" style={{ fontSize: 10.5, color: "#7a7a7a" }}>{f.day}</span>
                  <div style={{ position: "relative", height: 8 }}>
                    <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "#2a2a2a" }} />
                    <div style={{ position: "absolute", right: `${50}%`, top: 0, bottom: 0, width: `${sellPct}%`, background: "#ff4d4f", opacity: 0.7 }} />
                    <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: `${buyPct}%`, background: "#00d97e", opacity: 0.7 }} />
                  </div>
                  <span className="num" style={{ fontSize: 10, color: "#00d97e", textAlign: "right" }}>{f.buy.toLocaleString()}</span>
                  <span className="num" style={{ fontSize: 10, color: "#ff4d4f", textAlign: "right" }}>{f.sell.toLocaleString()}</span>
                  <span className="num" style={{ fontSize: 10.5, color: tone(f.net), textAlign: "right", fontWeight: 600 }}>{f.net >= 0 ? "+" : ""}{f.net}</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
