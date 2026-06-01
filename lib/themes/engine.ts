// Basket builder — produces a ThemeBasket from a Theme + the universe.
// Reuses lib/ticker-renderer.ts buildGenericAggregate so the Z computed
// here is identical to the one shown on /picks / per-ticker pages.

import { getTickerData } from "@/lib/universe-loader";
import { buildGenericAggregate } from "@/lib/ticker-renderer";
import type { Theme, ThemeBasket, ThemeBasketRow } from "./types";

function tierToWeight(tier: "Core" | "Significant" | "Peripheral"): number {
  if (tier === "Core") return 1.0;
  if (tier === "Significant") return 0.55;
  return 0.25;
}

export function buildThemeBasket(theme: Theme): ThemeBasket {
  const rawRows: ThemeBasketRow[] = theme.constituents.map((c) => {
    const u = getTickerData(c.ticker, c.region === "GLOBAL" ? undefined : c.region);
    if (!u) {
      return {
        ...c,
        name: c.ticker,
        sector: null,
        price: null,
        score: null,
        compositeZ: null,
        marketCap: null,
        ytdReturn: null,
        beta: null,
        basketWeight: 0,
      };
    }
    const agg = buildGenericAggregate(u);
    return {
      ...c,
      name: u.name,
      sector: u.sector,
      price: u.price,
      score: agg.score,
      compositeZ: (agg.score - 50) / 20,
      marketCap: u.marketCap,
      ytdReturn: u.ytdReturn,
      beta: u.beta,
      basketWeight: 0,
    };
  });

  // Weighting per theme.methodology.weighting
  const inUniverse = rawRows.filter((r) => r.score != null);
  const computeWeights = (): number[] => {
    if (inUniverse.length === 0) return rawRows.map(() => 0);
    if (theme.methodology.weighting === "equal") {
      const w = 1 / inUniverse.length;
      return rawRows.map((r) => (r.score != null ? w : 0));
    }
    if (theme.methodology.weighting === "market-cap") {
      const sum = inUniverse.reduce((s, r) => s + (r.marketCap ?? 0), 0) || 1;
      return rawRows.map((r) => (r.score != null ? (r.marketCap ?? 0) / sum : 0));
    }
    if (theme.methodology.weighting === "score-vol") {
      // Conviction × inverse-vol proxy via beta
      const raws = rawRows.map((r) => {
        if (r.score == null) return 0;
        const sigmaProxy = Math.max(0.6, r.beta ?? 1.0);
        return Math.max(0, r.score - 40) / sigmaProxy;
      });
      const sum = raws.reduce((s, x) => s + x, 0) || 1;
      return raws.map((x) => x / sum);
    }
    // default: relevance (MSCI-style)
    const raws = rawRows.map((r) =>
      r.score != null ? (r.relevancePct / 100) * tierToWeight(r.tier) : 0,
    );
    const sum = raws.reduce((s, x) => s + x, 0) || 1;
    return raws.map((x) => x / sum);
  };

  const weights = computeWeights();
  const rows = rawRows.map((r, i) => ({ ...r, basketWeight: weights[i] }));

  // Aggregate
  const weightedZ = rows.reduce(
    (s, r) => s + (r.compositeZ ?? 0) * r.basketWeight,
    0,
  );
  const avgRelevance =
    theme.constituents.reduce((s, c) => s + c.relevancePct, 0) /
    Math.max(1, theme.constituents.length);

  const sectorCounts = new Map<string, number>();
  rows.forEach((r) => {
    if (r.sector) {
      sectorCounts.set(r.sector, (sectorCounts.get(r.sector) ?? 0) + r.basketWeight);
    }
  });
  const topSector =
    Array.from(sectorCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  rows.sort((a, b) => b.basketWeight - a.basketWeight);

  return {
    theme,
    rows,
    weightedZ,
    avgRelevance,
    totalNames: rows.length,
    coreNames: rows.filter((r) => r.tier === "Core").length,
    inUniverseNames: inUniverse.length,
    topSector,
    asOf: theme.methodology.lastReview,
  };
}
