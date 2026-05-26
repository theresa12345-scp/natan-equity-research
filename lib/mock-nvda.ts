// Mock data for NVDA · NVIDIA Corporation · NASDAQ.
// US framework: 5-factor + momentum (Carhart 1997), NOT IDX 5-factor.
// DCF params from METHODOLOGY.md: UST 10Y 4.50%, ERP 6.0%, Beta 1.84, g 2.5%.
// Ke = 4.50 + 1.84 * 6.0 = 15.54%

export const NVDA_IDENTITY = {
  ticker: "NVDA",
  exchange: "US · NASDAQ",
  name: "NVIDIA Corporation",
  sector: "Information Technology",
  industry: "Semiconductors · AI Accelerators",
  market: "United States",
  currency: "USD",
  indices: ["S&P 500", "NDX", "SOX", "MAG-7"],
  rups: "2026-06-26",
  nextEarnings: "2026-08-27 AMC",
  fiscalYearEnd: "JAN",
} as const;

export const NVDA_KPIS = [
  { label: "MKT CAP", value: "$3.97 trn", sub: "5.4× SOX index", subTone: "neutral" as const },
  { label: "P/E FWD", value: "32.8×", sub: "peer 24.1× · prem +36%", subTone: "neutral" as const },
  { label: "P/S FWD", value: "21.4×", sub: "peer 7.8× · prem +174%", subTone: "neg" as const },
  { label: "ROE TTM", value: "98.4%", sub: "peer 28.4% · +70.0pp", subTone: "pos" as const },
  { label: "OP MGN", value: "62.1%", sub: "peer 31.2% · +30.9pp", subTone: "pos" as const },
  { label: "REV GROWTH", value: "+28.4%", sub: "3Y CAGR · vs peer +9.4%", subTone: "pos" as const },
  { label: "BETA", value: "1.84", sub: "vs S&P · 60mo", subTone: "neutral" as const },
  { label: "DIV YLD", value: "0.02%", sub: "buyback-heavy · $50B auth", subTone: "neutral" as const },
];

export const NVDA_GRADE = {
  letter: "B+",
  score: 76,
  max: 100,
  verdict: "HOLD · WATCH VALUATION",
  verdictTone: "hold" as const,
  horizon: "12 mo",
  targetPx: 148.2,
  targetUpsidePct: -9.0,
  downsidePx: 112.4,
  downsideDeltaPct: -31.0,
  rrRatio: 0.29,
  positionSize: 2.5,
};

// US-aware 8-pillar weights — Momentum INCLUDED per Carhart (1997).
// Validity per Fama-French 5 (2015) + Carhart momentum baseline.
export const NVDA_PILLARS = [
  { name: "Valuation", weight: 15, score: 38, letter: "D+", tone: "neg" as const,
    raw: { peFwd: 32.8, ps: 21.4, evEbitda: 38.4, pfcf: 48.2 }, pctRank: 8, contribution: 5.7 },
  { name: "Quality", weight: 15, score: 96, letter: "A+", tone: "pos" as const,
    raw: { roe: 98.4, gpoa: 0.74, operatingLeverage: "max" }, pctRank: 98, contribution: 14.4 },
  { name: "Profitability", weight: 10, score: 98, letter: "A+", tone: "pos" as const,
    raw: { grossMargin: 74.8, opMargin: 62.1, fcfConv: 0.92 }, pctRank: 99, contribution: 9.8 },
  { name: "Financial Health", weight: 10, score: 92, letter: "A", tone: "pos" as const,
    raw: { piotroskiF: 9, altmanZ: 8.42, netCash: 32.4 }, pctRank: 94, contribution: 9.2 },
  { name: "Low-Vol / Defensive", weight: 10, score: 56, letter: "C", tone: "amber" as const,
    raw: { beta: 1.84, realizedVol: 38.4, mddTtm: -32.4 }, pctRank: 38, contribution: 5.6 },
  { name: "Sentiment", weight: 10, score: 84, letter: "A−", tone: "pos" as const,
    raw: { score7d: 0.42, finBert: 0.62, n: 38 }, pctRank: 82, contribution: 8.4 },
  { name: "Growth", weight: 10, score: 94, letter: "A", tone: "pos" as const,
    raw: { rev3yCagr: 28.4, eps3yCagr: 84.2 }, pctRank: 96, contribution: 9.4 },
  { name: "Momentum (Carhart 12-1)", weight: 15, score: 88, letter: "A−", tone: "pos" as const,
    raw: { ret12m1: 84.2, decileRank: 9 }, pctRank: 92, contribution: 13.2 },
  { name: "Liquidity", weight: 5, score: 100, letter: "A+", tone: "pos" as const,
    raw: { adv: 38400, amihud: 0.000018 }, pctRank: 100, contribution: 5.0 },
];

