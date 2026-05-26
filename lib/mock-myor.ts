// Mock data for MYOR · Mayora Indah · IDX Consumer Staples.
// TODO: replace pillar scores with lib/grade/pillars.ts computation once
// that's ported from src/utils/mlFactorWeighting.js (Phase 3+).
// Computed verdict (B / HOLD · NEUTRAL) follows from the score, not pre-decided.

export const MYOR_IDENTITY = {
  ticker: "MYOR",
  exchange: "IJ · IDX",
  name: "PT Mayora Indah Tbk",
  sector: "Consumer Staples",
  industry: "Food Products · Snacks · Coffee",
  market: "Indonesia",
  currency: "IDR",
  indices: ["LQ45", "KOMPAS100", "JII"],
  rups: "2026-05-08",
  nextEarnings: "2026-08-06 AMC",
  fiscalYearEnd: "DEC",
} as const;

export const MYOR_KPIS = [
  { label: "MKT CAP", value: "Rp 62.8 trn", sub: "$3.54 bn @ 17,742", subTone: "neutral" as const },
  { label: "P/E NTM", value: "22.4×", sub: "peer 19.8× · prem +13%", subTone: "neutral" as const },
  { label: "P/BV", value: "3.84×", sub: "peer 3.21× · prem +20%", subTone: "neutral" as const },
  { label: "ROE FY26E", value: "21.8%", sub: "peer 17.4% · +4.4pp", subTone: "pos" as const },
  { label: "GROSS MGN", value: "28.4%", sub: "peer 26.1% · +2.3pp", subTone: "pos" as const },
  { label: "REV GROWTH", value: "+9.2%", sub: "3Y CAGR · vs peer +6.8%", subTone: "pos" as const },
  { label: "BETA", value: "0.84", sub: "vs IHSG · 60mo", subTone: "neutral" as const },
  { label: "DIV YLD", value: "1.84%", sub: "payout 38% · TTM", subTone: "neutral" as const },
];

export const MYOR_GRADE = {
  letter: "B",
  score: 72,
  max: 100,
  verdict: "HOLD · NEUTRAL",
  verdictTone: "hold" as const,
  horizon: "12 mo",
  targetPx: 2980,
  targetUpsidePct: 6.0,
  downsidePx: 2410,
  downsideDeltaPct: -14.2,
  rrRatio: 0.42,
  positionSize: 3.0,
};

// 8-pillar EM-aware weights per Li, Wei & Zhang (2023) PBFJ 82:102175.
// TODO: replace with lib/grade/pillars.ts computation against MYOR fundamentals once ported.
export const MYOR_PILLARS = [
  { name: "Valuation", weight: 20, score: 58, letter: "C+", tone: "amber" as const,
    raw: { pe: 22.4, pbv: 3.84, evEbitda: 14.8, divYield: 1.84 }, pctRank: 28, contribution: 11.6 },
  { name: "Quality", weight: 20, score: 88, letter: "A−", tone: "pos" as const,
    raw: { roe: 21.8, gpoa: 4.84, brandMoat: "strong" }, pctRank: 84, contribution: 17.6 },
  { name: "Profitability", weight: 15, score: 84, letter: "B+", tone: "pos" as const,
    raw: { grossMargin: 28.4, opMargin: 14.2, fcfConv: 0.84 }, pctRank: 78, contribution: 12.6 },
  { name: "Financial Health", weight: 10, score: 82, letter: "B+", tone: "pos" as const,
    raw: { piotroskiF: 7, altmanZ: 3.84, debtToEbitda: 1.42 }, pctRank: 76, contribution: 8.2 },
  { name: "Low-Vol / Defensive", weight: 10, score: 78, letter: "B+", tone: "pos" as const,
    raw: { beta: 0.84, realizedVol: 21.8 }, pctRank: 72, contribution: 7.8 },
  { name: "Sentiment", weight: 10, score: 68, letter: "B−", tone: "pos" as const,
    raw: { score7d: 0.32, indoBert: 0.42, n: 18 }, pctRank: 62, contribution: 6.8 },
  { name: "Growth", weight: 5, score: 82, letter: "B+", tone: "pos" as const,
    raw: { rev3yCagr: 9.2, eps3yCagr: 8.4 }, pctRank: 78, contribution: 4.1 },
  { name: "Momentum (ST reversal)", weight: 5, score: 54, letter: "C+", tone: "amber" as const,
    raw: { ret1m: 0.18, ret3m: 1.18, stReversal: 0.21 }, pctRank: 48, contribution: 2.7 },
  { name: "Liquidity", weight: 5, score: 72, letter: "B", tone: "mag" as const,
    raw: { adtv: 28, amihud: 0.0084 }, pctRank: 64, contribution: 3.6 },
];

