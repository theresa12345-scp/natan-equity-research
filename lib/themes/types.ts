// Thematic investing module — types.
// Methodology backbone documented in lib/data/citations.ts:
//   - MSCI thematic relevance (msci-thematic-relevance)
//   - Bloomberg thematic protocol (bloomberg-thematic-protocol)
//   - Hoberg-Phillips 2016 (hoberg-phillips-2016)
// Critique:
//   - Ben-David et al. 2023 (ben-david-franzoni-kim-moussawi-2023)
//   - Morningstar 2022 (morningstar-thematic-2022)

export type ThemeRegion = "IDX" | "US" | "GLOBAL";

export type ThemeCategory =
  | "Disruptive Technology"
  | "Energy & Materials"
  | "Healthcare & Life Sciences"
  | "Finance & Inclusion"
  | "Consumer & Demographics"
  | "Defense & Geopolitics";

export type RelevanceTier = "Core" | "Significant" | "Peripheral";

export type RelevanceSource =
  | "revenue-segment" // XBRL segment match (Bloomberg Revenue Intensity)
  | "text-derived"    // 10-K Item 1 / IDX annual-report keyword match
  | "analyst-tagged"; // hand-curated; honest label

export interface ThemeConstituent {
  ticker: string;
  region: ThemeRegion;
  relevancePct: number; // 0-100
  tier: RelevanceTier;
  source: RelevanceSource;
  rationale: string; // one-line why
}

export interface ThemeMethodology {
  scoringFormula: string;
  dataProvenance: string;
  eligibilityFloorPct: number;
  weighting: "relevance" | "equal" | "market-cap" | "score-vol";
  rebalanceCadence: string;
  lastReview: string; // YYYY-MM-DD
  limitations: string;
}

export interface Theme {
  slug: string;
  name: string;
  category: ThemeCategory;
  region: ThemeRegion;
  definition: string; // one paragraph
  seedwords: string[];
  constituents: ThemeConstituent[];
  benchmark: string; // "IHSG TR" | "S&P 500" etc.
  methodology: ThemeMethodology;
  citationIds: string[]; // /sources#cite-* anchors
  riskNote: string; // theme-specific risk callout
  blurb: string; // 1-line hub-card subtitle
}

export interface ThemeBasketRow extends ThemeConstituent {
  name: string;
  sector: string | null;
  price: number | null;
  score: number | null; // 0-100 composite
  compositeZ: number | null;
  marketCap: number | null;
  ytdReturn: number | null;
  beta: number | null;
  basketWeight: number; // post-weighting, 0-1
}

export interface ThemeBasket {
  theme: Theme;
  rows: ThemeBasketRow[];
  weightedZ: number; // basket composite z
  avgRelevance: number;
  totalNames: number;
  coreNames: number;
  inUniverseNames: number;
  topSector: string | null;
  asOf: string;
}
