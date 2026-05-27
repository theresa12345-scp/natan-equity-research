// /flow data model — types shared across the smart-money surface.
// Aggregates four domains: congressional STOCK Act filings, 13F-HR
// institutional holdings, Form 4 insider transactions, and (later)
// unusual options + dark-pool prints. All shapes match the Quiver
// schema where applicable so the stub→live swap is mechanical.

export type Party = "R" | "D" | "I";
export type Chamber = "House" | "Senate";

export type Form4Code = "P" | "S" | "A" | "M" | "D" | "F" | "G" | "V" | "C" | "X";

export type SmartMoneyGrade =
  | "A+"
  | "A"
  | "A-"
  | "B+"
  | "B"
  | "B-"
  | "C"
  | "C-"
  | "D"
  | "F";

// One Form 4 transaction row (one insider, one txn type, one date).
export interface Form4Txn {
  id: string;
  ticker: string;
  issuerCik: string;
  insiderName: string;
  insiderTitle: string;
  transactionDate: string; // YYYY-MM-DD
  filingDate: string;
  txnCode: Form4Code;
  shares: number;
  pricePerShare: number;
  valueUsd: number;
  postTxnShares: number;
  is10b51: boolean; // 10b5-1 plan flag — excluded from cluster signal
}

// One 13F position (one institution, one ticker, one quarter).
export interface Position13F {
  ticker: string;
  cusip: string;
  managerCik: string;
  managerName: string;
  period: string; // e.g. "2026Q1"
  filingDate: string;
  shares: number;
  valueUsd: number;
  pctPortfolio: number;
  sharesChangeQoQ: number | null;
  valueChangeQoQUsd: number | null;
  isNew: boolean;
  isExit: boolean;
}

// One congressional trade.
export interface CongressTrade {
  id: string;
  politician: string;
  party: Party;
  chamber: Chamber;
  state: string;
  ticker: string;
  transactionType: "Buy" | "Sale" | "Exchange";
  tradeDate: string;
  filingDate: string;
  amountMin: number;
  amountMax: number;
  filingLagDays: number;
}

// Per-ticker aggregates over the four domains.
export interface TickerFlowAgg {
  ticker: string;
  // Congress
  congressTrades90d: number;
  congressNetUsd90d: number; // (mid of buys) − (mid of sells)
  congressDistinctActors90d: number;
  // 13F
  inst13FAdds: number; // # tracked institutions opening + increasing
  inst13FExits: number;
  inst13FNetHolderDelta: number; // adds − exits, current Q
  inst13FTotalValueUsd: number; // sum of tracked-institution holdings
  // Form 4 (open-market P-code only, excluding 10b5-1)
  form4Buyers30d: number;
  form4NetUsd30d: number; // P-code buys − S sales
  form4ClusterSize30d: number; // distinct P-code buyers in 30d
  form4MostSeniorBuyer: string | null;
}

// SMC scoring output.
export interface SMCComponent {
  z: number;
  contribution: number; // weight × z
}

export interface SMCResult {
  ticker: string;
  asOf: string;
  smcZ: number;
  smcGrade: SmartMoneyGrade;
  components: {
    congress: SMCComponent;
    institutional: SMCComponent;
    insider: SMCComponent;
    options: SMCComponent | null; // null until Checkpoint 3
  };
  source: "live" | "mixed" | "stub";
}

// Tracked institution metadata.
export interface TrackedInstitution {
  cik: string;
  name: string;
  manager: string;
  aumUsd: number; // in millions
  strategy: "Value" | "Growth" | "Macro" | "Activist" | "Quant" | "Long-Short" | "Event-Driven" | "Distressed";
}
