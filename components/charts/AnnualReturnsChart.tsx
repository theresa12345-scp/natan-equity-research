import { ANNUAL_RETURNS, BENCH_ANNUAL } from "@/lib/mock-backtest-ext";

export default function AnnualReturnsChart(): JSX.Element {
  const w = 580;
  const h = 180;
  const pad = { l: 42, r: 12, t: 20, b: 36 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const allVals = [
    ...ANNUAL_RETURNS.map((d) => d.ret),
    ...BENCH_ANNUAL.map((d) => d.ret),
  ];
  const max = Math.max(...allVals, 30);
  const min = Math.min(...allVals, -20);
  const yMid = pad.t + innerH * (max / (max - min));
  const y = (v: number): number => yMid - (v / (max - min)) * innerH;

  const groupW = innerW / ANNUAL_RETURNS.length;
  const barW = (groupW - 6) / 2;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" role="img" aria-label="Annual returns vs benchmark">
      {/* Y gridlines */}
      {[-20, -10, 0, 10, 20, 30].map((v) => (
        <g key={v}>
          <line x1={pad.l} x2={w - pad.r} y1={y(v)} y2={y(v)} stroke="#1a1a1a" strokeDasharray="2 3" />
          <text x={pad.l - 6} y={y(v) + 3} textAnchor="end" style={{ fontSize: 8.5, fill: "#555", fontFamily: "var(--font-jetbrains)" }}>{v}%</text>
        </g>
      ))}
      <line x1={pad.l} x2={w - pad.r} y1={yMid} y2={yMid} stroke="#2a2a2a" />

      {ANNUAL_RETURNS.map((d, i) => {
        const benchRet = BENCH_ANNUAL[i]?.ret ?? 0;
        const gx = pad.l + i * groupW + 3;
        const strat = { x: gx, top: Math.min(yMid, y(d.ret)), height: Math.abs(y(d.ret) - yMid) };
        const bench = { x: gx + barW + 0, top: Math.min(yMid, y(benchRet)), height: Math.abs(y(benchRet) - yMid) };
        return (
          <g key={d.year}>
            <rect x={strat.x} y={strat.top} width={barW} height={strat.height} fill={d.ret >= 0 ? "#ff2e88" : "#ff4d4f"} opacity={0.85} />
            <rect x={bench.x} y={bench.top} width={barW} height={bench.height} fill={benchRet >= 0 ? "#7a7a7a" : "#5a4040"} opacity={0.85} />
            <text x={gx + (groupW - 6) / 2} y={h - 18} textAnchor="middle" style={{ fontSize: 8.5, fill: "#666", fontFamily: "var(--font-jetbrains)" }}>{String(d.year).slice(2)}</text>
          </g>
        );
      })}
      {/* Legend */}
      <g transform={`translate(${pad.l}, ${pad.t - 8})`}>
        <rect x={0} y={0} width={10} height={5} fill="#ff2e88" />
        <text x={14} y={5} style={{ fontSize: 9, fill: "#d8d8d8", fontFamily: "var(--font-geist-sans)" }}>Composite v2.1</text>
        <rect x={110} y={0} width={10} height={5} fill="#7a7a7a" />
        <text x={124} y={5} style={{ fontSize: 9, fill: "#7a7a7a", fontFamily: "var(--font-geist-sans)" }}>IHSG TR</text>
      </g>
    </svg>
  );
}
