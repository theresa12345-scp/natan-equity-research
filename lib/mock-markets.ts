export const IHSG_COMPONENTS = [
  { ticker: "BBCA", wt: 8.42, perf5d: 2.41 },
  { ticker: "BBRI", wt: 6.84, perf5d: -1.84 },
  { ticker: "BMRI", wt: 5.92, perf5d: 1.62 },
  { ticker: "TLKM", wt: 4.21, perf5d: -2.41 },
  { ticker: "ASII", wt: 3.84, perf5d: 0.84 },
  { ticker: "BBNI", wt: 3.21, perf5d: 0.42 },
  { ticker: "BREN", wt: 2.84, perf5d: 4.81 },
  { ticker: "AMMN", wt: 2.41, perf5d: 2.18 },
  { ticker: "ICBP", wt: 2.18, perf5d: 0.84 },
  { ticker: "UNVR", wt: 1.94, perf5d: -2.41 },
];

export const SECTOR_HEATMAP = [
  { sector: "Financials", perf5d: 1.82, wt: 32.4 },
  { sector: "Cons Staples", perf5d: 0.42, wt: 11.2 },
  { sector: "Basic Mats", perf5d: 2.84, wt: 9.8 },
  { sector: "Industrials", perf5d: -1.21, wt: 8.4 },
  { sector: "Energy", perf5d: 3.42, wt: 8.2 },
  { sector: "Comm Svcs", perf5d: -2.18, wt: 7.4 },
  { sector: "Cons Disc", perf5d: 0.84, wt: 6.8 },
  { sector: "Health Care", perf5d: -0.42, wt: 5.4 },
  { sector: "Real Estate", perf5d: -1.84, wt: 3.2 },
  { sector: "Utilities", perf5d: 1.21, wt: 2.8 },
  { sector: "Tech", perf5d: 4.21, wt: 4.4 },
];

export const MACRO_PANEL = [
  { label: "USD/IDR", value: "17,742", delta: "+0.21%", tone: "neg" as const },
  { label: "BI-RATE", value: "4.75%", delta: "−25bp 5d", tone: "pos" as const },
  { label: "ID 10Y", value: "6.842%", delta: "−2.4bp", tone: "pos" as const },
  { label: "ID 2Y", value: "6.18%", delta: "+1.2bp", tone: "neg" as const },
  { label: "CDS 5Y ID", value: "68 bp", delta: "+2", tone: "neg" as const },
  { label: "INFLATION", value: "2.84%", delta: "YoY", tone: "pos" as const },
  { label: "GDP", value: "+4.8%", delta: "Q1 prov.", tone: "neutral" as const },
  { label: "BRENT", value: "$104.53", delta: "+1.84%", tone: "pos" as const },
  { label: "COAL NEW", value: "$118.40", delta: "−2.41%", tone: "neg" as const },
  { label: "CPO MY", value: "RM 4,820", delta: "+0.84%", tone: "pos" as const },
];

export const FOREIGN_FLOW = [
  { day: "TDY", buy: 1842, sell: 1428, net: 414 },
  { day: "D-1", buy: 1624, sell: 1402, net: 222 },
  { day: "D-2", buy: 1518, sell: 1684, net: -166 },
  { day: "D-3", buy: 1421, sell: 1342, net: 79 },
  { day: "D-4", buy: 1684, sell: 1218, net: 466 },
  { day: "D-5", buy: 1248, sell: 1442, net: -194 },
];

// ────────────────────────────────────────────────────────────────
// New data for the redesigned Markets page
// ────────────────────────────────────────────────────────────────

export interface IndexCard {
  label: string;
  value: string;
  delta: number;        // %
  spark: number[];      // 12 points relative
}

