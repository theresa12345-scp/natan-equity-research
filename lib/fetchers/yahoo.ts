// Yahoo Finance fetchers — uses yahoo-finance2 (already in deps).
// Graceful on errors — returns null per field so the brief generator
// can fall back to mock values without crashing.

import YahooFinance from "yahoo-finance2";
import type { IndexQuote } from "../brief/types";

const yahoo = new YahooFinance();

const INDEX_SYMBOLS: Array<{ symbol: string; label: string }> = [
  { symbol: "^GSPC", label: "S&P 500" },
  { symbol: "^IXIC", label: "NASDAQ" },
  { symbol: "^VIX", label: "VIX" },
  { symbol: "^TNX", label: "UST 10Y" }, // tenths of percent
  { symbol: "DX-Y.NYB", label: "DXY" },
  { symbol: "CL=F", label: "WTI Crude" },
  { symbol: "GC=F", label: "Gold" },
  { symbol: "USDIDR=X", label: "USD/IDR" },
];

function fmtIndexValue(symbol: string, price: number): string {
  if (symbol === "^TNX") return `${(price / 10).toFixed(2)}%`;
  if (symbol === "^VIX") return price.toFixed(1);
  if (symbol === "CL=F" || symbol === "GC=F") return `$${price.toFixed(2)}`;
  if (symbol === "USDIDR=X") return Math.round(price).toLocaleString("en-US");
  return Math.round(price).toLocaleString("en-US");
}

function fmtDelta(changePct: number): string {
  const sign = changePct >= 0 ? "+" : "";
  return `${sign}${changePct.toFixed(2)}%`;
}

export async function fetchOvernightIndices(): Promise<IndexQuote[]> {
  try {
    const quotes = await yahoo.quote(INDEX_SYMBOLS.map((s) => s.symbol));
    const arr = Array.isArray(quotes) ? quotes : [quotes];
    return INDEX_SYMBOLS.map(({ symbol, label }) => {
      const q = arr.find((x) => x.symbol === symbol);
      if (!q || q.regularMarketPrice == null) {
        return { symbol, label, price: null, changePct: null };
      }
      const price = q.regularMarketPrice;
      const changePct = q.regularMarketChangePercent ?? 0;
      return {
        symbol,
        label,
        price,
        changePct,
        fmt: fmtIndexValue(symbol, price),
        deltaFmt: fmtDelta(changePct),
      };
    });
  } catch (err) {
    console.warn("[brief] yahoo overnight indices failed:", (err as Error).message);
    return INDEX_SYMBOLS.map(({ symbol, label }) => ({
      symbol, label, price: null, changePct: null,
    }));
  }
}

export interface TickerMover {
  symbol: string;
  name: string;
  changePct: number;
  price: number;
}

export async function fetchTickerMovers(symbols: string[]): Promise<TickerMover[]> {
  if (symbols.length === 0) return [];
  try {
    const quotes = await yahoo.quote(symbols);
    const arr = Array.isArray(quotes) ? quotes : [quotes];
    return arr
      .filter((q) => q.regularMarketPrice != null)
      .map((q) => ({
        symbol: q.symbol,
        name: q.shortName ?? q.longName ?? q.symbol,
        changePct: q.regularMarketChangePercent ?? 0,
        price: q.regularMarketPrice ?? 0,
      }));
  } catch (err) {
    console.warn("[brief] yahoo ticker movers failed:", (err as Error).message);
    return [];
  }
}
