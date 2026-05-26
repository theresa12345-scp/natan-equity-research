export type Market = "IDX" | "US";
export type Currency = "IDR" | "USD";

export type PillarName =
  | "technical"
  | "sentiment"
  | "valuation"
  | "quality"
  | "growth"
  | "finHealth"
  | "liquidity"
  | "analyst";

export interface Pillar {
  name: PillarName;
  label: string;
  weight: number;
  score: number;
  max: number;
  letter: string;
}

export type Verdict =
  | "STRONG BUY"
  | "BUY"
  | "HOLD"
  | "UNDERPERFORM"
  | "SELL"
  | "AVOID";
export type VerdictTone = "buy" | "hold" | "sell";

export interface Aggregate {
  score: number;
  max: number;
  letter: string;
  verdict: Verdict | string;
  verdictTone: VerdictTone;
  targetPrice: number;
  positionSize: number;
}

export interface CapmInput {
  riskFreeRate: number;
  equityRiskPremium: number;
  beta: number;
  costOfEquity: number;
}

export interface DCFProjectionRow {
  year: number;
  revenue: number;
  revenueGrowth: number;
  ebitMargin: number;
  ebit: number;
  tax: number;
  reinvestment: number;
  fcff: number;
  discountFactor: number;
  pv: number;
}

export interface DCFInput {
  capm: CapmInput;
  terminalGrowth: number;
  terminalMargin: number;
  taxRate: number;
  projection: DCFProjectionRow[];
  sensitivity: number[][];
  intrinsicValue: number;
  marketPrice: number;
  upsidePct: number;
  verdict: string;
}

export interface FactorScore {
  factor: string;
  zScore: number;
  decile: number;
  reading: string;
}

export interface CompsRow {
  ticker: string;
  name: string;
  sector: string;
  marketCap: number;
  peForward: number;
  ps: number;
  evEbitda: number;
  roic: number;
  operatingMargin: number;
  revGrowth3y: number;
  fcfYield: number;
  netDebtEbitda: number;
  perf3m: number;
  beta: number;
  grade: string;
  isSubject?: boolean;
  isAggregate?: "mean" | "delta";
}

export type SentimentTone = "pos" | "neg" | "neutral";

export interface NewsItem {
  ts: string;
  source: string;
  headline: string;
  sentiment: number;
  tone: SentimentTone;
  lang: "en" | "id";
  url?: string;
}

export interface AuditCitation {
  tag: string;
  description: string;
  citation: string;
}

export interface BiasControl {
  label: string;
  active: boolean;
  description: string;
}

export interface Reproducibility {
  repoUrl: string;
  commitHash: string;
  testsPassing: number;
  testsTotal: number;
  lastRun: string;
  limitations: string[];
}

export interface KPIDatum {
  label: string;
  value: string;
  sub?: string;
  subTone?: SentimentTone;
}

export interface Security {
  ticker: string;
  exchange: string;
  market: Market;
  currency: Currency;
  name: string;
  sector: string;
  industry: string;
  marketCap: number;
  price: number;
  pe?: number;
  pb?: number;
  roe?: number;
  de?: number;
  beta?: number;
  ytdReturn?: number;
  revenue?: number;
  revenueGrowth?: number;
  netIncome?: number;
  fcf?: number;
  ebitda?: number;
  grossMargin?: number;
  ebitdaMargin?: number;
  dividendYield?: number;
  kpis: KPIDatum[];
  pillars: Pillar[];
  aggregate: Aggregate;
  dcf: DCFInput;
  factors: FactorScore[];
  comps: CompsRow[];
  news: NewsItem[];
  audit: {
    citations: AuditCitation[];
    biasControls: BiasControl[];
    repro: Reproducibility;
  };
}
