import { ROLLING_SHARPE } from "@/lib/mock-backtest-ext";

export default function RollingSharpeChart(): JSX.Element {
  const data = ROLLING_SHARPE;
  const w = 580;
  const h = 140;
  const pad = { l: 36, r: 12, t: 14, b: 22 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const min = 0;
  const max = 1.8;
  const xStep = innerW / (data.length - 1);
  const x = (i: number): number => pad.l + i * xStep;
  const y = (v: number): number => pad.t + innerH - ((v - min) / (max - min)) * innerH;
  const pts = data.map((d, i) => `${x(i)},${y(d.sharpe)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" role="img" aria-label="Rolling 36-month Sharpe ratio">
      {[0, 0.5, 1.0, 1.5].map((v) => (
        <g key={v}>
          <line x1={pad.l} x2={w - pad.r} y1={y(v)} y2={y(v)} stroke="#1a1a1a" strokeDasharray="2 3" />
          <text x={pad.l - 6} y={y(v) + 3} textAnchor="end" style={{ fontSize: 8.5, fill: "#555", fontFamily: "var(--font-jetbrains)" }}>{v.toFixed(1)}</text>
        </g>
      ))}
      {/* Reference line at Sharpe = 1.0 */}
      <line x1={pad.l} x2={w - pad.r} y1={y(1.0)} y2={y(1.0)} stroke="#ff2e88" strokeDasharray="3 4" opacity={0.5} />
      <polyline fill="none" stroke="#ff2e88" strokeWidth={1.5} points={pts} />

      {[2017, 2019, 2021, 2023, 2025].map((yr) => {
        const i = Math.round(((yr - 2017) / 9) * data.length);
        return (
          <text key={yr} x={x(Math.min(i, data.length - 1))} y={h - 6} textAnchor="middle" style={{ fontSize: 9, fill: "#666", fontFamily: "var(--font-jetbrains)" }}>{yr}</text>
        );
      })}
      <text x={pad.l} y={pad.t - 2} style={{ fontSize: 8.5, fill: "#7a7a7a", fontFamily: "var(--font-geist-sans)", letterSpacing: "0.08em" }}>3Y ROLLING</text>
    </svg>
  );
}
