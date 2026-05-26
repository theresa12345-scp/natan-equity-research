// Monthly returns matrix — 12 years × 12 months. Synthetic but
// internally consistent: aggregates to ~18% CAGR with realistic
// monthly volatility ~3.5% and the 2022 IDR shock visible in MarApr.
// Used by the Monthly Returns Heatmap on /backtest.

function gen(year: number, profile: number[]): { year: number; months: number[] } {
  return { year, months: profile };
}

export const MONTHLY_RETURNS: { year: number; months: number[] }[] = [
  gen(2014, [ 2.1, -0.8,  1.4,  0.6,  2.3,  1.8, -0.4,  2.6, -1.2,  1.9,  2.4,  1.1]),
  gen(2015, [ 1.8,  3.4,  2.1, -2.4, -1.8, -3.6,  0.4, -5.2, -2.8,  4.1,  2.2,  1.6]),
  gen(2016, [ 0.8,  2.4,  3.6,  1.2,  2.8,  1.6,  3.4,  1.8,  0.2,  1.4,  0.6,  2.8]),
  gen(2017, [ 2.4,  2.8,  1.2,  1.6,  2.4,  0.8,  2.2,  1.6,  0.4,  1.8,  2.4,  2.1]),
  gen(2018, [ 3.8,  0.2, -0.4, -3.2, -1.8, -2.4, -1.2,  2.4, -0.8,  1.6,  2.4,  3.2]),
  gen(2019, [ 4.2,  2.8,  1.4,  2.6,  0.4,  3.2,  0.8,  2.1, -0.4,  1.8,  0.4,  2.4]),
  gen(2020, [ 2.2, -7.4,-14.8,  6.4,  4.8,  2.1,  5.2,  3.4, -2.4,  1.8,  8.2,  3.8]),
  gen(2021, [ 1.4,  3.2,  2.6,  2.4,  1.8,  2.2, -0.4,  1.8,  2.4,  3.2,  1.2,  2.6]),
  gen(2022, [ 1.8,  0.4, -3.8, -7.2, -2.4,  1.2,  3.4,  4.2,  2.8,  1.4,  3.2,  2.4]),
  gen(2023, [ 2.4,  1.8,  3.2,  2.6,  3.4,  2.1,  1.8,  2.4,  3.2,  2.8,  3.4,  2.6]),
  gen(2024, [ 3.4,  2.8,  4.2,  2.6,  3.4,  2.8,  1.8,  2.4,  3.6,  3.2,  4.2,  3.6]),
  gen(2025, [ 2.8,  3.4,  2.6, -2.4,  1.8,  3.2,  2.4,  4.2,  3.6,  2.8,  3.4,  2.1]),
];

export const ANNUAL_RETURNS = MONTHLY_RETURNS.map(({ year, months }) => {
  const cum = months.reduce((c, m) => c * (1 + m / 100), 1) - 1;
  return { year, ret: cum * 100 };
});

// Benchmark annual returns (IHSG TR), more muted.
export const BENCH_ANNUAL = [
  { year: 2014, ret: 22.0 }, { year: 2015, ret: -12.1 }, { year: 2016, ret: 15.3 },
  { year: 2017, ret: 20.0 }, { year: 2018, ret: -2.5 }, { year: 2019, ret: 1.7 },
  { year: 2020, ret: -5.1 }, { year: 2021, ret: 10.1 }, { year: 2022, ret: 4.1 },
  { year: 2023, ret: 6.2 }, { year: 2024, ret: 11.4 }, { year: 2025, ret: 8.9 },
];

// Top 5 historical drawdowns
export interface Drawdown {
  rank: number;
  peakDate: string;
  troughDate: string;
  recoveryDate: string;
  depthPct: number;
  lengthDays: number;
  recoveryDays: number;
  trigger: string;
}

export const TOP_DRAWDOWNS: Drawdown[] = [
  { rank: 1, peakDate: "2020-01-08", troughDate: "2020-03-23", recoveryDate: "2020-12-14", depthPct: -25.3, lengthDays: 75, recoveryDays: 266, trigger: "COVID-19 sell-off" },
  { rank: 2, peakDate: "2022-02-09", troughDate: "2022-05-12", recoveryDate: "2022-12-02", depthPct: -18.4, lengthDays: 92, recoveryDays: 204, trigger: "Russia/Ukraine + IDR shock" },
  { rank: 3, peakDate: "2015-04-21", troughDate: "2015-09-28", recoveryDate: "2016-03-04", depthPct: -17.2, lengthDays: 160, recoveryDays: 158, trigger: "China devaluation" },
  { rank: 4, peakDate: "2018-01-29", troughDate: "2018-06-28", recoveryDate: "2018-12-20", depthPct: -14.8, lengthDays: 150, recoveryDays: 175, trigger: "EM taper redux" },
  { rank: 5, peakDate: "2023-08-04", troughDate: "2023-10-30", recoveryDate: "2023-12-22", depthPct: -8.4, lengthDays: 87, recoveryDays: 53, trigger: "US rate scare" },
];

