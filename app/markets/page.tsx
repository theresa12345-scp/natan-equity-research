import Link from "next/link";
import {
  IHSG_COMPONENTS,
  SECTOR_HEATMAP,
  MACRO_PANEL,
  FOREIGN_FLOW,
  INDEX_STRIP,
  TOP_GAINERS,
  TOP_LOSERS,
  US_OVERNIGHT,
  ASIA_OPEN,
  COMMODITIES,
  BREADTH,
  FOREIGN_CUM_10D,
  type MoverRow,
  type CrossAssetRow,
} from "@/lib/mock-markets";
import TickerLink from "@/components/primitives/TickerLink";
import Tooltip from "@/components/primitives/Tooltip";

function tone(v: number): string {
  if (v > 0) return "#00d97e";
  if (v < 0) return "#ff4d4f";
  return "#7a7a7a";
}

function heatBg(v: number): string {
  if (v > 3) return "#005a30";
  if (v > 1) return "#0f3d20";
  if (v > 0) return "#0a2818";
  if (v > -1) return "#2a1313";
  if (v > -3) return "#4a1818";
  return "#6a1a1a";
}

function PanelHead({ title, meta }: { title: string; meta?: string }): JSX.Element {
  return (
    <div
      className="flex items-center"
      style={{
        height: 24,
        padding: "0 10px",
        borderBottom: "1px solid #1d1d1d",
        background: "#050505",
        gap: 8,
      }}
    >
      <span
        style={{
          fontSize: 9,
          color: "#ff2e88",
          letterSpacing: "0.14em",
          fontWeight: 600,
          textTransform: "uppercase",
        }}
      >
        {title}
      </span>
      {meta ? (
        <span style={{ fontSize: 9.5, color: "#7a7a7a" }}>{meta}</span>
      ) : null}
    </div>
  );
}

// Tiny inline sparkline — minimal SVG path
function Spark({
  values,
  width = 56,
  height = 18,
  color = "#ff2e88",
}: {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
}): JSX.Element {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = width / (values.length - 1);
  const path = values
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * height;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height} style={{ overflow: "visible", display: "block" }}>
      <path d={path} fill="none" stroke={color} strokeWidth={1.2} />
    </svg>
  );
}

function tone3(t: CrossAssetRow["tone"] | undefined): string {
  if (t === "pos") return "#00d97e";
  if (t === "neg") return "#ff4d4f";
  return "#7a7a7a";
}