export const NVDA_DRIVERS = [
  { label: "DCF", value: "RICH −9%", tone: "neg" as const },
  { label: "FACTOR Z", value: "+1.42", tone: "pos" as const },
  { label: "FLOW 5D", value: "+2.18", tone: "pos" as const },
  { label: "SENT 7D", value: "+0.42", tone: "pos" as const },
  { label: "MOMENTUM", value: "TOP DECILE", tone: "pos" as const },
];

export const NVDA_THESIS = `NVIDIA is the clearest expression of the AI capex cycle and the framework recognizes that: quality (96), growth (98), profitability (98), financial health (92), liquidity (98), and momentum (88) all rate near the maximum. But the valuation pillar at 38/100 (P/S 21.4×, P/E 32.8× fwd) is binding — DCF intrinsic ($148) sits 9% below market ($162), and the model penalizes extreme multiples explicitly. The 8-pillar composite lands at 76/100 in the HOLD band: BUY on quality alone is naive when valuation is this stretched. Verdict: HOLD · WATCH VALUATION at half policy weight (2.5% vs full 5%). The framework would upgrade to BUY on a multiple compression to ~25× P/E (around $125) or a quality deterioration that doesn't materialize. Bear watch: hyperscaler capex sustainability post-DeepSeek efficiency narratives.`;

export const NVDA_GRADE_HISTORY = [
  { month: "Jun '25", score: 82 },
  { month: "Jul '25", score: 84 },
  { month: "Aug '25", score: 82, marker: "Q2 ER" },
  { month: "Sep '25", score: 80 },
  { month: "Oct '25", score: 78 },
  { month: "Nov '25", score: 76, marker: "Q3 BEAT" },
  { month: "Dec '25", score: 74 },
  { month: "Jan '26", score: 72, marker: "DEEPSEEK" },
  { month: "Feb '26", score: 70 },
  { month: "Mar '26", score: 72 },
  { month: "Apr '26", score: 74 },
  { month: "May '26", score: 76 },
];

export const NVDA_DCF_CAPM = [
  { label: "Risk-free · UST 10Y", value: "4.50%" },
  { label: "ERP · Damodaran 2026 US", value: "6.00%" },
  { label: "Beta · 60mo vs S&P", value: "1.84" },
  { label: "CRP · US", value: "0.00%", note: "base mature market" },
  { label: "Cost of Equity (Ke)", value: "15.54%", emphasis: true },
];

export const NVDA_DCF_TERMINAL = [
  { label: "g∞ · perpetuity", value: "2.50%" },
  { label: "5y FCF CAGR", value: "18.40%" },
  { label: "Terminal op margin", value: "48%" },
  { label: "Buyback policy · TTM", value: "$50B auth" },
];

export const NVDA_DCF_OUTPUT = {
  intrinsic: 148.20,
  market: 162.84,
  upsidePct: -8.99,
  verdict: "RICH",
  verdictTone: "sell" as const,
  callout:
    "DCF intrinsic of $148.20 sits 9% below market — the model is telling you the AI capex assumption is already baked in. Quality/growth pillars at 96/98 deserve the premium; the question is whether the framework's high Ke (15.5% Beta-adjusted) and conservative g∞ (2.5%) understate durability of the moat. Half-weight HOLD is the calibrated answer: own it, but size for valuation drawdown risk.",
};

export const NVDA_DCF_PROJECTION = [
  { year: "FY26E", rev: 170.4, ebit: 105.8, tax: 22.22, ni: 83.58, capex: -4.2, fcfe: 79.38, df: 0.866, pv: 68.74 },
  { year: "FY27E", rev: 218.7, ebit: 137.8, tax: 28.94, ni: 108.86, capex: -5.4, fcfe: 103.46, df: 0.750, pv: 77.60 },
  { year: "FY28E", rev: 274.2, ebit: 175.5, tax: 36.86, ni: 138.64, capex: -6.8, fcfe: 131.84, df: 0.649, pv: 85.59 },
  { year: "FY29E", rev: 334.5, ebit: 217.4, tax: 45.65, ni: 171.75, capex: -8.4, fcfe: 163.35, df: 0.562, pv: 91.80 },
  { year: "FY30E", rev: 391.3, ebit: 258.3, tax: 54.24, ni: 204.06, capex: -9.8, fcfe: 194.26, df: 0.486, pv: 94.41 },
];

