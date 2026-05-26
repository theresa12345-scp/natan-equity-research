// Mock data for BBCA · Bank Central Asia · IDX
// Sourced from meridian-idx-bbca.html (section 02 Security Deep-Dive +
// section 03 DCF Model). Amber chrome tokens translated to magenta.

export const BBCA_IDENTITY = {
  ticker: "BBCA",
  exchange: "IJ · IDX",
  name: "PT Bank Central Asia Tbk",
  sector: "Financials",
  industry: "Banks · Buku-4",
  market: "Indonesia",
  currency: "IDR",
  indices: ["LQ45", "IDX30", "JII", "KOMPAS100"],
  rups: "2026-03-26",
  nextEarnings: "2026-07-24 AMC",
  fiscalYearEnd: "DEC",
} as const;

export const BBCA_KPIS = [
  { label: "MKT CAP", value: "Rp 1,189 trn", sub: "$67.0 bn @ 17,742", subTone: "neutral" as const },
  { label: "P/E NTM", value: "19.4×", sub: "peer 11.7× · prem +66%", subTone: "neutral" as const },
  { label: "P/BV", value: "4.62×", sub: "peer 1.83× · prem +152%", subTone: "neutral" as const },
  { label: "ROE FY26E", value: "22.8%", sub: "peer 13.8% · +9.0pp", subTone: "pos" as const },
  { label: "NIM", value: "5.84%", sub: "peer 5.51% · +33bps", subTone: "pos" as const },
  { label: "CASA", value: "81.4%", sub: "industry-best · moat", subTone: "pos" as const },
  { label: "BETA", value: "1.05", sub: "vs IHSG · 60mo", subTone: "neutral" as const },
  { label: "DIV YLD", value: "2.94%", sub: "payout 65% · TTM", subTone: "neutral" as const },
];

export const BBCA_GRADE = {
  letter: "A−",
  score: 82,
  max: 100,
  verdict: "BUY · HIGH CONVICTION",
  verdictTone: "buy" as const,
  horizon: "12–24 mo",
  targetPx: 10820,
  targetUpsidePct: 12.1,
  downsidePx: 8180,
  downsideDeltaPct: -15.2,
  rrRatio: 0.79,
  positionSize: 5.0,
};

// 8-pillar decomposition per METHODOLOGY.md §2 — EM-aware weights per
// Li, Wei & Zhang (2023) Pacific-Basin Finance Journal 82:102175.
// IDX framework: Quality+Profitability+Valuation = 55% of weight.
// Momentum is reframed as short-term reversal at 5% (NOT 12-1 trend) —
// Li-Wei-Zhang find IDX momentum factor is not statistically significant.
export const BBCA_PILLARS = [
  { name: "Valuation", weight: 20, score: 62, letter: "C+", tone: "amber" as const,
    raw: { pe: 19.4, pbv: 4.62, evEbitda: 14.2, pfcf: 21.8, divYield: 2.94 },
    winsorized: { peZ: -0.84, pbvZ: -1.21, evEbitdaZ: -0.62 },
    pctRank: 32, contribution: 12.4 },
  { name: "Quality", weight: 20, score: 94, letter: "A", tone: "pos" as const,
    raw: { roe: 22.8, gpoa: 6.18, casaRatio: 81.4, niStability5y: 0.94 },
    winsorized: { qmjZ: 2.84 },
    pctRank: 94, contribution: 18.8 },
  { name: "Profitability", weight: 15, score: 91, letter: "A−", tone: "pos" as const,
    raw: { nim: 5.84, opMargin: 47.2, fcfConv: 1.18 },
    winsorized: { profZ: 2.41 },
    pctRank: 88, contribution: 13.6 },
  { name: "Financial Health", weight: 10, score: 88, letter: "A−", tone: "pos" as const,
    raw: { piotroskiF: 8, altmanZ: 4.21, npl: 1.84, tier1: 22.4 },
    winsorized: { healthZ: 1.84 },
    pctRank: 84, contribution: 8.8 },
  { name: "Low-Vol / Defensive", weight: 10, score: 84, letter: "A−", tone: "pos" as const,
    raw: { beta: 1.05, realizedVol: 18.4, mddTtm: -18.4 },
    winsorized: { babZ: 1.42 },
    pctRank: 78, contribution: 8.4 },
  { name: "Sentiment", weight: 10, score: 76, letter: "B", tone: "pos" as const,
    raw: { score7d: 0.51, indoBert: 0.62, foreignFlow5d: 84, n: 42 },
    winsorized: { sentZ: 1.21 },
    pctRank: 72, contribution: 7.6 },
  { name: "Growth", weight: 5, score: 71, letter: "B−", tone: "mag" as const,
    raw: { rev3yCagr: 9.4, eps3yCagr: 11.2, expGrowth: 0.94 },
    winsorized: { growthZ: 0.84 },
    pctRank: 68, contribution: 3.6 },
  { name: "Momentum (ST reversal)", weight: 5, score: 42, letter: "C−", tone: "neg" as const,
    raw: { ret1m: 2.81, ret3m: -4.21, stReversal: -0.42 },
    winsorized: { stRevZ: -0.62 },
    pctRank: 32, contribution: 2.1 },
  { name: "Liquidity", weight: 5, score: 96, letter: "A+", tone: "pos" as const,
    raw: { adtv: 327, amihud: 0.0021, lotSize: 100 },
    winsorized: { liqZ: 2.41 },
    pctRank: 96, contribution: 4.8 },
];

