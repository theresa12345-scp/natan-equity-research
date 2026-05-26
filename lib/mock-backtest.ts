export const PERFORMANCE_STATS = [
  { label: "Cumulative return", value: "+382%", sub: "vs IHSG +189%", tone: "pos" as const },
  { label: "CAGR", value: "+18.2%", sub: "vs IHSG +9.4%", tone: "pos" as const },
  { label: "Volatility", value: "16.8%", sub: "vs IHSG 14.2%", tone: "neutral" as const },
  { label: "Sharpe ratio", value: "0.91", sub: "CPCV-validated", tone: "pos" as const },
  { label: "Deflated Sharpe Ratio", value: "0.997", sub: "N=8 trials · DSR > 0.95 required", tone: "pos" as const },
  { label: "Max drawdown", value: "-25.3%", sub: "recovery 18mo", tone: "neg" as const },
  { label: "Hit rate", value: "69.7%", sub: "100 / 144 months positive", tone: "pos" as const },
  { label: "Information ratio", value: "0.84", sub: "vs IHSG TR", tone: "pos" as const },
];

export const EQUITY_CURVE = Array.from({ length: 144 }, (_, i) => {
  const monthsIn = i + 1;
  const stratLog = Math.log(1) + (monthsIn / 12) * Math.log(1.182) + Math.sin(i / 6) * 0.04;
  const benchLog = Math.log(1) + (monthsIn / 12) * Math.log(1.094) + Math.sin(i / 8) * 0.03;
  return {
    date: `2014-${String(Math.floor(i / 12) + 1).padStart(4, "0")}`,
    year: 2014 + Math.floor(i / 12),
    strat: Math.round(100 * Math.exp(stratLog)),
    bench: Math.round(100 * Math.exp(benchLog)),
  };
});

export const ANNOTATIONS = [
  { date: "Aug 2015", label: "China crisis" },
  { date: "Mar 2020", label: "COVID" },
  { date: "Feb 2022", label: "Russia/Ukraine" },
  { date: "Oct 2022", label: "BoE crisis" },
];

export const CPCV_BARS = [
  { sr: 0.82, count: 1 },
  { sr: 0.85, count: 1 },
  { sr: 0.89, count: 2 },
  { sr: 0.92, count: 3 },
  { sr: 0.94, count: 1 },
  { sr: 0.96, count: 1 },
];

export const ISOLATED_FACTORS = [
  { factor: "Profitability", sr: 0.81 },
  { factor: "Low-Volatility", sr: 0.66 },
  { factor: "Quality", sr: 0.56 },
  { factor: "Value", sr: 0.45 },
  { factor: "Size", sr: 0.34 },
  { factor: "Momentum (excluded)", sr: 0.41, excluded: true },
];

export const SAVED_STRATEGIES = [
  { name: "Multi-Factor v2.1 (current)", universe: "LQ45", sharpe: 0.91, dsr: 0.997, mdd: -25.3, cagr: 18.2, saved: "2025-05-15" },
  { name: "Quality-Only IDX", universe: "LQ45", sharpe: 0.74, dsr: 0.91, mdd: -22.1, cagr: 14.8, saved: "2025-05-12" },
  { name: "Value-Only IDX", universe: "LQ45", sharpe: 0.42, dsr: 0.82, mdd: -38.4, cagr: 9.2, saved: "2025-05-10" },
  { name: "Momentum-Only IDX (control)", universe: "LQ45", sharpe: 0.12, dsr: 0.34, mdd: -42.1, cagr: 3.4, saved: "2025-05-08" },
  { name: "S&P 500 Multi-Factor", universe: "SPX", sharpe: 0.82, dsr: 0.94, mdd: -28.4, cagr: 12.4, saved: "2025-05-14" },
];

export const PILLAR_SLIDERS_IDX = [
  { name: "Valuation", weight: 20 },
  { name: "Quality", weight: 20 },
  { name: "Profitability", weight: 15 },
  { name: "Financial Health", weight: 10 },
  { name: "Low-Vol", weight: 10 },
  { name: "Sentiment", weight: 10 },
  { name: "Growth", weight: 5 },
  { name: "Momentum", weight: 5 },
  { name: "Liquidity", weight: 5 },
];

export const PILLAR_SLIDERS_US = [
  { name: "Valuation", weight: 15 },
  { name: "Quality", weight: 15 },
  { name: "Profitability", weight: 10 },
  { name: "Financial Health", weight: 10 },
  { name: "Low-Vol", weight: 10 },
  { name: "Sentiment", weight: 10 },
  { name: "Growth", weight: 10 },
  { name: "Momentum", weight: 15 },
  { name: "Liquidity", weight: 5 },
];

export const BACKTEST_AUDIT = [
  { tag: "CPCV", desc: "10 groups × 2 test · 45 splits → 9 paths · embargo 1%", cite: "López de Prado (2018), ch. 12" },
  { tag: "DSR", desc: "Multi-trial correction K=8 · skew −0.74 · kurt 2.96", cite: "Bailey & López de Prado (2014), JPM 40(5):94-107" },
  { tag: "PBO", desc: "Probability of Backtest Overfitting via CSCV", cite: "Bailey, Borwein, López de Prado, Zhu (2017)" },
  { tag: "FACTORS", desc: "152-factor Bayesian study · 5 significant on IDX · momentum excluded", cite: "Li, Wei & Zhang (2023), PBFJ 82:102175" },
  { tag: "COSTS", desc: "LQ45 18bps + 0.1% PPh sales tax · S&P 500 5bps · slippage by ADTV", cite: "PP 41/1994 (ID) · venue published commission schedule" },
  { tag: "BIAS", desc: "Point-in-time fundamentals · survivorship-honest · purge/embargo · K-tracked", cite: "Harvey, Liu & Zhu (2016), RFS 29(1):5-68" },
];
