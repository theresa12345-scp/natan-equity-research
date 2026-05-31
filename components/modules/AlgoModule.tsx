import { CitationCluster } from "@/components/primitives/CitationChip";

interface FactorScore {
  factor: string;
  z: number;
  reading: string;
  tone: "pos" | "neg" | "neutral";
}

interface Overlay {
  label: string;
  value: string;
  tone: "pos" | "neg" | "neutral";
  note: string;
}

interface BacktestStat {
  label: string;
  value: string;
  note?: string;
  tone?: "pos" | "neg" | "neutral";
}

interface EquityPoint {
  yr: string;
  strat: number;
  bench: number;
}

interface AlgoModuleProps {
  factors: FactorScore[];
  composite: number;
  overlays: Overlay[];
  backtest: BacktestStat[];
  equityCurve: EquityPoint[];
  factorFramework?: string;
}

function toneColor(t: "pos" | "neg" | "neutral"): string {
  if (t === "pos") return "#00d97e";
  if (t === "neg") return "#ff4d4f";
  return "#7a7a7a";
}

function SectionHeader({ title, meta }: { title: string; meta?: string }): JSX.Element {
  return (
    <div
      className="flex items-center"
      style={{
        height: 28,
        padding: "0 12px",
        borderBottom: "1px solid #1d1d1d",
        background: "#050505",
        gap: 10,
      }}
    >
      <span
        style={{
          fontSize: 9.5,
          color: "#ff2e88",
          letterSpacing: "0.14em",
          fontWeight: 600,
          textTransform: "uppercase",
        }}
      >
        {title}
      </span>
      {meta ? <span style={{ fontSize: 10, color: "#7a7a7a" }}>{meta}</span> : null}
    </div>
  );
}

function FactorBar({ f }: { f: FactorScore }): JSX.Element {
  const zMax = 3;
  const center = 50; // %
  const halfWidth = 50; // %
  const span = Math.max(-zMax, Math.min(zMax, f.z));
  const widthPct = (Math.abs(span) / zMax) * halfWidth;
  const offsetPct = span >= 0 ? center : center - widthPct;
  const color = toneColor(f.tone);

  return (
    <div
      className="grid items-center"
      style={{
        gridTemplateColumns: "100px 1fr 50px",
        height: 26,
        padding: "0 12px",
        borderBottom: "1px solid #111",
        gap: 8,
      }}
    >
      <span style={{ fontSize: 11, color: "#d8d8d8" }}>{f.factor}</span>
      <div style={{ position: "relative", height: 8, background: "#0a0a0a" }}>
        {/* center axis */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            bottom: 0,
            width: 1,
            background: "#2a2a2a",
          }}
        />
        {/* bar */}
        <div
          style={{
            position: "absolute",
            left: `${offsetPct}%`,
            top: 0,
            bottom: 0,
            width: `${widthPct}%`,
            background: color,
            opacity: 0.85,
          }}
        />
      </div>
      <span
        className="num"
        style={{ fontSize: 11, color, textAlign: "right" }}
      >
        {f.z >= 0 ? "+" : ""}{f.z.toFixed(2)}
      </span>
      <span
        style={{
          gridColumn: "1 / -1",
          fontSize: 9.5,
          color: "#666",
          paddingLeft: 0,
          marginTop: -2,
          letterSpacing: "0.02em",
        }}
      >
        {f.reading}
      </span>
    </div>
  );
}

function EquityCurve({ data }: { data: EquityPoint[] }): JSX.Element {
  const w = 540;
  const h = 200;
  const pad = { l: 36, r: 12, t: 14, b: 22 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const allVals = data.flatMap((d) => [d.strat, d.bench]);
  const min = Math.min(...allVals);
  const max = Math.max(...allVals);
  const xStep = innerW / (data.length - 1);
  const x = (i: number): number => pad.l + i * xStep;
  const y = (v: number): number =>
    pad.t + innerH - ((v - min) / (max - min)) * innerH;
  const ptsStrat = data.map((d, i) => `${x(i)},${y(d.strat)}`).join(" ");
  const ptsBench = data.map((d, i) => `${x(i)},${y(d.bench)}`).join(" ");

  const yTicks = [100, 200, 300, 400, 500].filter((v) => v >= min && v <= max);
  // Approximate path length for stroke-dashoffset draw-in.
  const stratLen = (data.length - 1) * xStep * 1.4;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" role="img" aria-label="12-year equity curve">
      {yTicks.map((v) => (
        <g key={v}>
          <line
            x1={pad.l}
            x2={w - pad.r}
            y1={y(v)}
            y2={y(v)}
            stroke="#1a1a1a"
            strokeDasharray="2 3"
          />
          <text
            x={pad.l - 6}
            y={y(v) + 3}
            textAnchor="end"
            style={{ fontSize: 8.5, fill: "#555", fontFamily: "var(--font-jetbrains)" }}
          >
            {v}
          </text>
        </g>
      ))}
      <polyline
        fill="none"
        stroke="#7a7a7a"
        strokeWidth={1.2}
        points={ptsBench}
        className="mrdn-draw"
        style={{ strokeDasharray: `${stratLen.toFixed(0)} ${stratLen.toFixed(0)}`, strokeDashoffset: stratLen.toFixed(0), animationDuration: "800ms" }}
      />
      <polyline
        fill="none"
        stroke="#ff2e88"
        strokeWidth={1.6}
        points={ptsStrat}
        className="mrdn-draw"
        style={{ strokeDasharray: `${stratLen.toFixed(0)} ${stratLen.toFixed(0)}`, strokeDashoffset: stratLen.toFixed(0), animationDuration: "900ms" }}
      />
      {data.map((d, i) =>
        i % 2 === 0 ? (
          <text
            key={d.yr}
            x={x(i)}
            y={h - 6}
            textAnchor="middle"
            style={{ fontSize: 8.5, fill: "#666", fontFamily: "var(--font-jetbrains)" }}
          >
            {d.yr}
          </text>
        ) : null,
      )}
      {/* legend */}
      <g transform={`translate(${pad.l}, ${pad.t + 4})`}>
        <rect x={0} y={0} width={10} height={2} fill="#ff2e88" />
        <text x={14} y={4} style={{ fontSize: 9, fill: "#d8d8d8", fontFamily: "var(--font-geist-sans)" }}>
          Composite
        </text>
        <rect x={80} y={0} width={10} height={2} fill="#7a7a7a" />
        <text x={94} y={4} style={{ fontSize: 9, fill: "#7a7a7a", fontFamily: "var(--font-geist-sans)" }}>
          IHSG TR
        </text>
      </g>
    </svg>
  );
}

