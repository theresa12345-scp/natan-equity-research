// Featured ticker registry — these get bespoke prose + handcrafted pillar
// raw inputs + curated news. All other tickers route through the generic
// renderer in lib/ticker-renderer.ts.

export const FEATURED_TICKERS = new Set(["BBCA", "MYOR", "NVDA"]);

export function isFeatured(ticker: string): boolean {
  return FEATURED_TICKERS.has(ticker.toUpperCase());
}
