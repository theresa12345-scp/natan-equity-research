interface Pillar {
  name: string;
  weight: number;
  score: number;
  letter: string;
  tone: "mag" | "pos" | "amber" | "neg";
}

interface VerdictCardProps {
  letter: string;
  score: number;
  max: number;
  compositeZ: number;
  pctRankLabel: string;     // e.g. "92nd %ile LQ45"
  pillars: Pillar[];
  regimeSensitivity?: string;
}

function badgeColor(score: number, max: number): string {
  const ratio = score / max;
  if (ratio >= 0.8) return "#00d97e";
  if (ratio >= 0.65) return "#ff2e88";
  if (ratio >= 0.5) return "#c4831f";
  return "#ff4d4f";
}

function compositeColor(z: number): string {
  if (z >= 1.5) return "#00d97e";
  if (z >= 0.5) return "#ff2e88";
  if (z >= -0.5) return "#c4831f";
  return "#ff4d4f";
}

export default function VerdictCard({
  letter,
  score,
  max,
  compositeZ,
  pctRankLabel,
  pillars,
  regimeSensitivity,
}: VerdictCardProps): JSX.Element {
  const sorted = pillars.slice().sort((a, b) => b.score - a.score);
  const topTwo = sorted.slice(0, 2);
  const bottom = sorted[sorted.length - 1];
  const tiltCopy = `${topTwo.map((p) => p.name.split(" ")[0]).join(" + ")} lead · ${bottom.name.split(" ")[0]} drag`;

  return (
    <div
      className="flex items-center"
      role="status"
      aria-label="Composite verdict summary"
      style={{
        padding: "8px 14px",
        borderBottom: "1px solid #2a2a2a",
        background: "linear-gradient(180deg, rgba(255,46,136,0.04) 0%, transparent 80%)",
        gap: 14,
        flexWrap: "wrap",
        minHeight: 38,
      }}
    >
      {/* Grade badge */}
      <div className="flex items-baseline" style={{ gap: 8, flexShrink: 0 }}>
        <span
          style={{
            fontSize: 9,
            color: "#666",
            letterSpacing: "0.14em",
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          Verdict
        </span>
        <span
          style={{
            fontSize: 20,
            color: badgeColor(score, max),
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          {letter}
        </span>
        <span className="num" style={{ fontSize: 11, color: "#d8d8d8" }}>
          {score.toFixed(1)}
          <span style={{ color: "#666" }}> / {max}</span>
        </span>
      </div>

      {/* Composite z + percentile */}
      <div className="flex items-baseline" style={{ gap: 6, flexShrink: 0 }}>
        <span
          style={{
            fontSize: 9,
            color: "#666",
            letterSpacing: "0.14em",
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          Composite
        </span>
        <span
          className="num"
          style={{
            fontSize: 14,
            color: compositeColor(compositeZ),
            fontWeight: 600,
            letterSpacing: "-0.01em",
          }}
        >
          {compositeZ >= 0 ? "+" : ""}{compositeZ.toFixed(2)}σ
        </span>
        <span
          className="num"
          style={{ fontSize: 10.5, color: "#7a7a7a", letterSpacing: "0.04em" }}
        >
          · {pctRankLabel}
        </span>
      </div>

      {/* Factor tilt */}
      <div className="flex items-baseline" style={{ gap: 6, minWidth: 0, flexShrink: 1 }}>
        <span
          style={{
            fontSize: 9,
            color: "#666",
            letterSpacing: "0.14em",
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          Tilt
        </span>
        <span
          style={{
            fontSize: 11,
            color: "#d8d8d8",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {tiltCopy}
        </span>
      </div>

      {/* Regime */}
      {regimeSensitivity ? (
        <div className="flex items-baseline ml-auto" style={{ gap: 6, flexShrink: 0 }}>
          <span
            style={{
              fontSize: 9,
              color: "#666",
              letterSpacing: "0.14em",
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            Regime
          </span>
          <span style={{ fontSize: 11, color: "#d8d8d8" }}>{regimeSensitivity}</span>
        </div>
      ) : null}
    </div>
  );
}
