import TickerLink from "@/components/primitives/TickerLink";
import {
  buildIdxScoreSheet,
  buildModelPortfolio,
  type ModelHolding,
  type ModelPortfolio,
  type SectorAllocation,
} from "@/lib/portfolio/engine";
import { IDX_DEFAULT_POLICY } from "@/lib/portfolio/policy";

export const revalidate = 3600;

// ---------------- formatters ----------------

function fmtPct(n: number, digits = 2): string {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(digits)}%`;
}
function fmtBps(n: number): string {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n}bps`;
}
function fmtPrice(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}
function tone(n: number): string {
  if (n > 0) return "#00d97e";
  if (n < 0) return "#ff4d4f";
  return "#b8b8b8";
}
function signalColor(s: ModelHolding["rebalanceSignal"]): string {
  if (s === "ADD") return "#00d97e";
  if (s === "TRIM") return "#ff4d4f";
  return "#7a7a7a";
}

// Deterministic palette — magenta only for the largest sector.
const PALETTE = [
  "#ff2e88", "#5ec4e0", "#007a47", "#c4831f",
  "#9a2a2c", "#b8b8b8", "#7a7a7a", "#555555",
];

// ---------------- header ----------------

function PortfolioHeader({ model }: { model: ModelPortfolio }): JSX.Element {
  return (
    <div
      className="flex items-center"
      style={{
        padding: "14px 14px",
        borderBottom: "1px solid #2a2a2a",
        gap: 14,
        flexWrap: "wrap",
      }}
    >
      <span className="num" style={{ fontSize: 9, color: "#ff2e88", letterSpacing: "0.08em", fontWeight: 600 }}>02</span>
      <h1 style={{ fontSize: 22, color: "#f5f5f5", fontWeight: 500, letterSpacing: "-0.01em", margin: 0, lineHeight: 1 }}>
        Model Portfolio
      </h1>
      <span style={{ color: "#333", fontSize: 12 }}>·</span>
      <span style={{ fontSize: 11.5, color: "#b8b8b8" }}>{model.policy.name}</span>
      <span
        className="num"
        style={{
          fontSize: 9,
          color: "#ff2e88",
          border: "1px solid #ff2e88",
          padding: "1px 6px",
          letterSpacing: "0.08em",
          marginLeft: 4,
        }}
      >
        SCORE-DRIVEN
      </span>

      <div className="ml-auto flex items-center num" style={{ gap: 16, fontSize: 10, letterSpacing: "0.08em" }}>
        <span style={{ color: "#7a7a7a" }}>BENCHMARK <span style={{ color: "#d8d8d8", marginLeft: 4 }}>{model.policy.benchmark}</span></span>
        <span style={{ color: "#7a7a7a" }}>LAST REBAL <span style={{ color: "#d8d8d8", marginLeft: 4 }}>{model.lastRebalance}</span></span>
        <span style={{ color: "#7a7a7a" }}>NEXT REBAL <span style={{ color: "#ff2e88", marginLeft: 4 }}>{model.nextRebalance}</span></span>
        <span style={{ color: "#7a7a7a" }}>NAMES <span style={{ color: "#d8d8d8", marginLeft: 4 }}>{model.totalNamesHeld} / {model.totalNamesEligible}</span></span>
      </div>
    </div>
  );
}

// ---------------- KPI strip (now derived) ----------------