export const BBCA_DRIVERS = [
  { label: "DCF", value: "FAIR", tone: "neutral" as const },
  { label: "FACTOR Z", value: "+2.18", tone: "pos" as const },
  { label: "FLOW 5D", value: "+0.84", tone: "pos" as const },
  { label: "SENT 7D", value: "+0.51", tone: "pos" as const },
  { label: "PEAD", value: "D8", tone: "pos" as const },
];

export const BBCA_THESIS = `BBCA's structural premium is real but binding. CASA at 81.4% — the highest in ASEAN — produces a 33bps NIM advantage and ROE 9pp above the Big-4 median. Quality, profitability, and financial-health pillars rate near maximum; the 8-pillar composite lands at 82/100. Valuation is where the framework cools: at 19.4× NTM P/E and 4.62× P/BV the multiple compression risk is real, with the BBCA-BBRI P/BV spread at 5-year wides (4.6× vs 1.9×). Either BBCA de-rates or BBRI re-rates. Historical reversion favors the latter, but the CASA franchise warrants a structural premium. Verdict: BUY · HIGH CONVICTION at 5.0% position with a 12–24 month horizon. Target Rp 10,820 (+12.1%); downside floor Rp 8,180 (−15.2%) on macro/IDR shock. R/R 0.79× — asymmetry favors the bull case under BI rate-cut tailwind into H2'26.`;

export const BBCA_GRADE_HISTORY = [
  { month: "Jun '25", score: 78 },
  { month: "Jul '25", score: 80 },
  { month: "Aug '25", score: 83, marker: "Q3 ER" },
  { month: "Sep '25", score: 85 },
  { month: "Oct '25", score: 84 },
  { month: "Nov '25", score: 82 },
  { month: "Dec '25", score: 81 },
  { month: "Jan '26", score: 80, marker: "Q4 BEAT" },
  { month: "Feb '26", score: 79 },
  { month: "Mar '26", score: 78 },
  { month: "Apr '26", score: 80 },
  { month: "May '26", score: 82 },
];

// ----------------- DCF -----------------

export const BBCA_DCF_CAPM = [
  { label: "Risk-free · ID 10Y", value: "6.842%" },
  { label: "ERP · Damodaran 2026", value: "4.35%" },
  { label: "Beta · 60mo vs IHSG", value: "1.05" },
  { label: "CRP · ID", value: "0.00%", note: "embedded in ERP" },
  { label: "Cost of Equity (Ke)", value: "11.41%", emphasis: true },
];

export const BBCA_DCF_TERMINAL = [
  { label: "g∞ · perpetuity", value: "4.00%" },
  { label: "5y FCF CAGR", value: "9.20%" },
  { label: "Terminal op margin", value: "42%" },
  { label: "Payout ratio · TTM", value: "65%" },
];

