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

export interface StressHolding {
  ticker: string;
  weight: number;       // portfolio weight pct
  benchWeight: number;  // benchmark weight pct
  portReturn: number;   // hypothetical return under scenario
  benchReturn: number;  // benchmark return under scenario for same sector
}

export interface StressScenario {
  id: string;
  name: string;
  impact: number;
  tone: "pos" | "neg";
  prob: "Low" | "Med" | "High" | "Tail";
  holdings: StressHolding[];
}

// Per-holding modeled returns under each scenario; aggregates feed
// Brinson-Fachler attribution: allocation = (wp - wb) * Rb;
// selection = wb * (Rp - Rb).
const PORTFOLIO_HOLDINGS_SHORT = [
  { ticker: "BBCA", weight: 10.42, benchWeight: 8.42 },
  { ticker: "BBRI", weight: 8.91, benchWeight: 6.84 },
  { ticker: "BMRI", weight: 7.84, benchWeight: 5.92 },
  { ticker: "TLKM", weight: 6.42, benchWeight: 4.21 },
  { ticker: "ASII", weight: 5.84, benchWeight: 3.84 },
  { ticker: "ICBP", weight: 4.92, benchWeight: 2.18 },
  { ticker: "UNVR", weight: 3.84, benchWeight: 1.94 },
  { ticker: "MYOR", weight: 3.42, benchWeight: 0.84 },
  { ticker: "SMGR", weight: 3.21, benchWeight: 1.21 },
  { ticker: "INTP", weight: 2.84, benchWeight: 0.94 },
  { ticker: "ADRO", weight: 2.62, benchWeight: 1.42 },
  { ticker: "PGAS", weight: 2.41, benchWeight: 1.84 },
];

function withReturns(scale: number, individualNoise: number[]): StressHolding[] {
  return PORTFOLIO_HOLDINGS_SHORT.map((h, i) => ({
    ...h,
    portReturn: scale + (individualNoise[i] ?? 0),
    benchReturn: scale * 0.85 + (individualNoise[i] ?? 0) * 0.6,
  }));
}

export const STRESS_SCENARIOS: StressScenario[] = [
  { id: "idr-shock", name: "IDR −10% vs USD", impact: -8.42, tone: "neg", prob: "Tail",
    holdings: withReturns(-8.4, [-3.2, -2.4, -2.8, -1.8, -4.2, -1.2, -2.1, -1.4, 0.4, -0.2, -2.8, -1.4]) },
  { id: "birate-up", name: "BI rate +200bp", impact: -12.84, tone: "neg", prob: "Low",
    holdings: withReturns(-12.8, [-3.4, -4.8, -4.2, -2.1, -2.8, -1.2, -0.4, -0.8, -2.4, -2.8, -1.4, -0.4]) },
  { id: "commodity-rev", name: "Commodity reversal −20%", impact: -4.21, tone: "neg", prob: "Med",
    holdings: withReturns(-4.2, [-0.8, -1.2, -1.4, -0.4, -2.1, 0.2, 0.4, 0.6, -1.8, -1.4, -4.8, -3.2]) },
  { id: "foreign-out", name: "Foreign outflow $1B 5d", impact: -6.42, tone: "neg", prob: "Med",
    holdings: withReturns(-6.4, [-2.8, -3.2, -2.4, -1.4, -2.1, -1.2, -0.8, -0.4, -1.8, -1.2, -2.4, -1.8]) },
  { id: "2008-gfc", name: "2008 GFC −38%", impact: -38.40, tone: "neg", prob: "Tail",
    holdings: withReturns(-38.4, [-12.4, -14.2, -13.4, -8.4, -16.2, -4.2, -2.1, -3.4, -8.2, -10.4, -18.4, -8.2]) },
  { id: "2013-taper", name: "2013 Taper Tantrum", impact: -15.84, tone: "neg", prob: "Tail",
    holdings: withReturns(-15.8, [-8.4, -6.2, -5.4, -3.8, -7.2, -1.4, -0.8, -1.2, -3.4, -2.8, -4.2, -2.4]) },
  { id: "sov-downgrade", name: "Sovereign downgrade", impact: -15.84, tone: "neg", prob: "Tail",
    holdings: withReturns(-15.8, [-8.4, -5.2, -6.4, -2.8, -3.4, -1.2, -0.8, -1.4, -2.8, -3.2, -1.8, -0.8]) },
  { id: "birate-down", name: "BI rate −100bp surprise", impact: 4.84, tone: "pos", prob: "Low",
    holdings: withReturns(4.8, [2.1, 3.2, 2.8, 1.4, 0.8, 0.4, 0.2, 0.6, 0.8, 0.4, 1.2, 0.8]) },
];

export interface AttributionRow {
  ticker: string;
  weight: number;
  scenarioReturn: number;
  allocEffect: number;
  selectionEffect: number;
  total: number;
}

// Brinson-Fachler (1985, JPM Spring:73-76):
// Allocation Effect (i) = (wp_i - wb_i) * Rb_i
// Selection Effect (i)  = wb_i * (Rp_i - Rb_i)
// Interaction folded into Selection.
export function brinsonFachler(s: StressScenario): AttributionRow[] {
  return s.holdings.map((h) => {
    const wDelta = (h.weight - h.benchWeight) / 100;
    const allocEffect = wDelta * h.benchReturn;
    const selectionEffect = (h.benchWeight / 100) * (h.portReturn - h.benchReturn);
    return {
      ticker: h.ticker,
      weight: h.weight,
      scenarioReturn: h.portReturn,
      allocEffect,
      selectionEffect,
      total: allocEffect + selectionEffect,
    };
  });
}
