// Inline SVG sparkline with a draw-in animation. Pure server-render —
// path length is approximated as Euclidean sum (close enough for
// dasharray purposes). Trend color: green when last > first, red when
// last < first, grey otherwise.

interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  strokeWidth?: number;
  color?: string; // override trend color if provided
  showAreaFill?: boolean;
}

export default function Sparkline({
  values,
  width = 64,
  height = 18,
  strokeWidth = 1.2,
  color,
  showAreaFill = false,
}: SparklineProps): JSX.Element {
  if (!values || values.length < 2) {
    return <svg width={width} height={height} aria-hidden="true" />;
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pad = 1;

  const points: Array<[number, number]> = values.map((v, i) => {
    const x = (i / (values.length - 1)) * (width - 2 * pad) + pad;
    const y = height - pad - ((v - min) / range) * (height - 2 * pad);
    return [x, y];
  });

  const polylineStr = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

  // Approximate path length for stroke-dasharray draw-in.
  let pathLen = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i][0] - points[i - 1][0];
    const dy = points[i][1] - points[i - 1][1];
    pathLen += Math.sqrt(dx * dx + dy * dy);
  }
  pathLen = Math.max(20, pathLen); // floor

  const trend = values[values.length - 1] - values[0];
  const stroke = color ?? (trend > 0 ? "#00d97e" : trend < 0 ? "#ff4d4f" : "#888");

  const areaPath = showAreaFill
    ? `M ${points[0][0]},${height - pad} L ${polylineStr.replace(/,/g, " ")} L ${points[points.length - 1][0]},${height - pad} Z`
    : null;

  return (
    <svg width={width} height={height} role="img" aria-label="Sparkline" style={{ display: "inline-block", verticalAlign: "middle" }}>
      {areaPath ? (
        <path d={areaPath} fill={stroke} fillOpacity={0.12} stroke="none" />
      ) : null}
      <polyline
        points={polylineStr}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="square"
        strokeLinejoin="miter"
        className="mrdn-draw"
        style={{
          strokeDasharray: `${pathLen.toFixed(0)} ${pathLen.toFixed(0)}`,
          strokeDashoffset: pathLen.toFixed(0),
        }}
      />
    </svg>
  );
}

// Deterministic price walk from a seed — used when no real time series
// is available (e.g., portfolio holdings without price history).
// Same ticker always yields the same walk; stable across reloads.
export function deterministicWalk(
  seed: string,
  n: number = 24,
  trend: number = 0,
  vol: number = 0.02,
): number[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let x = (h >>> 0) / 4294967295;
  const out: number[] = [];
  let p = 100;
  for (let i = 0; i < n; i++) {
    // Park-Miller-Carta LCG
    x = (x * 1103515245 + 12345) % 1;
    const step = (x - 0.5) * 2 * vol + trend / n;
    p = p * (1 + step);
    out.push(p);
  }
  return out;
}
