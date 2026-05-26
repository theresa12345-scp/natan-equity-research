import { buildBrief } from "@/lib/brief/build";
import type { BriefDocument } from "@/lib/brief/types";
import TickerLink from "@/components/primitives/TickerLink";

// Revalidate every 6 hours. Vercel Cron also rebuilds at 06:30 WIB +
// 08:00 EDT; this revalidate is the safety net.
export const revalidate = 21600;

function tone(v: number): string {
  if (v > 0) return "#00d97e";
  if (v < 0) return "#ff4d4f";
  return "#7a7a7a";
}

function PanelHead({ title, meta }: { title: string; meta?: string }): JSX.Element {
  return (
    <div className="flex items-center" style={{ height: 26, padding: "0 12px", borderBottom: "1px solid #1d1d1d", background: "#050505", gap: 10 }}>
      <span style={{ fontSize: 9.5, color: "#ff2e88", letterSpacing: "0.14em", fontWeight: 600, textTransform: "uppercase" }}>{title}</span>
      {meta ? <span style={{ fontSize: 9.5, color: "#7a7a7a" }}>{meta}</span> : null}
    </div>
  );
}

function ChartOfDay({ brief }: { brief: BriefDocument }): JSX.Element {
  const total = brief.chartOfDay.series.reduce((s, x) => s + x.value, 0);
  return (
    <div style={{ padding: "16px 18px" }}>
      <div style={{ fontSize: 17, color: "#f5f5f5", fontWeight: 500, letterSpacing: "-0.01em", lineHeight: 1.4, maxWidth: "68ch" }}>
        {brief.chartOfDay.headline}
      </div>

      <div style={{ marginTop: 18, marginBottom: 14 }}>
        <div style={{ display: "flex", height: 30, border: "1px solid #2a2a2a" }}>
          {brief.chartOfDay.series.map((s) => {
            const pct = (s.value / total) * 100;
            return (
              <div
                key={s.label}
                title={`${s.label}: ${s.value}%`}
                style={{
                  width: `${pct}%`,
                  background: s.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontFamily: "var(--font-jetbrains)",
                  color: s.value > 35 ? "#000" : "#f5f5f5",
                  fontWeight: 600,
                  borderRight: "1px solid #000",
                }}
              >
                {s.value}%
              </div>
            );
          })}
        </div>
        <div className="flex items-center" style={{ marginTop: 8, gap: 14, fontSize: 10 }}>
          {brief.chartOfDay.series.map((s) => (
            <span key={s.label} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#d8d8d8" }}>
              <span aria-hidden="true" style={{ width: 10, height: 10, background: s.color }} />
              {s.label}
            </span>
          ))}
        </div>
      </div>

      <p style={{ fontSize: 12, color: "#d8d8d8", lineHeight: 1.7, maxWidth: "72ch", margin: 0 }}>
        {brief.chartOfDay.takeaway}
      </p>
      <p
        className="num"
        style={{ fontSize: 9.5, color: "#7a7a7a", marginTop: 12, fontStyle: "italic", letterSpacing: "0.02em" }}
      >
        source · {brief.chartOfDay.sourceLabel}
      </p>
    </div>
  );
}

function ImpactBadge({ impact }: { impact: "high" | "medium" | "low" }): JSX.Element {
  const colors = {
    high: { fg: "#ff2e88", bg: "rgba(255,46,136,0.08)" },
    medium: { fg: "#c4831f", bg: "rgba(196,131,31,0.08)" },
    low: { fg: "#7a7a7a", bg: "rgba(122,122,122,0.08)" },
  } as const;
  const c = colors[impact];
  return (
    <span
      style={{
        fontSize: 8.5,
        color: c.fg,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        fontWeight: 600,
        border: `1px solid ${c.fg}`,
        background: c.bg,
        padding: "1px 5px",
      }}
    >
      {impact}
    </span>
  );
}

