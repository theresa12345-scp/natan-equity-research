import type { ReactNode } from "react";

interface KPI {
  label: string;
  value: string;
  sub?: string;
  subTone?: "pos" | "neg" | "neutral";
}

interface Grade {
  letter: string;
  score: number;
  max: number;
  verdict: string;
  verdictTone: "buy" | "hold" | "sell";
}

interface SecurityHeaderProps {
  ticker: string;
  exchange: string;
  name: string;
  sector: string;
  industry: string;
  indices?: ReadonlyArray<string>;
  kpis: KPI[];
  grade: Grade;
  meta?: { label: string; value: string }[];
}

function subColor(t?: KPI["subTone"]): string {
  if (t === "pos") return "#00d97e";
  if (t === "neg") return "#ff4d4f";
  return "#7a7a7a";
}

function verdictColor(t: Grade["verdictTone"]): string {
  if (t === "buy") return "#00d97e";
  if (t === "sell") return "#ff4d4f";
  return "#ff2e88";
}

export default function SecurityHeader({
  ticker,
  exchange,
  name,
  sector,
  industry,
  indices,
  kpis,
  grade,
  meta,
}: SecurityHeaderProps): JSX.Element {
  return (
    <div
      style={{
        borderBottom: "1px solid #2a2a2a",
        background: "#000",
      }}
    >
      {/* Identity row + meta */}
      <div
        className="flex items-baseline"
        style={{
          padding: "10px 14px 8px",
          borderBottom: "1px solid #111",
          gap: 14,
          flexWrap: "wrap",
        }}
      >
        <div className="flex items-baseline" style={{ gap: 8 }}>
          <span
            className="num"
            style={{
              fontSize: 26,
              color: "#ff2e88",
              fontWeight: 600,
              letterSpacing: "-0.01em",
              lineHeight: 1,
            }}
          >
            {ticker}
          </span>
          <span
            className="num"
            style={{
              fontSize: 9,
              color: "#7a7a7a",
              letterSpacing: "0.08em",
              border: "1px solid #2a2a2a",
              padding: "2px 5px",
            }}
          >
            {exchange}
          </span>
        </div>
        <div style={{ fontSize: 13, color: "#d8d8d8" }}>{name}</div>
        <span style={{ color: "#333", fontSize: 12 }}>·</span>
        <span
          style={{
            fontSize: 9.5,
            color: "#666",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {sector} · {industry}
        </span>
        {indices ? (
          <div className="flex items-baseline" style={{ gap: 4, marginLeft: 6 }}>
            {indices.map((ix) => (
              <span
                key={ix}
                className="num"
                style={{
                  fontSize: 9,
                  color: "#7a7a7a",
                  letterSpacing: "0.06em",
                  border: "1px solid #1d1d1d",
                  padding: "1px 4px",
                }}
              >
                {ix}
              </span>
            ))}
          </div>
        ) : null}

        {meta ? (
          <div className="ml-auto flex items-center num" style={{ gap: 14 }}>
            {meta.map((m) => (
              <span
                key={m.label}
                style={{
                  fontSize: 10,
                  color: "#666",
                  letterSpacing: "0.08em",
                }}
              >
                {m.label}{" "}
                <span style={{ color: "#d8d8d8", marginLeft: 4 }}>
                  {m.value}
                </span>
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {/* KPI strip with grade cell */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${kpis.length}, minmax(0, 1fr)) 200px`,
        }}
      >
        {kpis.map((k, i) => (
          <div
            key={k.label}
            style={{
              padding: "10px 12px",
              borderRight: "1px solid #1d1d1d",
              minWidth: 0,
            }}
          >
            <div
              style={{
                fontSize: 8.5,
                color: "#666",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 5,
              }}
            >
              {k.label}
            </div>
            <div
              className="num"
              style={{
                fontSize: 14,
                color: "#f5f5f5",
                letterSpacing: "-0.01em",
                lineHeight: 1.1,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {k.value}
            </div>
            {k.sub ? (
              <div
                className="num"
                style={{
                  fontSize: 9,
                  color: subColor(k.subTone),
                  marginTop: 4,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {k.sub}
              </div>
            ) : null}
          </div>
        ))}

        {/* Grade cell — magenta top border + faint gradient */}
        <div
          style={{
            padding: "8px 12px 10px",
            borderTop: "2px solid #ff2e88",
            background:
              "linear-gradient(180deg, rgba(255,46,136,0.08) 0%, transparent 60%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontSize: 28,
              color: "#ff2e88",
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}
          >
            {grade.letter}
          </div>
          <div
            className="num"
            style={{
              fontSize: 10,
              color: "#d8d8d8",
              marginTop: 3,
              letterSpacing: "0.02em",
            }}
          >
            {grade.score} / {grade.max}
          </div>
          <div
            style={{
              fontSize: 9,
              color: verdictColor(grade.verdictTone),
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginTop: 4,
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            {grade.verdict}
          </div>
        </div>
      </div>
    </div>
  );
}