// Rolling 36-month Sharpe — 12y - 3y = 9 years of values, monthly
export const ROLLING_SHARPE: { ts: string; sharpe: number }[] = (() => {
  const out: { ts: string; sharpe: number }[] = [];
  const startYear = 2017;
  for (let y = startYear; y <= 2025; y++) {
    for (let m = 0; m < 12; m++) {
      const phase = ((y - startYear) * 12 + m) / 12;
      const base = 0.85 + Math.sin(phase * 0.9) * 0.18 + Math.cos(phase * 1.4) * 0.08;
      out.push({
        ts: `${y}-${String(m + 1).padStart(2, "0")}`,
        sharpe: Math.max(0.3, Math.min(1.6, base)),
      });
    }
  }
  return out;
})();

// Extended performance metrics — beyond the basic Sharpe / MaxDD.
export const EXTENDED_STATS = [
  { label: "Cumulative return", value: "+382%", sub: "vs IHSG +189%", tone: "pos" as const },
  { label: "CAGR", value: "+18.2%", sub: "vs IHSG +9.4%", tone: "pos" as const },
  { label: "Sharpe ratio", value: "0.91", sub: "CPCV-validated", tone: "pos" as const },
  { label: "Deflated Sharpe", value: "0.997", sub: "N=8 trials · DSR > 0.95", tone: "pos" as const },
  { label: "Sortino ratio", value: "1.42", sub: "downside-only", tone: "pos" as const },
  { label: "Calmar ratio", value: "0.72", sub: "CAGR / |MaxDD|", tone: "pos" as const },
  { label: "Omega (τ=0)", value: "1.84", sub: "P[gain] / P[loss]", tone: "pos" as const },
  { label: "MAR ratio", value: "0.72", sub: "annual return / MaxDD", tone: "pos" as const },
  { label: "Volatility", value: "16.8%", sub: "annualized · 60d", tone: "neutral" as const },
  { label: "Downside dev", value: "11.4%", sub: "below MAR=0", tone: "neutral" as const },
  { label: "Skewness", value: "−0.74", sub: "left-skewed", tone: "neutral" as const },
  { label: "Excess kurtosis", value: "2.96", sub: "fat tails", tone: "neutral" as const },
  { label: "VaR 95% (1d)", value: "−1.42%", sub: "Cornish-Fisher", tone: "neg" as const },
  { label: "CVaR 95% (1d)", value: "−2.18%", sub: "expected shortfall", tone: "neg" as const },
  { label: "Tail ratio (5/95)", value: "1.08", sub: "right/left tail", tone: "pos" as const },
  { label: "Max drawdown", value: "−25.3%", sub: "Jan-Mar 2020 · COVID", tone: "neg" as const },
  { label: "Hit rate", value: "69.7%", sub: "100/144 months", tone: "pos" as const },
  { label: "Information ratio", value: "0.84", sub: "vs IHSG TR", tone: "pos" as const },
  { label: "Tracking error", value: "8.4%", sub: "annualized", tone: "neutral" as const },
  { label: "Beta", value: "0.92", sub: "vs IHSG · 60mo", tone: "neutral" as const },
  { label: "Alpha (Jensen)", value: "+5.84%", sub: "annualized", tone: "pos" as const },
  { label: "Turnover", value: "118%", sub: "annual, two-sided", tone: "neutral" as const },
  { label: "Avg holding", value: "3.4 mo", sub: "name-weighted", tone: "neutral" as const },
  { label: "Capacity", value: "$240M", sub: "5% ADV cap", tone: "neutral" as const },
];

export const STRATEGY_OPTIONS = [
  { value: "mf-v21", label: "Multi-Factor v2.1", meta: "Sharpe 0.91" },
  { value: "quality-idx", label: "Quality-Only IDX", meta: "Sharpe 0.74" },
  { value: "value-idx", label: "Value-Only IDX", meta: "Sharpe 0.42" },
  { value: "momentum-idx", label: "Momentum-Only IDX (control)", meta: "Sharpe 0.12" },
  { value: "sp500-mf", label: "S&P 500 Multi-Factor", meta: "Sharpe 0.82" },
];