function SourceChip({ source }: { source: BriefDocument["source"] }): JSX.Element {
  const color = source === "live" ? "#00d97e" : source === "mixed" ? "#c4831f" : "#7a7a7a";
  const label = source === "live" ? "LIVE" : source === "mixed" ? "MIXED" : "FALLBACK";
  return (
    <span
      className="num"
      style={{
        fontSize: 8.5,
        color,
        letterSpacing: "0.14em",
        border: `1px solid ${color}`,
        padding: "1px 5px",
        fontWeight: 600,
      }}
      title={`Data source: ${source}`}
    >
      {label}
    </span>
  );
}

export default async function BriefPage(): Promise<JSX.Element> {
  const brief = await buildBrief();

  return (
    <div>
      {/* Header */}
      <div
        className="flex items-baseline"
        style={{ padding: "14px 14px 8px", borderBottom: "1px solid #2a2a2a", gap: 12, flexWrap: "wrap" }}
      >
        <span className="num" style={{ fontSize: 9, color: "#ff2e88", letterSpacing: "0.08em", fontWeight: 600 }}>00</span>
        <h1 style={{ fontSize: 22, color: "#f5f5f5", fontWeight: 500, margin: 0, letterSpacing: "-0.01em" }}>
          Daily Brief
        </h1>
        <span style={{ fontSize: 11, color: "#7a7a7a", marginLeft: 8 }}>
          {brief.meta.edition} · {brief.date}
        </span>
        <SourceChip source={brief.source} />
        <div className="ml-auto flex items-center num" style={{ gap: 14, fontSize: 10, letterSpacing: "0.06em" }}>
          <span style={{ color: "#7a7a7a" }}>JKT <span style={{ color: "#d8d8d8" }}>{brief.meta.jktTime}</span></span>
          <span style={{ color: "#7a7a7a" }}>NY <span style={{ color: "#d8d8d8" }}>{brief.meta.estTime}</span></span>
          <span style={{ color: "#666" }}>· {brief.meta.author}</span>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 280px" }}>
        {/* Main column */}
        <div style={{ borderRight: "1px solid #2a2a2a", minWidth: 0 }}>
          {/* Chart of the Day */}
          <section style={{ borderBottom: "1px solid #2a2a2a" }}>
            <PanelHead title="Chart of the Day" meta="one chart · one takeaway" />
            <ChartOfDay brief={brief} />
          </section>

          {/* Overnight Wrap */}
          <section style={{ borderBottom: "1px solid #2a2a2a" }}>
            <PanelHead title="Overnight Wrap" meta="US close → Asia open" />
            <div className="grid" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
              {brief.overnightWrap.map((w, i) => (
                <div
                  key={w.label}
                  style={{
                    padding: "10px 12px",
                    borderRight: (i + 1) % 4 === 0 ? "none" : "1px solid #1d1d1d",
                    borderBottom: i < 4 ? "1px solid #1d1d1d" : "none",
                  }}
                >
                  <div style={{ fontSize: 8.5, color: "#666", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>{w.label}</div>
                  <div className="num" style={{ fontSize: 14, color: "#f5f5f5", letterSpacing: "-0.01em" }}>{w.value}</div>
                  <div
                    className="num"
                    style={{ fontSize: 10, color: w.tone === "pos" ? "#00d97e" : w.tone === "neg" ? "#ff4d4f" : "#7a7a7a", marginTop: 3 }}
                  >
                    {w.delta}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Idea of the Day */}
          <section style={{ borderBottom: "1px solid #2a2a2a" }}>
            <PanelHead title="Idea of the Day" meta="composite-screen pick" />
            <div style={{ padding: "14px 18px" }}>
              <div className="flex items-baseline" style={{ gap: 10 }}>
                <TickerLink ticker={brief.ideaOfDay.ticker} market={brief.ideaOfDay.exchange === "IDX" ? "IDX" : "US"} size="md" bold />
                <span style={{ fontSize: 9, color: "#7a7a7a", border: "1px solid #2a2a2a", padding: "1px 5px", letterSpacing: "0.08em" }}>{brief.ideaOfDay.exchange}</span>
                <h2 style={{ fontSize: 14, color: "#f5f5f5", margin: 0, fontWeight: 500 }}>{brief.ideaOfDay.title}</h2>
                <span className="num ml-auto" style={{ fontSize: 13, color: "#ff2e88", fontWeight: 700 }}>
                  +{brief.ideaOfDay.composite.toFixed(2)}σ
                </span>
              </div>
              <p style={{ fontSize: 11.5, color: "#d8d8d8", lineHeight: 1.65, marginTop: 10, marginBottom: 12, maxWidth: "70ch" }}>
                {brief.ideaOfDay.prose}
              </p>
              <div className="flex" style={{ gap: 8 }}>
                {brief.ideaOfDay.pillars.map((p) => (
                  <div
                    key={p.name}
                    className="num"
                    style={{
                      fontSize: 10,
                      padding: "3px 8px",
                      border: "1px solid #ff2e88",
                      background: "rgba(255,46,136,0.05)",
                      color: "#ff2e88",
                      letterSpacing: "0.04em",
                    }}
                  >
                    <span style={{ color: "#888", marginRight: 4 }}>{p.name}</span>
                    {p.score}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Today's Catalysts */}
          <section style={{ borderBottom: "1px solid #2a2a2a" }}>
            <PanelHead title="Today's Catalysts" meta={`${brief.todaysCatalysts.length} scheduled`} />
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <thead>
                <tr style={{ background: "#050505" }}>
                  {["TIME", "REG", "EVENT", "IMPACT", "NOTE"].map((h) => (
                    <th key={h} style={{ padding: "6px 10px", textAlign: "left", fontSize: 9, color: "#555", letterSpacing: "0.1em", fontWeight: 500, borderBottom: "1px solid #1d1d1d" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {brief.todaysCatalysts.map((c, i) => (
                  <tr key={i} style={{ height: 24, background: i % 2 === 0 ? "#0d0d0d" : "#0a0a0a" }}>
                    <td className="num" style={{ padding: "0 10px", color: "#b8b8b8", whiteSpace: "nowrap" }}>{c.time}</td>
                    <td style={{ padding: "0 10px", color: "#ff2e88", fontSize: 9.5, letterSpacing: "0.1em", fontWeight: 600 }}>{c.region}</td>
                    <td style={{ padding: "0 10px", color: "#f5f5f5" }}>{c.event}</td>
                    <td style={{ padding: "0 10px" }}><ImpactBadge impact={c.impact} /></td>
                    <td style={{ padding: "0 10px", color: "#888", fontSize: 10.5, fontStyle: "italic" }}>{c.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Sector Rundown */}
          <section style={{ borderBottom: "1px solid #2a2a2a" }}>
            <PanelHead title="Sector Rundown · 1d perf" meta="IDX vs US · close-to-close" />
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <thead>
                <tr style={{ background: "#050505" }}>
                  {["SECTOR", "IDX", "US", "READ"].map((h, i) => (
                    <th key={h} style={{ padding: "6px 10px", textAlign: i === 0 || i === 3 ? "left" : "right", fontSize: 9, color: "#555", letterSpacing: "0.1em", fontWeight: 500, borderBottom: "1px solid #1d1d1d" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {brief.sectorRundown.map((s, i) => (
                  <tr key={s.sector} style={{ height: 22, background: i % 2 === 0 ? "#0d0d0d" : "#0a0a0a" }}>
                    <td style={{ padding: "0 10px", color: "#d8d8d8" }}>{s.sector}</td>
                    <td className="num" style={{ padding: "0 10px", textAlign: "right", color: tone(s.idx) }}>{s.idx >= 0 ? "+" : ""}{s.idx.toFixed(2)}%</td>
                    <td className="num" style={{ padding: "0 10px", textAlign: "right", color: tone(s.us) }}>{s.us >= 0 ? "+" : ""}{s.us.toFixed(2)}%</td>
                    <td style={{ padding: "0 10px", color: "#888", fontSize: 10.5, fontStyle: "italic" }}>{s.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Macro drivers */}
          <section style={{ borderBottom: "1px solid #2a2a2a" }}>
            <PanelHead title="Macro Drivers" meta="what to watch" />
            <div>
              {brief.macroDrivers.map((m) => (
                <div
                  key={m.label}
                  className="grid"
                  style={{ gridTemplateColumns: "160px 1fr", padding: "8px 14px", borderBottom: "1px solid #111", gap: 14 }}
                >
                  <span style={{ fontSize: 10.5, color: "#ff2e88", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>{m.label}</span>
                  <span style={{ fontSize: 11.5, color: "#d8d8d8", lineHeight: 1.5 }}>{m.desc}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right column */}
        <div style={{ minWidth: 0 }}>
          <section style={{ borderBottom: "1px solid #2a2a2a" }}>
            <PanelHead title="Watchlist · last close" meta="movers" />
            <div>
              {brief.watchlistMovers.map((w) => (
                <div
                  key={w.ticker}
                  style={{ padding: "8px 12px", borderBottom: "1px solid #111" }}
                >
                  <div className="flex items-baseline" style={{ gap: 6 }}>
                    <TickerLink ticker={w.ticker} market={w.region} size="sm" bold />
                    <span style={{ fontSize: 10, color: "#888" }}>{w.name}</span>
                    <span className="num ml-auto" style={{ fontSize: 11, color: tone(w.change), fontWeight: 600 }}>
                      {w.change >= 0 ? "+" : ""}{w.change.toFixed(2)}%
                    </span>
                  </div>
                  <div style={{ fontSize: 9.5, color: "#666", marginTop: 3, lineHeight: 1.45, fontStyle: "italic" }}>{w.note}</div>
                </div>
              ))}
            </div>
          </section>

          <section style={{ borderBottom: "1px solid #2a2a2a" }}>
            <PanelHead title="Flows · positioning" />
            <div>
              {brief.sidebarFlows.map((f) => (
                <div
                  key={f.label}
                  className="grid items-baseline"
                  style={{ gridTemplateColumns: "1fr auto", height: 26, padding: "0 12px", borderBottom: "1px solid #111", gap: 8 }}
                >
                  <span style={{ fontSize: 10.5, color: "#d8d8d8" }}>{f.label}</span>
                  <span
                    className="num"
                    style={{
                      fontSize: 11,
                      color: f.tone === "pos" ? "#00d97e" : f.tone === "neg" ? "#ff4d4f" : "#d8d8d8",
                      fontWeight: 600,
                    }}
                  >
                    {f.value}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <PanelHead title="Provenance" />
            <div>
              {Object.entries(brief.sourceDetail).map(([k, v]) => (
                <div
                  key={k}
                  className="grid items-baseline"
                  style={{ gridTemplateColumns: "1fr auto", height: 22, padding: "0 12px", borderBottom: "1px solid #111", gap: 8 }}
                >
                  <span style={{ fontSize: 10, color: "#888" }}>{k}</span>
                  <span
                    className="num"
                    style={{
                      fontSize: 9,
                      color: v === "live" ? "#00d97e" : "#7a7a7a",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      fontWeight: 600,
                    }}
                  >
                    {v}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ padding: "10px 14px", fontSize: 10, color: "#7a7a7a", lineHeight: 1.55 }}>
              <p style={{ margin: "0 0 6px" }}>
                Format follows <span style={{ color: "#d8d8d8" }}>Apollo Daily Spark</span> (Torsten Slok) + <span style={{ color: "#d8d8d8" }}>BRI Danareksa Equity Snapshot</span>.
              </p>
              <p style={{ margin: 0, fontStyle: "italic" }}>
                Vercel Cron rebuilds 06:30 WIB + 08:00 EDT. Page revalidate 6h safety net.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
