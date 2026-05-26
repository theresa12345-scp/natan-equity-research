import ReverseDCFPanel from "./ReverseDCFPanel";

interface CapmRow {
  label: string;
  value: string;
  note?: string;
  emphasis?: boolean;
}

interface DCFOutput {
  intrinsic: number;
  market: number;
  upsidePct: number;
  verdict: string;
  verdictTone: "buy" | "hold" | "sell" | "neutral";
  callout: string;
}

interface ProjectionRow {
  year: string;
  rev: number;
  ebit: number;
  tax: number;
  ni: number;
  capex: number;
  fcfe: number;
  df: number;
  pv: number;
}

interface Sensitivity {
  keValues: number[];
  gValues: number[];
  rows: number[][];
  base: { row: number; col: number };
}

interface DCFModuleProps {
  capm: CapmRow[];
  terminal: CapmRow[];
  output: DCFOutput;
  projection: ProjectionRow[];
  sensitivity: Sensitivity;
  currency?: "IDR" | "USD";
  unitLabel?: string;
}

function verdictColor(t: DCFOutput["verdictTone"]): string {
  if (t === "buy") return "#00d97e";
  if (t === "sell") return "#ff4d4f";
  if (t === "hold") return "#ff2e88";
  return "#d8d8d8";
}

function heatColor(pct: number): string {
  if (pct > 8) return "#00d97e";
  if (pct > 3) return "#3d7d4f";
  if (pct > -3) return "#7a7a7a";
  if (pct > -8) return "#9a4040";
  return "#ff4d4f";
}

