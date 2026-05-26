import { MONTHLY_RETURNS } from "@/lib/mock-backtest-ext";

// Compute underwater equity curve from the monthly returns matrix.
function buildUnderwater(): { idx: number; date: string; dd: number }[] {
  const out: { idx: number; date: string; dd: number }[] = [];
  let cum = 1;
  let peak = 1;
  let i = 0;
  for (const { year, months } of MONTHLY_RETURNS) {
    for (let m = 0; m < months.length; m++) {
      cum *= 1 + months[m] / 100;
      peak = Math.max(peak, cum);
      const dd = (cum / peak - 1) * 100;
      out.push({ idx: i++, date: `${year}-${String(m + 1).padStart(2, "0")}`, dd });
    }
  }
  return out;
}

export default function DrawdownChart(): JSX.Element {
  const data = buildUnderwater();
  const w = 580;
  const h = 140;
  const pad = { l: 42, r: 12, t: 14, b: 22 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const min = Math.min(...data.map((d) => d.dd));
  const xStep = innerW / (data.length - 1);
  const x = (i: number): number => pad.l + i * xStep;
  const y = (v: number): number => pad.t + ((0 - v) / (0 - min)) * innerH;

  // Build a filled area below 0
  const pts = data.map((d, i) => `${x(i)},${y(d.dd)}`).join(" L ");
  const areaPath = `M ${x(0)},${pad.t} L ${pts} L ${x(data.length - 1)},${pad.t} Z`;

  const ticks = [-5, -10, -15, -20, -25];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" role="img" aria-label="Drawdown · underwater equity curve">
      {ticks.map((v) => (
        <g key={v}>
          <line x1={pad.l} x2={w - pad.r} y1={y(v)} y2={y(v)} stroke="#1a1a1a" strokeDasharray="2 3" />
          <text x={pad.l - 6} y={y(v) + 3} textAnchor="end" style={{ fontSize: 8.5, fill: "#555", fontFamily: "var(--font-jetbrains)" }}>{v}%</text>
        </g>
      ))}
      <line x1={pad.l} x2={w - pad.r} y1={pad.t} y2={pad.t} stroke="#2a2a2a" />
      <text x={pad.l - 6} y={pad.t + 3} textAnchor="end" style={{ fontSize: 8.5, fill: "#7a7a7a", fontFamily: "var(--font-jetbrains)" }}>0%</text>

      <path d={areaPath} fill="#ff4d4f" fillOpacity={0.28} stroke="#ff4d4f" strokeWidth={1} />

      {[2014, 2016, 2018, 2020, 2022, 2024].map((yr) => {
        const i = Math.round(((yr - 2014) / 12) * data.length);
        return (
          <text key={yr} x={x(i)} y={h - 6} textAnchor="middle" style={{ fontSize: 9, fill: "#666", fontFamily: "var(--font-jetbrains)" }}>{yr}</text>
        );
      })}
    </svg>
  );
}