export const BBCA_DCF_OUTPUT = {
  intrinsic: 9820,
  market: 9650,
  upsidePct: 1.76,
  verdict: "FAIR",
  verdictTone: "neutral" as const,
  callout:
    "DCF says do not add and do not trim. Intrinsic Rp 9,820 sits inside the noise band around Rp 9,650 spot. The grade-level BUY thesis rests on the 8-pillar composite (quality + flow + sentiment), not on intrinsic-value mispricing. If DCF were the only lens, we would hold at policy weight, not overweight.",
};

export const BBCA_DCF_PROJECTION = [
  { year: "FY26E", rev: 96.4, ebit: 51.2, tax: 11.27, ni: 39.93, capex: -3.2, fcfe: 36.73, df: 0.898, pv: 32.99 },
  { year: "FY27E", rev: 105.3, ebit: 56.8, tax: 12.50, ni: 44.30, capex: -3.5, fcfe: 40.80, df: 0.806, pv: 32.88 },
  { year: "FY28E", rev: 114.8, ebit: 62.9, tax: 13.84, ni: 49.06, capex: -3.8, fcfe: 45.26, df: 0.723, pv: 32.72 },
  { year: "FY29E", rev: 125.1, ebit: 69.4, tax: 15.27, ni: 54.13, capex: -4.1, fcfe: 50.03, df: 0.649, pv: 32.47 },
  { year: "FY30E", rev: 136.3, ebit: 76.3, tax: 16.79, ni: 59.51, capex: -4.4, fcfe: 55.11, df: 0.583, pv: 32.13 },
];

// 5x5 sensitivity: rows = Ke values, cols = g∞ values; cells = intrinsic per share
// Base case (Ke 11.41%, g 4.00%) sits roughly at [2,2].
export const BBCA_DCF_SENSITIVITY = {
  keValues: [10.41, 10.91, 11.41, 11.91, 12.41],
  gValues: [3.0, 3.5, 4.0, 4.5, 5.0],
  rows: [
    [10410, 10720, 11050, 11410, 11800],
    [10010, 10300, 10610, 10940, 11300],
    [9650,  9920,  10210, 10520, 10860],  // base at [2,2]
    [9320,  9580,  9850,  10140, 10460],
    [9020,  9260,  9520,  9790,  10090],
  ],
  base: { row: 2, col: 2 },
};

// ----------------- COMPS -----------------

export const BBCA_COMPS_COLUMNS = [
  "TICKER", "ISSUER", "SECT", "MCAP $bn", "P/E", "P/BV", "ROE", "NIM", "CIR", "NPL", "DIV YLD", "5Y EPS Δ", "3M PERF", "BETA", "GRADE",
] as const;

export interface CompRow {
  ticker: string;
  issuer: string;
  sect: string;
  mcap: number;     // $bn
  pe: number;
  pbv: number;
  roe: number;
  nim: number;
  cir: number;
  npl: number;
  divYld: number;
  eps5y: number;    // %
  perf3m: number;   // %
  beta: number;
  grade: string;
  highlight?: "subject" | "peer";
  isDivider?: boolean;
}