function CapmList({ rows }: { rows: CapmRow[] }): JSX.Element {
  return (
    <div>
      {rows.map((r) => (
        <div
          key={r.label}
          className="grid items-baseline"
          style={{
            gridTemplateColumns: "1fr auto",
            height: 22,
            padding: "0 12px",
            borderBottom: "1px solid #111",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 11, color: r.emphasis ? "#f5f5f5" : "#7a7a7a" }}>
            {r.label}
            {r.note ? (
              <span
                style={{ color: "#555", fontSize: 9.5, marginLeft: 6 }}
              >
                · {r.note}
              </span>
            ) : null}
          </span>
          <span
            className="num"
            style={{
              fontSize: 11.5,
              color: r.emphasis ? "#ff2e88" : "#d8d8d8",
              fontWeight: r.emphasis ? 600 : 400,
              textAlign: "right",
            }}
          >
            {r.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function SectionHeader({ title }: { title: string }): JSX.Element {
  return (
    <div
      className="flex items-center"
      style={{
        height: 28,
        padding: "0 12px",
        borderBottom: "1px solid #1d1d1d",
        borderTop: "1px solid #2a2a2a",
        background: "#050505",
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
    </div>
  );
}

export default function DCFModule({
  capm,
  terminal,
  output,
  projection,
  sensitivity,
  currency = "IDR",
  unitLabel,
}: DCFModuleProps): JSX.Element {
  const cur = currency === "USD" ? "$" : "Rp ";
  const fmt = (n: number): string =>
    `${cur}${n.toLocaleString("en-US", { maximumFractionDigits: currency === "USD" ? 2 : 0 })}`;

  return (
    <div
      className="grid"
      style={{ gridTemplateColumns: "40% 60%", minHeight: 0 }}
    >
      {/* LEFT: CAPM + terminal + output */}
      <section style={{ borderRight: "1px solid #2a2a2a", minWidth: 0 }}>
        <SectionHeader title="Cost of Equity · CAPM" />
        <CapmList rows={capm} />
        <SectionHeader title="Terminal Assumptions" />
        <CapmList rows={terminal} />

        {/* Output panel */}
        <div
          style={{
            padding: "12px 14px",
            borderTop: "2px solid #ff2e88",
            background:
              "linear-gradient(180deg, rgba(255,46,136,0.06) 0%, transparent 60%)",
          }}
        >
          <div
            style={{
              fontSize: 9,
              color: "#ff2e88",
              letterSpacing: "0.14em",
              fontWeight: 600,
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            DCF Output · per share
          </div>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div
                style={{
                  fontSize: 8.5,
                  color: "#666",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Intrinsic
              </div>
              <div
                className="num"
                style={{
                  fontSize: 22,
                  color: "#f5f5f5",
                  fontWeight: 500,
                  letterSpacing: "-0.01em",
                  marginTop: 4,
                }}
              >
                {fmt(output.intrinsic)}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: 8.5,
                  color: "#666",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Market
              </div>
              <div
                className="num"
                style={{
                  fontSize: 22,
                  color: "#d8d8d8",
                  fontWeight: 500,
                  letterSpacing: "-0.01em",
                  marginTop: 4,
                }}
              >
                {fmt(output.market)}
              </div>
            </div>
          </div>
          <div
            className="num"
            style={{
              fontSize: 13,
              color: output.upsidePct >= 0 ? "#00d97e" : "#ff4d4f",
              marginTop: 8,
            }}
          >
            {output.upsidePct >= 0 ? "+" : ""}
            {output.upsidePct.toFixed(2)}% upside
          </div>
          <div
            style={{
              fontSize: 11,
              color: verdictColor(output.verdictTone),
              letterSpacing: "0.1em",
              fontWeight: 600,
              marginTop: 4,
              textTransform: "uppercase",
            }}
          >
            {output.verdict}
          </div>
        </div>

        <div
          style={{
            margin: "0 14px 14px",
            padding: "10px 12px",
            border: "1px solid #ff2e88",
            background: "rgba(255,46,136,0.04)",
          }}
        >
          <p
            style={{
              fontSize: 10.5,
              color: "#d8d8d8",
              lineHeight: 1.55,
              margin: 0,
              fontStyle: "italic",
            }}
          >
            {output.callout}
          </p>
        </div>
      </section>

      {/* RIGHT: projection + sensitivity */}
      <section style={{ minWidth: 0, overflow: "hidden" }}>
        <SectionHeader
          title={`5-Year FCFE Projection${unitLabel ? ` · ${unitLabel}` : ""}`}
        />
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 10.5,
            }}
          >
            <thead>
              <tr style={{ background: "#050505" }}>
                {["YEAR", "REV", "EBIT", "TAX", "NI", "CAPEX", "FCFE", "DF", "PV"].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        padding: "6px 8px",
                        textAlign: h === "YEAR" ? "left" : "right",
                        fontSize: 9,
                        color: "#555",
                        letterSpacing: "0.1em",
                        fontWeight: 500,
                        borderBottom: "1px solid #1d1d1d",
                      }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {projection.map((r, i) => (
                <tr
                  key={r.year}
                  style={{
                    height: 22,
                    background: i % 2 === 0 ? "#0d0d0d" : "#0a0a0a",
                  }}
                >
                  <td className="num" style={{ padding: "0 8px", color: "#d8d8d8" }}>
                    {r.year}
                  </td>
                  <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#f5f5f5" }}>
                    {r.rev.toFixed(1)}
                  </td>
                  <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#d8d8d8" }}>
                    {r.ebit.toFixed(1)}
                  </td>
                  <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#b8b8b8" }}>
                    {r.tax.toFixed(2)}
                  </td>
                  <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#f5f5f5" }}>
                    {r.ni.toFixed(2)}
                  </td>
                  <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#ff4d4f" }}>
                    {r.capex.toFixed(1)}
                  </td>
                  <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#00d97e" }}>
                    {r.fcfe.toFixed(2)}
                  </td>
                  <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#7a7a7a" }}>
                    {r.df.toFixed(3)}
                  </td>
                  <td className="num" style={{ padding: "0 8px", textAlign: "right", color: "#ff2e88", fontWeight: 600 }}>
                    {r.pv.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <SectionHeader title="Sensitivity · IV per share · Ke × g∞" />
        <div style={{ padding: "12px 14px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
            <thead>
              <tr>
                <th style={{ padding: 4, color: "#555", fontSize: 9 }}>Ke ↓ · g→</th>
                {sensitivity.gValues.map((g) => (
                  <th
                    key={g}
                    className="num"
                    style={{
                      padding: 4,
                      textAlign: "center",
                      color: "#7a7a7a",
                      fontSize: 9.5,
                    }}
                  >
                    {g.toFixed(1)}%
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sensitivity.rows.map((row, ri) => (
                <tr key={ri}>
                  <td
                    className="num"
                    style={{ padding: 4, color: "#7a7a7a", fontSize: 9.5 }}
                  >
                    {sensitivity.keValues[ri].toFixed(2)}%
                  </td>
                  {row.map((v, ci) => {
                    const upside = ((v - output.market) / output.market) * 100;
                    const isBase =
                      ri === sensitivity.base.row && ci === sensitivity.base.col;
                    return (
                      <td
                        key={ci}
                        className="num"
                        style={{
                          padding: 0,
                          textAlign: "center",
                          background: isBase ? "#ff2e88" : heatColor(upside),
                          color: isBase ? "#000" : "#f5f5f5",
                          fontSize: 10,
                          fontWeight: isBase ? 700 : 500,
                          border: "1px solid #000",
                          height: 26,
                        }}
                      >
                        {fmt(v)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Reverse DCF — Mauboussin "what's priced in" */}
        <ReverseDCFPanel
          marketPrice={output.market}
          intrinsicAtBase={output.intrinsic}
          baseCAGR={9.2}
          ke={11.41}
          terminalGrowth={4.0}
          currency={currency}
        />
      </section>
    </div>
  );
}