export const NVDA_DCF_SENSITIVITY = {
  keValues: [14.54, 15.04, 15.54, 16.04, 16.54],
  gValues: [1.5, 2.0, 2.5, 3.0, 3.5],
  rows: [
    [164.20, 168.40, 172.80, 177.40, 182.20],
    [156.20, 160.10, 164.20, 168.40, 172.80],
    [148.20, 151.80, 155.60, 159.40, 163.40],
    [141.00, 144.40, 147.80, 151.40, 155.20],
    [134.20, 137.40, 140.60, 143.80, 147.20],
  ],
  base: { row: 2, col: 2 },
};

export const NVDA_COMPS_COLUMNS = [
  "TICKER", "ISSUER", "SECT", "MCAP $bn", "P/E FWD", "P/S", "ROE", "OP MGN", "GROSS MGN", "REV g 3Y", "FCF Y", "EPS Δ", "3M PERF", "BETA", "GRADE",
] as const;

export const NVDA_COMPS = [
  { ticker: "NVDA", issuer: "NVIDIA", sect: "Semis · AI", mcap: 3970, pe: 32.8, ps: 21.4, roe: 98.4, nim: 62.1, cir: 74.8, npl: 28.4, divYld: 2.1, eps5y: 84.2, perf3m: 12.4, beta: 1.84, grade: "B+", highlight: "subject" as const },
  { ticker: "AVGO", issuer: "Broadcom", sect: "Semis", mcap: 1240, pe: 28.4, ps: 18.4, roe: 38.4, nim: 48.4, cir: 74.2, npl: 22.4, divYld: 4.21, eps5y: 24.1, perf3m: 4.8, beta: 1.42, grade: "A−" },
  { ticker: "AMD", issuer: "Advanced Micro Devices", sect: "Semis", mcap: 248, pe: 38.4, ps: 8.4, roe: 8.4, nim: 22.4, cir: 51.8, npl: 18.4, divYld: 0, eps5y: 18.4, perf3m: -2.1, beta: 1.94, grade: "B" },
  { ticker: "INTC", issuer: "Intel", sect: "Semis", mcap: 124, pe: 22.4, ps: 2.1, roe: -4.2, nim: 8.4, cir: 38.4, npl: -2.1, divYld: 1.84, eps5y: -12.4, perf3m: -8.4, beta: 1.18, grade: "C" },
  { ticker: "TSM", issuer: "Taiwan Semiconductor", sect: "Semis · Foundry", mcap: 884, pe: 22.8, ps: 8.4, roe: 28.4, nim: 42.1, cir: 52.4, npl: 12.4, divYld: 1.42, eps5y: 16.4, perf3m: 6.8, beta: 1.12, grade: "A−", highlight: "peer" as const },
  { ticker: "MU", issuer: "Micron Technology", sect: "Semis · Memory", mcap: 142, pe: 14.8, ps: 3.4, roe: 14.2, nim: 22.1, cir: 28.4, npl: 38.4, divYld: 0.51, eps5y: 8.4, perf3m: 18.4, beta: 1.48, grade: "B" },
  { ticker: "—", issuer: "MEGA-CAP TECH PEERS", sect: "—", mcap: 0, pe: 0, ps: 0, roe: 0, nim: 0, cir: 0, npl: 0, divYld: 0, eps5y: 0, perf3m: 0, beta: 0, grade: "—", isDivider: true },
  { ticker: "MSFT", issuer: "Microsoft", sect: "Software", mcap: 3420, pe: 30.4, ps: 12.4, roe: 38.4, nim: 42.1, cir: 68.4, npl: 12.4, divYld: 0.74, eps5y: 14.2, perf3m: 2.4, beta: 0.92, grade: "A−" },
  { ticker: "GOOGL", issuer: "Alphabet", sect: "Internet", mcap: 2180, pe: 22.4, ps: 6.4, roe: 28.4, nim: 32.1, cir: 56.4, npl: 8.4, divYld: 0.42, eps5y: 16.4, perf3m: 1.8, beta: 1.12, grade: "B+" },
  { ticker: "META", issuer: "Meta Platforms", sect: "Internet", mcap: 1480, pe: 24.4, ps: 8.4, roe: 32.1, nim: 38.4, cir: 81.2, npl: 12.4, divYld: 0.32, eps5y: 28.4, perf3m: 8.4, beta: 1.38, grade: "B+" },
];

export const NVDA_COMPS_PEER_AVG = {
  pe: 24.84, pbv: 0, ps: 7.74, roe: 22.84, nim: 32.04, npl: 14.43, divYld: 1.16, perf3m: 4.04, beta: 1.32,
};