export const BBCA_COMPS: CompRow[] = [
  { ticker: "BBCA", issuer: "Bank Central Asia", sect: "Banks", mcap: 67.0, pe: 19.4, pbv: 4.62, roe: 22.8, nim: 5.84, cir: 31.4, npl: 1.84, divYld: 2.94, eps5y: 12.1, perf3m: -4.21, beta: 1.05, grade: "A−", highlight: "subject" },
  { ticker: "BMRI", issuer: "Bank Mandiri", sect: "Banks", mcap: 40.6, pe: 9.8, pbv: 2.18, roe: 21.4, nim: 5.18, cir: 38.2, npl: 2.41, divYld: 6.21, eps5y: 10.4, perf3m: 1.84, beta: 1.21, grade: "A" },
  { ticker: "BBRI", issuer: "Bank Rakyat Indonesia", sect: "Banks", mcap: 32.0, pe: 10.2, pbv: 1.94, roe: 18.4, nim: 7.82, cir: 42.1, npl: 3.21, divYld: 7.84, eps5y: 8.2, perf3m: -8.42, beta: 1.18, grade: "B+" },
  { ticker: "BBNI", issuer: "Bank Negara Indonesia", sect: "Banks", mcap: 10.3, pe: 7.4, pbv: 1.18, roe: 14.8, nim: 4.81, cir: 44.8, npl: 2.84, divYld: 5.42, eps5y: 6.8, perf3m: -2.41, beta: 1.31, grade: "B" },
  { ticker: "BNGA", issuer: "Bank CIMB Niaga", sect: "Banks", mcap: 4.9, pe: 6.8, pbv: 0.94, roe: 12.4, nim: 4.42, cir: 47.2, npl: 2.21, divYld: 5.94, eps5y: 5.4, perf3m: -1.21, beta: 1.42, grade: "B−" },
  { ticker: "—", issuer: "REGIONAL ASEAN PEERS", sect: "—", mcap: 0, pe: 0, pbv: 0, roe: 0, nim: 0, cir: 0, npl: 0, divYld: 0, eps5y: 0, perf3m: 0, beta: 0, grade: "—", isDivider: true },
  { ticker: "DBS SP", issuer: "DBS Group Holdings", sect: "Banks", mcap: 99.4, pe: 11.2, pbv: 1.74, roe: 16.8, nim: 2.18, cir: 38.4, npl: 1.21, divYld: 6.84, eps5y: 9.2, perf3m: 4.21, beta: 1.08, grade: "A−" },
  { ticker: "OCBC SP", issuer: "OCBC Bank", sect: "Banks", mcap: 60.2, pe: 9.8, pbv: 1.21, roe: 13.4, nim: 2.41, cir: 41.2, npl: 0.94, divYld: 6.21, eps5y: 7.4, perf3m: 2.18, beta: 1.04, grade: "B+" },
  { ticker: "MAY MK", issuer: "Maybank", sect: "Banks", mcap: 30.4, pe: 12.8, pbv: 1.34, roe: 11.2, nim: 2.18, cir: 47.8, npl: 1.42, divYld: 5.84, eps5y: 6.2, perf3m: 1.84, beta: 0.94, grade: "B" },
  { ticker: "HDFCB IN", issuer: "HDFC Bank", sect: "Banks", mcap: 158.4, pe: 19.4, pbv: 2.74, roe: 17.4, nim: 4.12, cir: 39.8, npl: 1.21, divYld: 1.18, eps5y: 14.2, perf3m: 6.42, beta: 0.92, grade: "A−", highlight: "peer" },
];

export const BBCA_COMPS_PEER_AVG = {
  pe: 11.74, pbv: 1.83, roe: 14.96, nim: 4.13, cir: 42.42, npl: 2.13, divYld: 5.91, perf3m: 0.50, beta: 1.11,
};

export const BBCA_COMPS_DELTA = {
  pe: 65, pbv: 152, roe: 52, nim: 41, divYld: -50,  // pct premiums/discounts vs peer mean
};

export const BBCA_COMPS_PROSE = `BBCA's 152% P/BV premium vs the ID Big-4 / regional peer mean is justified by a 52% ROE differential and unmatched CASA franchise (81.4% vs 60s for peers). Premium contracts in a tail scenario but the structural moat is durable.`;

// ----------------- ALGO & FACTORS -----------------

export const BBCA_FACTORS = [
  { factor: "Value", z: -0.84, reading: "expensive · P/E 19.4× peer 11.7×", tone: "neg" as const },
  { factor: "Quality", z: 2.84, reading: "top decile · GPOA leader · CASA moat", tone: "pos" as const },
  { factor: "Profitability", z: 2.41, reading: "ROE 22.8% > peer 13.8%", tone: "pos" as const },
  { factor: "Low-Vol", z: 1.84, reading: "Beta 1.05 · realized 3M σ 18%", tone: "pos" as const },
  { factor: "Size", z: -0.62, reading: "mega-cap · SMB headwind", tone: "neg" as const },
];

