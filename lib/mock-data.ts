// Mock data sourced from the screenshot reference (meridian-idx-bbca screen,
// QRES · 04.4 view). Numbers are illustrative — replace with live data once
// lib/data-fetchers.ts is wired up in Phase 5.

export interface TickerTapeItem {
  symbol: string;
  price: string;
  delta?: string;
  changePct?: number;
}

export const TICKER_TAPE_IDX: TickerTapeItem[] = [
  { symbol: "ID10Y", price: "6.842%", delta: "-2.4bp", changePct: -0.4 },
  { symbol: "BBCA", price: "9,650", delta: "+125", changePct: 1.32 },
  { symbol: "BMRI", price: "7,725", delta: "+75", changePct: 0.98 },
  { symbol: "BBRI", price: "3,750", delta: "-20", changePct: -0.53 },
  { symbol: "BREN", price: "5,425", delta: "+250", changePct: 4.81 },
  { symbol: "AMMN", price: "8,425", delta: "+200", changePct: 2.43 },
  { symbol: "ADRO", price: "3,920", delta: "-16", changePct: -0.42 },
  { symbol: "PGAS", price: "1,725", delta: "+32", changePct: 1.84 },
];

export interface QuoteWatchItem {
  symbol: string;
  price: string;
  changePct: number;
}

export const QUOTE_WATCH: QuoteWatchItem[] = [
  { symbol: "BBCA", price: "9,650", changePct: 1.32 },
  { symbol: "BMRI", price: "7,725", changePct: 0.98 },
  { symbol: "BBRI", price: "3,750", changePct: -0.53 },
  { symbol: "BBNI", price: "5,920", changePct: 0.84 },
  { symbol: "PGAS", price: "1,725", changePct: 1.84 },
  { symbol: "ADRO", price: "3,920", changePct: -0.42 },
  { symbol: "BREN", price: "5,425", changePct: 4.81 },
  { symbol: "AMMN", price: "8,425", changePct: 2.43 },
  { symbol: "ICBP", price: "12,425", changePct: 0.21 },
  { symbol: "SMGR", price: "4,825", changePct: 0.62 },
];

export interface AlertItem {
  ts: string;
  ticker: string;
  body: string;
}

export const ALERTS: AlertItem[] = [
  {
    ts: "14:18",
    ticker: "BREN",
    body: "intraday breakout +4.81% on 2.4× ADTV. Momentum overlay would flag — composite ignores (excluded factor).",
  },
  {
    ts: "13:42",
    ticker: "BBRI",
    body: "foreign net −Rp 412 mrd 5d. Flow z dropped to −1.42, sentiment z −0.84. Value trap silhouette confirmed.",
  },
  {
    ts: "11:08",
    ticker: "DNTR",
    body: "policy paper leaked re: cement & cement-adj. SMGR + INTP catalysts both flagged for review at 16:00.",
  },
];

export interface SavedScreen {
  name: string;
  count: number;
  active?: boolean;
}

export const SAVED_SCREENS: SavedScreen[] = [
  { name: "Multi-Factor v2.1", count: 24, active: true },
  { name: "PEAD · SUE Top Decile", count: 11 },
  { name: "Cross-Cohort Flow", count: 17 },
  { name: "Low-Vol Defensive", count: 28 },
  { name: "Danantara Catalyst", count: 9 },
  { name: "Energy Beta Long", count: 14 },
  { name: "Value Trap Avoidance", count: 38 },
  { name: "SOE Bank Specifically", count: 4 },
];

export interface StatusItem {
  label: string;
  value: string;
  tone?: "pos" | "neg" | "neutral";
}

export const STATUS_TOP: StatusItem[] = [
  { label: "SESSION VOL", value: "12.4 trn" },
  { label: "ADV/DEC", value: "182 / 412" },
  { label: "52W HI", value: "8,859 (Jan)" },
  { label: "52W LO", value: "6,621 (Apr)" },
  { label: "VIX-ID", value: "18.4 +1.2", tone: "pos" },
  { label: "CDS 5Y ID", value: "68 bp +2", tone: "neg" },
  { label: "JCI P/E TTM", value: "14.2×" },
  { label: "JCI DIV", value: "2.84%" },
];

export const STATUS_BOTTOM: StatusItem[] = [
  { label: "IHSG", value: "7,418.62", tone: "pos" },
  { label: "USD/IDR", value: "17,742", tone: "neg" },
  { label: "BIRATE", value: "4.75" },
  { label: "SESI", value: "II" },
  { label: "WIB", value: "14:23:08" },
];

export const FN_KEYS: ReadonlyArray<{ key: string; label: string }> = [
  { key: "F1", label: "HELP" },
  { key: "F2", label: "SCRN" },
  { key: "F3", label: "RANK" },
  { key: "F4", label: "BACK" },
  { key: "F5", label: "EXP" },
  { key: "F6", label: "NOTES" },
];

export interface SectionTab {
  num: string;
  label: string;
  href: string;
  active?: boolean;
}

export const SECTION_TABS: SectionTab[] = [
  { num: "01", label: "MKTS", href: "/" },
  { num: "02", label: "PORT", href: "/" },
  { num: "03", label: "SCRN", href: "/" },
  { num: "04", label: "QRES", href: "/", active: true },
  { num: "05", label: "RISK", href: "/" },
  { num: "06", label: "EXEC", href: "/" },
];

export const SESSION = {
  brand: "MRDN",
  product: "IDX-Q",
  version: "v0.1",
  timestamp: "2026-05-26 14:23",
  user: "NLUU",
  workspace: "IDX-Q-04",
  latencyMs: 42,
} as const;