export default function AlgoModule({
  factors,
  composite,
  overlays,
  backtest,
  equityCurve,
  factorFramework = "Fama-French 5 · momentum excluded · Wirjanto 2023",
}: AlgoModuleProps): JSX.Element {
  return (
    <div className="grid" style={{ gridTemplateColumns: "40% 60%", minHeight: 0 }}>
      {/* LEFT */}
      <section style={{ borderRight: "1px solid #2a2a2a", minWidth: 0 }}>
        <SectionHeader title="Factor Z · standardized" meta={factorFramework} />
        {factors.map((f) => (
          <FactorBar key={f.factor} f={f} />
        ))}
        <div
          className="grid items-center"
          style={{
            gridTemplateColumns: "100px 1fr 50px",
            height: 28,
            padding: "0 12px",
            borderTop: "2px solid #ff2e88",
            background: "rgba(255,46,136,0.05)",
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: "#ff2e88",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Composite
          </span>
          <div style={{ position: "relative", height: 10, background: "#0a0a0a" }}>
            <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "#2a2a2a" }} />
            <div
              style={{
                position: "absolute",
                left: composite >= 0 ? "50%" : `${50 - (Math.abs(composite) / 3) * 50}%`,
                top: 0,
                bottom: 0,
                width: `${(Math.abs(composite) / 3) * 50}%`,
                background: "#ff2e88",
              }}
            />
          </div>
          <span className="num" style={{ fontSize: 12, color: "#ff2e88", textAlign: "right", fontWeight: 700 }}>
            {composite >= 0 ? "+" : ""}{composite.toFixed(2)}
          </span>
        </div>

        <SectionHeader title="Overlay Signals" />
        {overlays.map((o) => (
          <div
            key={o.label}
            style={{
              padding: "8px 12px",
              borderBottom: "1px solid #111",
            }}
          >
            <div className="flex items-baseline" style={{ gap: 6 }}>
              <span style={{ fontSize: 10.5, color: "#d8d8d8" }}>{o.label}</span>
              <span
                className="num ml-auto"
                style={{ fontSize: 11, color: toneColor(o.tone), fontWeight: 600 }}
              >
                {o.value}
              </span>
            </div>
            <div style={{ fontSize: 9.5, color: "#666", marginTop: 3 }}>{o.note}</div>
          </div>
        ))}
      </section>

      {/* RIGHT */}
      <section style={{ minWidth: 0 }}>
        <SectionHeader title="CPCV Backtest · 2014–2025" meta="paper-tested · DSR-corrected" />
        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            borderBottom: "1px solid #2a2a2a",
          }}
        >
          {backtest.map((s, i) => (
            <div
              key={s.label}
              style={{
                padding: "10px 12px",
                borderRight: i % 3 === 2 ? "none" : "1px solid #1d1d1d",
                borderBottom: i < 3 ? "1px solid #1d1d1d" : "none",
              }}
            >
              <div
                style={{
                  fontSize: 8.5,
                  color: "#666",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {s.label}
              </div>
              <div
                className="num"
                style={{
                  fontSize: 16,
                  color: s.tone ? toneColor(s.tone) : "#f5f5f5",
                  marginTop: 4,
                  letterSpacing: "-0.01em",
                }}
              >
                {s.value}
              </div>
              {s.note ? (
                <div style={{ fontSize: 9, color: "#666", marginTop: 3 }}>{s.note}</div>
              ) : null}
            </div>
          ))}
        </div>

        <SectionHeader title="Equity Curve · vs benchmark" />
        <div style={{ padding: "12px" }}>
          <EquityCurve data={equityCurve} />
        </div>
        <div style={{ padding: "10px 12px", borderTop: "1px solid #1d1d1d", background: "#050505" }}>
          <CitationCluster
            label="founded on"
            ids={
              factorFramework.includes("momentum excluded") || factorFramework.includes("Li")
                ? ["fama-french-2015", "li-wei-zhang-2023", "lopez-de-prado-2018", "bailey-lopez-de-prado-2014"]
                : ["fama-french-2015", "carhart-1997", "novy-marx-2013", "lopez-de-prado-2018", "bailey-lopez-de-prado-2014"]
            }
          />
        </div>
      </section>
    </div>
  );
}
