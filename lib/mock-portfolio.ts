// Mock portfolio data for the /idx/portfolio route.
// Replace with live KSEI/yahoo-finance2 feeds once lib/data-fetchers.ts
// portfolio queries are wired in Phase 5.

export type ValueTone = "default" | "pos" | "neg" | "mag";
export type SubTone = "pos" | "neg" | "neutral";

export interface SubSpan {
  text: string;
  tone?: SubTone;
}

export interface PortfolioKpi {
  label: string;
  value: string;
  valueTone?: ValueTone;
  sub?: string;
  subParts?: SubSpan[];
}

export const PORTFOLIO_KPIS: PortfolioKpi[] = [
  {
    label: "NOTIONAL TRACKING · IDR",
    value: "Rp 412.47 mrd",
    sub: "hypothetical equal-weighted at inception",
  },
  {
    label: "DAY HYP RETURN",
    value: "+0.93%",
    valueTone: "pos",
    subParts: [
      { text: "vs IHSG +0.84%", tone: "neutral" },
      { text: " · α +9bps", tone: "pos" },
    ],
  },
  {
    label: "YTD RETURN · IDR",
    value: "+8.42%",
    valueTone: "pos",
    subParts: [
      { text: "IHSG +14.93%", tone: "neg" },
      { text: " · α +2,335bps" },
    ],
  },
  {
    label: "SHARPE (TTM)",
    value: "1.18",
    valueTone: "mag",
    sub: "Rf 6.842% · Sortino 1.64",
  },
  {
    label: "MAX DRAWDOWN (TTM)",
    value: "-18.42%",
    valueTone: "neg",
    sub: "PEAK 2026-01-05 · TROUGH 2026-04-08 · REC 47d",
  },
];

export interface HoldingRow {
  kode: string;
  emiten: string;
  wtPct: number;
  lot: number;
  costBasis: number;
  last: number;
  dayPct: number;
  unrlValueJt: number;
  unrlPct: number;
  divYld: number;
  sect: string;
}

export const PORTFOLIO_HOLDINGS: HoldingRow[] = [
  { kode: "BBCA", emiten: "Bank Central Asia", wtPct: 10.42, lot: 580, costBasis: 7425, last: 9650, dayPct: 1.32, unrlValueJt: 12.91, unrlPct: 29.97, divYld: 2.94, sect: "Financials" },
  { kode: "BBRI", emiten: "Bank Rakyat Indonesia", wtPct: 8.91, lot: 980, costBasis: 4180, last: 3750, dayPct: -0.53, unrlValueJt: -42.14, unrlPct: -10.29, divYld: 7.84, sect: "Financials" },
  { kode: "BMRI", emiten: "Bank Mandiri", wtPct: 7.84, lot: 420, costBasis: 5820, last: 7725, dayPct: 0.98, unrlValueJt: 80.01, unrlPct: 32.73, divYld: 6.21, sect: "Financials" },
  { kode: "TLKM", emiten: "Telkom Indonesia", wtPct: 6.42, lot: 780, costBasis: 3640, last: 2840, dayPct: -1.21, unrlValueJt: -62.40, unrlPct: -21.98, divYld: 7.21, sect: "Comm Svcs" },
  { kode: "ASII", emiten: "Astra International", wtPct: 5.84, lot: 340, costBasis: 5418, last: 5150, dayPct: 0.49, unrlValueJt: -9.11, unrlPct: -4.95, divYld: 5.84, sect: "Industrials" },
  { kode: "ICBP", emiten: "Indofood CBP", wtPct: 4.92, lot: 180, costBasis: 10400, last: 12725, dayPct: 0.39, unrlValueJt: 41.85, unrlPct: 22.36, divYld: 2.41, sect: "Cons Staples" },
  { kode: "UNVR", emiten: "Unilever Indonesia", wtPct: 3.84, lot: 820, costBasis: 2180, last: 1925, dayPct: -0.78, unrlValueJt: -20.91, unrlPct: -11.70, divYld: 5.42, sect: "Cons Staples" },
  { kode: "MYOR", emiten: "Mayora Indah", wtPct: 3.42, lot: 240, costBasis: 2640, last: 2810, dayPct: 0.18, unrlValueJt: 4.08, unrlPct: 6.44, divYld: 1.84, sect: "Cons Staples" },
  { kode: "SMGR", emiten: "Semen Indonesia", wtPct: 3.21, lot: 380, costBasis: 4820, last: 4825, dayPct: 0.62, unrlValueJt: 0.19, unrlPct: 0.10, divYld: 4.21, sect: "Basic Mats" },
  { kode: "INTP", emiten: "Indocement", wtPct: 2.84, lot: 220, costBasis: 7420, last: 7180, dayPct: -0.42, unrlValueJt: -5.28, unrlPct: -3.23, divYld: 5.84, sect: "Basic Mats" },
  { kode: "ADRO", emiten: "Adaro Energy", wtPct: 2.62, lot: 540, costBasis: 3420, last: 3920, dayPct: -0.42, unrlValueJt: 27.00, unrlPct: 14.62, divYld: 8.42, sect: "Energy" },
  { kode: "PGAS", emiten: "Perusahaan Gas Negara", wtPct: 2.41, lot: 1180, costBasis: 1540, last: 1725, dayPct: 1.84, unrlValueJt: 21.83, unrlPct: 12.01, divYld: 6.21, sect: "Energy" },
];

export interface AllocationSegment {
  name: string;
  pct: number;
  color: string;
}

// Magenta is reserved for the largest sector only (Financials). Remaining
// segments use a non-chrome chart palette — these colors must never appear
// on TopBar / TickerTape / RightRail / StatusBar / button borders.
export const PORTFOLIO_ALLOCATION_SECTORS: AllocationSegment[] = [
  { name: "Financials", pct: 30.1, color: "#ff2e88" },
  { name: "Cons Staples", pct: 14.0, color: "#5ec4e0" },
  { name: "Basic Mats", pct: 13.0, color: "#007a47" },
  { name: "Industrials", pct: 10.0, color: "#c4831f" },
  { name: "Comm Svcs", pct: 9.0, color: "#9a2a2c" },
  { name: "Energy", pct: 8.0, color: "#b8b8b8" },
  { name: "Infrastructure", pct: 7.0, color: "#7a7a7a" },
  { name: "Other (2)", pct: 8.9, color: "#555555" },
];

export interface IndexBreakdown {
  label: string;
  pct: number;
}

export const PORTFOLIO_INDEX_BREAKDOWN: IndexBreakdown[] = [
  { label: "LQ45", pct: 71 },
  { label: "IDX30", pct: 62 },
  { label: "MID-CAP", pct: 24 },
  { label: "SMALL", pct: 5 },
];

export const PORTFOLIO_META = {
  sectionNumber: "02",
  title: "Portfolio Overview",
  subtitle: "Meridian Research Tracking · Hypothetical Equal-Weighted Long Sleeve",
  benchmark: "IHSG TR",
  inception: "2021-04-12",
  positions: 28,
  cashPct: 4.81,
  totalSectors: 9,
} as const;
