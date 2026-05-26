"use client";

import Sheet from "@/components/primitives/Sheet";

interface PillarDetail {
  name: string;
  weight: number;
  score: number;
  letter: string;
  tone: "mag" | "pos" | "amber" | "neg";
  raw?: Record<string, number | string | undefined>;
  winsorized?: Record<string, number | undefined>;
  pctRank?: number;
  contribution?: number;
}

interface Aggregate {
  letter: string;
  score: number;
  max: number;
  verdict: string;
  verdictTone: "buy" | "hold" | "sell";
}

interface ScoreDerivationDrawerProps {
  open: boolean;
  onClose: () => void;
  ticker: string;
  name: string;
  pillars: PillarDetail[];
  aggregate: Aggregate;
  positionCap: number;
  ciLow?: string;
  ciHigh?: string;
}

function pillarColor(tone: PillarDetail["tone"]): string {
  if (tone === "mag") return "#ff2e88";
  if (tone === "pos") return "#00d97e";
  if (tone === "amber") return "#c4831f";
  return "#ff4d4f";
}

function verdictColor(t: Aggregate["verdictTone"]): string {
  if (t === "buy") return "#00d97e";
  if (t === "sell") return "#ff4d4f";
  return "#ff2e88";
}

function PillarRow({ p }: { p: PillarDetail }): JSX.Element {
  const color = pillarColor(p.tone);
  const rawEntries = p.raw ? Object.entries(p.raw) : [];

  return (
    <details
      style={{
        borderBottom: "1px solid #1d1d1d",
      }}
    >
      <summary
        className="grid items-center"
        style={{
          gridTemplateColumns: "140px 60px 60px 60px 60px",
          padding: "8px 14px",
          gap: 10,
          cursor: "pointer",
          listStyle: "none",
        }}
      >
        <span style={{ fontSize: 11, color: "#d8d8d8" }}>{p.name}</span>
        <span
          className="num"
          style={{ fontSize: 10.5, color: "#7a7a7a", textAlign: "right" }}
        >
          {p.weight}%
        </span>
        <span
          className="num"
          style={{ fontSize: 11, color: "#f5f5f5", textAlign: "right" }}
        >
          {p.score}
        </span>
        <span
          className="num"
          style={{ fontSize: 11, color: color, textAlign: "right", fontWeight: 600 }}
        >
          {p.letter}
        </span>
        <span
          className="num"
          style={{ fontSize: 11, color: "#ff2e88", textAlign: "right" }}
        >
          {p.contribution !== undefined ? `${p.contribution.toFixed(1)}` : "—"}
        </span>
      </summary>
      {rawEntries.length > 0 ? (
        <div
          style={{
            padding: "8px 14px 12px 28px",
            background: "#050505",
            borderTop: "1px solid #111",
          }}
        >
          <div
            style={{
              fontSize: 8.5,
              color: "#666",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Raw Inputs · sector-relative
          </div>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 4 }}>
            {rawEntries
              .filter(([, v]) => v !== undefined)
              .map(([k, v]) => (
                <div
                  key={k}
                  className="num"
                  style={{ fontSize: 10, color: "#888", display: "flex", gap: 6 }}
                >
                  <span style={{ color: "#555", minWidth: 90 }}>{k}</span>
                  <span style={{ color: "#d8d8d8" }}>
                    {typeof v === "number" ? v.toFixed(2) : String(v)}
                  </span>
                </div>
              ))}
          </div>
          {p.winsorized ? (
            <div style={{ marginTop: 8 }}>
              <div
                style={{
                  fontSize: 8.5,
                  color: "#666",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                Winsorized · z-score
              </div>
              <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                {Object.entries(p.winsorized)
                  .filter(([, v]) => v !== undefined)
                  .map(([k, v]) => {
                    const n = v as number;
                    return (
                      <div
                        key={k}
                        className="num"
                        style={{ fontSize: 10, color: "#888", display: "flex", gap: 6 }}
                      >
                        <span style={{ color: "#555", minWidth: 90 }}>{k}</span>
                        <span style={{ color: n >= 0 ? "#00d97e" : "#ff4d4f" }}>
                          {n >= 0 ? "+" : ""}
                          {n.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : null}
          {p.pctRank !== undefined ? (
            <div className="num" style={{ fontSize: 10, color: "#7a7a7a", marginTop: 8 }}>
              Cross-sectional percentile rank ·{" "}
              <span style={{ color: "#ff2e88", fontWeight: 600 }}>{p.pctRank}</span>
            </div>
          ) : null}
        </div>
      ) : null}
    </details>
  );
}

export default function ScoreDerivationDrawer({
  open,
  onClose,
  ticker,
  name,
  pillars,
  aggregate,
  positionCap,
  ciLow,
  ciHigh,
}: ScoreDerivationDrawerProps): JSX.Element {
  const ciDisplay = ciLow && ciHigh ? ` [${ciLow}, ${ciHigh}]` : "";

  return (
    <Sheet open={open} onClose={onClose} title="Score Derivation" width={480}>
      {/* Header */}
      <div style={{ padding: "14px", borderBottom: "1px solid #2a2a2a" }}>
        <div className="flex items-baseline" style={{ gap: 8 }}>
          <span
            className="num"
            style={{
              fontSize: 22,
              color: "#ff2e88",
              fontWeight: 600,
              letterSpacing: "-0.01em",
            }}
          >
            {ticker}
          </span>
          <span style={{ fontSize: 11, color: "#d8d8d8" }}>{name}</span>
        </div>
        <div className="flex items-baseline" style={{ gap: 10, marginTop: 8 }}>
          <span
            style={{
              fontSize: 36,
              color: "#ff2e88",
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}
          >
            {aggregate.letter}
          </span>
          <div>
            <div
              className="num"
              style={{ fontSize: 13, color: "#d8d8d8" }}
            >
              {aggregate.score.toFixed(1)} / {aggregate.max}
              <span style={{ color: "#666", fontSize: 11 }}>{ciDisplay}</span>
            </div>
            <div
              style={{
                fontSize: 9,
                color: "#666",
                letterSpacing: "0.08em",
                marginTop: 3,
              }}
            >
              95% bootstrap CI · 1,000 resamples
            </div>
          </div>
        </div>
      </div>

      {/* Pillar header */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: "140px 60px 60px 60px 60px",
          padding: "6px 14px",
          gap: 10,
          background: "#050505",
          borderBottom: "1px solid #2a2a2a",
        }}
      >
        {["PILLAR", "WT", "SCORE", "LETTER", "CONTRIB"].map((h, i) => (
          <span
            key={h}
            style={{
              fontSize: 8.5,
              color: "#555",
              letterSpacing: "0.1em",
              textAlign: i === 0 ? "left" : "right",
              fontWeight: 500,
            }}
          >
            {h}
          </span>
        ))}
      </div>
      {pillars.map((p) => (
        <PillarRow key={p.name} p={p} />
      ))}

      {/* Verdict */}
      <div
        style={{
          padding: "14px",
          borderTop: "2px solid #ff2e88",
          background: "linear-gradient(180deg, rgba(255,46,136,0.06) 0%, transparent 70%)",
        }}
      >
        <div
          style={{
            fontSize: 9,
            color: "#666",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Verdict
        </div>
        <div
          style={{
            fontSize: 14,
            color: verdictColor(aggregate.verdictTone),
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          {aggregate.verdict}
        </div>
        <div className="num" style={{ fontSize: 11, color: "#d8d8d8", marginTop: 8 }}>
          Position cap ·{" "}
          <span style={{ color: "#ff2e88", fontWeight: 600 }}>{positionCap.toFixed(1)}%</span>{" "}
          <span style={{ color: "#555", fontSize: 9.5 }}>(half-Kelly)</span>
        </div>
      </div>

      {/* Methodology footer */}
      <div style={{ padding: "12px 14px", borderTop: "1px solid #2a2a2a" }}>
        <div
          style={{
            fontSize: 9,
            color: "#666",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          Methodology
        </div>
        <p
          className="num"
          style={{
            fontSize: 9.5,
            color: "#7a7a7a",
            lineHeight: 1.55,
            margin: 0,
            fontStyle: "italic",
          }}
        >
          Composite per METHODOLOGY.md §2. EM weights per Li, Wei &amp; Zhang (2023){" "}
          <span style={{ color: "#d8d8d8" }}>
            Pacific-Basin Finance Journal 82, Article 102175
          </span>
          . Bootstrap CI per 1,000-resample standard procedure.
        </p>
        <p
          style={{
            fontSize: 9.5,
            color: "#666",
            lineHeight: 1.5,
            margin: "6px 0 0",
          }}
        >
          {/* TODO: replace with lib/grade/pillars.ts computation once ported from src/utils/quantFactorEngine.js */}
          Pillar inputs currently hardcoded; live computation pending port of
          src/utils/quantFactorEngine.js → lib/grade/pillars.ts.
        </p>
      </div>
    </Sheet>
  );
}
