export interface Fill {
  ts: string;
  ticker: string;
  side: "BUY" | "SELL";
  qty: number;
  px: number;
  notional: number;       // mio IDR
  venue: string;
  status: "FILLED" | "PARTIAL" | "WORKING";
  vwap: number;
  arrivalPx: number;
  realizedPnlJt: number;
  unrealizedPnlJt: number;
}

// Slippage (bps) = (px - arrivalPx) / arrivalPx * 10000 with sign flipped for SELL
function slippage(f: Pick<Fill, "px" | "arrivalPx" | "side">): number {
  const raw = ((f.px - f.arrivalPx) / f.arrivalPx) * 10000;
  return f.side === "BUY" ? raw : -raw;
}
export const fillSlippageBp = slippage;

export const FILLS: Fill[] = [
  { ts: "14:18:42", ticker: "BBCA", side: "BUY", qty: 12000, px: 9648, notional: 115.78, venue: "JKT", status: "FILLED", vwap: 9652, arrivalPx: 9655, realizedPnlJt: 0, unrealizedPnlJt: 8.42 },
  { ts: "13:42:18", ticker: "BBRI", side: "SELL", qty: 18000, px: 3752, notional: 67.54, venue: "JKT", status: "FILLED", vwap: 3749, arrivalPx: 3748, realizedPnlJt: 12.84, unrealizedPnlJt: 0 },
  { ts: "13:18:04", ticker: "BMRI", side: "BUY", qty: 8000, px: 7720, notional: 61.76, venue: "JKT", status: "FILLED", vwap: 7722, arrivalPx: 7724, realizedPnlJt: 0, unrealizedPnlJt: 4.21 },
  { ts: "11:42:31", ticker: "ICBP", side: "BUY", qty: 4000, px: 12720, notional: 50.88, venue: "JKT", status: "FILLED", vwap: 12724, arrivalPx: 12728, realizedPnlJt: 0, unrealizedPnlJt: 2.18 },
  { ts: "10:08:18", ticker: "BREN", side: "SELL", qty: 12000, px: 5418, notional: 65.02, venue: "JKT", status: "PARTIAL", vwap: 5421, arrivalPx: 5419, realizedPnlJt: -3.84, unrealizedPnlJt: 0 },
  { ts: "09:42:14", ticker: "PGAS", side: "BUY", qty: 24000, px: 1722, notional: 41.33, venue: "JKT", status: "FILLED", vwap: 1721, arrivalPx: 1720, realizedPnlJt: 0, unrealizedPnlJt: 5.42 },
  { ts: "09:18:42", ticker: "AMMN", side: "BUY", qty: 5000, px: 8418, notional: 42.09, venue: "JKT", status: "FILLED", vwap: 8420, arrivalPx: 8412, realizedPnlJt: 0, unrealizedPnlJt: -3.21 },
  { ts: "09:02:08", ticker: "ADRO", side: "SELL", qty: 14000, px: 3922, notional: 54.91, venue: "JKT", status: "WORKING", vwap: 3920, arrivalPx: 3922, realizedPnlJt: 0, unrealizedPnlJt: 0 },
];

export interface ExecStat {
  label: string;
  value: string;
  sub: string;
  tone?: "pos" | "neg" | "neutral";
}

export const EXEC_STATS: ExecStat[] = [
  { label: "ORDERS TODAY", value: "12", sub: "8 FILLED · 1 PARTIAL · 3 WORKING" },
  { label: "NOTIONAL · IDR", value: "Rp 624 mrd", sub: "8.4% of AUM", tone: "neutral" },
  { label: "AVG SLIPPAGE", value: "−2.4bp", sub: "vs VWAP · 30d", tone: "pos" },
  { label: "COMMISSIONS", value: "Rp 12.4 jt", sub: "18bps blended · 30d" },
];