export const NVDA_COMPS_DELTA = {
  pe: 32, pbv: 0, ps: 176, roe: 331, nim: 94, divYld: -55,
};

export const NVDA_COMPS_PROSE = `NVIDIA trades at a 176% P/S premium vs the mega-cap tech peer mean — justified to some extent by 331% ROE premium and 94% gross-margin advantage, but the absolute multiple is in territory historically associated with multiple compression. The grade's HOLD verdict isn't anti-NVDA — it's anti-paying-32×-forward-earnings-for-anything in a regime that has historically reverted.`;

export const NVDA_FACTORS = [
  { factor: "Value", z: -2.41, reading: "extremely expensive · P/E 32.8× peer 24.1×", tone: "neg" as const },
  { factor: "Quality", z: 2.84, reading: "max quality · operating leverage", tone: "pos" as const },
  { factor: "Profitability", z: 2.94, reading: "ROE 98% · gross 74%", tone: "pos" as const },
  { factor: "Momentum (Carhart)", z: 1.84, reading: "top decile · 12-1 month", tone: "pos" as const },
  { factor: "Low-Vol", z: -1.21, reading: "Beta 1.84 · realized σ 38%", tone: "neg" as const },
  { factor: "Size", z: -2.18, reading: "mega-cap · SMB headwind", tone: "neg" as const },
];

export const NVDA_COMPOSITE_Z = 1.42;

export const NVDA_OVERLAYS = [
  { label: "PEAD · D9", value: "+1.42", tone: "pos" as const, note: "Q4 beat · SUE top decile" },
  { label: "Cross-asset flow", value: "+2.18", tone: "pos" as const, note: "ETF inflows · QQQ +$8B 5d" },
  { label: "Sentiment (English)", value: "+0.42", tone: "pos" as const, note: "Bloomberg/Reuters · 38 articles 7d" },
  { label: "Catalyst", value: "BLACKWELL", tone: "pos" as const, note: "Hopper-to-Blackwell pricing power" },
];

export const NVDA_BACKTEST_STATS = [
  { label: "DSR", value: "0.984", note: "P[SR > null] · 98.4%" },
  { label: "CPCV μ", value: "1.124", note: "n=9 paths · σ 0.062" },
  { label: "Range", value: "[.98, 1.24]", note: "tight · σ/μ 5.5%" },
  { label: "CAGR net", value: "+24.8%", note: "after 12bps cost", tone: "pos" as const },
  { label: "MaxDD", value: "-38.40%", note: "Sep 2022 rate shock", tone: "neg" as const },
  { label: "Hit Rt", value: "72.4%", note: "104/144 months" },
];

export const NVDA_EQUITY_CURVE = [
  { yr: "'14", strat: 100, bench: 100 },
  { yr: "'15", strat: 118, bench: 104 },
  { yr: "'16", strat: 142, bench: 116 },
  { yr: "'17", strat: 184, bench: 142 },
  { yr: "'18", strat: 212, bench: 138 },
  { yr: "'19", strat: 248, bench: 178 },
  { yr: "'20", strat: 296, bench: 212 },
  { yr: "'21", strat: 384, bench: 268 },
  { yr: "'22", strat: 318, bench: 218 },
  { yr: "'23", strat: 462, bench: 268 },
  { yr: "'24", strat: 624, bench: 312 },
  { yr: "'25", strat: 738, bench: 342 },
];

export const NVDA_SENTIMENT = { score: 0.42, label: "Positive", n: 38, windowDays: 7 };

export const NVDA_SENT_HISTORY = [
  { day: "D-6", score: 0.62 },
  { day: "D-5", score: 0.58 },
  { day: "D-4", score: 0.51 },
  { day: "D-3", score: -0.32 },
  { day: "D-2", score: 0.21 },
  { day: "D-1", score: 0.48 },
  { day: "TDY", score: 0.42 },
];

export const NVDA_SOURCES = [
  { source: "Bloomberg", count: 12, avg: 0.51 },
  { source: "Reuters", count: 8, avg: 0.42 },
  { source: "WSJ", count: 7, avg: 0.38 },
  { source: "FT", count: 5, avg: 0.31 },
  { source: "CNBC", count: 4, avg: 0.58 },
  { source: "Barron's", count: 2, avg: 0.21 },
];