export const INDEX_STRIP: IndexCard[] = [
  { label: "IHSG",     value: "7,418.62", delta: 0.84, spark: [100, 99.8, 100.2, 100.4, 100.1, 100.6, 100.8, 101.0, 100.7, 100.9, 101.2, 100.84] },
  { label: "LQ45",     value: "862.41",   delta: 0.92, spark: [100, 100.1, 100.4, 100.2, 100.5, 100.8, 100.6, 100.9, 101.1, 100.8, 101.0, 100.92] },
  { label: "IDX30",    value: "452.18",   delta: 0.78, spark: [100, 100.2, 100.1, 100.4, 100.6, 100.3, 100.5, 100.7, 100.9, 100.6, 100.8, 100.78] },
  { label: "IDX80",    value: "138.42",   delta: 0.64, spark: [100, 100.1, 99.9, 100.3, 100.2, 100.5, 100.4, 100.6, 100.8, 100.5, 100.7, 100.64] },
  { label: "JII",      value: "584.24",   delta: 1.21, spark: [100, 100.4, 100.6, 100.3, 100.8, 100.5, 101.0, 100.7, 101.2, 101.4, 101.0, 101.21] },
  { label: "Kompas100",value: "1,182.4",  delta: 0.74, spark: [100, 100.1, 100.3, 100.2, 100.5, 100.4, 100.6, 100.8, 100.5, 100.7, 100.9, 100.74] },
  { label: "MSCI ID",  value: "8,624.8",  delta: -0.18, spark: [100, 100.2, 99.8, 99.6, 99.9, 100.1, 99.8, 99.5, 99.7, 99.4, 99.6, 99.82] },
  { label: "S&P 500",  value: "5,842",    delta: 0.42, spark: [100, 100.1, 100.2, 100.1, 100.3, 100.2, 100.4, 100.3, 100.5, 100.4, 100.5, 100.42] },
];

export interface MoverRow {
  ticker: string;
  name: string;
  perf: number;
  vol: string;
  spark: number[];
}

export const TOP_GAINERS: MoverRow[] = [
  { ticker: "BREN", name: "Barito Renewables",   perf: 4.81, vol: "Rp 248 mrd", spark: [100, 100.4, 101.0, 100.8, 101.6, 102.4, 103.1, 103.8, 104.2, 104.5, 104.7, 104.81] },
  { ticker: "TPIA", name: "Chandra Asri Pacific", perf: 3.42, vol: "Rp 184 mrd", spark: [100, 100.2, 100.6, 101.1, 101.6, 102.1, 102.4, 102.8, 103.0, 103.2, 103.3, 103.42] },
  { ticker: "AMMN", name: "Amman Mineral",       perf: 2.43, vol: "Rp 142 mrd", spark: [100, 100.3, 100.5, 100.8, 101.2, 101.6, 101.9, 102.0, 102.2, 102.3, 102.4, 102.43] },
  { ticker: "PGAS", name: "Perusahaan Gas Negara", perf: 1.84, vol: "Rp 98 mrd", spark: [100, 100.2, 100.4, 100.6, 100.9, 101.1, 101.4, 101.6, 101.7, 101.8, 101.8, 101.84] },
  { ticker: "BBCA", name: "Bank Central Asia",   perf: 1.32, vol: "Rp 327 mrd", spark: [100, 100.1, 100.3, 100.5, 100.7, 100.9, 101.0, 101.1, 101.2, 101.3, 101.3, 101.32] },
];

export const TOP_LOSERS: MoverRow[] = [
  { ticker: "TLKM", name: "Telkom Indonesia",   perf: -2.41, vol: "Rp 218 mrd", spark: [100, 99.8, 99.6, 99.4, 99.2, 99.0, 98.8, 98.5, 98.2, 98.0, 97.8, 97.59] },
  { ticker: "UNVR", name: "Unilever Indonesia", perf: -2.18, vol: "Rp 84 mrd",  spark: [100, 99.9, 99.7, 99.5, 99.3, 99.1, 98.9, 98.6, 98.4, 98.1, 97.9, 97.82] },
  { ticker: "ITMG", name: "Indo Tambangraya",   perf: -1.84, vol: "Rp 62 mrd",  spark: [100, 99.9, 99.8, 99.6, 99.4, 99.1, 98.9, 98.7, 98.5, 98.3, 98.2, 98.16] },
  { ticker: "EXCL", name: "XL Axiata",          perf: -1.21, vol: "Rp 48 mrd",  spark: [100, 99.9, 99.8, 99.6, 99.5, 99.3, 99.2, 99.0, 98.9, 98.8, 98.8, 98.79] },
  { ticker: "BBRI", name: "Bank Rakyat Indonesia", perf: -0.53, vol: "Rp 312 mrd", spark: [100, 99.9, 99.9, 99.7, 99.6, 99.5, 99.5, 99.4, 99.4, 99.5, 99.5, 99.47] },
];