export const MYOR_DRIVERS = [
  { label: "DCF", value: "MILD UPSIDE", tone: "pos" as const },
  { label: "FACTOR Z", value: "+0.84", tone: "pos" as const },
  { label: "FLOW 5D", value: "+0.31", tone: "pos" as const },
  { label: "SENT 7D", value: "+0.32", tone: "pos" as const },
  { label: "PEAD", value: "D5", tone: "neutral" as const },
];

export const MYOR_THESIS = `Mayora's quality and growth metrics rate near the top of the consumer-staples cohort — ROE 21.8% with 9.2% 3Y revenue CAGR puts it ahead of peers ICBP / UNVR / INDF on capital efficiency. Distribution moat (3M warungs across the archipelago) is durable. The 8-pillar composite lands at 72/100, in the HOLD band: quality and growth pillars excel, but valuation (P/E 22.4×) and technical (sideways since Q3'25) keep the composite from clearing the BUY threshold. Verdict: HOLD · NEUTRAL at policy 3.0% weight with a 12-month horizon. Catalyst-driven upside on cocoa cost normalization and post-Lebaran volume recovery; downside on raw-material spike or rupiah weakness pressuring imported wheat/sugar inputs.`;

export const MYOR_GRADE_HISTORY = [
  { month: "Jun '25", score: 76 },
  { month: "Jul '25", score: 74 },
  { month: "Aug '25", score: 72, marker: "Q3 ER" },
  { month: "Sep '25", score: 70 },
  { month: "Oct '25", score: 68 },
  { month: "Nov '25", score: 71 },
  { month: "Dec '25", score: 73 },
  { month: "Jan '26", score: 72, marker: "FY GUIDE" },
  { month: "Feb '26", score: 71 },
  { month: "Mar '26", score: 70 },
  { month: "Apr '26", score: 71 },
  { month: "May '26", score: 72 },
];

export const MYOR_DCF_CAPM = [
  { label: "Risk-free · ID 10Y", value: "6.842%" },
  { label: "ERP · Damodaran 2026", value: "4.35%" },
  { label: "Beta · 60mo vs IHSG", value: "0.84" },
  { label: "CRP · ID", value: "0.00%", note: "embedded in ERP" },
  { label: "Cost of Equity (Ke)", value: "10.50%", emphasis: true },
];

export const MYOR_DCF_TERMINAL = [
  { label: "g∞ · perpetuity", value: "4.00%" },
  { label: "5y FCF CAGR", value: "8.40%" },
  { label: "Terminal op margin", value: "14%" },
  { label: "Payout ratio · TTM", value: "38%" },
];

export const MYOR_DCF_OUTPUT = {
  intrinsic: 2980,
  market: 2810,
  upsidePct: 6.05,
  verdict: "MILD UPSIDE",
  verdictTone: "buy" as const,
  callout:
    "DCF supports the hold thesis with a modest +6.0% upside cushion. Intrinsic Rp 2,980 sits above market Rp 2,810 but below the +10% threshold that would push toward incremental adds. Growth/quality story is intact; valuation just slightly stretched against historical multiples.",
};

export const MYOR_DCF_PROJECTION = [
  { year: "FY26E", rev: 38.4, ebit: 5.18, tax: 1.14, ni: 4.04, capex: -1.42, fcfe: 2.62, df: 0.905, pv: 2.37 },
  { year: "FY27E", rev: 41.8, ebit: 5.74, tax: 1.26, ni: 4.48, capex: -1.51, fcfe: 2.97, df: 0.819, pv: 2.43 },
  { year: "FY28E", rev: 45.4, ebit: 6.34, tax: 1.39, ni: 4.95, capex: -1.61, fcfe: 3.34, df: 0.741, pv: 2.48 },
  { year: "FY29E", rev: 49.1, ebit: 6.94, tax: 1.53, ni: 5.41, capex: -1.71, fcfe: 3.70, df: 0.671, pv: 2.48 },
  { year: "FY30E", rev: 53.0, ebit: 7.62, tax: 1.68, ni: 5.94, capex: -1.82, fcfe: 4.12, df: 0.607, pv: 2.50 },
];

