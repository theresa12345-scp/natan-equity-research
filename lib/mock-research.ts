// Mock data for the QRES (Research) section — methodology audit notebook.

export const RESEARCH_HYPOTHESIS = `Composite multi-factor signals on IDX outperform single-factor strategies after CPCV-validated, DSR-corrected backtesting. Momentum is excluded per Wirjanto et al. (2023) — Indonesian momentum factor fails DSR significance vs K=8 trials. The composite (Value 25% + Quality 25% + Profitability 20% + Low-Vol 20% + Size 10%) plus overlay tilts (PEAD, Flow, Sentiment) delivers Sharpe 0.90 ± 0.04 across 9 CPCV paths. Methodology fully audited; live performance discount 30–50% applied.`;

export const CPCV_PATHS = [
  { sr: 0.82, label: "p1" },
  { sr: 0.85, label: "p2" },
  { sr: 0.89, label: "p3" },
  { sr: 0.89, label: "p4" },
  { sr: 0.92, label: "p5" },
  { sr: 0.92, label: "p6" },
  { sr: 0.92, label: "p7" },
  { sr: 0.94, label: "p8" },
  { sr: 0.96, label: "p9" },
];

export const CPCV_NULL_MARKER = -0.027;
export const CPCV_SINGLE_PATH = 0.953;
export const CPCV_MEAN = 0.904;

export const ISOLATED_FACTORS = [
  { factor: "Profitability", sr: 0.81 },
  { factor: "Low-Volatility", sr: 0.66 },
  { factor: "Quality", sr: 0.56 },
  { factor: "Value", sr: 0.45 },
  { factor: "Size", sr: 0.34 },
  { factor: "Momentum", sr: 0.41, excluded: true },
];

export const COMPOSITE_SR = 0.90;