export interface CrossAssetRow {
  label: string;
  value: string;
  delta: string;
  tone: "pos" | "neg" | "neutral";
}

export const US_OVERNIGHT: CrossAssetRow[] = [
  { label: "S&P 500",    value: "5,842",    delta: "+0.42%", tone: "pos" },
  { label: "NASDAQ",     value: "18,624",   delta: "+0.68%", tone: "pos" },
  { label: "DOW",        value: "42,184",   delta: "+0.18%", tone: "pos" },
  { label: "VIX",        value: "14.2",     delta: "−2.1%",  tone: "pos" },
  { label: "UST 10Y",    value: "4.50%",    delta: "−2bp",   tone: "pos" },
  { label: "DXY",        value: "104.8",    delta: "−0.18%", tone: "pos" },
];

export const ASIA_OPEN: CrossAssetRow[] = [
  { label: "Nikkei 225", value: "38,924",   delta: "+0.84%", tone: "pos" },
  { label: "Hang Seng",  value: "19,842",   delta: "−0.42%", tone: "neg" },
  { label: "KOSPI",      value: "2,684",    delta: "+0.31%", tone: "pos" },
  { label: "STI (SG)",   value: "3,824",    delta: "+0.18%", tone: "pos" },
  { label: "ASX 200",    value: "8,184",    delta: "−0.12%", tone: "neg" },
  { label: "Sensex",     value: "82,184",   delta: "+0.42%", tone: "pos" },
];

export const COMMODITIES: CrossAssetRow[] = [
  { label: "Brent",      value: "$104.53",  delta: "+1.84%", tone: "pos" },
  { label: "WTI",        value: "$72.40",   delta: "+1.21%", tone: "pos" },
  { label: "Coal NEW",   value: "$118.40",  delta: "−2.41%", tone: "neg" },
  { label: "Nickel LME", value: "$15,840",  delta: "+0.84%", tone: "pos" },
  { label: "Copper LME", value: "$9,624",   delta: "+1.42%", tone: "pos" },
  { label: "CPO MY",     value: "RM 4,820", delta: "+0.84%", tone: "pos" },
  { label: "Gold",       value: "$2,684",   delta: "+0.42%", tone: "pos" },
  { label: "Tin LME",    value: "$30,184",  delta: "−1.84%", tone: "neg" },
];

export interface BreadthRow {
  label: string;
  value: string;
  sub?: string;
  tone?: "pos" | "neg" | "neutral";
}

export const BREADTH: BreadthRow[] = [
  { label: "ADV / DEC",    value: "342 / 182", sub: "ratio 1.88×", tone: "pos" },
  { label: "NEW 52W HI",   value: "18",        sub: "vs 12 D-1",    tone: "pos" },
  { label: "NEW 52W LO",   value: "4",         sub: "vs 8 D-1",     tone: "pos" },
  { label: "TURNOVER LQ45", value: "Rp 12.4T", sub: "5d avg 11.8T", tone: "pos" },
  { label: "FRG NET 5D",   value: "+Rp 412mrd", sub: "vs −184 prior", tone: "pos" },
  { label: "BLOCK TX",     value: "Rp 1.84T",   sub: "8 trades · BBCA/BMRI", tone: "neutral" },
];

// 10-day cumulative foreign flow for the line overlay
export const FOREIGN_CUM_10D = [
  -184, -42, 38, 12, -68, 86, 218, 386, 412, 414,
];