export const BBCA_COMPOSITE_Z = 2.18;

export const BBCA_OVERLAYS = [
  { label: "PEAD · D8", value: "+0.84", tone: "pos" as const, note: "SUE D8 since Q1'26 beat" },
  { label: "Cross-cohort flow", value: "+1.42", tone: "pos" as const, note: "Foreign net buy 5d Rp 84mrd" },
  { label: "Bahasa sentiment", value: "+1.21", tone: "pos" as const, note: "Kontan, Bisnis · 42 articles 7d" },
  { label: "Catalyst", value: "—", tone: "neutral" as const, note: "BI-Rate decision 2026-06-18" },
];

export const BBCA_BACKTEST_STATS = [
  { label: "DSR", value: "0.997", note: "P[SR > null] · 99.7%" },
  { label: "CPCV μ", value: "0.904", note: "n=9 paths · σ 0.040" },
  { label: "Range", value: "[.82, .96]", note: "tight · σ/μ 4.4%" },
  { label: "CAGR net", value: "+18.23%", note: "after 18bps cost", tone: "pos" as const },
  { label: "MaxDD", value: "-25.30%", note: "Mar 2022 IDR shock", tone: "neg" as const },
  { label: "Hit Rt", value: "69.7%", note: "100/144 months" },
];

export const BBCA_EQUITY_CURVE = [
  { yr: "'14", strat: 100, bench: 100 },
  { yr: "'15", strat: 112, bench: 96 },
  { yr: "'16", strat: 128, bench: 112 },
  { yr: "'17", strat: 156, bench: 130 },
  { yr: "'18", strat: 174, bench: 124 },
  { yr: "'19", strat: 198, bench: 132 },
  { yr: "'20", strat: 184, bench: 118 },
  { yr: "'21", strat: 224, bench: 138 },
  { yr: "'22", strat: 268, bench: 152 },
  { yr: "'23", strat: 318, bench: 168 },
  { yr: "'24", strat: 392, bench: 182 },
  { yr: "'25", strat: 458, bench: 194 },
];

// ----------------- NEWS & SENTIMENT -----------------

export const BBCA_SENTIMENT = {
  score: 0.51,
  label: "Positive",
  n: 42,
  windowDays: 7,
};

export const BBCA_SENT_HISTORY = [
  { day: "D-6", score: 0.18 },
  { day: "D-5", score: 0.32 },
  { day: "D-4", score: 0.41 },
  { day: "D-3", score: 0.48 },
  { day: "D-2", score: 0.62 },
  { day: "D-1", score: 0.58 },
  { day: "TDY", score: 0.51 },
];

export const BBCA_SOURCES = [
  { source: "Kontan", count: 14, avg: 0.62 },
  { source: "Bisnis", count: 9, avg: 0.48 },
  { source: "Kompas", count: 8, avg: 0.41 },
  { source: "Reuters ID", count: 6, avg: 0.58 },
  { source: "Bloomberg ID", count: 3, avg: 0.71 },
  { source: "DetikFinance", count: 2, avg: 0.32 },
];

export interface NewsRow {
  source: string;
  ts: string;
  headline: string;
  bahasa?: string;
  score: number;
  tone: "pos" | "neg" | "neutral";
}

