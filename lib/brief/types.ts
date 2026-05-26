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
