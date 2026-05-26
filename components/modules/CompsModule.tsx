import TickerLink from "@/components/primitives/TickerLink";

interface CompRow {
  ticker: string;
  issuer: string;
  sect: string;
  mcap: number;
  pe: number;
  pbv?: number;
  ps?: number;
  roe: number;
  nim?: number;
  cir?: number;
  npl?: number;
  divYld: number;
  eps5y: number;
  perf3m: number;
  beta: number;
  grade: string;
  highlight?: "subject" | "peer";
  isDivider?: boolean;
}

interface CompsModuleProps {
  rows: CompRow[];
  peerAvg: Record<string, number>;
  delta: Record<string, number>;
  prose: string;
  columns: ReadonlyArray<string>;
}

function toneColor(v: number): string {
  if (v > 0) return "#00d97e";
  if (v < 0) return "#ff4d4f";
  return "#b8b8b8";
}

function fmt(v: number | undefined, digits = 2, suffix = ""): string {
  if (v === undefined || v === null) return "—";
  return `${v.toFixed(digits)}${suffix}`;
}

export default function CompsModule({
  rows,
  peerAvg,
  delta,
  prose,
  columns,
}: CompsModuleProps): JSX.Element {
  return (
    <div style={{ minHeight: 0, overflow: "hidden" }}>
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
          Peer Comparison · 15 columns
        </span>
        <span style={{ fontSize: 10, color: "#7a7a7a" }}>
          subject vs ID Big-4 + Regional ASEAN
        </span>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
          <thead>
            <tr style={{ background: "#050505" }}>
              {columns.map((c, i) => (
                <th
                  key={c}
                  style={{
                    padding: "6px 8px",
                    textAlign: i < 3 ? "left" : "right",
                    fontSize: 9,
                    color: "#555",
                    letterSpacing: "0.1em",
                    fontWeight: 500,
                    borderBottom: "1px solid #1d1d1d",
                    whiteSpace: "nowrap",
                  }}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              if (r.isDivider) {
                return (
                  <tr key={`div-${i}`} style={{ background: "#050505" }}>
                    <td
                      colSpan={columns.length}
                      style={{
                        padding: "5px 12px",
                        fontSize: 9,
                        color: "#666",
                        letterSpacing: "0.14em",
                        fontWeight: 600,
                        borderTop: "1px solid #2a2a2a",
                        borderBottom: "1px solid #2a2a2a",
                      }}
                    >
                      {r.issuer}
                    </td>
                  </tr>
                );
              }
              const isSubject = r.highlight === "subject";
              return (
                <tr
                  key={r.ticker}
                  style={{
                    height: 22,
                    background: isSubject
                      ? "rgba(255,46,136,0.06)"
                      : i % 2 === 0
                      ? "#0d0d0d"
                      : "#0a0a0a",
                    borderLeft: isSubject ? "2px solid #ff2e88" : "2px solid transparent",
                  }}
                >
                  <td style={{ padding: "0 8px" }}>
                    <TickerLink
                      ticker={r.ticker}
                      market={r.ticker.includes(" ") ? "US" : "IDX"}
                      size="sm"
                      bold={isSubject}
                    />
                  </td>
                  <td style={{ padding: "0 8px", color: "#d8d8d8", whiteSpace: "nowrap" }}>
                    {r.issuer}
                  </td>
                  <td style={{ padding: "0 8px", color: "#b8b8b8", fontSize: 10.5 }}>
                    {r.sect}
                  </td>
                  <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#d8d8d8" }}>
                    {r.mcap.toFixed(1)}
                  </td>
                  <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#d8d8d8" }}>
                    {fmt(r.pe, 1, "×")}
                  </td>
                  <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#d8d8d8" }}>
                    {r.pbv !== undefined ? fmt(r.pbv, 2, "×") : fmt(r.ps, 2, "×")}
                  </td>
                  <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#d8d8d8" }}>
                    {fmt(r.roe, 1, "%")}
                  </td>
                  <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#d8d8d8" }}>
                    {fmt(r.nim, 2, "%")}
                  </td>
                  <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#b8b8b8" }}>
                    {fmt(r.cir, 1, "%")}
                  </td>
                  <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#b8b8b8" }}>
                    {fmt(r.npl, 2, "%")}
                  </td>
                  <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#b8b8b8" }}>
                    {fmt(r.divYld, 2, "%")}
                  </td>
                  <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#b8b8b8" }}>
                    {fmt(r.eps5y, 1, "%")}
                  </td>
                  <td className="num" style={{ padding: "0 8px", textAlign: "right", color: toneColor(r.perf3m) }}>
                    {r.perf3m >= 0 ? "+" : ""}{r.perf3m.toFixed(2)}%
                  </td>
                  <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#b8b8b8" }}>
                    {r.beta.toFixed(2)}
                  </td>
                  <td
                    style={{
                      padding: "0 8px",
                      textAlign: "right",
                      color: isSubject ? "#ff2e88" : "#d8d8d8",
                      fontWeight: 600,
                    }}
                  >
                    {r.grade}
                  </td>
                </tr>
              );
            })}
            {/* Peer average row */}
            <tr style={{ borderTop: "1px solid #2a2a2a", height: 22, background: "#050505" }}>
              <td style={{ padding: "0 8px", color: "#7a7a7a", fontSize: 10, letterSpacing: "0.08em", fontWeight: 600 }}>
                PEER AVG
              </td>
              <td colSpan={3} />
              <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#7a7a7a" }}>
                {fmt(peerAvg.pe, 1, "×")}
              </td>
              <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#7a7a7a" }}>
                {fmt(peerAvg.pbv ?? peerAvg.ps, 2, "×")}
              </td>
              <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#7a7a7a" }}>
                {fmt(peerAvg.roe, 1, "%")}
              </td>
              <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#7a7a7a" }}>
                {fmt(peerAvg.nim, 2, "%")}
              </td>
              <td colSpan={2} />
              <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#7a7a7a" }}>
                {fmt(peerAvg.divYld, 2, "%")}
              </td>
              <td />
              <td className="num" style={{ padding: "0 8px", textAlign: "right", color: toneColor(peerAvg.perf3m ?? 0) }}>
                {(peerAvg.perf3m ?? 0).toFixed(2)}%
              </td>
              <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#7a7a7a" }}>
                {(peerAvg.beta ?? 0).toFixed(2)}
              </td>
              <td />
            </tr>
            {/* Subject delta */}
            <tr style={{ height: 22, background: "rgba(255,46,136,0.04)" }}>
              <td style={{ padding: "0 8px", color: "#ff2e88", fontSize: 10, letterSpacing: "0.08em", fontWeight: 600 }}>
                Δ vs PEER
              </td>
              <td colSpan={3} />
              <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#ff2e88" }}>
                {delta.pe >= 0 ? "+" : ""}{delta.pe}%
              </td>
              <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#ff2e88" }}>
                {delta.pbv >= 0 ? "+" : ""}{delta.pbv}%
              </td>
              <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#ff2e88" }}>
                {delta.roe >= 0 ? "+" : ""}{delta.roe}%
              </td>
              <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#ff2e88" }}>
                {delta.nim >= 0 ? "+" : ""}{delta.nim}%
              </td>
              <td colSpan={2} />
              <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#ff2e88" }}>
                {delta.divYld >= 0 ? "+" : ""}{delta.divYld}%
              </td>
              <td colSpan={4} />
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ padding: "14px 16px", borderTop: "1px solid #2a2a2a" }}>
        <p
          style={{
            fontSize: 11.5,
            color: "#d8d8d8",
            lineHeight: 1.65,
            margin: 0,
            fontStyle: "italic",
            maxWidth: "80ch",
          }}
        >
          {prose}
        </p>
      </div>
    </div>
  );
}