function SectionHeader({
  num,
  title,
  meta,
}: {
  num: string;
  title: string;
  meta?: string;
}): JSX.Element {
  return (
    <div
      className="flex items-baseline"
      style={{ padding: "12px 14px 8px", borderBottom: "1px solid #2a2a2a", gap: 12 }}
    >
      <span
        className="num"
        style={{ fontSize: 9, color: "#ff2e88", letterSpacing: "0.08em", fontWeight: 600 }}
      >
        {num}
      </span>
      <h1
        style={{
          fontSize: 22,
          color: "#f5f5f5",
          fontWeight: 500,
          margin: 0,
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h1>
      {meta ? (
        <span style={{ fontSize: 11, color: "#7a7a7a", marginLeft: 8 }}>{meta}</span>
      ) : null}
    </div>
  );
}

// ──────────── INDEX STRIP ────────────
function IndexStrip(): JSX.Element {
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${INDEX_STRIP.length}, minmax(0, 1fr))`,
        borderBottom: "1px solid #2a2a2a",
      }}
    >
      {INDEX_STRIP.map((idx, i) => (
        <div
          key={idx.label}
          style={{
            padding: "10px 12px",
            borderRight: i < INDEX_STRIP.length - 1 ? "1px solid #1d1d1d" : "none",
            minWidth: 0,
          }}
        >
          <div
            className="flex items-baseline"
            style={{ gap: 6, marginBottom: 6 }}
          >
            <span
              style={{
                fontSize: 9,
                color: "#7a7a7a",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {idx.label}
            </span>
            <span
              className="num ml-auto"
              style={{ fontSize: 10, color: tone(idx.delta) }}
            >
              {idx.delta >= 0 ? "+" : ""}
              {idx.delta.toFixed(2)}%
            </span>
          </div>
          <div
            className="flex items-end"
            style={{ gap: 8, justifyContent: "space-between" }}
          >
            <span
              className="num"
              style={{ fontSize: 14, color: "#f5f5f5", letterSpacing: "-0.01em" }}
            >
              {idx.value}
            </span>
            <Spark
              values={idx.spark}
              color={tone(idx.delta)}
              width={50}
              height={16}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ──────────── SECTOR HEATMAP — denser ────────────
function HeatmapDense(): JSX.Element {
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        padding: 8,
        gap: 4,
      }}
    >
      {SECTOR_HEATMAP.map((s) => (
        <Link
          key={s.sector}
          href={`/screener?sector=${encodeURIComponent(s.sector)}`}
          className="hover:brightness-110"
          style={{
            display: "block",
            background: heatBg(s.perf5d),
            padding: "8px 10px",
            border: "1px solid #000",
            color: "inherit",
            cursor: "pointer",
            minHeight: 52,
          }}
        >
          <div
            style={{
              fontSize: 9.5,
              color: "#d8d8d8",
              letterSpacing: "0.04em",
              marginBottom: 3,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {s.sector}
          </div>
          <div className="flex items-baseline" style={{ gap: 6 }}>
            <span
              className="num"
              style={{
                fontSize: 13,
                color: "#f5f5f5",
                fontWeight: 500,
                letterSpacing: "-0.01em",
              }}
            >
              {s.perf5d >= 0 ? "+" : ""}
              {s.perf5d.toFixed(2)}%
            </span>
            <span
              className="num ml-auto"
              style={{ fontSize: 9, color: "#888" }}
            >
              {s.wt.toFixed(1)}%
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

// ──────────── TOP MOVERS table ────────────
function MoversTable({
  rows,
  isLoser,
}: {
  rows: MoverRow[];
  isLoser: boolean;
}): JSX.Element {
  const color = isLoser ? "#ff4d4f" : "#00d97e";
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10.5 }}>
      <thead>
        <tr style={{ background: "#050505" }}>
          {["TKR", "EMITEN", "PERF", "VOL", ""].map((h, i) => (
            <th
              key={h}
              style={{
                padding: "4px 8px",
                textAlign: i < 2 ? "left" : "right",
                fontSize: 8.5,
                color: "#555",
                letterSpacing: "0.1em",
                fontWeight: 500,
                borderBottom: "1px solid #1d1d1d",
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr
            key={r.ticker}
            style={{ height: 22, background: i % 2 === 0 ? "#0d0d0d" : "#0a0a0a" }}
          >
            <td style={{ padding: "0 8px" }}>
              <TickerLink ticker={r.ticker} market="IDX" size="sm" />
            </td>
            <td
              style={{
                padding: "0 8px",
                color: "#d8d8d8",
                fontSize: 10,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 0,
              }}
            >
              {r.name}
            </td>
            <td
              className="num"
              style={{
                padding: "0 8px",
                textAlign: "right",
                color,
                fontWeight: 600,
              }}
            >
              {r.perf >= 0 ? "+" : ""}
              {r.perf.toFixed(2)}%
            </td>
            <td
              className="num"
              style={{ padding: "0 8px", textAlign: "right", color: "#7a7a7a", fontSize: 9.5 }}
            >
              {r.vol}
            </td>
            <td style={{ padding: "0 8px", textAlign: "right" }}>
              <Spark values={r.spark} color={color} width={40} height={14} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ──────────── FOREIGN FLOW with 10d cumulative line ────────────
function ForeignFlowPanel(): JSX.Element {
  // Cumulative line chart (10-day)
  const cum = FOREIGN_CUM_10D;
  const min = Math.min(...cum);
  const max = Math.max(...cum);
  const range = max - min || 1;
  const w = 280;
  const h = 80;
  const pad = { l: 24, r: 8, t: 8, b: 18 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const step = innerW / (cum.length - 1);
  const path = cum
    .map((v, i) => {
      const x = pad.l + i * step;
      const y = pad.t + innerH - ((v - min) / range) * innerH;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const zeroY = pad.t + innerH - ((0 - min) / range) * innerH;
  const lastV = cum[cum.length - 1];

  return (
    <div>
      {/* Mini chart */}
      <div style={{ padding: "8px 12px", borderBottom: "1px solid #1d1d1d" }}>
        <div
          className="flex items-baseline"
          style={{ justifyContent: "space-between", marginBottom: 4 }}
        >
          <span
            style={{
              fontSize: 8.5,
              color: "#666",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            10D cumulative · IDR miliar
          </span>
          <span
            className="num"
            style={{ fontSize: 14, color: tone(lastV), fontWeight: 600 }}
          >
            {lastV >= 0 ? "+" : ""}
            {lastV}
          </span>
        </div>
        <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ display: "block" }}>
          <line
            x1={pad.l}
            x2={w - pad.r}
            y1={zeroY}
            y2={zeroY}
            stroke="#2a2a2a"
            strokeDasharray="2 3"
          />
          <text
            x={pad.l - 4}
            y={zeroY + 3}
            textAnchor="end"
            style={{ fontSize: 8, fill: "#555", fontFamily: "var(--font-jetbrains)" }}
          >
            0
          </text>
          <path d={path} fill="none" stroke="#ff2e88" strokeWidth={1.5} />
        </svg>
      </div>

      {/* Daily detail table */}
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10.5 }}>
        <thead>
          <tr style={{ background: "#050505" }}>
            {["DAY", "BUY", "SELL", "NET"].map((h, i) => (
              <th
                key={h}
                style={{
                  padding: "4px 10px",
                  textAlign: i === 0 ? "left" : "right",
                  fontSize: 8.5,
                  color: "#555",
                  letterSpacing: "0.1em",
                  fontWeight: 500,
                  borderBottom: "1px solid #1d1d1d",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {FOREIGN_FLOW.map((f, i) => (
            <tr
              key={f.day}
              style={{ height: 20, background: i % 2 === 0 ? "#0d0d0d" : "#0a0a0a" }}
            >
              <td className="num" style={{ padding: "0 10px", color: "#7a7a7a" }}>
                {f.day}
              </td>
              <td
                className="num"
                style={{ padding: "0 10px", textAlign: "right", color: "#00d97e" }}
              >
                {f.buy.toLocaleString()}
              </td>
              <td
                className="num"
                style={{ padding: "0 10px", textAlign: "right", color: "#ff4d4f" }}
              >
                {f.sell.toLocaleString()}
              </td>
              <td
                className="num"
                style={{
                  padding: "0 10px",
                  textAlign: "right",
                  color: tone(f.net),
                  fontWeight: 600,
                }}
              >
                {f.net >= 0 ? "+" : ""}
                {f.net}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ──────────── CROSS-ASSET (US + Asia) ────────────
function CrossAssetGroup({
  title,
  meta,
  rows,
}: {
  title: string;
  meta: string;
  rows: CrossAssetRow[];
}): JSX.Element {
  return (
    <div>
      <div
        className="flex items-center"
        style={{
          height: 22,
          padding: "0 10px",
          borderBottom: "1px solid #111",
          background: "#080808",
          gap: 8,
        }}
      >
        <span
          style={{
            fontSize: 9,
            color: "#ff2e88",
            letterSpacing: "0.1em",
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          {title}
        </span>
        <span
          style={{ fontSize: 9, color: "#666", letterSpacing: "0.04em" }}
        >
          {meta}
        </span>
      </div>
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {rows.map((r, i) => (
          <div
            key={r.label}
            className="flex items-baseline"
            style={{
              gridColumn: "auto",
              height: 22,
              padding: "0 10px",
              borderBottom: "1px solid #111",
              borderRight: i % 2 === 0 ? "1px solid #111" : "none",
              gap: 8,
            }}
          >
            <span
              style={{
                fontSize: 9.5,
                color: "#888",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                minWidth: 70,
              }}
            >
              {r.label}
            </span>
            <span
              className="num"
              style={{ fontSize: 11, color: "#f5f5f5", letterSpacing: "-0.01em" }}
            >
              {r.value}
            </span>
            <span
              className="num ml-auto"
              style={{ fontSize: 10, color: tone3(r.tone) }}
            >
              {r.delta}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────── KV column (Macro / Commodities / Breadth) ────────────
function KVColumn({
  rows,
}: {
  rows: { label: string; value: string; sub?: string; delta?: string; tone?: "pos" | "neg" | "neutral" }[];
}): JSX.Element {
  return (
    <div>
      {rows.map((r) => (
        <div
          key={r.label}
          className="grid items-baseline"
          style={{
            gridTemplateColumns: "100px 1fr auto",
            padding: "0 12px",
            height: 24,
            borderBottom: "1px solid #111",
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 9.5,
              color: "#666",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {r.label}
          </span>
          <span
            className="num"
            style={{ fontSize: 12, color: "#f5f5f5", letterSpacing: "-0.01em" }}
          >
            {r.value}
          </span>
          <span
            className="num"
            style={{ fontSize: 9.5, color: tone3(r.tone), textAlign: "right" }}
          >
            {r.delta ?? r.sub ?? ""}
          </span>
        </div>
      ))}
    </div>
  );
}

// Sector tooltip detail
const SECTOR_DETAIL: Record<string, { contrib: string[]; detract: string[]; flow: string }> = {
  Financials:    { contrib: ["BBCA +1.32%", "BMRI +0.98%", "BBNI +0.84%"], detract: ["BBRI −0.53%", "BNGA −1.21%"], flow: "+184 mrd 5d" },
  "Cons Staples":{ contrib: ["MYOR +0.18%", "ICBP +0.39%"],                 detract: ["UNVR −0.78%"],                flow: "+24 mrd 5d" },
  "Basic Mats":  { contrib: ["AMMN +2.43%", "ANTM +0.42%"],                 detract: ["INTP −0.42%"],                flow: "+62 mrd 5d" },
  Industrials:   { contrib: ["UNTR +0.84%", "WIKA +1.21%"],                 detract: ["ASII +0.49%", "WSKT −2.41%"], flow: "−18 mrd 5d" },
  Energy:        { contrib: ["BREN +4.81%", "PGAS +1.84%"],                 detract: ["ADRO −0.42%"],                flow: "+248 mrd 5d" },
  "Comm Svcs":   { contrib: ["EXCL +1.84%"],                                 detract: ["TLKM −1.21%"],                flow: "−42 mrd 5d" },
};

// ──────────── PAGE ────────────
export default function MarketsPage(): JSX.Element {
  return (
    <div>
      <SectionHeader
        num="01"
        title="Markets · IDX Overview"
        meta="JKT · session II · 14:23 WIB · daily snapshot"
      />

      {/* ROW 1 · Index strip */}
      <IndexStrip />

      {/* ROW 2 · Sector heatmap (5 wide) + Movers (2 wide) */}
      <div
        className="grid"
        style={{ gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid #2a2a2a" }}
      >
        <section style={{ borderRight: "1px solid #2a2a2a" }}>
          <PanelHead title="Sector Heatmap · 5D" meta="IDX-IC · click → screener" />
          <HeatmapDense />
        </section>

        <section>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div style={{ borderRight: "1px solid #1d1d1d" }}>
              <PanelHead title="Top Gainers · 1D" meta="LQ45" />
              <MoversTable rows={TOP_GAINERS} isLoser={false} />
            </div>
            <div>
              <PanelHead title="Top Losers · 1D" meta="LQ45" />
              <MoversTable rows={TOP_LOSERS} isLoser />
            </div>
          </div>
        </section>
      </div>

      {/* ROW 3 · Foreign flow + Cross-asset */}
      <div
        className="grid"
        style={{ gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid #2a2a2a" }}
      >
        <section style={{ borderRight: "1px solid #2a2a2a" }}>
          <PanelHead title="Foreign Flow · LQ45" meta="IDR miliar · cumulative + daily" />
          <ForeignFlowPanel />
        </section>

        <section>
          <PanelHead title="Cross-Asset · overnight" meta="last close → Asia open" />
          <CrossAssetGroup title="US close" meta="prev session" rows={US_OVERNIGHT} />
          <CrossAssetGroup title="Asia open" meta="today" rows={ASIA_OPEN} />
        </section>
      </div>

      {/* ROW 4 · Macro / Commodities / Breadth */}
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
        <section style={{ borderRight: "1px solid #2a2a2a" }}>
          <PanelHead title="ID Macro" meta="real-time" />
          <KVColumn rows={MACRO_PANEL.slice(0, 7)} />
        </section>
        <section style={{ borderRight: "1px solid #2a2a2a" }}>
          <PanelHead title="Commodities" meta="ID-relevant + global" />
          <KVColumn rows={COMMODITIES} />
        </section>
        <section>
          <PanelHead title="Breadth · Turnover" meta="IDX · daily" />
          <KVColumn rows={BREADTH} />
        </section>
      </div>

      {/* ROW 5 · IHSG top 10 (compact) */}
      <section style={{ borderTop: "1px solid #2a2a2a" }}>
        <PanelHead title="IHSG Composition · Top 10" meta="weighted by market cap" />
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {IHSG_COMPONENTS.slice(0, 5).map((c, i) => (
            <div
              key={c.ticker}
              className="grid items-center"
              style={{
                gridTemplateColumns: "70px 1fr 60px 60px",
                height: 22,
                padding: "0 12px",
                borderBottom: "1px solid #111",
                borderRight: "1px solid #1d1d1d",
                gap: 8,
              }}
            >
              <TickerLink ticker={c.ticker} market="IDX" size="sm" />
              <div style={{ height: 4, background: "#1a1a1a", position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: `${(c.wt / 10) * 100}%`,
                    background: "#ff2e88",
                    opacity: 0.75,
                  }}
                />
              </div>
              <span
                className="num"
                style={{ fontSize: 10, color: "#d8d8d8", textAlign: "right" }}
              >
                {c.wt.toFixed(2)}%
              </span>
              <span
                className="num"
                style={{
                  fontSize: 10,
                  color: tone(c.perf5d),
                  textAlign: "right",
                }}
              >
                {c.perf5d >= 0 ? "+" : ""}
                {c.perf5d.toFixed(2)}%
              </span>
            </div>
          ))}
          {IHSG_COMPONENTS.slice(5, 10).map((c, i) => (
            <div
              key={c.ticker}
              className="grid items-center"
              style={{
                gridTemplateColumns: "70px 1fr 60px 60px",
                height: 22,
                padding: "0 12px",
                borderBottom: "1px solid #111",
                gap: 8,
              }}
            >
              <TickerLink ticker={c.ticker} market="IDX" size="sm" />
              <div style={{ height: 4, background: "#1a1a1a", position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: `${(c.wt / 10) * 100}%`,
                    background: "#ff2e88",
                    opacity: 0.75,
                  }}
                />
              </div>
              <span
                className="num"
                style={{ fontSize: 10, color: "#d8d8d8", textAlign: "right" }}
              >
                {c.wt.toFixed(2)}%
              </span>
              <span
                className="num"
                style={{
                  fontSize: 10,
                  color: tone(c.perf5d),
                  textAlign: "right",
                }}
              >
                {c.perf5d >= 0 ? "+" : ""}
                {c.perf5d.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