export const NVDA_NEWS = [
  { source: "BLOOMBERG", ts: "14:18 EDT", headline: "Hyperscaler capex 2026 estimates revised up 12% — META leads with $52B GenAI infra", score: 0.74, tone: "pos" as const },
  { source: "REUTERS", ts: "11:42 EDT", headline: "NVIDIA Blackwell production yield hits 84%, ahead of TSMC milestone schedule", score: 0.62, tone: "pos" as const },
  { source: "WSJ", ts: "09:14 EDT", headline: "DeepSeek-V3 efficiency claims raise NVIDIA dependency narrative — analysts split", score: -0.62, tone: "neg" as const },
  { source: "FT", ts: "D-1 16:48", headline: "US-China export controls expanded to H100 alternatives; NVDA China revenue at risk", score: -0.42, tone: "neg" as const },
  { source: "CNBC", ts: "D-1 13:20", headline: "Sovereign-AI infrastructure deals — KSA $40B, UAE $25B compute commitments", score: 0.71, tone: "pos" as const },
  { source: "BLOOMBERG", ts: "D-2 11:42", headline: "OpenAI commits to multi-year NVDA Blackwell capacity reservation through 2028", score: 0.84, tone: "pos" as const },
  { source: "REUTERS", ts: "D-3 14:18", headline: "AMD Instinct MI400 specs leak — first credible competitive challenge to Blackwell", score: -0.31, tone: "neg" as const },
  { source: "WSJ", ts: "D-4 10:42", headline: "NVIDIA inventories rise 22% sequentially — supply easing or demand wobble?", score: -0.18, tone: "neg" as const },
  { source: "BLOOMBERG", ts: "D-4 09:14", headline: "JPM Cazenove raises NVDA PT to $185 on FY27E EPS revision", score: 0.62, tone: "pos" as const },
  { source: "BARRONS", ts: "D-5 16:30", headline: "Tech-sector P/E spread widens to 5y high — NVDA in the 99th percentile", score: -0.21, tone: "neg" as const },
  { source: "CNBC", ts: "D-5 11:08", headline: "NVDA $50B buyback authorization announced; pace tilts toward FY26 H2", score: 0.58, tone: "pos" as const },
  { source: "FT", ts: "D-6 14:42", headline: "Analyst consensus: 38 BUY / 6 HOLD / 1 SELL · PT $185.40", score: 0.62, tone: "pos" as const },
];

export const NVDA_AUDIT_CITATIONS = [
  { tag: "CPCV", title: "Combinatorial Purged Cross-Validation", citation: "López de Prado (2018), Adv. in Financial Machine Learning, ch. 12" },
  { tag: "DSR", title: "Deflated Sharpe Ratio", citation: "Bailey & López de Prado (2014), JPM 40(5):94-107" },
  { tag: "MOMENTUM", title: "Carhart 4-factor — momentum INCLUDED for US", citation: "Carhart (1997), Journal of Finance 52(1)" },
  { tag: "FF5", title: "Fama-French 5-factor model", citation: "Fama & French (2015), JFE 116(1):1-22" },
  { tag: "QMJ", title: "Quality Minus Junk", citation: "Asness, Frazzini, Pedersen (2019), Rev. Acc. Studies 24(1):34-112" },
  { tag: "HXZ", title: "q-factor model — alternate to FF5", citation: "Hou, Xue & Zhang (2015), RFS 28(3):650-705" },
];

export const NVDA_BIAS_CONTROLS = [
  { label: "Look-ahead", active: true },
  { label: "Survivorship", active: true },
  { label: "Selection", active: true },
  { label: "Data-snooping (DSR)", active: true },
  { label: "Backfill", active: true },
  { label: "Time-zone alignment (US EST)", active: true },
  { label: "Transaction cost (S&P 4bps)", active: true },
  { label: "Slippage by ADV", active: true },
  { label: "Borrow cost (short leg)", active: true },
  { label: "Capacity haircut", active: true },
  { label: "Regime weighting", active: true },
  { label: "Multiple-testing penalty", active: true },
];

export const NVDA_REPRO = {
  repoUrl: "github.com/nluu/us-factor-backtest",
  commitHash: "b8a1f4d",
  buildStatus: "passing",
  coveragePct: 91.2,
  testCount: { pass: 24, total: 24 },
  codeLines: 5184,
  license: "MIT",
};

export const NVDA_LIMITATIONS = `Paper-tested on point-in-time data 2014–2025. US framework includes momentum (Carhart 1997) — distinct from IDX framework which excludes it (Wirjanto et al. 2023 calibration). Live performance typically 50–70% of backtest Sharpe. Beta-adjusted Ke 15.5% — extreme valuations sensitive to ERP regime; sensitivity heatmap recommended over point estimate.`;