function KpiStrip({ model }: { model: ModelPortfolio }): JSX.Element {
  const sleeve = 100 - model.cashPct;
  const trims = model.holdings.filter((h) => h.rebalanceSignal === "TRIM").length;
  const adds = model.holdings.filter((h) => h.rebalanceSignal === "ADD").length;
  const cells: Array<{ label: string; value: string; sub: string; valTone?: "pos" | "neg" | "mag" }> = [
    {
      label: "NOTIONAL TRACKING · IDR",
      value: "Rp 412.47 mrd",
      sub: `${sleeve.toFixed(1)}% deployed · ${model.cashPct.toFixed(1)}% cash buffer`,
    },
    {
      label: "WEIGHTED Z-SCORE",
      value: `${model.weightedZ >= 0 ? "+" : ""}${model.weightedZ.toFixed(2)}σ`,
      valTone: "mag",
      sub: `vs benchmark Z = 0.00 by construction`,
    },
    {
      label: "PORTFOLIO β · VOL",
      value: `${model.portfolioBeta.toFixed(2)} · ${(model.portfolioVol * 100).toFixed(1)}%`,
      sub: `CAPM proxy · σ via β + sector idio`,
    },
    {
      label: "REBALANCE SIGNAL",
      value: `${adds} ADD · ${trims} TRIM`,
      valTone: trims + adds > 0 ? "mag" : undefined,
      sub: `drift band ±200bps from target`,
    },
    {
      label: "POLICY CAPS",
      value: `${model.policy.nameCapPct}% name · ${model.policy.sectorCapPct}% sector`,
      sub: `top-${model.policy.topN} by composite · min score ${model.policy.minScore}`,
    },
  ];

  return (
    <div
      className="grid"
      style={{ gridTemplateColumns: "repeat(5, minmax(0, 1fr))", borderBottom: "1px solid #2a2a2a" }}
    >
      {cells.map((k, i) => {
        const color = k.valTone === "pos" ? "#00d97e" : k.valTone === "neg" ? "#ff4d4f" : k.valTone === "mag" ? "#ff2e88" : "#f5f5f5";
        return (
          <div
            key={k.label}
            style={{
              padding: 14,
              borderRight: i === cells.length - 1 ? "none" : "1px solid #1d1d1d",
              minWidth: 0,
            }}
          >
            <div style={{ fontSize: 8.5, color: "#666", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
              {k.label}
            </div>
            <div
              className="num"
              style={{
                fontSize: 18,
                color,
                fontWeight: 500,
                letterSpacing: "-0.01em",
                lineHeight: 1.1,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {k.value}
            </div>
            <div className="num" style={{ marginTop: 6, fontSize: 10, color: "#888", lineHeight: 1.35 }}>
              {k.sub}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------- sub-header ----------------

function SubHeader({ title, meta, right }: { title: string; meta?: string; right?: React.ReactNode }): JSX.Element {
  return (
    <div
      className="flex items-center"
      style={{ height: 28, padding: "0 12px", borderBottom: "1px solid #1d1d1d", background: "#050505", gap: 12 }}
    >
      <span style={{ fontSize: 9.5, color: "#ff2e88", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600 }}>
        {title}
      </span>
      {meta ? <span style={{ fontSize: 10, color: "#7a7a7a" }}>{meta}</span> : null}
      {right ? <div className="ml-auto flex items-center" style={{ gap: 6 }}>{right}</div> : null}
    </div>
  );
}

// ---------------- holdings table (score-driven) ----------------

const COL_HEADERS: Array<{ label: string; align: "left" | "right"; width?: string }> = [
  { label: "KODE", align: "left", width: "58px" },
  { label: "EMITEN", align: "left", width: "160px" },
  { label: "SCORE", align: "right", width: "56px" },
  { label: "Z", align: "right", width: "54px" },
  { label: "TGT WT %", align: "right", width: "70px" },
  { label: "CUR WT %", align: "right", width: "70px" },
  { label: "DRIFT", align: "right", width: "68px" },
  { label: "SIG", align: "left", width: "48px" },
  { label: "σ ANN", align: "right", width: "60px" },
  { label: "β", align: "right", width: "50px" },
  { label: "LAST", align: "right", width: "68px" },
  { label: "YTD", align: "right", width: "60px" },
  { label: "SECTOR", align: "left", width: "108px" },
];

function HoldingsTable({ holdings }: { holdings: ModelHolding[] }): JSX.Element {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
        <colgroup>
          {COL_HEADERS.map((c, i) => (
            <col key={i} style={c.width ? { width: c.width } : undefined} />
          ))}
        </colgroup>
        <thead>
          <tr style={{ background: "#050505", borderBottom: "1px solid #1d1d1d" }}>
            {COL_HEADERS.map((c) => (
              <th
                key={c.label}
                style={{
                  padding: "6px 8px",
                  textAlign: c.align,
                  fontSize: 9,
                  color: "#555",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                }}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {holdings.map((row, i) => (
            <tr key={row.ticker} className="hover:bg-[#1a1a1a]" style={{ background: i % 2 === 0 ? "#0d0d0d" : "#0a0a0a", height: 22 }}>
              <td style={{ padding: "0 8px" }}>
                <TickerLink ticker={row.ticker} market="IDX" />
              </td>
              <td style={{ padding: "0 8px", color: "#d8d8d8", fontSize: 11, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {row.name}
              </td>
              <td className="num" style={{ padding: "0 8px", textAlign: "right", color: row.score >= 75 ? "#ff2e88" : "#d8d8d8", fontSize: 11, fontWeight: row.score >= 75 ? 600 : 400 }}>
                {row.score.toFixed(0)}
              </td>
              <td className="num" style={{ padding: "0 8px", textAlign: "right", color: tone(row.compositeZ), fontSize: 11 }}>
                {row.compositeZ >= 0 ? "+" : ""}{row.compositeZ.toFixed(2)}
              </td>
              <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#f5f5f5", fontSize: 11, fontWeight: 500 }}>
                {row.targetWtPct.toFixed(2)}
              </td>
              <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#b8b8b8", fontSize: 11 }}>
                {row.currentWtPct.toFixed(2)}
              </td>
              <td className="num" style={{ padding: "0 8px", textAlign: "right", color: tone(row.driftBps), fontSize: 11 }}>
                {fmtBps(row.driftBps)}
              </td>
              <td style={{ padding: "0 8px", color: signalColor(row.rebalanceSignal), fontSize: 10, fontWeight: 600, letterSpacing: "0.04em" }}>
                {row.rebalanceSignal === "HOLD" ? "—" : row.rebalanceSignal}
              </td>
              <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#b8b8b8", fontSize: 11 }}>
                {(row.annualVol * 100).toFixed(1)}%
              </td>
              <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#b8b8b8", fontSize: 11 }}>
                {row.beta != null ? row.beta.toFixed(2) : "—"}
              </td>
              <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#f5f5f5", fontSize: 11 }}>
                {fmtPrice(row.price)}
              </td>
              <td className="num" style={{ padding: "0 8px", textAlign: "right", color: tone(row.ytdReturn ?? 0), fontSize: 11 }}>
                {row.ytdReturn != null ? fmtPct(row.ytdReturn, 1) : "—"}
              </td>
              <td style={{ padding: "0 8px", color: "#b8b8b8", fontSize: 10.5, whiteSpace: "nowrap" }}>
                {row.sector}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HoldingsPanel({ model }: { model: ModelPortfolio }): JSX.Element {
  return (
    <section style={{ borderRight: "1px solid #2a2a2a", minWidth: 0, overflow: "hidden" }}>
      <SubHeader
        title={`HOLDINGS · MODEL SLEEVE (${model.holdings.length})`}
        meta="weights derived from composite Z × inverse-vol · sorted by target weight ▾"
      />
      <HoldingsTable holdings={model.holdings} />
    </section>
  );
}

// ---------------- donut ----------------

function Donut({ segments }: { segments: SectorAllocation[] }): JSX.Element {
  const radius = 90;
  const circ = 2 * Math.PI * radius;
  let cum = 0;
  const sum = segments.reduce((s, x) => s + x.pct, 0) || 1;

  return (
    <svg width={240} height={240} viewBox="-120 -120 240 240" role="img" aria-label="Sector allocation">
      <g transform="rotate(-90)">
        {segments.map((seg, i) => {
          const portion = seg.pct / sum;
          const len = portion * circ;
          const dash = Math.max(0, len - 1);
          const offset = -cum;
          cum += len;
          const color = PALETTE[i] ?? "#555";
          return (
            <circle
              key={seg.name}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={40}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={offset}
            />
          );
        })}
      </g>
      <text x={0} y={-4} textAnchor="middle" style={{ fontSize: 9, fill: "#7a7a7a", letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: "var(--font-geist-sans, system-ui), sans-serif" }}>
        SECTORS
      </text>
      <text x={0} y={22} textAnchor="middle" style={{ fontSize: 28, fill: "#f5f5f5", fontWeight: 600, fontFamily: "var(--font-jetbrains, ui-monospace), monospace", letterSpacing: "-0.02em" }}>
        {segments.length}
      </text>
    </svg>
  );
}

function Legend({ segments, cap }: { segments: SectorAllocation[]; cap: number }): JSX.Element {
  function row(s: SectorAllocation, i: number): JSX.Element {
    const color = PALETTE[i] ?? "#555";
    const atCap = s.pct >= cap - 0.5;
    return (
      <div
        key={s.name}
        className="grid items-center"
        style={{ gridTemplateColumns: "10px 1fr auto auto", gap: 8, padding: "3px 0", fontSize: 11 }}
      >
        <span aria-hidden="true" style={{ width: 8, height: 8, background: color, display: "inline-block" }} />
        <span style={{ color: "#d8d8d8" }}>{s.name}</span>
        {atCap ? (
          <span className="num" style={{ color: "#ffa940", fontSize: 9, letterSpacing: "0.06em" }}>
            CAP
          </span>
        ) : <span />}
        <span className="num" style={{ color: "#f5f5f5", textAlign: "right" }}>{s.pct.toFixed(1)}%</span>
      </div>
    );
  }

  const mid = Math.ceil(segments.length / 2);
  return (
    <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 16, padding: "0 16px 12px" }}>
      <div>{segments.slice(0, mid).map(row)}</div>
      <div>{segments.slice(mid).map((s, i) => row(s, i + mid))}</div>
    </div>
  );
}

// ---------------- rebalance signals panel ----------------

function RebalanceCard({ model }: { model: ModelPortfolio }): JSX.Element {
  const adds = model.holdings.filter((h) => h.rebalanceSignal === "ADD").slice(0, 5);
  const trims = model.holdings.filter((h) => h.rebalanceSignal === "TRIM").slice(0, 5);

  if (adds.length === 0 && trims.length === 0) {
    return (
      <div style={{ padding: "12px 16px", fontSize: 11, color: "#7a7a7a", fontStyle: "italic" }}>
        No drift exceeds ±200bps band. Portfolio in policy compliance.
      </div>
    );
  }
  return (
    <div>
      {adds.length > 0 ? (
        <div>
          <div style={{ padding: "6px 12px", background: "#050505", borderBottom: "1px solid #1d1d1d", fontSize: 9, color: "#00d97e", letterSpacing: "0.14em", fontWeight: 600, textTransform: "uppercase" }}>
            ADD · underweight vs target
          </div>
          {adds.map((h, i) => (
            <div
              key={h.ticker}
              className="grid items-center"
              style={{ gridTemplateColumns: "60px 1fr 70px 70px 60px", height: 24, padding: "0 12px", borderBottom: "1px solid #111", background: i % 2 === 0 ? "#0d0d0d" : "#0a0a0a", fontSize: 10.5, gap: 6 }}
            >
              <TickerLink ticker={h.ticker} market="IDX" size="sm" />
              <span style={{ color: "#d8d8d8" }}>{h.name}</span>
              <span className="num" style={{ color: "#888", textAlign: "right" }}>tgt {h.targetWtPct.toFixed(2)}%</span>
              <span className="num" style={{ color: "#888", textAlign: "right" }}>cur {h.currentWtPct.toFixed(2)}%</span>
              <span className="num" style={{ color: "#00d97e", textAlign: "right", fontWeight: 600 }}>{fmtBps(h.driftBps)}</span>
            </div>
          ))}
        </div>
      ) : null}
      {trims.length > 0 ? (
        <div>
          <div style={{ padding: "6px 12px", background: "#050505", borderTop: "1px solid #2a2a2a", borderBottom: "1px solid #1d1d1d", fontSize: 9, color: "#ff4d4f", letterSpacing: "0.14em", fontWeight: 600, textTransform: "uppercase" }}>
            TRIM · overweight vs target
          </div>
          {trims.map((h, i) => (
            <div
              key={h.ticker}
              className="grid items-center"
              style={{ gridTemplateColumns: "60px 1fr 70px 70px 60px", height: 24, padding: "0 12px", borderBottom: "1px solid #111", background: i % 2 === 0 ? "#0d0d0d" : "#0a0a0a", fontSize: 10.5, gap: 6 }}
            >
              <TickerLink ticker={h.ticker} market="IDX" size="sm" />
              <span style={{ color: "#d8d8d8" }}>{h.name}</span>
              <span className="num" style={{ color: "#888", textAlign: "right" }}>tgt {h.targetWtPct.toFixed(2)}%</span>
              <span className="num" style={{ color: "#888", textAlign: "right" }}>cur {h.currentWtPct.toFixed(2)}%</span>
              <span className="num" style={{ color: "#ff4d4f", textAlign: "right", fontWeight: 600 }}>{fmtBps(h.driftBps)}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// ---------------- methodology footer ----------------

function MethodologyFooter({ model }: { model: ModelPortfolio }): JSX.Element {
  return (
    <div style={{ padding: "12px 16px", borderTop: "1px solid #2a2a2a", background: "#050505" }}>
      <div className="num" style={{ fontSize: 9, color: "#666", letterSpacing: "0.08em", marginBottom: 6, textTransform: "uppercase" }}>
        Methodology · {model.policy.name}
      </div>
      <div style={{ fontSize: 10.5, color: "#888", lineHeight: 1.55 }}>
        Universe = top {model.totalNamesEligible} IDX names by market cap.
        Sleeve = top {model.policy.topN} by composite score (min {model.policy.minScore}).
        Raw weight ∝ max(0, score − 40) × (1 / σ̂_ann); σ̂_ann ≈ √((β·σ_IHSG)² + σ_idio²) with σ_IHSG = 18%.
        Hard caps: {model.policy.nameCapPct}% per name, {model.policy.sectorCapPct}% per sector;
        intentional {model.policy.cashBufferPct.toFixed(2)}% cash sleeve.
        Drift simulated by trailing 1m return; signal fires at ±200bps band.
        Rebalance discipline: monthly review on the 1st; signals tracked daily.
        Hypothetical model · paper P&L only · no real positions.
      </div>
    </div>
  );
}

// ---------------- page ----------------

export default function PortfolioPage(): JSX.Element {
  const scores = buildIdxScoreSheet();
  const model = buildModelPortfolio(scores, IDX_DEFAULT_POLICY);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
      <PortfolioHeader model={model} />
      <KpiStrip model={model} />
      <div className="grid" style={{ gridTemplateColumns: "60% 40%", minHeight: 0 }}>
        <HoldingsPanel model={model} />
        <section style={{ minWidth: 0, display: "flex", flexDirection: "column" }}>
          <SubHeader title="ALLOCATION · BY SECTOR" meta={`${model.sectorAllocation.length} sectors · cap ${model.policy.sectorCapPct}%`} />
          <div style={{ display: "flex", justifyContent: "center", padding: "20px 0 8px" }}>
            <Donut segments={model.sectorAllocation} />
          </div>
          <Legend segments={model.sectorAllocation} cap={model.policy.sectorCapPct} />
          <SubHeader title="REBALANCE QUEUE · DRIFT > 200BPS" meta={`as of ${model.asOf}`} />
          <RebalanceCard model={model} />
        </section>
      </div>
      <MethodologyFooter model={model} />
    </div>
  );
}