export const BBCA_NEWS: NewsRow[] = [
  { source: "KONTAN", ts: "14:08 TDY", headline: "BBCA credit growth accelerates to 13.4% YoY in Q1; CASA holds 81%", bahasa: "Pertumbuhan kredit BBCA capai 13,4% YoY · CASA 81%", score: 0.74, tone: "pos" },
  { source: "BISNIS", ts: "11:42 TDY", headline: "Bank Indonesia signals dovish pivot — BBCA NIM tailwind into H2'26", bahasa: "BI sinyal pivot dovish · NIM BBCA H2'26 angin segar", score: 0.68, tone: "pos" },
  { source: "BLOOMBERG ID", ts: "09:15 TDY", headline: "BCA digital channel hits 30M users; mobile-app txn ratio 90%", score: 0.71, tone: "pos" },
  { source: "REUTERS ID", ts: "D-1 16:20", headline: "Indonesia inflation moderates to 2.8% — banks tilt risk-on", score: 0.42, tone: "pos" },
  { source: "KOMPAS", ts: "D-1 14:08", headline: "BBCA RUPS approves Rp 156/share final dividend, payout 65%", bahasa: "BBCA bagi dividen final Rp 156/saham", score: 0.48, tone: "pos" },
  { source: "KONTAN", ts: "D-1 11:30", headline: "Foreign net buy IDX hits Rp 412 mrd 5d — BBCA top of flow stack", score: 0.62, tone: "pos" },
  { source: "BLOOMBERG ID", ts: "D-2 10:42", headline: "ASEAN bank P/BV spread widens — BBCA premium tested at 4.6×", score: -0.21, tone: "neg" },
  { source: "BISNIS", ts: "D-2 09:14", headline: "Indonesia sovereign CDS tightens 8bps — risk-on into Q2 earnings", score: 0.41, tone: "pos" },
  { source: "DETIKFINANCE", ts: "D-3 15:08", headline: "Mandiri H1 outpaces BBCA on loan-growth — Big-4 comp narrows", score: -0.31, tone: "neg" },
  { source: "KONTAN", ts: "D-3 11:14", headline: "BCA mobile downtime <0.1% — operational moat hardens vs Buku-3", score: 0.58, tone: "pos" },
  { source: "REUTERS ID", ts: "D-4 14:48", headline: "Prabowo fiscal package — SBN supply risk + BI absorption capacity", score: -0.18, tone: "neg" },
  { source: "BLOOMBERG ID", ts: "D-5 08:42", headline: "Damodaran lowers ID ERP to 4.35% — DCF inputs tighten across sector", score: 0.31, tone: "pos" },
  { source: "KOMPAS", ts: "D-5 07:18", headline: "BBCA wealth-mgmt AUM crosses Rp 800 trn — second largest in SEA", score: 0.62, tone: "pos" },
  { source: "KONTAN", ts: "D-6 16:24", headline: "Foreign analyst target survey: 21 BUY / 6 HOLD / 1 SELL · PT Rp 11,200", bahasa: "Target analis asing: 21 BUY · PT Rp 11.200", score: 0.51, tone: "pos" },
];

// ----------------- AUDIT -----------------

export const BBCA_AUDIT_CITATIONS = [
  { tag: "CPCV", title: "Combinatorial Purged Cross-Validation", citation: "López de Prado (2018), Adv. in Financial Machine Learning, ch. 12" },
  { tag: "DSR", title: "Deflated Sharpe Ratio", citation: "Bailey & López de Prado (2014), JPM 40(5):94-107" },
  { tag: "PBO", title: "Probability of Backtest Overfitting", citation: "Bailey, Borwein, López de Prado, Zhu (2017)" },
  { tag: "FACTORS", title: "IDX 152-factor Bayesian study", citation: "Li, Wei & Zhang (2023), Pacific-Basin Finance Journal 82, Article 102175" },
  { tag: "QMJ", title: "Quality Minus Junk", citation: "Asness, Frazzini, Pedersen (2019), Rev. Acc. Studies 24(1):34-112" },
  { tag: "ERP", title: "Country Risk Premium model", citation: "Damodaran (2026), NYU Stern country risk dataset" },
];

export const BBCA_BIAS_CONTROLS = [
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

export const BBCA_REPRO = {
  repoUrl: "github.com/nluu/idx-factor-backtest",
  commitHash: "a3f6e9c",
  buildStatus: "passing",
  coveragePct: 87.4,
  testCount: { pass: 19, total: 19 },
  codeLines: 4218,
  license: "MIT",
};

export const BBCA_LIMITATIONS = `Paper-tested on point-in-time data 2014–2025. Live performance typically achieves 50–70% of backtest Sharpe after slippage, borrow costs, and regime shift. Expected live Sharpe: 0.55–0.65. Composite signal is not market-neutral and carries beta exposure (~1.05). Synthetic-data caveat: catalyst-overlay assumes BI-Rate decision dates; no event-window stress beyond 2022 IDR shock.`;
