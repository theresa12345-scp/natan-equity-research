interface Sentiment {
  score: number;
  label: string;
  n: number;
  windowDays: number;
}

interface SentHistoryPoint {
  day: string;
  score: number;
}

interface Source {
  source: string;
  count: number;
  avg: number;
}

interface NewsRow {
  source: string;
  ts: string;
  headline: string;
  bahasa?: string;
  score: number;
  tone: "pos" | "neg" | "neutral";
}

interface NewsModuleProps {
  sentiment: Sentiment;
  history: SentHistoryPoint[];
  sources: Source[];
  feed: NewsRow[];
}

function toneColor(t: NewsRow["tone"]): string {
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

function SentimentGauge({ score }: { score: number }): JSX.Element {
  // Semi-circular gauge, range -1 → +1, needle at score
  const r = 80;
  const cx = 110;
  const cy = 90;
  const startAngle = 180; // degrees
  const endAngle = 0;
  const clamped = Math.max(-1, Math.min(1, score));
  const t = (clamped + 1) / 2; // 0..1
  const needleAngle = startAngle - t * (startAngle - endAngle); // degrees
  const rad = (needleAngle * Math.PI) / 180;
  const nx = cx + r * Math.cos(rad);
  const ny = cy - r * Math.sin(rad);

  // arc segments
  function arcPath(a0: number, a1: number, radius: number): string {
    const rad0 = (a0 * Math.PI) / 180;
    const rad1 = (a1 * Math.PI) / 180;
    const x0 = cx + radius * Math.cos(rad0);
    const y0 = cy - radius * Math.sin(rad0);
    const x1 = cx + radius * Math.cos(rad1);
    const y1 = cy - radius * Math.sin(rad1);
    const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
    return `M ${x0} ${y0} A ${radius} ${radius} 0 ${large} 0 ${x1} ${y1}`;
  }

  return (
    <svg viewBox="0 0 220 110" width="100%" style={{ maxWidth: 280 }} role="img" aria-label="Sentiment gauge">
      {/* base track */}
      <path d={arcPath(180, 0, r)} stroke="#1a1a1a" strokeWidth={12} fill="none" />
      {/* negative half */}
      <path d={arcPath(180, 90, r)} stroke="#3d1a1a" strokeWidth={12} fill="none" opacity={0.7} />
      {/* positive half */}
      <path d={arcPath(90, 0, r)} stroke="#1a3d24" strokeWidth={12} fill="none" opacity={0.7} />
      {/* fill arc up to needle */}
      <path
        d={arcPath(180, needleAngle, r)}
        stroke={score >= 0 ? "#00d97e" : "#ff4d4f"}
        strokeWidth={12}
        fill="none"
        opacity={0.9}
      />
      {/* tick marks */}
      {[180, 135, 90, 45, 0].map((a) => {
        const rd = (a * Math.PI) / 180;
        const x0 = cx + (r - 8) * Math.cos(rd);
        const y0 = cy - (r - 8) * Math.sin(rd);
        const x1 = cx + (r + 8) * Math.cos(rd);
        const y1 = cy - (r + 8) * Math.sin(rd);
        return (
          <line key={a} x1={x0} y1={y0} x2={x1} y2={y1} stroke="#444" strokeWidth={1} />
        );
      })}
      {/* needle */}
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#ff2e88" strokeWidth={2.5} />
      <circle cx={cx} cy={cy} r={4} fill="#ff2e88" />
      {/* labels */}
      <text x={cx - r - 8} y={cy + 14} style={{ fontSize: 9, fill: "#7a7a7a", fontFamily: "var(--font-jetbrains)" }}>−1.0</text>
      <text x={cx + r - 14} y={cy + 14} style={{ fontSize: 9, fill: "#7a7a7a", fontFamily: "var(--font-jetbrains)" }}>+1.0</text>
    </svg>
  );
}

function SentHistoryChart({ data }: { data: SentHistoryPoint[] }): JSX.Element {
  const w = 260;
  const h = 90;
  const pad = 18;
  const max = 1;
  const min = -1;
  const barW = (w - pad * 2) / data.length - 4;
  const x0 = pad;
  const y0 = pad;
  const innerH = h - pad * 2;
  const yMid = y0 + innerH / 2;
  const yScale = (v: number): number =>
    yMid - ((v - 0) / (max - min)) * innerH;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" role="img" aria-label="7-day sentiment">
      <line x1={x0} x2={w - pad} y1={yMid} y2={yMid} stroke="#2a2a2a" />
      {data.map((d, i) => {
        const x = x0 + i * ((w - pad * 2) / data.length);
        const top = d.score >= 0 ? yScale(d.score) : yMid;
        const height = Math.abs(yScale(d.score) - yMid);
        return (
          <g key={d.day}>
            <rect
              x={x}
              y={top}
              width={barW}
              height={height}
              fill={d.score >= 0 ? "#00d97e" : "#ff4d4f"}
              opacity={0.85}
            />
            <text
              x={x + barW / 2}
              y={h - 4}
              textAnchor="middle"
              style={{ fontSize: 8, fill: "#666", fontFamily: "var(--font-jetbrains)" }}
            >
              {d.day}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function NewsModule({
  sentiment,
  history,
  sources,
  feed,
}: NewsModuleProps): JSX.Element {
  const sentColor =
    sentiment.score > 0.2 ? "#00d97e" : sentiment.score < -0.2 ? "#ff4d4f" : "#ff2e88";

  return (
    <div className="grid" style={{ gridTemplateColumns: "40% 60%", minHeight: 0 }}>
      {/* LEFT: gauge + history + sources */}
      <section style={{ borderRight: "1px solid #2a2a2a", minWidth: 0 }}>
        <SectionHeader title="Sentiment · rolling 7d" />
        <div style={{ padding: "16px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <SentimentGauge score={sentiment.score} />
          <div style={{ marginTop: 6, textAlign: "center" }}>
            <span
              className="num"
              style={{ fontSize: 24, color: sentColor, fontWeight: 600 }}
            >
              {sentiment.score >= 0 ? "+" : ""}
              {sentiment.score.toFixed(2)}
            </span>
            <span
              style={{
                marginLeft: 8,
                fontSize: 11,
                color: sentColor,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {sentiment.label}
            </span>
          </div>
          <div className="num" style={{ fontSize: 10, color: "#7a7a7a", marginTop: 2 }}>
            n={sentiment.n} headlines · {sentiment.windowDays}d
          </div>
        </div>

        <SectionHeader title="Daily Sentiment · D-6 → TDY" />
        <div style={{ padding: "12px 16px" }}>
          <SentHistoryChart data={history} />
        </div>

        <SectionHeader title="Source Breakdown" />
        <div>
          {sources.map((s) => (
            <div
              key={s.source}
              className="grid items-center"
              style={{
                gridTemplateColumns: "1fr auto auto",
                height: 22,
                padding: "0 12px",
                borderBottom: "1px solid #111",
                gap: 10,
              }}
            >
              <span style={{ fontSize: 11, color: "#d8d8d8" }}>{s.source}</span>
              <span className="num" style={{ fontSize: 10, color: "#666" }}>
                {s.count}
              </span>
              <span
                className="num"
                style={{
                  fontSize: 11,
                  color: s.avg >= 0 ? "#00d97e" : "#ff4d4f",
                  minWidth: 50,
                  textAlign: "right",
                }}
              >
                {s.avg >= 0 ? "+" : ""}{s.avg.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* RIGHT: headline feed */}
      <section style={{ minWidth: 0, overflow: "hidden" }}>
        <SectionHeader title={`Headline Feed · ${feed.length} items`} meta="rolling 7d" />
        <div>
          {feed.map((n, i) => (
            <article
              key={i}
              className="grid"
              style={{
                gridTemplateColumns: "120px 1fr 60px",
                padding: "8px 12px",
                borderBottom: "1px solid #111",
                gap: 12,
              }}
            >
              <div>
                <div
                  className="num"
                  style={{
                    fontSize: 9.5,
                    color: "#ff2e88",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                  }}
                >
                  {n.source}
                </div>
                <div
                  className="num"
                  style={{ fontSize: 9, color: "#666", marginTop: 2 }}
                >
                  {n.ts}
                </div>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11.5, color: "#d8d8d8", lineHeight: 1.45 }}>
                  {n.headline}
                </div>
                {n.bahasa ? (
                  <div
                    style={{
                      fontSize: 10,
                      color: "#666",
                      fontStyle: "italic",
                      marginTop: 2,
                      lineHeight: 1.4,
                    }}
                  >
                    {n.bahasa}
                  </div>
                ) : null}
              </div>
              <span
                className="num"
                style={{
                  fontSize: 11,
                  color: toneColor(n.tone),
                  textAlign: "right",
                  alignSelf: "start",
                  marginTop: 2,
                }}
              >
                {n.score >= 0 ? "+" : ""}
                {n.score.toFixed(2)}
              </span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
