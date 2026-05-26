"use client";

import { MONTHLY_RETURNS } from "@/lib/mock-backtest-ext";

const MONTH_LABELS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function cellColor(v: number): string {
  if (v >= 5) return "#005a30";
  if (v >= 3) return "#0f3d20";
  if (v >= 1) return "#1a3d24";
  if (v >= 0) return "#0a2818";
  if (v >= -1) return "#2a1313";
  if (v >= -3) return "#4a1818";
  if (v >= -5) return "#6a1a1a";
  return "#8a2020";
}

function textColor(v: number): string {
  if (Math.abs(v) > 4) return "#f5f5f5";
  if (Math.abs(v) > 2) return "#d8d8d8";
  return "#b8b8b8";
}

export default function MonthlyReturnsHeatmap(): JSX.Element {
  const annual = MONTHLY_RETURNS.map(({ year, months }) => {
    const cum = months.reduce((c, m) => c * (1 + m / 100), 1) - 1;
    return { year, ret: cum * 100 };
  });

  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 10,
          minWidth: 720,
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                padding: "5px 8px",
                fontSize: 8.5,
                color: "#666",
                letterSpacing: "0.1em",
                fontWeight: 500,
                textAlign: "left",
                borderBottom: "1px solid #2a2a2a",
                background: "#050505",
              }}
            >
              YR
            </th>
            {MONTH_LABELS.map((m) => (
              <th
                key={m}
                style={{
                  padding: "5px 4px",
                  fontSize: 8.5,
                  color: "#666",
                  letterSpacing: "0.06em",
                  fontWeight: 500,
                  borderBottom: "1px solid #2a2a2a",
                  background: "#050505",
                  textAlign: "center",
                  fontFamily: "var(--font-jetbrains)",
                }}
              >
                {m}
              </th>
            ))}
            <th
              style={{
                padding: "5px 8px",
                fontSize: 8.5,
                color: "#ff2e88",
                letterSpacing: "0.1em",
                fontWeight: 600,
                borderBottom: "1px solid #ff2e88",
                background: "#050505",
                textAlign: "right",
              }}
            >
              YEAR
            </th>
          </tr>
        </thead>
        <tbody>
          {MONTHLY_RETURNS.map(({ year, months }, i) => {
            const yearRet = annual[i].ret;
            return (
              <tr key={year}>
                <td
                  className="num"
                  style={{
                    padding: "0 8px",
                    color: "#7a7a7a",
                    fontSize: 10,
                    height: 22,
                    borderBottom: "1px solid #111",
                  }}
                >
                  {year}
                </td>
                {months.map((m, j) => (
                  <td
                    key={j}
                    className="num"
                    title={`${MONTH_LABELS[j]} ${year}: ${m >= 0 ? "+" : ""}${m.toFixed(2)}%`}
                    style={{
                      padding: 0,
                      textAlign: "center",
                      background: cellColor(m),
                      color: textColor(m),
                      fontSize: 9.5,
                      border: "1px solid #000",
                      height: 22,
                      minWidth: 38,
                    }}
                  >
                    {m >= 0 ? "+" : ""}{m.toFixed(1)}
                  </td>
                ))}
                <td
                  className="num"
                  style={{
                    padding: "0 8px",
                    textAlign: "right",
                    color: yearRet >= 0 ? "#00d97e" : "#ff4d4f",
                    fontSize: 11,
                    fontWeight: 600,
                    borderBottom: "1px solid #111",
                    borderLeft: "1px solid #2a2a2a",
                  }}
                >
                  {yearRet >= 0 ? "+" : ""}{yearRet.toFixed(1)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* Legend */}
      <div
        className="flex items-center"
        style={{
          padding: "10px 12px",
          borderTop: "1px solid #2a2a2a",
          fontSize: 9,
          color: "#666",
          letterSpacing: "0.08em",
          gap: 8,
        }}
      >
        <span style={{ textTransform: "uppercase" }}>Scale</span>
        {[-5, -3, -1, 0, 1, 3, 5].map((v) => (
          <span
            key={v}
            className="num"
            style={{
              background: cellColor(v),
              color: textColor(v),
              padding: "1px 6px",
              minWidth: 36,
              textAlign: "center",
            }}
          >
            {v >= 0 ? "+" : ""}{v}%
          </span>
        ))}
        <span style={{ marginLeft: "auto", color: "#7a7a7a" }}>
          monthly return · % gain / loss
        </span>
      </div>
    </div>
  );
}