export const MYOR_DCF_SENSITIVITY = {
  keValues: [9.50, 10.00, 10.50, 11.00, 11.50],
  gValues: [3.0, 3.5, 4.0, 4.5, 5.0],
  rows: [
    [3210, 3320, 3440, 3580, 3740],
    [3080, 3180, 3290, 3420, 3570],
    [2960, 3050, 2980, 3270, 3410],
    [2850, 2930, 3030, 3140, 3270],
    [2750, 2820, 2910, 3010, 3140],
  ],
  base: { row: 2, col: 2 },
};

export const MYOR_COMPS_COLUMNS = [
  "TICKER", "ISSUER", "SECT", "MCAP $bn", "P/E", "P/BV", "ROE", "GM", "OPM", "REV g", "DIV YLD", "5Y EPS Δ", "3M PERF", "BETA", "GRADE",
] as const;

export const MYOR_COMPS = [
  { ticker: "MYOR", issuer: "Mayora Indah", sect: "Food", mcap: 3.54, pe: 22.4, pbv: 3.84, roe: 21.8, nim: 28.4, cir: 14.2, npl: 9.2, divYld: 1.84, eps5y: 11.8, perf3m: 0.18, beta: 0.84, grade: "B", highlight: "subject" as const },
  { ticker: "ICBP", issuer: "Indofood CBP", sect: "Food", mcap: 9.84, pe: 16.4, pbv: 3.21, roe: 18.4, nim: 30.1, cir: 21.4, npl: 7.4, divYld: 2.41, eps5y: 9.4, perf3m: 0.39, beta: 0.71, grade: "B+" },
  { ticker: "UNVR", issuer: "Unilever Indonesia", sect: "Personal Care", mcap: 2.84, pe: 18.8, pbv: 12.40, roe: 64.2, nim: 24.8, cir: 18.4, npl: -8.4, divYld: 5.42, eps5y: -4.2, perf3m: -0.78, beta: 0.62, grade: "C+" },
  { ticker: "INDF", issuer: "Indofood Sukses Makmur", sect: "Food", mcap: 4.21, pe: 8.2, pbv: 1.34, roe: 12.4, nim: 18.4, cir: 12.4, npl: 5.4, divYld: 4.21, eps5y: 6.8, perf3m: -1.42, beta: 0.94, grade: "B" },
  { ticker: "CPIN", issuer: "Charoen Pokphand", sect: "Food · Poultry", mcap: 5.42, pe: 21.4, pbv: 2.74, roe: 16.8, nim: 14.2, cir: 8.4, npl: 12.4, divYld: 3.21, eps5y: 8.4, perf3m: 1.21, beta: 0.81, grade: "B+" },
  { ticker: "AALI", issuer: "Astra Agro Lestari", sect: "Agri · Palm", mcap: 0.84, pe: 12.4, pbv: 0.84, roe: 8.4, nim: 22.1, cir: 32.4, npl: 4.2, divYld: 6.21, eps5y: 2.4, perf3m: -3.21, beta: 1.12, grade: "C+" },
  { ticker: "JPFA", issuer: "Japfa Comfeed", sect: "Food · Poultry", mcap: 1.21, pe: 14.8, pbv: 1.42, roe: 10.4, nim: 12.4, cir: 6.8, npl: 9.4, divYld: 4.21, eps5y: 7.4, perf3m: 2.41, beta: 0.92, grade: "B" },
  { ticker: "—", issuer: "REGIONAL ASEAN PEERS", sect: "—", mcap: 0, pe: 0, pbv: 0, roe: 0, nim: 0, cir: 0, npl: 0, divYld: 0, eps5y: 0, perf3m: 0, beta: 0, grade: "—", isDivider: true },
  { ticker: "NESTLE MK", issuer: "Nestlé Malaysia", sect: "Food", mcap: 7.84, pe: 26.4, pbv: 32.1, roe: 121, nim: 32.4, cir: 14.2, npl: -4.2, divYld: 3.42, eps5y: 5.2, perf3m: 1.84, beta: 0.71, grade: "B+", highlight: "peer" as const },
  { ticker: "F&N SP", issuer: "Fraser & Neave", sect: "Food · Bev", mcap: 1.42, pe: 18.4, pbv: 1.21, roe: 7.4, nim: 24.2, cir: 18.2, npl: 4.2, divYld: 4.21, eps5y: 3.4, perf3m: 0.42, beta: 0.84, grade: "B" },
];

