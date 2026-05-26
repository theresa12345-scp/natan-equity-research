import {
  PORTFOLIO_KPIS,
  PORTFOLIO_HOLDINGS,
  PORTFOLIO_ALLOCATION_SECTORS,
  PORTFOLIO_INDEX_BREAKDOWN,
  PORTFOLIO_META,
  type PortfolioKpi,
  type HoldingRow,
  type AllocationSegment,
  type ValueTone,
  type SubSpan,
} from "@/lib/mock-portfolio";
import TickerLink from "@/components/primitives/TickerLink";

// ---------------- formatters & tone helpers ----------------

function fmtInt(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function fmtSignedPct(n: number, digits = 2): string {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(digits)}%`;
}

function fmtSignedNum(n: number, digits = 2): string {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(digits)}`;
}

function tone(n: number): string {
  if (n > 0) return "#00d97e";
  if (n < 0) return "#ff4d4f";
  return "#b8b8b8";
}

function valueColor(t?: ValueTone): string {
  switch (t) {
    case "pos":
      return "#00d97e";
    case "neg":
      return "#ff4d4f";
    case "mag":
      return "#ff2e88";
    default:
      return "#f5f5f5";
  }
}

function subToneColor(t?: SubSpan["tone"]): string {
  if (t === "pos") return "#00d97e";
  if (t === "neg") return "#ff4d4f";
  return "#888";
}

// ---------------- header ----------------

function PortfolioHeader(): JSX.Element {
  const m = PORTFOLIO_META;
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
      <span
        className="num"
        style={{
          fontSize: 9,
          color: "#ff2e88",
          letterSpacing: "0.08em",
          fontWeight: 600,
        }}
      >
        {m.sectionNumber}
      </span>
      <h1
        style={{
          fontSize: 22,
          color: "#f5f5f5",
          fontWeight: 500,
          letterSpacing: "-0.01em",
          margin: 0,
          lineHeight: 1,
        }}
      >
        {m.title}
      </h1>
      <span style={{ color: "#333", fontSize: 12 }}>·</span>
      <span style={{ fontSize: 11.5, color: "#b8b8b8" }}>{m.subtitle}</span>

      <div
        className="ml-auto flex items-center num"
        style={{ gap: 16, fontSize: 10, letterSpacing: "0.08em" }}
      >
        <span style={{ color: "#7a7a7a" }}>
          BENCHMARK{" "}
          <span style={{ color: "#d8d8d8", marginLeft: 4 }}>{m.benchmark}</span>
        </span>
        <span style={{ color: "#7a7a7a" }}>
          TRACKING SINCE{" "}
          <span style={{ color: "#d8d8d8", marginLeft: 4 }}>
            {m.inception}
          </span>
        </span>
        <span style={{ color: "#7a7a7a" }}>
          NAMES{" "}
          <span style={{ color: "#d8d8d8", marginLeft: 4 }}>{m.positions}</span>
        </span>
      </div>
    </div>
  );
}

// ---------------- KPI strip ----------------

