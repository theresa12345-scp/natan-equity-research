import {
  loadUniverse,
  deterministicScore,
  letterFromScore,
  letterTone,
  type UniverseRow,
} from "./universe-loader";
import { isFeatured } from "./featured-tickers";

export interface PickRow {
  ticker: string;
  name: string;
  sector: string;
  industryGroup: string;
  region: "IDX" | "US";
  marketCap: number;
  pe: number | null;
  roe: number | null;
  beta: number | null;
  composite: number;        // 0-100
  z: number;                // composite z-score
  letter: string;
  tone: "mag" | "pos" | "amber" | "neg";
  pillars: {
    valuation: number;
    quality: number;
    profitability: number;
    lowVol: number;
    momentum: number;
  };
  featured: boolean;
}

const IDX_WEIGHTS_FOR_LEADERBOARD: Array<[string, number]> = [
  ["Valuation", 20],
  ["Quality", 20],
  ["Profitability", 15],
  ["Financial Health", 10],
  ["Low-Vol / Defensive", 10],
  ["Sentiment", 10],
  ["Growth", 5],
  ["Momentum (ST reversal)", 5],
  ["Liquidity", 5],
];

const US_WEIGHTS_FOR_LEADERBOARD: Array<[string, number]> = [
  ["Valuation", 15],
  ["Quality", 15],
  ["Profitability", 10],
  ["Financial Health", 10],
  ["Low-Vol / Defensive", 10],
  ["Sentiment", 10],
  ["Growth", 10],
  ["Momentum (Carhart 12-1)", 15],
  ["Liquidity", 5],
];

function computeRow(r: UniverseRow): PickRow {
  const weights = r.region === "IDX" ? IDX_WEIGHTS_FOR_LEADERBOARD : US_WEIGHTS_FOR_LEADERBOARD;
  let composite = 0;
  const pillarScores: number[] = [];
  for (const [name, weight] of weights) {
    const score = deterministicScore(r.ticker, name);
    composite += (score * weight) / 100;
    pillarScores.push(score);
  }
  const z = (composite - 50) / 20;
  return {
    ticker: r.ticker,
    name: r.name,
    sector: r.sector,
    industryGroup: r.industryGroup,
    region: r.region,
    marketCap: r.marketCap,
    pe: r.pe,
    roe: r.roe,
    beta: r.beta,
    composite,
    z,
    letter: letterFromScore(composite),
    tone: letterTone(composite),
    pillars: {
      valuation: pillarScores[0],
      quality: pillarScores[1],
      profitability: pillarScores[2],
      lowVol: pillarScores[4],
      momentum: pillarScores[7],
    },
    featured: isFeatured(r.ticker),
  };
}

let cachedPicks: PickRow[] | null = null;

export function loadPicks(): PickRow[] {
  if (cachedPicks) return cachedPicks;
  const universe = loadUniverse().filter(
    (r) => (r.marketCap ?? 0) > 0 && r.ticker && r.name,
  );
  cachedPicks = universe.map(computeRow).sort((a, b) => b.composite - a.composite);
  return cachedPicks;
}

export function uniqueSectors(picks: PickRow[]): string[] {
  return Array.from(new Set(picks.map((p) => p.sector))).sort();
}
