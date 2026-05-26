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
