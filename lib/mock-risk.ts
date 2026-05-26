export const RISK_METRICS = [
  { label: "BETA · portfolio", value: "1.08", sub: "vs IHSG · 60mo" },
  { label: "VaR 95%", value: "−2.84%", sub: "1d · Cornish-Fisher", tone: "neg" as const },
  { label: "VaR 99%", value: "−4.21%", sub: "1d · Cornish-Fisher", tone: "neg" as const },
  { label: "Max Drawdown · TTM", value: "−18.42%", sub: "Jan-Apr 2026", tone: "neg" as const },
  { label: "Volatility · TTM", value: "18.4%", sub: "annualized · 60d" },
  { label: "Sharpe TTM", value: "1.18", sub: "Rf 6.842%", tone: "pos" as const },
  { label: "Sortino TTM", value: "1.64", sub: "downside-only", tone: "pos" as const },
  { label: "Tracking Error", value: "4.21%", sub: "vs IHSG TR" },
];

export const FACTOR_EXPOSURES = [
  { factor: "Value", z: -0.42 },
  { factor: "Quality", z: 1.84 },
  { factor: "Profitability", z: 1.42 },
  { factor: "Low-Volatility", z: 0.84 },
  { factor: "Size (SMB)", z: -1.42 },
  { factor: "Yield", z: 0.62 },
];

export const SECTOR_CONCENTRATION = [
  { sector: "Financials", port: 30.1, bench: 32.4, delta: -2.3 },
  { sector: "Cons Staples", port: 14.0, bench: 11.2, delta: 2.8 },
  { sector: "Basic Mats", port: 13.0, bench: 9.8, delta: 3.2 },
  { sector: "Industrials", port: 10.0, bench: 8.4, delta: 1.6 },
  { sector: "Energy", port: 8.0, bench: 8.2, delta: -0.2 },
  { sector: "Comm Svcs", port: 9.0, bench: 7.4, delta: 1.6 },
  { sector: "Real Estate", port: 0.0, bench: 3.2, delta: -3.2 },
  { sector: "Utilities", port: 0.0, bench: 2.8, delta: -2.8 },
];

export const STRESS_SCENARIOS = [
  { name: "IDR -10% vs USD", impact: -8.42, tone: "neg" as const, prob: "Tail" },
  { name: "BI rate +200bp", impact: -12.84, tone: "neg" as const, prob: "Low" },
  { name: "Commodity reversal -20%", impact: -4.21, tone: "neg" as const, prob: "Med" },
  { name: "Foreign outflow $1B 5d", impact: -6.42, tone: "neg" as const, prob: "Med" },
  { name: "Sovereign downgrade", impact: -15.84, tone: "neg" as const, prob: "Tail" },
  { name: "BI rate -100bp surprise", impact: 4.84, tone: "pos" as const, prob: "Low" },
];