export const MYOR_COMPS_PEER_AVG = {
  pe: 17.31, pbv: 6.31, roe: 29.96, nim: 22.96, divYld: 4.16, perf3m: -0.04, beta: 0.85,
};

export const MYOR_COMPS_DELTA = {
  pe: 29, pbv: -39, roe: -27, nim: 24, divYld: -56,
};

export const MYOR_COMPS_PROSE = `MYOR trades at a modest P/E premium (+29% vs peer mean) but with significantly higher revenue growth (+9.2% 3Y CAGR vs +6.8%) and ROE in line with the cohort. The pricing reflects distribution moat and brand portfolio strength rather than financial-engineering tailwind. Reasonable valuation; HOLD validated.`;

export const MYOR_FACTORS = [
  { factor: "Value", z: -0.42, reading: "modestly expensive · P/E 22.4× peer 19.8×", tone: "neg" as const },
  { factor: "Quality", z: 1.84, reading: "top quartile · brand moat + distribution", tone: "pos" as const },
  { factor: "Profitability", z: 1.21, reading: "ROE 21.8% > peer 17.4%", tone: "pos" as const },
  { factor: "Low-Vol", z: 1.42, reading: "Beta 0.84 · low realized σ", tone: "pos" as const },
  { factor: "Size", z: -0.21, reading: "mid-cap · neutral SMB", tone: "neutral" as const },
];

export const MYOR_COMPOSITE_Z = 0.84;

export const MYOR_OVERLAYS = [
  { label: "PEAD · D5", value: "+0.18", tone: "neutral" as const, note: "Q1 in-line · SUE D5" },
  { label: "Cross-cohort flow", value: "+0.31", tone: "pos" as const, note: "Foreign net buy 5d Rp 18mrd" },
  { label: "Bahasa sentiment", value: "+0.42", tone: "pos" as const, note: "Kontan, DetikFinance · 18 articles 7d" },
  { label: "Catalyst", value: "—", tone: "neutral" as const, note: "1H earnings 2026-08-06" },
];

export const MYOR_BACKTEST_STATS = [
  { label: "DSR", value: "0.842", note: "P[SR > null] · 84.2%" },
  { label: "CPCV μ", value: "0.612", note: "n=9 paths · σ 0.084" },
  { label: "Range", value: "[.42, .81]", note: "wider · σ/μ 13.7%" },
  { label: "CAGR net", value: "+11.2%", note: "after 22bps cost", tone: "pos" as const },
  { label: "MaxDD", value: "-31.40%", note: "Sep 2022 COGS shock", tone: "neg" as const },
  { label: "Hit Rt", value: "61.2%", note: "88/144 months" },
];

export const MYOR_EQUITY_CURVE = [
  { yr: "'14", strat: 100, bench: 100 },
  { yr: "'15", strat: 106, bench: 96 },
  { yr: "'16", strat: 118, bench: 112 },
  { yr: "'17", strat: 128, bench: 130 },
  { yr: "'18", strat: 142, bench: 124 },
  { yr: "'19", strat: 154, bench: 132 },
  { yr: "'20", strat: 138, bench: 118 },
  { yr: "'21", strat: 168, bench: 138 },
  { yr: "'22", strat: 184, bench: 152 },
  { yr: "'23", strat: 212, bench: 168 },
  { yr: "'24", strat: 242, bench: 182 },
  { yr: "'25", strat: 268, bench: 194 },
];

export const MYOR_SENTIMENT = { score: 0.32, label: "Positive", n: 18, windowDays: 7 };

export const MYOR_SENT_HISTORY = [
  { day: "D-6", score: 0.21 },
  { day: "D-5", score: 0.28 },
  { day: "D-4", score: 0.31 },
  { day: "D-3", score: 0.18 },
  { day: "D-2", score: 0.41 },
  { day: "D-1", score: 0.38 },
  { day: "TDY", score: 0.32 },
];

export const MYOR_SOURCES = [
  { source: "Kontan", count: 6, avg: 0.42 },
  { source: "Bisnis", count: 4, avg: 0.31 },
  { source: "DetikFinance", count: 3, avg: 0.28 },
  { source: "Kompas", count: 2, avg: 0.21 },
  { source: "Bloomberg ID", count: 2, avg: 0.51 },
  { source: "Reuters ID", count: 1, avg: 0.18 },
];

