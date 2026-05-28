export interface IndexQuote {
  symbol: string;
  label: string;
  price: number | null;
  changePct: number | null;
  fmt?: string;
  deltaFmt?: string;
}

export interface MacroPoint {
  label: string;
  value: string;
  delta: string;
  tone: "pos" | "neg" | "neutral";
}

export interface EarningsEvent {
  symbol: string;
  date: string;
  hour: "bmo" | "amc" | "dmh";
  epsEstimate: number | null;
  revenueEstimate: number | null;
}

export interface OvernightSnapshot {
  indices: IndexQuote[];
  fedFunds: number | null;
  ust10y: number | null;
  dxy: number | null;
  fxIDR: number | null;
}

export interface BriefDocument {
  date: string;
  generatedAt: string;
  meta: {
    author: string;
    edition: string;
    jktTime: string;
    estTime: string;
  };
  yesterdaysCall: {
    ticker: string;
    exchange: "IDX" | "US";
    claim: string;
    actualMovePct: number; // realized 1d move
    benchmarkMovePct: number;
    alphaPct: number; // claim − benchmark
    hit: boolean; // claim direction matched realized
    prose: string;
  };
  todaysQuestion: {
    question: string;
    probability: number; // 0–100
    basis: string;
    watchTrigger: string;
    refTicker?: string;
    refExchange?: "IDX" | "US";
  };
  chartOfDay: {
    headline: string;
    takeaway: string;
    sourceLabel: string;
    series: { label: string; value: number; color: string }[];
  };
  overnightWrap: { label: string; value: string; delta: string; tone: "pos" | "neg" | "neutral" }[];
  ideaOfDay: {
    ticker: string;
    exchange: string;
    title: string;
    composite: number;
    prose: string;
    pillars: { name: string; score: number }[];
  };
  smartMoneyDigest: {
    items: {
      kind: "CONGRESS" | "13F" | "INSIDER" | "SMC";
      ticker: string;
      exchange: "US" | "IDX";
      primary: string;
      secondary: string;
      tone: "pos" | "neg" | "neutral";
    }[];
  };
  modelPortfolioUpdate: {
    weightedZ: number;
    portfolioBeta: number;
    portfolioVol: number;
    adds: { ticker: string; name: string; fromPct: number; toPct: number; driftBps: number }[];
    trims: { ticker: string; name: string; fromPct: number; toPct: number; driftBps: number }[];
    note: string;
  };
  todaysCatalysts: {
    time: string;
    region: "US" | "IDX" | "ASIA" | "GLOBAL";
    event: string;
    impact: "high" | "medium" | "low";
    note: string;
  }[];
  watchlistMovers: {
    ticker: string;
    name: string;
    change: number;
    region: "IDX" | "US";
    note: string;
  }[];
  sectorRundown: {
    sector: string;
    idx: number;
    us: number;
    note: string;
  }[];
  macroDrivers: { label: string; desc: string }[];
  sidebarFlows: { label: string; value: string; tone: "pos" | "neg" | "neutral" }[];
  // Provenance: where each section's data came from on this run.
  source: "live" | "fallback" | "mixed";
  sourceDetail: Record<string, "live" | "fallback">;
}