function KpiCell({
  kpi,
  isLast,
}: {
  kpi: PortfolioKpi;
  isLast: boolean;
}): JSX.Element {
  return (
    <div
      style={{
        padding: 14,
        borderRight: isLast ? "none" : "1px solid #1d1d1d",
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: 8.5,
          color: "#666",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        {kpi.label}
      </div>
      <div
        className="num"
        style={{
          fontSize: 22,
          color: valueColor(kpi.valueTone),
          fontWeight: 500,
          letterSpacing: "-0.01em",
          lineHeight: 1.1,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {kpi.value}
      </div>
      <div
        className="num"
        style={{ marginTop: 6, fontSize: 10, color: "#888", lineHeight: 1.35 }}
      >
        {kpi.sub
          ? kpi.sub
          : kpi.subParts?.map((sp, i) => (
              <span key={i} style={{ color: subToneColor(sp.tone) }}>
                {sp.text}
              </span>
            ))}
      </div>
    </div>
  );
}

function KpiStrip(): JSX.Element {
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
        borderBottom: "1px solid #2a2a2a",
      }}
    >
      {PORTFOLIO_KPIS.map((kpi, i) => (
        <KpiCell
          key={kpi.label}
          kpi={kpi}
          isLast={i === PORTFOLIO_KPIS.length - 1}
        />
      ))}
    </div>
  );
}

// ---------------- sub-header (reused by both panels) ----------------

function SubHeader({
  title,
  meta,
  right,
}: {
  title: string;
  meta?: string;
  right?: React.ReactNode;
}): JSX.Element {
  return (
    <div
      className="flex items-center"
      style={{
        height: 28,
        padding: "0 12px",
        borderBottom: "1px solid #1d1d1d",
        background: "#050505",
        gap: 12,
      }}
    >
      <span
        style={{
          fontSize: 9.5,
          color: "#ff2e88",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          fontWeight: 600,
        }}
      >
        {title}
      </span>
      {meta ? (
        <span style={{ fontSize: 10, color: "#7a7a7a" }}>{meta}</span>
      ) : null}
      {right ? <div className="ml-auto flex items-center" style={{ gap: 6 }}>{right}</div> : null}
    </div>
  );
}

// ---------------- holdings ----------------

function HoldingsActions(): JSX.Element {
  const labels = ["EXPORT"] as const;
  return (
    <>
      {labels.map((l, i) => (
        <button
          key={l}
          type="button"
          className="hover:text-[#f5f5f5]"
          style={{
            height: 22,
            padding: "0 8px",
            marginLeft: i === 0 ? 0 : 6,
            background: "transparent",
            border: "1px solid #2a2a2a",
            color: "#b8b8b8",
            fontSize: 10,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            cursor: "pointer",
            lineHeight: 1,
          }}
        >
          {l}
        </button>
      ))}
    </>
  );
}

const COL_HEADERS: Array<{
  label: string;
  align: "left" | "right";
  width?: string;
}> = [
  { label: "KODE", align: "left", width: "58px" },
  { label: "EMITEN", align: "left", width: "180px" },
  { label: "WT %", align: "right", width: "54px" },
  { label: "LOT", align: "right", width: "56px" },
  { label: "COST BASIS", align: "right", width: "78px" },
  { label: "LAST", align: "right", width: "68px" },
  { label: "Δ DAY", align: "right", width: "70px" },
  { label: "UNRL P&L · RP", align: "right", width: "100px" },
  { label: "%", align: "right", width: "72px" },
  { label: "DIV YLD", align: "right", width: "62px" },
  { label: "IDX-IC SECT", align: "left", width: "108px" },
];

function HoldingRow({ row, idx }: { row: HoldingRow; idx: number }): JSX.Element {
  const bg = idx % 2 === 0 ? "#0d0d0d" : "#0a0a0a";
  return (
    <tr
      className="hover:bg-[#1a1a1a]"
      style={{ background: bg, height: 18 }}
    >
      <td
        style={{
          padding: "0 8px",
        }}
      >
        <TickerLink ticker={row.kode} market="IDX" />
      </td>
      <td
        style={{
          padding: "0 8px",
          color: "#d8d8d8",
          fontSize: 11,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {row.emiten}
      </td>
      <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#d8d8d8", fontSize: 11 }}>
        {row.wtPct.toFixed(2)}
      </td>
      <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#b8b8b8", fontSize: 11 }}>
        {fmtInt(row.lot)}
      </td>
      <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#b8b8b8", fontSize: 11 }}>
        {fmtInt(row.costBasis)}
      </td>
      <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#f5f5f5", fontSize: 11 }}>
        {fmtInt(row.last)}
      </td>
      <td className="num" style={{ padding: "0 8px", textAlign: "right", color: tone(row.dayPct), fontSize: 11 }}>
        {fmtSignedPct(row.dayPct)}
      </td>
      <td className="num" style={{ padding: "0 8px", textAlign: "right", fontSize: 11 }}>
        <span style={{ color: tone(row.unrlValueJt) }}>
          {fmtSignedNum(row.unrlValueJt)}
        </span>
        <span style={{ color: "#666", fontSize: 10, marginLeft: 3 }}>jt</span>
      </td>
      <td className="num" style={{ padding: "0 8px", textAlign: "right", color: tone(row.unrlPct), fontSize: 11 }}>
        {fmtSignedPct(row.unrlPct)}
      </td>
      <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#b8b8b8", fontSize: 11 }}>
        {row.divYld.toFixed(2)}%
      </td>
      <td style={{ padding: "0 8px", color: "#b8b8b8", fontSize: 10.5, whiteSpace: "nowrap" }}>
        {row.sect}
      </td>
    </tr>
  );
}

function HoldingsPanel(): JSX.Element {
  return (
    <section
      style={{ borderRight: "1px solid #2a2a2a", minWidth: 0, overflow: "hidden" }}
    >
      <SubHeader
        title={`HOLDINGS · IDX POSITIONS (${PORTFOLIO_META.positions})`}
        meta="sorted by weight ▾ · prices in IDR"
        right={<HoldingsActions />}
      />
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
            {PORTFOLIO_HOLDINGS.map((row, i) => (
              <HoldingRow key={row.kode} row={row} idx={i} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ---------------- allocation donut ----------------

function SegmentedTab({
  label,
  active,
}: {
  label: string;
  active?: boolean;
}): JSX.Element {
  return (
    <button
      type="button"
      style={{
        height: 22,
        padding: "0 10px",
        background: "transparent",
        border: `1px solid ${active ? "#ff2e88" : "#2a2a2a"}`,
        color: active ? "#ff2e88" : "#7a7a7a",
        fontSize: 10,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        cursor: "pointer",
        lineHeight: 1,
        marginLeft: -1,
      }}
    >
      {label}
    </button>
  );
}

function Donut({
  segments,
  centerLabel,
  centerValue,
}: {
  segments: AllocationSegment[];
  centerLabel: string;
  centerValue: string;
}): JSX.Element {
  const radius = 90;
  const circ = 2 * Math.PI * radius;
  let cum = 0;

  return (
    <svg
      width={240}
      height={240}
      viewBox="-120 -120 240 240"
      role="img"
      aria-label="Sector allocation donut chart"
    >
      <g transform="rotate(-90)">
        {segments.map((seg) => {
          const len = (seg.pct / 100) * circ;
          // 1px black gap before next segment for visual separation
          const dash = Math.max(0, len - 1);
          const offset = -cum;
          cum += len;
          return (
            <circle
              key={seg.name}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={40}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={offset}
            />
          );
        })}
      </g>
      <text
        x={0}
        y={-4}
        textAnchor="middle"
        style={{
          fontSize: 9,
          fill: "#7a7a7a",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          fontFamily: "var(--font-geist-sans, system-ui), sans-serif",
        }}
      >
        {centerLabel}
      </text>
      <text
        x={0}
        y={22}
        textAnchor="middle"
        style={{
          fontSize: 28,
          fill: "#f5f5f5",
          fontWeight: 600,
          fontFamily: "var(--font-jetbrains, ui-monospace), monospace",
          letterSpacing: "-0.02em",
        }}
      >
        {centerValue}
      </text>
    </svg>
  );
}

function Legend({ segments }: { segments: AllocationSegment[] }): JSX.Element {
  // 2-column layout, 4 rows per column
  const mid = Math.ceil(segments.length / 2);
  const col1 = segments.slice(0, mid);
  const col2 = segments.slice(mid);

  function row(s: AllocationSegment): JSX.Element {
    return (
      <div
        key={s.name}
        className="grid items-center"
        style={{
          gridTemplateColumns: "10px 1fr auto",
          gap: 8,
          padding: "3px 0",
          fontSize: 11,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 8,
            height: 8,
            background: s.color,
            display: "inline-block",
          }}
        />
        <span style={{ color: "#d8d8d8" }}>{s.name}</span>
        <span className="num" style={{ color: "#f5f5f5", textAlign: "right" }}>
          {s.pct.toFixed(1)}%
        </span>
      </div>
    );
  }

  return (
    <div
      className="grid"
      style={{ gridTemplateColumns: "1fr 1fr", gap: 16, padding: "0 16px 12px" }}
    >
      <div>{col1.map(row)}</div>
      <div>{col2.map(row)}</div>
    </div>
  );
}

function IndexBreakdownGrid(): JSX.Element {
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        borderTop: "1px solid #1d1d1d",
      }}
    >
      {PORTFOLIO_INDEX_BREAKDOWN.map((b, i) => (
        <div
          key={b.label}
          style={{
            padding: "10px 12px",
            borderRight:
              i === PORTFOLIO_INDEX_BREAKDOWN.length - 1
                ? "none"
                : "1px solid #1d1d1d",
          }}
        >
          <div
            style={{
              fontSize: 8.5,
              color: "#666",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            {b.label}
          </div>
          <div
            className="num"
            style={{ fontSize: 13, color: "#f5f5f5", letterSpacing: "-0.01em" }}
          >
            {b.pct}%
          </div>
        </div>
      ))}
    </div>
  );
}

function AllocationPanel(): JSX.Element {
  return (
    <section style={{ minWidth: 0, display: "flex", flexDirection: "column" }}>
      <SubHeader
        title="ALLOCATION · IDX-IC"
        right={
          <>
            <SegmentedTab label="SECTOR" active />
            <SegmentedTab label="SIZE" />
            <SegmentedTab label="INDEX" />
          </>
        }
      />
      <div
        style={{ display: "flex", justifyContent: "center", padding: "20px 0 8px" }}
      >
        <Donut
          segments={PORTFOLIO_ALLOCATION_SECTORS}
          centerLabel="SECTORS"
          centerValue={String(PORTFOLIO_META.totalSectors)}
        />
      </div>
      <Legend segments={PORTFOLIO_ALLOCATION_SECTORS} />
      <IndexBreakdownGrid />
    </section>
  );
}

// ---------------- page ----------------

export default function PortfolioPage(): JSX.Element {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
      <PortfolioHeader />
      <KpiStrip />
      <div
        className="grid"
        style={{
          gridTemplateColumns: "60% 40%",
          minHeight: 0,
        }}
      >
        <HoldingsPanel />
        <AllocationPanel />
      </div>
    </div>
  );
}