export const MYOR_NEWS = [
  { source: "KONTAN", ts: "14:12 TDY", headline: "Mayora cocoa exposure declines on supplier diversification across 4 origins", bahasa: "MYOR diversifikasi pemasok kakao ke 4 negara", score: 0.51, tone: "pos" as const },
  { source: "BISNIS", ts: "11:08 TDY", headline: "Snack volume growth +8% YoY in Q1 — Lebaran tailwind extends into post-festive", score: 0.42, tone: "pos" as const },
  { source: "DETIKFINANCE", ts: "09:42 TDY", headline: "Mayora expands Kopiko distribution to 18 new ASEAN markets", bahasa: "Kopiko masuk 18 pasar ASEAN baru", score: 0.48, tone: "pos" as const },
  { source: "KONTAN", ts: "D-1 15:20", headline: "Wheat futures rally — Indonesian noodle/biscuit COGS pressure into H2", score: -0.31, tone: "neg" as const },
  { source: "BLOOMBERG ID", ts: "D-1 11:14", headline: "Mayora dividend yield 1.8% sustainable vs ICBP 2.4%; payout policy stable", score: 0.18, tone: "pos" as const },
  { source: "KOMPAS", ts: "D-2 14:48", headline: "Indonesian consumer confidence index ticks up to 108 — staples sector bid", score: 0.32, tone: "pos" as const },
  { source: "KONTAN", ts: "D-3 16:18", headline: "Mayora margin compression on rupiah weakness vs USD imported inputs", score: -0.21, tone: "neg" as const },
  { source: "BISNIS", ts: "D-4 09:42", headline: "ROYAL/MYOR coffee JV in Vietnam reaches breakeven 18 months ahead of plan", score: 0.62, tone: "pos" as const },
  { source: "DETIKFINANCE", ts: "D-5 11:32", headline: "MYOR RUPS approves Rp 52/share final dividend, payout 38%", bahasa: "MYOR bagi dividen final Rp 52", score: 0.21, tone: "pos" as const },
  { source: "BLOOMBERG ID", ts: "D-6 13:42", headline: "Analyst survey: 14 BUY / 4 HOLD / 1 SELL · PT Rp 2,980", score: 0.41, tone: "pos" as const },
];

export const MYOR_AUDIT_CITATIONS = [
  { tag: "CPCV", title: "Combinatorial Purged Cross-Validation", citation: "López de Prado (2018), Adv. in Financial Machine Learning, ch. 12" },
  { tag: "DSR", title: "Deflated Sharpe Ratio", citation: "Bailey & López de Prado (2014), JPM 40(5):94-107" },
  { tag: "PBO", title: "Probability of Backtest Overfitting", citation: "Bailey, Borwein, López de Prado, Zhu (2017)" },
  { tag: "FACTORS", title: "IDX 152-factor Bayesian study", citation: "Li, Wei & Zhang (2023), Pacific-Basin Finance Journal 82, Article 102175" },
  { tag: "QMJ", title: "Quality Minus Junk", citation: "Asness, Frazzini, Pedersen (2019), Rev. Acc. Studies 24(1):34-112" },
  { tag: "ERP", title: "Country Risk Premium model", citation: "Damodaran (2026), NYU Stern country risk dataset" },
];

export const MYOR_BIAS_CONTROLS = [
  { label: "Look-ahead", active: true },
  { label: "Survivorship", active: true },
  { label: "Selection", active: true },
  { label: "Data-snooping (DSR)", active: true },
  { label: "Backfill", active: true },
  { label: "Time-zone alignment", active: true },
  { label: "Transaction cost (LQ45 18bps)", active: true },
  { label: "Slippage by ADTV", active: true },
  { label: "Borrow cost (short leg)", active: true },
  { label: "Capacity haircut", active: true },
  { label: "Regime weighting", active: true },
  { label: "Multiple-testing penalty", active: true },
];

export const MYOR_REPRO = {
  repoUrl: "github.com/nluu/idx-factor-backtest",
  commitHash: "a3f6e9c",
  buildStatus: "passing",
  coveragePct: 87.4,
  testCount: { pass: 19, total: 19 },
  codeLines: 4218,
  license: "MIT",
};

export const MYOR_LIMITATIONS = `Paper-tested on point-in-time data 2014–2025. Consumer-staples cohort exhibits higher CPCV path dispersion (σ/μ 13.7% vs 4.4% banks) — strategy more sensitive to commodity-cost regime. Live performance typically 50–70% of backtest Sharpe.`;
